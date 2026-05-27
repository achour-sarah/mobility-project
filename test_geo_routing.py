import os
import sys
import math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from etl.db import execute_pg

def haversine(lat1, lon1, lat2, lon2):
    lat1, lon1, lat2, lon2 = map(float, [lat1, lon1, lat2, lon2])
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    return R * c

def test_geo():
    # Gare de Lyon coord
    lat1, lon1 = 48.843402, 2.376365
    # Châtelet - Les Halles coord
    lat2, lon2 = 48.861745, 2.346976
    
    # 1. Find all stops within 600m of Gare de Lyon
    # 600m in lat/lon degrees approximately:
    lat_delta = 0.6 / 111.0
    lon_delta = 0.6 / (111.0 * math.cos(math.radians(lat1)))
    
    from_stops = execute_pg(
        """
        SELECT stop_id, stop_name, stop_lat, stop_lon FROM idf_stops
        WHERE stop_lat BETWEEN %s AND %s AND stop_lon BETWEEN %s AND %s
        """,
        (lat1 - lat_delta, lat1 + lat_delta, lon1 - lon_delta, lon1 + lon_delta),
        fetch=True
    )
    from_ids = [s["stop_id"] for s in from_stops if haversine(lat1, lon1, s["stop_lat"], s["stop_lon"]) <= 0.6]
    
    # 2. Find all stops within 600m of Châtelet
    lat_delta_to = 0.6 / 111.0
    lon_delta_to = 0.6 / (111.0 * math.cos(math.radians(lat2)))
    
    to_stops = execute_pg(
        """
        SELECT stop_id, stop_name, stop_lat, stop_lon FROM idf_stops
        WHERE stop_lat BETWEEN %s AND %s AND stop_lon BETWEEN %s AND %s
        """,
        (lat2 - lat_delta_to, lat2 + lat_delta_to, lon2 - lon_delta_to, lon2 + lon_delta_to),
        fetch=True
    )
    to_ids = [s["stop_id"] for s in to_stops if haversine(lat2, lon2, s["stop_lat"], s["stop_lon"]) <= 0.6]
    
    print(f"Stops within 600m of Gare de Lyon: {len(from_ids)}")
    print(f"Stops within 600m of Châtelet - Les Halles: {len(to_ids)}")
    
    # Let's find direct transit lines connecting these two sets of stops
    t_from = tuple(from_ids * 2 if len(from_ids) == 1 else from_ids)
    t_to = tuple(to_ids * 2 if len(to_ids) == 1 else to_ids)
    
    rows = execute_pg(
        """
        SELECT DISTINCT
            r.route_short_name, r.route_type
        FROM idf_stop_times st1
        JOIN idf_stop_times st2 ON st1.trip_id = st2.trip_id AND st1.stop_sequence < st2.stop_sequence
        JOIN idf_trips t ON st1.trip_id = t.trip_id
        JOIN idf_routes r ON t.route_id = r.route_id
        WHERE st1.stop_id IN %s AND st2.stop_id IN %s
        """,
        (t_from, t_to),
        fetch=True,
    )
    
    print("\nDirect lines found:")
    for r in rows:
        print(dict(r))

if __name__ == "__main__":
    test_geo()
