import os
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from etl.db import execute_pg
from backend.routes.transports_routing import haversine

def test_all():
    # Fetch all stops matching Gare de Lyon
    glyon_stops = execute_pg("SELECT stop_id, stop_name, stop_lat, stop_lon FROM idf_stops WHERE stop_name ILIKE %s", ("%Gare de Lyon%",), fetch=True)
    # Fetch all stops matching Châtelet
    chatelet_stops = execute_pg("SELECT stop_id, stop_name, stop_lat, stop_lon FROM idf_stops WHERE stop_name ILIKE %s", ("%Châtelet%",), fetch=True)
    
    print(f"Gare de Lyon stops found: {len(glyon_stops)}")
    print(f"Châtelet stops found: {len(chatelet_stops)}")
    
    print("\nCombinations:")
    for s1 in glyon_stops:
        for s2 in chatelet_stops:
            dist = haversine(s1["stop_lat"], s1["stop_lon"], s2["stop_lat"], s2["stop_lon"])
            
            # Simulate direct route search for this specific pair
            from_name = s1["stop_name"]
            to_name = s2["stop_name"]
            
            from_ids_rows = execute_pg("SELECT stop_id FROM idf_stops WHERE stop_name = %s", (from_name,), fetch=True)
            to_ids_rows = execute_pg("SELECT stop_id FROM idf_stops WHERE stop_name = %s", (to_name,), fetch=True)
            
            from_ids = [r["stop_id"] for r in from_ids_rows]
            to_ids = [r["stop_id"] for r in to_ids_rows]
            
            t_from = tuple(from_ids * 2 if len(from_ids) == 1 else from_ids)
            t_to = tuple(to_ids * 2 if len(to_ids) == 1 else to_ids)
            
            rows = execute_pg(
                """
                SELECT DISTINCT r.route_short_name
                FROM idf_stop_times st1
                JOIN idf_stop_times st2 ON st1.trip_id = st2.trip_id AND st1.stop_sequence < st2.stop_sequence
                JOIN idf_trips t ON st1.trip_id = t.trip_id
                JOIN idf_routes r ON t.route_id = r.route_id
                WHERE st1.stop_id IN %s AND st2.stop_id IN %s
                """,
                (t_from, t_to),
                fetch=True,
            )
            lines = [r["route_short_name"] for r in rows]
            
            # Print if distance is close to 2.7 km or lines are empty
            if abs(dist - 2.7) < 0.2:
                print(f"From: '{from_name}' ({s1['stop_id']}) -> To: '{to_name}' ({s2['stop_id']}) | Dist: {dist} km | Lines: {lines}")

if __name__ == "__main__":
    test_all()
