from flask import Blueprint, jsonify, request
from etl.db import execute_pg
import math

transports_routing_bp = Blueprint("transports_routing", __name__)


def haversine(lat1, lon1, lat2, lon2):
    """Calcule la distance géodésique en km entre deux coordonnées."""
    try:
        lat1, lon1, lat2, lon2 = map(float, [lat1, lon1, lat2, lon2])
        R = 6371.0  # Rayon de la Terre en km
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = (
            math.sin(dlat / 2) ** 2
            + math.cos(math.radians(lat1))
            * math.cos(math.radians(lat2))
            * math.sin(dlon / 2) ** 2
        )
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return round(R * c, 2)
    except Exception:
        return 0.0


def map_route_type(rt):
    """Mappe le type de route GTFS vers des libellés conviviaux."""
    if rt == 0:
        return "Tramway"
    if rt == 1:
        return "Métro"
    if rt == 2:
        return "RER/Train"
    if rt == 3:
        return "Bus"
    return "Ligne"


@transports_routing_bp.route("/stops/search", methods=["GET"])
def search_stops():
    """Recherche des arrêts par mot-clé dans idf_stops."""
    q = request.args.get("q", "").strip()
    if not q or len(q) < 2:
        return jsonify({"status": "ok", "data": []})

    # Recherche avec filtre ILIKE et dédoublonnage par nom pour simplifier l'UI
    rows = execute_pg(
        """
        SELECT DISTINCT ON (stop_name)
            stop_id, stop_name, stop_lat, stop_lon
        FROM idf_stops
        WHERE stop_name ILIKE %s
        ORDER BY stop_name, stop_id
        LIMIT 10
        """,
        (f"%{q}%",),
        fetch=True,
    )

    data = [
        {
            "id": r["stop_id"],
            "name": r["stop_name"],
            "lat": r["stop_lat"],
            "lon": r["stop_lon"],
        }
        for r in rows
    ]

    return jsonify({"status": "ok", "data": data})


@transports_routing_bp.route("/route/calculate", methods=["GET"])
def calculate_route():
    """Calcule le trajet géodésique et recherche une liaison directe GTFS."""
    from_id = request.args.get("from")
    to_id = request.args.get("to")

    if not from_id or not to_id:
        return jsonify({"status": "error", "message": "Identifiants d'arrêts manquants"}), 400

    # 1. Charger les détails des arrêts
    stops = execute_pg(
        """
        SELECT stop_id, stop_name, stop_lat, stop_lon
        FROM idf_stops
        WHERE stop_id IN (%s, %s)
        """,
        (from_id, to_id),
        fetch=True,
    )

    if len(stops) < 2 and from_id != to_id:
        return jsonify({"status": "error", "message": "Un ou plusieurs arrêts sont introuvables"}), 404

    # Mapper pour retrouver départ/arrivée
    stop_map = {s["stop_id"]: s for s in stops}
    # Cas particulier : même arrêt
    if from_id == to_id and len(stops) == 1:
        stop_map[from_id] = stops[0]

    from_stop = stop_map.get(from_id)
    to_stop = stop_map.get(to_id)

    if not from_stop or not to_stop:
        return jsonify({"status": "error", "message": "Erreur lors du chargement des arrêts"}), 404

    # 2. Calculer la distance
    distance_km = haversine(
        from_stop["stop_lat"],
        from_stop["stop_lon"],
        to_stop["stop_lat"],
        to_stop["stop_lon"],
    )

    # 3. Rechercher une liaison directe GTFS (parmi tous les stop_id portant le même nom)
    direct_trips = []
    try:
        from_ids_rows = execute_pg("SELECT stop_id FROM idf_stops WHERE stop_name = %s", (from_stop["stop_name"],), fetch=True)
        to_ids_rows = execute_pg("SELECT stop_id FROM idf_stops WHERE stop_name = %s", (to_stop["stop_name"],), fetch=True)
        
        from_ids = [r["stop_id"] for r in from_ids_rows] if from_ids_rows else [from_id]
        to_ids = [r["stop_id"] for r in to_ids_rows] if to_ids_rows else [to_id]
        
        # Astuce de sécurité psycopg2 pour éviter la virgule de fin si taille == 1
        t_from = tuple(from_ids * 2 if len(from_ids) == 1 else from_ids)
        t_to = tuple(to_ids * 2 if len(to_ids) == 1 else to_ids)

        rows = execute_pg(
            """
            SELECT DISTINCT
                r.route_short_name, r.route_long_name, r.route_type,
                st1.departure_time, st2.arrival_time, t.trip_headsign
            FROM idf_stop_times st1
            JOIN idf_stop_times st2 ON st1.trip_id = st2.trip_id AND st1.stop_sequence < st2.stop_sequence
            JOIN idf_trips t ON st1.trip_id = t.trip_id
            JOIN idf_routes r ON t.route_id = r.route_id
            WHERE st1.stop_id IN %s AND st2.stop_id IN %s
            ORDER BY st1.departure_time
            LIMIT 5
            """,
            (t_from, t_to),
            fetch=True,
        )
        direct_trips = [
            {
                "ligne": r["route_short_name"],
                "nom_complet": r["route_long_name"],
                "type": map_route_type(r["route_type"]),
                "depart": r["departure_time"][:5],  # HH:MM
                "arrivee": r["arrival_time"][:5],  # HH:MM
                "direction": r["trip_headsign"],
            }
            for r in rows
        ]
    except Exception as e:
        # En cas d'erreur de base de données, on logge mais on ne bloque pas le calcul de distance
        print(f"Erreur recherche GTFS: {e}")

    # 4. Générer les options de transport
    # Option 1: Voiture individuelle (calcul basé sur la distance)
    # Vitesse moyenne voiture estimée à 35 km/h en milieu urbain/périurbain
    temps_voiture = max(3, int((distance_km / 35.0) * 60))
    # Facteur de congestion aléatoire léger (ex: entre 1x et 1.4x)
    temps_voiture_reel = int(temps_voiture * 1.15)
    co2_voiture = round(distance_km * 0.18, 2)  # 180g CO2/km

    # Option 2: Transports en commun / Multimodal
    # Vitesse moyenne transport estimée à 45 km/h (incluant arrêts) + 5 min d'attente
    temps_transit = max(5, int((distance_km / 45.0) * 60) + 5)
    co2_transit = round(distance_km * 0.02, 2)  # 20g CO2/km (RER/Métro électrique)

    # Calcul d'un "Healthy Score" sur 100
    # Plus le trajet rejette de CO2, plus le score baisse. Les transports doux/transit ont un excellent score.
    score_voiture = max(10, int(100 - (co2_voiture * 8)))
    score_transit = max(75, int(100 - (co2_transit * 4)))

    return jsonify(
        {
            "status": "ok",
            "from_stop": from_stop["stop_name"],
            "to_stop": to_stop["stop_name"],
            "distance_km": distance_km,
            "direct_transit": direct_trips,
            "options": {
                "voiture": {
                    "mode": "Voiture Individuelle",
                    "temps_minutes": temps_voiture_reel,
                    "co2_kg": co2_voiture,
                    "healthy_score": score_voiture,
                    "icon": "🚗",
                },
                "transit": {
                    "mode": "Itinéraire Multimodal (P+R & Rails)",
                    "temps_minutes": temps_transit,
                    "co2_kg": co2_transit,
                    "healthy_score": score_transit,
                    "icon": "🚇",
                },
            },
        }
    )
