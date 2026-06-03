from flask import Blueprint, jsonify
from etl.db import execute_pg
from datetime import datetime, timezone, timedelta
from etl.collectors.weather_collector import collect_weather

meteo_bp = Blueprint("meteo", __name__)


def ensure_weather_fresh():
    try:
        last_collect = execute_pg(
            "SELECT MAX(collecte_at) AS max_time FROM meteo",
            fetch=True
        )
        should_collect = True
        if last_collect and last_collect[0] and last_collect[0]["max_time"]:
            last_time = last_collect[0]["max_time"]
            now = datetime.now(last_time.tzinfo or timezone.utc)
            if now - last_time < timedelta(minutes=10):
                should_collect = False
        
        if should_collect:
            collect_weather()
    except Exception as e:
        import traceback
        print(f"Error ensuring weather is fresh: {e}")


@meteo_bp.route("/meteo", methods=["GET"])
def get_meteo():
    """Retourne la dernière météo par ville."""
    ensure_weather_fresh()
    rows = execute_pg(
        """
        SELECT DISTINCT ON (ville)
            ville, temperature, humidite, pression,
            vent_vitesse, vent_direction,
            description, pluie_1h,
            lat, lon, collecte_at
        FROM meteo
        ORDER BY ville, collecte_at DESC
        """,
        fetch=True,
    )

    data = [{
        "ville":          r["ville"],
        "temperature":    round(r["temperature"], 1),
        "humidite":       r["humidite"],
        "pression":       round(r["pression"], 1),
        "vent_vitesse":   round(r["vent_vitesse"], 1),
        "vent_direction": r["vent_direction"],
        "description":    r["description"],
        "pluie_1h":       round(r["pluie_1h"] or 0, 2),
        "lat":            r["lat"],
        "lon":            r["lon"],
        "collecte_at":    str(r["collecte_at"]),
    } for r in rows]

    return jsonify({
        "status": "ok",
        "count":  len(data),
        "data":   data,
    })


@meteo_bp.route("/meteo/historique/<ville>", methods=["GET"])
def get_meteo_historique(ville):
    """Retourne l'historique météo d'une ville."""
    rows = execute_pg(
        """
        SELECT temperature, humidite, pression,
               vent_vitesse, description, collecte_at
        FROM meteo
        WHERE ville = %s
        ORDER BY collecte_at DESC
        LIMIT 50
        """,
        (ville,),
        fetch=True,
    )

    data = [{
        "temperature":  round(r["temperature"], 1),
        "humidite":     r["humidite"],
        "pression":     round(r["pression"], 1),
        "vent_vitesse": round(r["vent_vitesse"], 1),
        "description":  r["description"],
        "collecte_at":  str(r["collecte_at"]),
    } for r in rows]

    return jsonify({
        "status": "ok",
        "ville":  ville,
        "count":  len(data),
        "data":   data,
    })