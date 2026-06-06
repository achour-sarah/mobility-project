import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import logging
import json
from datetime import datetime
from etl.db import execute_pg
from models.arima_model import train_arima_trafic, train_arima_air
from models.lstm_model  import train_lstm_trafic

logger = logging.getLogger(__name__)
SEP = "=" * 60


def _get_stations_air() -> list:
    """Récupère les vrais station_id depuis la base."""
    rows = execute_pg(
        """
        SELECT DISTINCT station_id, station_nom
        FROM qualite_air
        ORDER BY station_id
        LIMIT 5
        """,
        fetch=True,
    )
    return rows or []


def _get_polluants_dispo(station_id: str) -> list:
    """Récupère les polluants disponibles pour une station."""
    rows = execute_pg(
        """
        SELECT DISTINCT polluant, COUNT(*) as nb
        FROM qualite_air
        WHERE station_id = %s
        GROUP BY polluant
        HAVING COUNT(*) >= 10
        ORDER BY nb DESC
        """,
        (station_id,),
        fetch=True,
    )
    return [r["polluant"] for r in rows] if rows else []


def evaluer_trafic(segment_id: str = "A1-001") -> dict:
    print(f"\n{SEP}")
    print(f"  EVALUATION TRAFIC - Segment {segment_id}")
    print(SEP)

    resultats = {}

    # ARIMA
    try:
        print("\n  Entraînement ARIMA...")
        res_arima = train_arima_trafic(segment_id=segment_id, steps=10)
        resultats["arima"] = res_arima
        print(f"  ARIMA  — MAE: {res_arima['mae']:.2f} km/h | "
              f"RMSE: {res_arima['rmse']:.2f} | "
              f"MAPE: {res_arima['mape']:.2f}%")
    except Exception as e:
        print(f"  ARIMA ERREUR : {e}")
        resultats["arima"] = None

    # LSTM
    try:
        print("\n  Entraînement LSTM / GradientBoosting...")
        res_lstm = train_lstm_trafic(segment_id=segment_id)
        resultats["lstm"] = res_lstm
        print(f"  {res_lstm['modele']:<30} - MAE: {res_lstm['mae']:.2f} km/h | "
              f"RMSE: {res_lstm['rmse']:.2f} | "
              f"MAPE: {res_lstm['mape']:.2f}%")
    except Exception as e:
        print(f"  LSTM ERREUR : {e}")
        resultats["lstm"] = None

    # Comparaison
    if resultats.get("arima") and resultats.get("lstm"):
        meilleur = (
            "LSTM/GB" if resultats["lstm"]["mae"] < resultats["arima"]["mae"]
            else "ARIMA"
        )
        print(f"\n  Meilleur modèle : {meilleur}")
        resultats["meilleur"] = meilleur

    return resultats


def evaluer_air() -> dict:
    """Évalue ARIMA sur la qualité de l'air — détecte les stations automatiquement."""
    print(f"\n{SEP}")
    print("  EVALUATION QUALITE DE L'AIR")
    print(SEP)

    stations = _get_stations_air()
    if not stations:
        print("  Aucune station disponible dans la base.")
        return {}

    resultats = {}

    for st in stations[:2]:  # On prend les 2 premières stations
        station_id  = st["station_id"]
        station_nom = st["station_nom"]
        polluants   = _get_polluants_dispo(station_id)

        if not polluants:
            print(f"  {station_nom} — pas assez de données")
            continue

        polluant = polluants[0]  # Le polluant avec le plus de données
        print(f"\n  Station : {station_nom} / {polluant}")

        try:
            res = train_arima_air(
                station_id=station_id,
                polluant=polluant,
                steps=10,
            )
            print(f"  ARIMA Air - MAE: {res['mae']:.2f} | "
                  f"RMSE: {res['rmse']:.2f}")
            resultats[f"{station_id}_{polluant}"] = res
        except Exception as e:
            print(f"  ERREUR : {e}")

    return resultats


def rapport_complet() -> dict:
    print(f"\n{'='*60}")
    print("  RAPPORT COMPLET - MODELES PREDICTIFS")
    print(f"{'='*60}")
    print(f"  {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

    rapport = {
        "date":    datetime.now().isoformat(),
        "trafic":  evaluer_trafic("A1-001"),
        "air":     evaluer_air(),
    }

    os.makedirs("models/resultats", exist_ok=True)
    path = (
        f"models/resultats/"
        f"rapport_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    )
    with open(path, "w", encoding="utf-8") as f:
        json.dump(rapport, f, indent=2, default=str)

    print(f"\n  Rapport sauvegardé : {path}")
    print(f"{'='*60}\n")
    return rapport