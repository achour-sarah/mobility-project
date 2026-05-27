"""
Point d'entrée — Lance l'entraînement et l'évaluation des modèles.

Usage :
    python models/run_models.py              # rapport complet
    python models/run_models.py --arima      # ARIMA seulement
    python models/run_models.py --lstm       # LSTM seulement
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import logging
import argparse

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s — %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)

from models.evaluator import rapport_complet, evaluer_trafic, evaluer_air
from models.arima_model import train_arima_trafic
from models.lstm_model  import train_lstm_trafic


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--arima", action="store_true")
    parser.add_argument("--lstm",  action="store_true")
    args = parser.parse_args()

    if args.arima:
        res = train_arima_trafic(segment_id="A1-001", steps=10)
        print(f"\nARIMA — MAE: {res['mae']} | RMSE: {res['rmse']} | MAPE: {res['mape']}%")
        print("Prédictions futures (vitesse km/h) :")
        for p in res["predictions_future"]:
            print(f"  {p['index']} → {p['vitesse_kmh']:.1f} km/h")

    elif args.lstm:
        res = train_lstm_trafic(segment_id="A1-001")
        print(f"\nLSTM — MAE: {res['mae']} | RMSE: {res['rmse']}")
        print("Prédictions futures (vitesse km/h) :")
        for v in res["predictions_future"]:
            print(f"  {v:.1f} km/h")

    else:
        rapport_complet()