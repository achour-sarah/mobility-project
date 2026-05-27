import os
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from etl.db import execute_pg

def print_columns():
    rows = execute_pg(
        "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'idf_stops'",
        fetch=True
    )
    for r in rows:
        print(dict(r))

if __name__ == "__main__":
    print_columns()
