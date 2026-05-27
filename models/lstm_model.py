import sys
import os
import pickle
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import logging
import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error
from etl.db import execute_pg

logger = logging.getLogger(__name__)

try:
    import tensorflow as tf
    from tensorflow.keras.models import Sequential
    from tensorflow.keras.layers import LSTM, Dense, Dropout
    from tensorflow.keras.callbacks import EarlyStopping
    TF_DISPONIBLE = True
    logger.info("TensorFlow %s chargé", tf.__version__)
except ImportError:
    TF_DISPONIBLE = False
    logger.warning("TensorFlow non disponible — mode sklearn activé")


def _load_gtfs_profile() -> dict:
    try:
        rows = execute_pg("SELECT heure, nb_passages FROM gtfs_hourly_profile", fetch=True)
        return {int(r["heure"]): float(r["nb_passages"]) for r in rows}
    except Exception as e:
        logger.warning(f"Erreur chargement GTFS profile: {e}")
        return {}

def _load_features(segment_id: str = "A1-001", limit: int = None) -> pd.DataFrame:
    query = """
        SELECT collecte_at, vitesse_kmh, taux_occupation
        FROM trafic_temps_reel
        WHERE segment_id = %s
        ORDER BY collecte_at ASC
    """
    if limit:
        # On prend les 'limit' derniers enregistrements
        query = f"""
            SELECT collecte_at, vitesse_kmh, taux_occupation
            FROM (
                SELECT collecte_at, vitesse_kmh, taux_occupation
                FROM trafic_temps_reel
                WHERE segment_id = %s
                ORDER BY collecte_at DESC
                LIMIT {limit}
            ) sub
            ORDER BY collecte_at ASC
        """
        
    rows = execute_pg(query, (segment_id,), fetch=True)
    if not rows:
        raise ValueError(f"Aucune donnée pour {segment_id}")

    df = pd.DataFrame(rows)
    df["collecte_at"]    = pd.to_datetime(df["collecte_at"], utc=True)
    df["vitesse_kmh"]    = pd.to_numeric(df["vitesse_kmh"],     errors="coerce")
    df["taux_occupation"]= pd.to_numeric(df["taux_occupation"],  errors="coerce")
    df = df.set_index("collecte_at")
    df = df.resample("1min").mean().interpolate()

    df["heure"]        = df.index.hour
    df["minute"]       = df.index.minute
    df["jour_semaine"] = df.index.dayofweek
    df["is_peak"]      = df["heure"].apply(
        lambda h: 1 if (7 <= h <= 9 or 17 <= h <= 19) else 0
    )
    
    # Intégration GTFS
    gtfs_profile = _load_gtfs_profile()
    df["nb_transports_prevus"] = df["heure"].map(gtfs_profile).fillna(0)
    
    df = df.dropna()
    return df


def _creer_sequences(data: np.ndarray,
                     seq_len: int = 10) -> tuple:
    X, y = [], []
    for i in range(len(data) - seq_len):
        X.append(data[i:i + seq_len])
        y.append(data[i + seq_len, 0])
    return np.array(X), np.array(y)


def _model_sklearn_fallback(X_train, y_train, X_test,
                             y_test, features) -> dict:
    from sklearn.ensemble import GradientBoostingRegressor

    logger.info("Fallback GradientBoosting (TF indisponible)")
    X_tr_2d = X_train.reshape(len(X_train), -1)
    X_te_2d = X_test.reshape(len(X_test),  -1)

    model = GradientBoostingRegressor(
        n_estimators=100, learning_rate=0.1,
        max_depth=4, random_state=42
    )
    model.fit(X_tr_2d, y_train)
    preds = model.predict(X_te_2d)

    mae  = float(mean_absolute_error(y_test, preds))
    rmse = float(np.sqrt(mean_squared_error(y_test, preds)))
    mape = float(np.mean(np.abs(
        (y_test - preds) / np.maximum(y_test, 1)
    )) * 100)

    logger.info("GradientBoosting — MAE: %.2f | RMSE: %.2f | MAPE: %.2f%%",
                mae, rmse, mape)

    return {
        "modele":             "GradientBoosting (fallback LSTM)",
        "cible":              "trafic",
        "mae":                round(mae, 2),
        "rmse":               round(rmse, 2),
        "mape":               round(mape, 2),
        "train_size":         len(X_train),
        "test_size":          len(X_test),
        "predictions_test":   preds.tolist(),
        "actuel_test":        y_test.tolist(),
        "predictions_future": [],
    }


def train_lstm_trafic(segment_id: str = "A1-001",
                      seq_len: int = 10,
                      epochs: int = 30) -> dict:
    logger.info("LSTM Trafic — chargement données segment %s", segment_id)
    df = _load_features(segment_id)

    if len(df) < seq_len + 5:
        raise ValueError(f"Pas assez de données (minimum {seq_len + 5} points)")

    features    = ["vitesse_kmh", "taux_occupation",
                   "heure", "jour_semaine", "is_peak", "nb_transports_prevus"]
    data        = df[features].values
    scaler      = MinMaxScaler()
    data_scaled = scaler.fit_transform(data)
    
    # Sauvegarde du scaler
    model_dir = os.path.dirname(os.path.abspath(__file__))
    scaler_path = os.path.join(model_dir, f"scaler_{segment_id}.pkl")
    with open(scaler_path, "wb") as f:
        pickle.dump(scaler, f)

    X, y  = _creer_sequences(data_scaled, seq_len)
    split = int(len(X) * 0.8)

    X_train, y_train = X[:split], y[:split]
    X_test,  y_test  = X[split:], y[split:]

    logger.info("LSTM — %d séquences train, %d test",
                len(X_train), len(X_test))

    if not TF_DISPONIBLE or len(X_train) < 5:
        return _model_sklearn_fallback(
            X_train, y_train, X_test, y_test, features
        )

    model = Sequential([
        LSTM(64, return_sequences=True,
             input_shape=(seq_len, len(features))),
        Dropout(0.2),
        LSTM(32, return_sequences=False),
        Dropout(0.2),
        Dense(16, activation="relu"),
        Dense(1),
    ])
    model.compile(optimizer="adam", loss="mse", metrics=["mae"])

    early_stop = EarlyStopping(
        monitor="val_loss", patience=5,
        restore_best_weights=True
    )

    history = model.fit(
        X_train, y_train,
        epochs=epochs,
        batch_size=16,
        validation_split=0.2,
        callbacks=[early_stop],
        verbose=0,
    )

    preds_scaled = model.predict(X_test, verbose=0).flatten()

    def denorm_vitesse(vals):
        dummy       = np.zeros((len(vals), len(features)))
        dummy[:, 0] = vals
        return scaler.inverse_transform(dummy)[:, 0]

    preds_reel = denorm_vitesse(preds_scaled)
    y_reel     = denorm_vitesse(y_test)

    mae  = float(mean_absolute_error(y_reel, preds_reel))
    rmse = float(np.sqrt(mean_squared_error(y_reel, preds_reel)))
    mape = float(np.mean(np.abs(
        (y_reel - preds_reel) / np.maximum(y_reel, 1)
    )) * 100)

    epochs_done = len(history.history["loss"])
    logger.info(
        "LSTM — MAE: %.2f | RMSE: %.2f | MAPE: %.2f%% | Epochs: %d",
        mae, rmse, mape, epochs_done
    )

    # Prédictions futures
    last_seq     = data_scaled[-seq_len:]
    future_preds = []
    current_seq  = last_seq.copy()

    for _ in range(10):
        pred = model.predict(
            current_seq.reshape(1, seq_len, len(features)),
            verbose=0
        )[0, 0]
        future_preds.append(pred)
        new_row    = current_seq[-1].copy()
        new_row[0] = pred
        current_seq = np.vstack([current_seq[1:], new_row])

    future_reel = denorm_vitesse(np.array(future_preds))
    
    # Sauvegarde du modèle
    model_path = os.path.join(model_dir, f"lstm_{segment_id}.keras")
    model.save(model_path)
    logger.info(f"Modèle LSTM sauvegardé sous {model_path}")

    return {
        "modele":             "LSTM",
        "cible":              "trafic",
        "segment_id":         segment_id,
        "architecture":       "LSTM(64)→Dropout→LSTM(32)→Dense(16)→Dense(1)",
        "seq_len":            seq_len,
        "epochs_done":        epochs_done,
        "mae":                round(mae, 2),
        "rmse":               round(rmse, 2),
        "mape":               round(mape, 2),
        "train_size":         len(X_train),
        "test_size":          len(X_test),
        "predictions_test":   preds_reel.tolist(),
        "actuel_test":        y_reel.tolist(),
        "predictions_future": future_reel.tolist(),
        "historique_loss":    history.history["loss"],
    }

def predict_lstm_trafic(segment_id: str = "A1-001", seq_len: int = 10) -> dict:
    """Fait une prédiction en utilisant le modèle sauvegardé sans réentraîner."""
    model_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(model_dir, f"lstm_{segment_id}.keras")
    scaler_path = os.path.join(model_dir, f"scaler_{segment_id}.pkl")

    if not os.path.exists(model_path) or not os.path.exists(scaler_path) or not TF_DISPONIBLE:
        logger.warning("Modèle non trouvé ou TF indisponible, utilisation du fallback rapide.")
        try:
            df = _load_features(segment_id, limit=seq_len + 10)
            vitesse_actuelle = float(df["vitesse_kmh"].iloc[-1]) if not df.empty else 70.0
            hist = df["vitesse_kmh"].values[-seq_len:].tolist()
        except Exception:
            vitesse_actuelle = 70.0
            hist = [70.0] * seq_len
            
        future_reel = []
        curr = vitesse_actuelle
        for i in range(10):
            curr = curr * 0.95 + 75.0 * 0.05 + float(np.random.uniform(-2, 2))
            future_reel.append(round(curr, 1))
            
        return {
            "modele": "Fallback Rapide (En attente d'apprentissage)",
            "cible": "trafic",
            "segment_id": segment_id,
            "predictions_future": future_reel,
            "historique_recent": hist,
        }

    from tensorflow.keras.models import load_model
    model = load_model(model_path)
    
    with open(scaler_path, "rb") as f:
        scaler = pickle.load(f)

    # Récupérer uniquement les seq_len dernières minutes + un peu de marge
    df = _load_features(segment_id, limit=seq_len + 10)
    
    if len(df) < seq_len:
        raise ValueError(f"Pas assez de données temps réel pour la prédiction ({len(df)}/{seq_len})")

    features = ["vitesse_kmh", "taux_occupation", "heure", "jour_semaine", "is_peak", "nb_transports_prevus"]
    data = df[features].values[-seq_len:]
    
    data_scaled = scaler.transform(data)
    
    # Prédictions futures (10 minutes)
    future_preds = []
    current_seq = data_scaled.copy()

    for _ in range(10):
        pred = model.predict(current_seq.reshape(1, seq_len, len(features)), verbose=0)[0, 0]
        future_preds.append(pred)
        new_row = current_seq[-1].copy()
        new_row[0] = pred
        current_seq = np.vstack([current_seq[1:], new_row])

    def denorm_vitesse(vals):
        dummy = np.zeros((len(vals), len(features)))
        dummy[:, 0] = vals
        return scaler.inverse_transform(dummy)[:, 0]

    future_reel = denorm_vitesse(np.array(future_preds))

    return {
        "modele": "LSTM (Prédiction instantanée)",
        "cible": "trafic",
        "segment_id": segment_id,
        "predictions_future": future_reel.tolist(),
        "historique_recent": df["vitesse_kmh"].values[-seq_len:].tolist(),
    }