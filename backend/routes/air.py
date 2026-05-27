from flask import Blueprint, jsonify, request
from etl.db import execute_pg

air_bp = Blueprint("air", __name__)


@air_bp.route("/air", methods=["GET"])
def get_air():
    """Retourne la dernière mesure de qualité de l'air par station."""
    rows = execute_pg(
        """
        SELECT DISTINCT ON (station_id, polluant)
            station_id, station_nom, polluant,
            valeur, unite, indice_atmo,
            lat, lon, collecte_at
        FROM qualite_air
        ORDER BY station_id, polluant, collecte_at DESC
        """,
        fetch=True,
    )

    # Regrouper par station
    stations = {}
    for r in rows:
        sid = r["station_id"]
        if sid not in stations:
            stations[sid] = {
                "station_id":  sid,
                "station_nom": r["station_nom"],
                "indice_atmo": r["indice_atmo"],
                "lat":         r["lat"],
                "lon":         r["lon"],
                "collecte_at": str(r["collecte_at"]),
                "polluants":   {},
            }
        stations[sid]["polluants"][r["polluant"]] = {
            "valeur": round(r["valeur"], 2),
            "unite":  r["unite"],
        }

    return jsonify({
        "status": "ok",
        "count":  len(stations),
        "data":   list(stations.values()),
    })


@air_bp.route("/air/station/<station_id>", methods=["GET"])
def get_air_station(station_id):
    """Retourne l'historique d'une station."""
    polluant = request.args.get("polluant", "NO2")
    limite   = request.args.get("limite", 50, type=int)

    rows = execute_pg(
        """
        SELECT valeur, indice_atmo, collecte_at
        FROM qualite_air
        WHERE station_id = %s AND polluant = %s
        ORDER BY collecte_at DESC
        LIMIT %s
        """,
        (station_id, polluant, limite),
        fetch=True,
    )

    data = [{
        "valeur":      round(r["valeur"], 2),
        "indice_atmo": r["indice_atmo"],
        "collecte_at": str(r["collecte_at"]),
    } for r in rows]

    return jsonify({
        "status":     "ok",
        "station_id": station_id,
        "polluant":   polluant,
        "count":      len(data),
        "data":       data,
    })