from flask import Blueprint, jsonify
from etl.db import execute_pg
from backend.routes.meteo import ensure_weather_fresh

stats_bp = Blueprint("stats", __name__)


@stats_bp.route("/stats", methods=["GET"])
def get_stats():
    """Retourne les KPIs globaux pour le dashboard."""
    ensure_weather_fresh()

    # Trafic moyen
    trafic = execute_pg(
        """
        SELECT
            AVG(vitesse_kmh)      AS vitesse_moy,
            AVG(taux_occupation)  AS occupation_moy,
            COUNT(*)              AS total_mesures,
            SUM(CASE WHEN fluidite = 'libre'   THEN 1 ELSE 0 END) AS nb_libre,
            SUM(CASE WHEN fluidite = 'dense'   THEN 1 ELSE 0 END) AS nb_dense,
            SUM(CASE WHEN fluidite = 'bloqué'  THEN 1 ELSE 0 END) AS nb_bloque
        FROM trafic_temps_reel
        WHERE collecte_at > (SELECT COALESCE(MAX(collecte_at), NOW()) FROM trafic_temps_reel) - INTERVAL '1 hour'
        """,
        fetch=True,
    )[0]

    # Qualité de l'air moyenne
    air = execute_pg(
        """
        SELECT AVG(indice_atmo) AS indice_moy,
               AVG(valeur)      AS valeur_moy
        FROM qualite_air
        WHERE collecte_at > (SELECT COALESCE(MAX(collecte_at), NOW()) FROM qualite_air) - INTERVAL '1 hour'
        """,
        fetch=True,
    )[0]

    # Perturbations actives
    transports = execute_pg(
        """
        SELECT
            COUNT(*) AS total_lignes,
            SUM(CASE WHEN statut = 'perturbé'   THEN 1 ELSE 0 END) AS perturbees,
            SUM(CASE WHEN statut = 'interrompu' THEN 1 ELSE 0 END) AS interrompues,
            SUM(CASE WHEN statut = 'normal'     THEN 1 ELSE 0 END) AS normales
        FROM transports_perturbations
        WHERE collecte_at > (SELECT COALESCE(MAX(collecte_at), NOW()) FROM transports_perturbations) - INTERVAL '1 hour'
        """,
        fetch=True,
    )[0]

    # Météo Paris
    meteo = execute_pg(
        """
        SELECT temperature, humidite, description, vent_vitesse
        FROM meteo
        WHERE ville = 'Paris'
        ORDER BY collecte_at DESC
        LIMIT 1
        """,
        fetch=True,
    )

    # Pipeline health
    pipeline = execute_pg(
        """
        SELECT collecteur, statut, nb_enregistrements, run_at
        FROM pipeline_logs
        ORDER BY run_at DESC
        LIMIT 4
        """,
        fetch=True,
    )

    return jsonify({
        "status": "ok",
        "kpis": {
            "trafic": {
                "vitesse_moyenne":   round(float(trafic["vitesse_moy"] or 0), 1),
                "occupation_moyenne":round(float(trafic["occupation_moy"] or 0), 1),
                "total_mesures":     int(trafic["total_mesures"] or 0),
                "repartition": {
                    "libre":  int(trafic["nb_libre"]  or 0),
                    "dense":  int(trafic["nb_dense"]  or 0),
                    "bloque": int(trafic["nb_bloque"] or 0),
                },
            },
            "air": {
                "indice_moyen": round(float(air["indice_moy"] or 0), 1),
                "valeur_moy":   round(float(air["valeur_moy"] or 0), 2),
            },
            "transports": {
                "total_lignes":  int(transports["total_lignes"]  or 0),
                "perturbees":    int(transports["perturbees"]    or 0),
                "interrompues":  int(transports["interrompues"]  or 0),
                "normales":      int(transports["normales"]      or 0),
            },
            "meteo_paris": meteo[0] if meteo else {},
            "pipeline": [{
                "collecteur": p["collecteur"],
                "statut":     p["statut"],
                "nb":         p["nb_enregistrements"],
                "run_at":     str(p["run_at"]),
            } for p in pipeline],
        }
    })