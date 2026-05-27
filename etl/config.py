import os
from dotenv import load_dotenv

load_dotenv()

OPENWEATHERMAP_API_KEY = os.getenv("OPENWEATHERMAP_API_KEY", "")
TOMTOM_API_KEY         = os.getenv("TOMTOM_API_KEY", "")
IDFM_API_KEY           = os.getenv("IDFM_API_KEY", "")

POSTGRES_HOST     = os.getenv("POSTGRES_HOST", "localhost")
POSTGRES_PORT     = int(os.getenv("POSTGRES_PORT", 5432))
POSTGRES_DB       = os.getenv("POSTGRES_DB", "mobilite_urbaine")
POSTGRES_USER     = os.getenv("POSTGRES_USER", "postgres")
POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD", "admin123")

DATABASE_URL = (
    f"postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}"
    f"@{POSTGRES_HOST}:{POSTGRES_PORT}/{POSTGRES_DB}"
)

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
MONGO_DB  = os.getenv("MONGO_DB", "mobilite_raw")

VILLES = [
    {"nom": "Paris",    "lat": 48.8566, "lon": 2.3522},
    {"nom": "Lyon",     "lat": 45.7640, "lon": 4.8357},
    {"nom": "Bordeaux", "lat": 44.8378, "lon": -0.5792},
]

# Points trafic TomTom — autoroutes IDF
POINTS_TRAFIC = [
    {"id": "A1-001",   "nom": "A1 – Paris Nord",        "lat": 48.960, "lon": 2.340},
    {"id": "A3-001",   "nom": "A3 – Porte de Bagnolet", "lat": 48.860, "lon": 2.410},
    {"id": "A4-001",   "nom": "A4 – Marne-la-Vallée",   "lat": 48.840, "lon": 2.500},
    {"id": "A6-001",   "nom": "A6 – Paris Sud",          "lat": 48.780, "lon": 2.320},
    {"id": "A13-001",  "nom": "A13 – Versailles",        "lat": 48.820, "lon": 2.200},
    {"id": "BD-001",   "nom": "Périphérique Nord",       "lat": 48.900, "lon": 2.350},
    {"id": "BD-002",   "nom": "Périphérique Est",        "lat": 48.870, "lon": 2.420},
    {"id": "N118-001", "nom": "N118 – Saclay",           "lat": 48.730, "lon": 2.180},
]

INTERVAL_TRAFIC    = 60
INTERVAL_TRANSPORT = 120
INTERVAL_AIR       = 300
INTERVAL_METEO     = 600