"""
Modèle ARIMA — Prédiction du trafic et de la qualité de l'air.
Utilise les données historiques de PostgreSQL.
"""

import sys
import os
import pickle
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import warnings
import logging
import numpy as np
import pandas as pd
from statsmodels.tsa.arima.model import ARIMA
from statsmodels.tsa.stattools import adfuller
from etl.db import execute_pg

warnings.filterwarnings("ignore")
logger = logging.getLogger(__name__)


def _load_trafic_series(segment_id: str = "A1-001") -> pd.Series:
    """Charge la série temporelle de vitesse pour un segment."""
    rows = execute_pg(
        """
        SELECT collecte_at, vitesse_kmh
        FROM trafic_temps_reel
        WHERE segment_id = %s
        ORDER BY collecte_at ASC
        """,
        (segment_id,),
        fetch=True,
    )
    if not rows:
        raise ValueError(f"Aucune donnée pour le segment {segment_id}")

    df = pd.DataFrame(rows)
    df["collecte_at"] = pd.to_datetime(df["collecte_at"], utc=True)
    df = df.set_index("collecte_at")
    df = df.resample("1min").mean().interpolate()
    return df["vitesse_kmh"]


def _load_air_series(station_id: str = "owm-paris",
                     polluant: str = "NO2") -> pd.Series:
    """Charge la série temporelle d'un polluant pour une station."""
    rows = execute_pg(
        """
        SELECT collecte_at, valeur
        FROM qualite_air
        WHERE station_id = %s AND polluant = %s
        ORDER BY collecte_at ASC
        """,
        (station_id, polluant),
        fetch=True,
    )
    if not rows:
        raise ValueError(f"Aucune donnée pour {station_id} / {polluant}")

    df = pd.DataFrame(rows)
    df["collecte_at"] = pd.to_datetime(df["collecte_at"], utc=True)
    df = df.set_index("collecte_at")
    df = df.resample("5min").mean().interpolate()
    return df["valeur"]


def _test_stationnarite(series: pd.Series) -> bool:
    """Test ADF — retourne True si la série est stationnaire."""
    result = adfuller(series.dropna())
    p_value = result[1]
    logger.info("Test ADF — p-value : %.4f (%s)",
                p_value,
                "stationnaire" if p_value < 0.05 else "non stationnaire")
    return p_value < 0.05


def _choisir_ordre_d(series: pd.Series) -> int:
    """Choisit l'ordre de différenciation d."""
    if _test_stationnarite(series):
        return 0
    if _test_stationnarite(series.diff().dropna()):
        return 1
    return 2


def train_arima_trafic(segment_id: str = "A1-001",
                       steps: int = 10) -> dict:
    """
    Entraîne un modèle ARIMA sur les données de trafic.
    Retourne les prédictions et les métriques.
    """
    logger.info("ARIMA Trafic — chargement données segment %s", segment_id)
    series = _load_trafic_series(segment_id)

    if len(series) < 10:
        raise ValueError("Pas assez de données pour ARIMA (minimum 10 points)")

    # Split train/test 80/20
    split = int(len(series) * 0.8)
    train = series[:split]
    test  = series[split:]

    # Ordre de différenciation automatique
    d = _choisir_ordre_d(train)
    ordre = (2, d, 2)

    logger.info("ARIMA%s — entraînement sur %d points", ordre, len(train))

    model  = ARIMA(train, order=ordre)
    fitted = model.fit()

    # Prédictions sur le test set
    predictions = fitted.forecast(steps=len(test))
    predictions = pd.Series(predictions.values, index=test.index)

    # Prédictions futures
    future = fitted.forecast(steps=steps)
    future_index = pd.date_range(
        start=series.index[-1],
        periods=steps + 1,
        freq="1min"
    )[1:]
    future_series = pd.Series(future.values, index=future_index)

    # Métriques
    mae  = float(np.mean(np.abs(predictions.values - test.values[:len(predictions)])))
    rmse = float(np.sqrt(np.mean((predictions.values - test.values[:len(predictions)]) ** 2)))
    mape = float(np.mean(np.abs(
        (test.values[:len(predictions)] - predictions.values) /
        np.maximum(test.values[:len(predictions)], 1)
    )) * 100)

    logger.info("ARIMA Trafic — MAE: %.2f | RMSE: %.2f | MAPE: %.2f%%",
                mae, rmse, mape)

    # Sauvegarde du modèle
    model_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(model_dir, f"arima_trafic_{segment_id}.pkl")
    fitted.save(model_path)
    logger.info(f"Modèle ARIMA trafic sauvegardé sous {model_path}")

    return {
        "modele":       "ARIMA",
        "cible":        "trafic",
        "segment_id":   segment_id,
        "ordre":        ordre,
        "mae":          round(mae, 2),
        "rmse":         round(rmse, 2),
        "mape":         round(mape, 2),
        "train_size":   len(train),
        "test_size":    len(test),
        "predictions_test":   predictions.reset_index().to_dict("records"),
        "predictions_future": future_series.reset_index().to_dict("records"),
        "historique":         series.reset_index().to_dict("records"),
    }

def predict_arima_trafic(segment_id: str = "A1-001", steps: int = 10) -> dict:
    """Prédiction instantanée ARIMA Trafic à partir du modèle sauvegardé."""
    from statsmodels.tsa.arima.model import ARIMAResults
    
    model_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(model_dir, f"arima_trafic_{segment_id}.pkl")
    
    if not os.path.exists(model_path):
        logger.warning("Modèle ARIMA trafic non trouvé, entraînement lancé.")
        return train_arima_trafic(segment_id, steps)
        
    fitted = ARIMAResults.load(model_path)
    series = _load_trafic_series(segment_id)
    
    # Appliquer le modèle aux nouvelles données
    fitted = fitted.apply(series)
    
    future = fitted.forecast(steps=steps)
    future_index = pd.date_range(start=series.index[-1], periods=steps + 1, freq="1min")[1:]
    future_series = pd.Series(future.values, index=future_index)
    
    return {
        "modele":       "ARIMA (Prédiction instantanée)",
        "cible":        "trafic",
        "segment_id":   segment_id,
        "predictions_future": future_series.reset_index().to_dict("records"),
    }


def train_arima_air(station_id: str = "owm-paris",
                    polluant: str = "NO2",
                    steps: int = 10) -> dict:
    """
    Entraîne un modèle ARIMA sur les données de qualité de l'air.
    """
    logger.info("ARIMA Air — station %s / %s", station_id, polluant)
    series = _load_air_series(station_id, polluant)

    if len(series) < 10:
        raise ValueError("Pas assez de données pour ARIMA")

    split = int(len(series) * 0.8)
    train = series[:split]
    test  = series[split:]

    d     = _choisir_ordre_d(train)
    ordre = (1, d, 1)

    model  = ARIMA(train, order=ordre)
    fitted = model.fit()

    predictions = fitted.forecast(steps=len(test))
    predictions = pd.Series(predictions.values, index=test.index)

    future = fitted.forecast(steps=steps)
    future_index = pd.date_range(
        start=series.index[-1],
        periods=steps + 1,
        freq="5min"
    )[1:]
    future_series = pd.Series(future.values, index=future_index)

    mae  = float(np.mean(np.abs(predictions.values - test.values[:len(predictions)])))
    rmse = float(np.sqrt(np.mean((predictions.values - test.values[:len(predictions)]) ** 2)))

    logger.info("ARIMA Air — MAE: %.2f | RMSE: %.2f", mae, rmse)

    # Sauvegarde du modèle
    model_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(model_dir, f"arima_air_{station_id}_{polluant}.pkl")
    fitted.save(model_path)
    logger.info(f"Modèle ARIMA air sauvegardé sous {model_path}")

    return {
        "modele":       "ARIMA",
        "cible":        "air",
        "station_id":   station_id,
        "polluant":     polluant,
        "ordre":        ordre,
        "mae":          round(mae, 2),
        "rmse":         round(rmse, 2),
        "train_size":   len(train),
        "test_size":    len(test),
        "predictions_test":   predictions.reset_index().to_dict("records"),
        "predictions_future": future_series.reset_index().to_dict("records"),
        "historique":         series.reset_index().to_dict("records"),
    }

def predict_arima_air(station_id: str = "owm-paris", polluant: str = "NO2", steps: int = 10) -> dict:
    """Prédiction instantanée ARIMA Qualité de l'Air."""
    from statsmodels.tsa.arima.model import ARIMAResults
    
    model_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(model_dir, f"arima_air_{station_id}_{polluant}.pkl")
    
    if not os.path.exists(model_path):
        logger.warning("Modèle ARIMA air non trouvé, entraînement lancé.")
        return train_arima_air(station_id, polluant, steps)
        
    fitted = ARIMAResults.load(model_path)
    series = _load_air_series(station_id, polluant)
    
    fitted = fitted.apply(series)
    
    future = fitted.forecast(steps=steps)
    future_index = pd.date_range(start=series.index[-1], periods=steps + 1, freq="5min")[1:]
    future_series = pd.Series(future.values, index=future_index)
    
    return {
        "modele":       "ARIMA (Prédiction instantanée)",
        "cible":        "air",
        "station_id":   station_id,
        "polluant":     polluant,
        "predictions_future": future_series.reset_index().to_dict("records"),
    }