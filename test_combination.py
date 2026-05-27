import os
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from etl.db import execute_pg

def test_combination():
    # Simulate autocomplete behavior which selects the first stop_id ordered by stop_id alphabetically
    from_row = execute_pg(
        """
        SELECT stop_id, stop_name FROM idf_stops 
        WHERE stop_name ILIKE %s 
        ORDER BY stop_name, stop_id LIMIT 1
        """, 
        ("%Gare de Lyon%",), 
        fetch=True
    )[0]
    
    to_row = execute_pg(
        """
        SELECT stop_id, stop_name FROM idf_stops 
        WHERE stop_name ILIKE %s 
        ORDER BY stop_name, stop_id LIMIT 1
        """, 
        ("%Châtelet - Les Halles%",), 
        fetch=True
    )[0]
    
    from_id = from_row["stop_id"]
    from_name = from_row["stop_name"]
    to_id = to_row["stop_id"]
    to_name = to_row["stop_name"]
    
    print(f"Autocomplete returned: '{from_name}' (id={from_id}) and '{to_name}' (id={to_id})")
    
    # Let's see what is stored in idf_stops for these names
    from_ids_rows = execute_pg("SELECT stop_id, stop_name FROM idf_stops WHERE stop_name = %s", (from_name,), fetch=True)
    to_ids_rows = execute_pg("SELECT stop_id, stop_name FROM idf_stops WHERE stop_name = %s", (to_name,), fetch=True)
    
    from_ids = [r["stop_id"] for r in from_ids_rows]
    to_ids = [r["stop_id"] for r in to_ids_rows]
    
    print(f"All IDs with name '{from_name}': {from_ids}")
    print(f"All IDs with name '{to_name}': {to_ids}")
    
    t_from = tuple(from_ids * 2 if len(from_ids) == 1 else from_ids)
    t_to = tuple(to_ids * 2 if len(to_ids) == 1 else to_ids)
    
    # Run the query
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
    
    print(f"Direct trips found between exact names: {len(rows)}")
    for r in rows:
        print(dict(r))

if __name__ == "__main__":
    test_combination()
