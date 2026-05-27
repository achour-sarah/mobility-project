import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
load_dotenv()

class Config:
    SECRET_KEY        = os.getenv("FLASK_SECRET_KEY", "supersecret")
    FLASK_ENV         = os.getenv("FLASK_ENV", "development")
    POSTGRES_HOST     = os.getenv("POSTGRES_HOST", "localhost")
    POSTGRES_PORT     = int(os.getenv("POSTGRES_PORT", 5432))
    POSTGRES_DB       = os.getenv("POSTGRES_DB", "mobilite_urbaine")
    POSTGRES_USER     = os.getenv("POSTGRES_USER", "postgres")
    POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD", "admin123")
    DATABASE_URL      = (
        f"postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}"
        f"@{POSTGRES_HOST}:{POSTGRES_PORT}/{POSTGRES_DB}"
    )