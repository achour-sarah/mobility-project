import os
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from etl.db import execute_pg

def print_columns():
    for table in ['idf_stops', 'trafic_temps_reel', 'meteo', 'qualite_air']:
        print(f"=== Columns for {table} ===")
        rows = execute_pg(
            f"SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '{table}'",
            fetch=True
        )
        for r in rows:
            print(f"  {r['column_name']}: {r['data_type']}")

if __name__ == "__main__":
    print_columns()

