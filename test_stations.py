import os
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from etl.db import execute_pg

def test():
    # 1. Search for stop names matching 'Gare de Lyon' and 'Châtelet'
    print("--- Searching for Gare de Lyon ---")
    glyon_stops = execute_pg("SELECT stop_id, stop_name FROM idf_stops WHERE stop_name ILIKE %s LIMIT 10", ("%Gare de Lyon%",), fetch=True)
    for s in glyon_stops:
        print(s)

    print("\n--- Searching for Châtelet ---")
    chatelet_stops = execute_pg("SELECT stop_id, stop_name FROM idf_stops WHERE stop_name ILIKE %s LIMIT 10", ("%Châtelet%",), fetch=True)
    for s in chatelet_stops:
        print(s)

    # Let's see why routing between Gare de Lyon (name: "Gare de Lyon") and Châtelet - Les Halles (name: "Châtelet - Les Halles") might fail.
    # Let's find all stop IDs for exactly "Gare de Lyon" and "Châtelet - Les Halles" or similar
    name1 = "Gare de Lyon"
    name2 = "Châtelet - Les Halles"
    
    from_ids_rows = execute_pg("SELECT stop_id, stop_name FROM idf_stops WHERE stop_name = %s", (name1,), fetch=True)
    to_ids_rows = execute_pg("SELECT stop_id, stop_name FROM idf_stops WHERE stop_name = %s", (name2,), fetch=True)
    
    print(f"\nExact name match for '{name1}': {len(from_ids_rows)} stops")
    print(f"Exact name match for '{name2}': {len(to_ids_rows)} stops")
    
    from_ids = [r["stop_id"] for r in from_ids_rows]
    to_ids = [r["stop_id"] for r in to_ids_rows]
    
    if from_ids and to_ids:
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
            LIMIT 10
            """,
            (t_from, t_to),
            fetch=True,
        )
        print(f"\nDirect trips found: {len(rows)}")
        for r in rows[:10]:
            print(dict(r))
    else:
        print("\nCannot run query because one of the stop lists is empty.")

if __name__ == "__main__":
    test()
