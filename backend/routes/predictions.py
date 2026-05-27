from flask import Blueprint, jsonify, request
from models.arima_model import train_arima_trafic, predict_arima_trafic, train_arima_air, predict_arima_air
from models.lstm_model  import train_lstm_trafic, predict_lstm_trafic
import threading

predictions_bp = Blueprint("predictions", __name__)


@predictions_bp.route("/predictions/trafic", methods=["GET"])
def predict_trafic():
    """Lance ARIMA + GradientBoosting et retourne les prédictions."""
    segment_id = request.args.get("segment_id", "A1-001")
    steps      = request.args.get("steps", 10, type=int)

    resultats = {}

    try:
        res_arima = predict_arima_trafic(
            segment_id=segment_id, steps=steps
        )
        resultats["arima"] = {
            "mae":   res_arima.get("mae", "N/A"),
            "rmse":  res_arima.get("rmse", "N/A"),
            "mape":  res_arima.get("mape", "N/A"),
            "predictions_future": [
                {
                    "timestamp": str(p["index"]),
                    "vitesse_kmh": round(p["vitesse_kmh"], 1)
                    if isinstance(p.get("vitesse_kmh"), float)
                    else round(list(p.values())[1], 1),
                }
                for p in res_arima["predictions_future"]
            ],
        }
    except Exception as e:
        resultats["arima"] = {"error": str(e)}

    try:
        res_lstm = predict_lstm_trafic(segment_id=segment_id)
        # On garde 'gradient_boosting' ou on met 'lstm' selon ce qu'attend le front,
        # mettons 'lstm' pour être plus propre.
        resultats["lstm"] = {
            "predictions_future": res_lstm["predictions_future"],
            "historique_recent": res_lstm.get("historique_recent", [])
        }
    except Exception as e:
        resultats["lstm"] = {"error": str(e)}

    return jsonify({
        "status":     "ok",
        "segment_id": segment_id,
        "steps":      steps,
        "modeles":    resultats,
    })


@predictions_bp.route("/predictions/air", methods=["GET"])
def predict_air():
    """Prédictions qualité de l'air via ARIMA."""
    station_id = request.args.get("station_id", "33001001")
    polluant   = request.args.get("polluant", "CO")
    steps      = request.args.get("steps", 10, type=int)

    try:
        res = predict_arima_air(
            station_id=station_id,
            polluant=polluant,
            steps=steps,
        )
        return jsonify({
            "status":     "ok",
            "station_id": station_id,
            "polluant":   polluant,
            "mae":        res.get("mae", "N/A"),
            "rmse":       res.get("rmse", "N/A"),
            "predictions_future": [
                str(p) for p in res["predictions_future"]
            ],
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@predictions_bp.route("/train/trafic", methods=["POST"])
def trigger_training():
    """Déclenche l'entraînement du LSTM en tâche de fond."""
    segment_id = request.json.get("segment_id", "A1-001") if request.is_json else request.args.get("segment_id", "A1-001")
    
    def background_train():
        try:
            train_lstm_trafic(segment_id=segment_id)
        except Exception as e:
            print(f"Erreur d'entraînement: {e}")

    thread = threading.Thread(target=background_train)
    thread.start()

    return jsonify({
        "status": "ok",
        "message": f"Entraînement du LSTM pour le segment {segment_id} lancé en arrière-plan."
    })