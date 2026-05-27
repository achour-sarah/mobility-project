import os
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from etl.db import execute_pg

def test_endpoint():
    # Let's mock a call to calculate_route with typical IDs
    # First search for 'Gare de Lyon' in database
    from_res = execute_pg("SELECT stop_id, stop_name FROM idf_stops WHERE stop_name = %s LIMIT 1", ("Gare de Lyon",), fetch=True)
    to_res = execute_pg("SELECT stop_id, stop_name FROM idf_stops WHERE stop_name = %s LIMIT 1", ("Châtelet - Les Halles",), fetch=True)
    
    if not from_res or not to_res:
        print("Stops not found")
        return
        
    from_id = from_res[0]["stop_id"]
    to_id = to_res[0]["stop_id"]
    print(f"Testing calculate_route with from_id={from_id} ('{from_res[0]['stop_name']}') and to_id={to_id} ('{to_res[0]['stop_name']}')")
    
    # 1. Load stop details
    stops = execute_pg(
        """
        SELECT stop_id, stop_name, stop_lat, stop_lon
        FROM idf_stops
        WHERE stop_id IN (%s, %s)
        """,
        (from_id, to_id),
        fetch=True,
    )
    print(f"Stops loaded: {stops}")
    
    stop_map = {s["stop_id"]: s for s in stops}
    from_stop = stop_map.get(from_id)
    to_stop = stop_map.get(to_id)
    
    if not from_stop or not to_stop:
        print("Failed to find from_stop or to_stop in map")
        return
        
    # 2. Get stop names
    from_name = from_stop["stop_name"]
    to_name = to_stop["stop_name"]
    print(f"Names: '{from_name}' -> '{to_name}'")
    
    # 3. Find IDs with matching names
    from_ids_rows = execute_pg("SELECT stop_id FROM idf_stops WHERE stop_name = %s", (from_name,), fetch=True)
    to_ids_rows = execute_pg("SELECT stop_id FROM idf_stops WHERE stop_name = %s", (to_name,), fetch=True)
    
    from_ids = [r["stop_id"] for r in from_ids_rows] if from_ids_rows else [from_id]
    to_ids = [r["stop_id"] for r in to_ids_rows] if to_ids_rows else [to_id]
    
    print(f"from_ids (count {len(from_ids)}): {from_ids[:5]}")
    print(f"to_ids (count {len(to_ids)}): {to_ids[:5]}")
    
    t_from = tuple(from_ids * 2 if len(from_ids) == 1 else from_ids)
    t_to = tuple(to_ids * 2 if len(to_ids) == 1 else to_ids)
    
    # Let's run the exact query
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
    print(f"Rows found: {len(rows)}")
    for r in rows:
        print(dict(r))

if __name__ == "__main__":
    test_endpoint()
