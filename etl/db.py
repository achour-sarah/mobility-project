import logging
import psycopg2
import psycopg2.extras
from pymongo import MongoClient
from etl.config import DATABASE_URL, MONGO_URI, MONGO_DB

logger = logging.getLogger(__name__)


def get_pg_conn():
    return psycopg2.connect(
        DATABASE_URL,
        cursor_factory=psycopg2.extras.RealDictCursor
    )


def execute_pg(query: str, params: tuple = (), fetch: bool = False):
    conn = get_pg_conn()
    try:
        with conn:
            with conn.cursor() as cur:
                cur.execute(query, params)
                if fetch:
                    return cur.fetchall()
    except Exception as e:
        logger.error("PostgreSQL error: %s", e)
        raise
    finally:
        conn.close()


_mongo_client = None

def get_mongo_col(collection: str):
    """MongoDB désactivé — retourne un objet factice."""
    class FakeCol:
        def insert_one(self, doc):
            pass
    return FakeCol()

def log_pipeline(collecteur: str, statut: str,
                 nb: int = 0, message: str = "", duree_ms: int = 0):
    try:
        execute_pg(
            """
            INSERT INTO pipeline_logs
              (collecteur, statut, nb_enregistrements, message, duree_ms)
            VALUES (%s, %s, %s, %s, %s)
            """,
            (collecteur, statut, nb, message, duree_ms),
        )
    except Exception:
        pass