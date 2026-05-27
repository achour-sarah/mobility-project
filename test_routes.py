import os
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from etl.db import execute_pg

def test_routes():
    # Find all routes passing through any stop named 'Gare de Lyon'
    print("--- Routes at Gare de Lyon ---")
    rows = execute_pg(
        """
        SELECT DISTINCT r.route_short_name, r.route_type
        FROM idf_stop_times st
        JOIN idf_trips t ON st.trip_id = t.trip_id
        JOIN idf_routes r ON t.route_id = r.route_id
        JOIN idf_stops s ON st.stop_id = s.stop_id
        WHERE s.stop_name = 'Gare de Lyon'
        """,
        fetch=True
    )
    for r in rows:
        print(dict(r))

    # Find all routes passing through any stop named 'Châtelet - Les Halles'
    print("\n--- Routes at Châtelet - Les Halles ---")
    rows = execute_pg(
        """
        SELECT DISTINCT r.route_short_name, r.route_type
        FROM idf_stop_times st
        JOIN idf_trips t ON st.trip_id = t.trip_id
        JOIN idf_routes r ON t.route_id = r.route_id
        JOIN idf_stops s ON st.stop_id = s.stop_id
        WHERE s.stop_name = 'Châtelet - Les Halles'
        """,
        fetch=True
    )
    for r in rows:
        print(dict(r))

    # Find all routes passing through any stop named 'Châtelet'
    print("\n--- Routes at Châtelet ---")
    rows = execute_pg(
        """
        SELECT DISTINCT r.route_short_name, r.route_type
        FROM idf_stop_times st
        JOIN idf_trips t ON st.trip_id = t.trip_id
        JOIN idf_routes r ON t.route_id = r.route_id
        JOIN idf_stops s ON st.stop_id = s.stop_id
        WHERE s.stop_name = 'Châtelet'
        """,
        fetch=True
    )
    for r in rows:
        print(dict(r))

if __name__ == "__main__":
    test_routes()
