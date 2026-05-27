from flask import Blueprint, jsonify, request
from etl.db import execute_pg

transports_bp = Blueprint("transports", __name__)


@transports_bp.route("/transports", methods=["GET"])
def get_transports():
    """Retourne les dernières perturbations par ligne."""
    rows = execute_pg(
        """
        SELECT DISTINCT ON (ligne)
            ligne, type_transport, statut,
            message, collecte_at
        FROM transports_perturbations
        WHERE collecte_at >= (SELECT COALESCE(MAX(collecte_at), NOW()) FROM transports_perturbations) - INTERVAL '10 seconds'
        ORDER BY ligne, collecte_at DESC
        """,
        fetch=True,
    )

    data = [{
        "ligne":          r["ligne"],
        "type_transport": r["type_transport"],
        "statut":         r["statut"],
        "message":        r["message"],
        "collecte_at":    str(r["collecte_at"]),
    } for r in rows]

    # Comptage par statut
    resume = {"normal": 0, "perturbé": 0,
              "interrompu": 0, "information": 0}
    for d in data:
        s = d["statut"]
        if s in resume:
            resume[s] += 1

    return jsonify({
        "status": "ok",
        "count":  len(data),
        "resume": resume,
        "data":   data,
    })


@transports_bp.route("/transports/perturbations", methods=["GET"])
def get_perturbations_actives():
    """Retourne uniquement les lignes perturbées ou interrompues."""
    rows = execute_pg(
        """
        SELECT DISTINCT ON (ligne)
            ligne, type_transport, statut, message, collecte_at
        FROM transports_perturbations
        WHERE statut IN ('perturbé', 'interrompu')
          AND collecte_at >= (SELECT COALESCE(MAX(collecte_at), NOW()) FROM transports_perturbations) - INTERVAL '10 seconds'
        ORDER BY ligne, collecte_at DESC
        """,
        fetch=True,
    )

    data = [{
        "ligne":          r["ligne"],
        "type_transport": r["type_transport"],
        "statut":         r["statut"],
        "message":        r["message"],
        "collecte_at":    str(r["collecte_at"]),
    } for r in rows]

    return jsonify({
        "status": "ok",
        "count":  len(data),
        "data":   data,
    })