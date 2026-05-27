import sys
import os
import time
import logging

# Permet d'importer les modules du projet
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from etl.db import get_pg_conn

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s — %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("import_idf")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
IDF_DIR = os.path.join(BASE_DIR, "IDF")
SQL_INIT_FILE = os.path.join(BASE_DIR, "init_gtfs.sql")

# Mapping entre le nom du fichier et la table cible
FILES_TO_IMPORT = [
    ("agency.txt", "idf_agency"),
    ("routes.txt", "idf_routes"),
    ("stops.txt", "idf_stops"),
    ("calendar.txt", "idf_calendar"),
    ("calendar_dates.txt", "idf_calendar_dates"),
    ("shapes.txt", "idf_shapes"),
    ("trips.txt", "idf_trips"),
    ("transfers.txt", "idf_transfers"),
    ("stop_times.txt", "idf_stop_times"), # Le plus gros à la fin
]

def init_database():
    """Crée les tables en exécutant init_gtfs.sql"""
    logger.info("Création des tables GTFS...")
    with open(SQL_INIT_FILE, 'r', encoding='utf-8') as f:
        sql = f.read()
    
    conn = get_pg_conn()
    with conn:
        with conn.cursor() as cur:
            cur.execute(sql)
    conn.close()
    logger.info("Tables créées avec succès.")

def get_csv_headers(filepath: str) -> list:
    """Lit la première ligne du CSV pour avoir l'ordre exact des colonnes."""
    with open(filepath, 'r', encoding='utf-8') as f:
        header_line = f.readline().strip()
        
        # Le GTFS standard a parfois un BOM UTF-8 (\ufeff)
        if header_line.startswith('\ufeff'):
            header_line = header_line[1:]
            
        columns = header_line.split(',')
        return [col.strip() for col in columns]

def import_file(filename: str, tablename: str):
    """Importe un fichier texte dans PostgreSQL en utilisant la commande COPY."""
    filepath = os.path.join(IDF_DIR, filename)
    if not os.path.exists(filepath):
        logger.warning(f"Fichier {filename} introuvable. Ignoré.")
        return

    logger.info(f"--- Début de l'import : {filename} -> {tablename} ---")
    t0 = time.time()
    
    try:
        columns = get_csv_headers(filepath)
        cols_str = ','.join(columns)
        
        conn = get_pg_conn()
        with conn:
            with conn.cursor() as cur:
                # On vide la table avant d'importer pour éviter les doublons
                cur.execute(f"TRUNCATE TABLE {tablename};")
                
                # La commande COPY est lue directement depuis le fichier Python vers Postgres
                with open(filepath, 'r', encoding='utf-8') as f:
                    copy_sql = f"COPY {tablename}({cols_str}) FROM STDIN WITH CSV HEADER DELIMITER ','"
                    cur.copy_expert(sql=copy_sql, file=f)
                    
                # (Génération géospatiale retirée car PostGIS non disponible)
                pass

        duree = time.time() - t0
        logger.info(f"✅ {filename} importé avec succès en {duree:.1f} secondes.")
        
    except Exception as e:
        logger.error(f"❌ Erreur lors de l'import de {filename} : {e}")

if __name__ == "__main__":
    if not os.path.exists(IDF_DIR):
        logger.error(f"Le dossier {IDF_DIR} n'existe pas.")
        sys.exit(1)
        
    init_database()
    
    for filename, tablename in FILES_TO_IMPORT:
        import_file(filename, tablename)
        
    logger.info("🎉 Importation des données Île-de-France terminée ! Vous pouvez maintenant fermer ce script.")
