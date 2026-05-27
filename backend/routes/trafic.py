from flask import Blueprint, jsonify, request
from etl.db import execute_pg

trafic_bp = Blueprint("trafic", __name__)


@trafic_bp.route("/trafic", methods=["GET"])
def get_trafic():
    """Retourne les dernières données trafic par segment."""
    limite = request.args.get("limite", 50, type=int)

    rows = execute_pg(
        """
        SELECT DISTINCT ON (segment_id)
            segment_id, nom_segment, vitesse_kmh,
            fluidite, taux_occupation,
            lat1, lon1, lat2, lon2, collecte_at
        FROM trafic_temps_reel
        ORDER BY segment_id, collecte_at DESC
        LIMIT %s
        """,
        (limite,),
        fetch=True,
    )

    data = []
    for r in rows:
        data.append({
            "segment_id":     r["segment_id"],
            "nom_segment":    r["nom_segment"],
            "vitesse_kmh":    round(r["vitesse_kmh"], 1),
            "fluidite":       r["fluidite"],
            "taux_occupation":round(r["taux_occupation"], 1),
            "coordonnees": {
                "lat1": r["lat1"], "lon1": r["lon1"],
                "lat2": r["lat2"], "lon2": r["lon2"],
            },
            "collecte_at": str(r["collecte_at"]),
        })

    return jsonify({
        "status":  "ok",
        "count":   len(data),
        "data":    data,
    })


@trafic_bp.route("/trafic/historique/<segment_id>", methods=["GET"])
def get_trafic_historique(segment_id):
    """Retourne l'historique d'un segment pour les graphiques."""
    limite = request.args.get("limite", 100, type=int)

    rows = execute_pg(
        """
        SELECT vitesse_kmh, fluidite,
               taux_occupation, collecte_at
        FROM trafic_temps_reel
        WHERE segment_id = %s
        ORDER BY collecte_at DESC
        LIMIT %s
        """,
        (segment_id, limite),
        fetch=True,
    )

    data = [{
        "vitesse_kmh":    round(r["vitesse_kmh"], 1),
        "fluidite":       r["fluidite"],
        "taux_occupation":round(r["taux_occupation"], 1),
        "collecte_at":    str(r["collecte_at"]),
    } for r in rows]

    return jsonify({
        "status":     "ok",
        "segment_id": segment_id,
        "count":      len(data),
        "data":       data,
    })


@trafic_bp.route("/trafic/segments", methods=["GET"])
def get_segments():
    """Retourne la liste de tous les segments disponibles."""
    rows = execute_pg(
        """
        SELECT DISTINCT segment_id, nom_segment
        FROM trafic_temps_reel
        ORDER BY segment_id
        """,
        fetch=True,
    )
    return jsonify({
        "status": "ok",
        "data": [{"segment_id": r["segment_id"],
                  "nom": r["nom_segment"]} for r in rows],
    })