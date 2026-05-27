import psycopg2

try:
    conn = psycopg2.connect(
        host="localhost",
        port=5432,
        dbname="mobilite_urbaine",
        user="postgres",
        password="sarah"
    )
    print("Connexion PostgreSQL OK !")
    conn.close()
except Exception as e:
    print(f"ERREUR : {e}")