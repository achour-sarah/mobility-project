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
# Autoriser toutes les origines (Vercel, localhost, etc.)
CORS(app, resources={r"/api/*": {"origins": "*"}})

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
        "status": "running",
        "endpoints": [
            "/api/trafic",
            "/api/transports",
            "/api/air",
            "/api/meteo",
            "/api/predictions/trafic",
            "/api/signalements",
            "/api/stats",
        ]
    })

@app.route("/health")
def health():
    return jsonify({"status": "ok"}), 200

@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Endpoint introuvable"}), 404

@app.errorhandler(500)
def server_error(e):
    import traceback
    tb = traceback.format_exc()
    return jsonify({
        "error": "Erreur serveur interne",
        "detail": str(e),
        "traceback": tb
    }), 500

if __name__ == "__main__":
    port = int(os.getenv("FLASK_PORT", 5000))
    app.run(debug=False, host="0.0.0.0", port=port)