import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from flask import Flask, jsonify
from flask_cors import CORS

from backend.routes.trafic        import trafic_bp
from backend.routes.transports    import transports_bp
from backend.routes.air           import air_bp
from backend.routes.meteo         import meteo_bp
from backend.routes.predictions   import predictions_bp
from backend.routes.stats         import stats_bp
from backend.routes.signalements  import signalements_bp
from backend.routes.transports_routing import transports_routing_bp

app = Flask(__name__)
CORS(app)

app.register_blueprint(trafic_bp,       url_prefix="/api")
app.register_blueprint(transports_bp,   url_prefix="/api")
app.register_blueprint(air_bp,          url_prefix="/api")
app.register_blueprint(meteo_bp,        url_prefix="/api")
app.register_blueprint(predictions_bp,  url_prefix="/api")
app.register_blueprint(stats_bp,        url_prefix="/api")
app.register_blueprint(signalements_bp, url_prefix="/api")
app.register_blueprint(transports_routing_bp, url_prefix="/api")

@app.route("/")
def index():
    return jsonify({
        "message": "Plateforme Mobilité Urbaine — API v1.0",
        "endpoints": [
            "/api/trafic",
            "/api/trafic/prediction",
            "/api/transports",
            "/api/air",
            "/api/meteo",
            "/api/predictions/trafic",
            "/api/signalements",
            "/api/stats",
        ]
    })

@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Endpoint introuvable"}), 404

@app.errorhandler(500)
def server_error(e):
    return jsonify({"error": "Erreur serveur interne"}), 500

import threading
from etl.run_pipeline import run_realtime

if __name__ == "__main__":
    port = int(os.getenv("FLASK_PORT", 5000))
    
    # Démarrage du pipeline ETL en temps réel (en arrière-plan)
    etl_thread = threading.Thread(target=run_realtime, daemon=True)
    etl_thread.start()
    print("Pipeline ETL temps reel demarre en tache de fond.")
    
    app.run(debug=False, host="0.0.0.0", port=port)