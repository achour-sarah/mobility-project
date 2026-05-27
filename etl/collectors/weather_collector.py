import time
import requests
import logging
from datetime import datetime, timezone
from etl.db import execute_pg, get_mongo_col, log_pipeline
from etl.config import VILLES

logger = logging.getLogger(__name__)

def wmo_to_text(code):
    if code == 0: return "ciel dégagé"
    if code in [1, 2, 3]: return "nuageux"
    if code in [45, 48]: return "brouillard"
    if code in [51, 53, 55, 61, 63, 65, 80, 81, 82]: return "pluie"
    if code in [71, 73, 75, 85, 86]: return "neige"
    if code in [95, 96, 99]: return "orage"
    return "incertain"

def collect_weather() -> int:
    t0  = time.time()
    now = datetime.now(timezone.utc)
    records = []

    for ville in VILLES:
        try:
            url = f"https://api.open-meteo.com/v1/forecast?latitude={ville['lat']}&longitude={ville['lon']}&current=temperature_2m,relative_humidity_2m,surface_pressure,wind_speed_10m,wind_direction_10m,precipitation,weather_code"
            resp = requests.get(url, timeout=10)
            data = resp.json()
            curr = data.get("current", {})

            rec = {
                "ville":          ville["nom"],
                "temperature":    curr.get("temperature_2m", 15.0),
                "humidite":       curr.get("relative_humidity_2m", 50),
                "pression":       curr.get("surface_pressure", 1013.0),
                "vent_vitesse":   curr.get("wind_speed_10m", 10.0),
                "vent_direction": curr.get("wind_direction_10m", 0),
                "description":    wmo_to_text(curr.get("weather_code", 0)),
                "pluie_1h":       curr.get("precipitation", 0.0),
                "lat":            ville["lat"],
                "lon":            ville["lon"],
            }
        except Exception as e:
            logger.error(f"Erreur Open-Meteo pour {ville['nom']}: {e}")
            continue

        records.append(rec)

        execute_pg(
            """
            INSERT INTO meteo
              (source, ville, temperature, humidite, pression,
               vent_vitesse, vent_direction, description,
               pluie_1h, lat, lon, collecte_at)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
            """,
            (
                "OpenWeatherMap",
                rec["ville"], rec["temperature"], rec["humidite"],
                rec["pression"], rec["vent_vitesse"], rec["vent_direction"],
                rec["description"], rec["pluie_1h"],
                rec["lat"], rec["lon"], now,
            ),
        )

    get_mongo_col("meteo_raw").insert_one({
        "run_at":  now.isoformat(),
        "records": records,
    })

    duree = int((time.time() - t0) * 1000)
    log_pipeline("weather_collector", "success", len(records), "", duree)
    logger.info("[MÉTÉO] %d villes insérées en %d ms", len(records), duree)
    return len(records)