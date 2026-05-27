import time
import random
import logging
import requests
from datetime import datetime, timezone
from etl.db import execute_pg, get_mongo_col, log_pipeline
from etl.config import OPENWEATHERMAP_API_KEY, VILLES

logger = logging.getLogger(__name__)

OWM_AIR_URL = "https://api.openweathermap.org/data/2.5/air_pollution"

STATIONS_SUPPLEMENTAIRES = [
    {"id": "92002001", "nom": "Boulogne-Billancourt", "lat": 48.8400, "lon": 2.2401},
    {"id": "93001001", "nom": "Saint-Denis Centre",   "lat": 48.9363, "lon": 2.3575},
    {"id": "94001001", "nom": "Créteil – Préfecture", "lat": 48.7752, "lon": 2.4568},
]

POLLUANTS_DEMO = {
    "NO2":  {"mean": 32,  "std": 18, "unite": "µg/m³"},
    "PM10": {"mean": 22,  "std": 12, "unite": "µg/m³"},
    "PM25": {"mean": 15,  "std": 8,  "unite": "µg/m³"},
    "O3":   {"mean": 55,  "std": 25, "unite": "µg/m³"},
    "CO":   {"mean": 0.4, "std": 0.2,"unite": "mg/m³"},
}


def _indice(no2, pm10, pm25, o3) -> int:
    def si(v, s):
        for i, x in enumerate(s, 1):
            if v <= x:
                return i
        return 10
    return max(
        si(no2,  [20, 40, 50, 75, 100, 150, 200, 275, 400]),
        si(pm10, [10, 20, 25, 30,  40,  50,  65,  80, 100]),
        si(pm25, [5,  10, 15, 20,  25,  30,  40,  50,  75]),
        si(o3,   [29, 54, 79, 99, 119, 139, 159, 179, 239]),
    )


def _fetch_owm_air(lat: float, lon: float) -> dict | None:
    """Appel API OpenWeatherMap Air Pollution."""
    if not OPENWEATHERMAP_API_KEY:
        return None
    try:
        resp = requests.get(
            OWM_AIR_URL,
            params={
                "lat":   lat,
                "lon":   lon,
                "appid": OPENWEATHERMAP_API_KEY,
            },
            timeout=10,
        )
        resp.raise_for_status()
        data = resp.json()
        comp = data["list"][0]["components"]
        aqi  = data["list"][0]["main"]["aqi"]

        # Conversion indice OWM (1-5) vers ATMO (1-10)
        indice_atmo = aqi * 2

        return {
            "NO2":  {"valeur": round(comp.get("no2",  0), 2), "unite": "µg/m³"},
            "PM10": {"valeur": round(comp.get("pm10", 0), 2), "unite": "µg/m³"},
            "PM25": {"valeur": round(comp.get("pm2_5",0), 2), "unite": "µg/m³"},
            "O3":   {"valeur": round(comp.get("o3",   0), 2), "unite": "µg/m³"},
            "CO":   {"valeur": round(comp.get("co",   0) / 1000, 2), "unite": "mg/m³"},
            "indice_atmo": indice_atmo,
        }
    except Exception as e:
        logger.warning("OWM Air erreur : %s", e)
        return None


def _demo_mesures() -> dict:
    vals = {
        p: max(0.0, random.gauss(cfg["mean"], cfg["std"]))
        for p, cfg in POLLUANTS_DEMO.items()
    }
    indice = _indice(vals["NO2"], vals["PM10"], vals["PM25"], vals["O3"])
    return {
        p: {"valeur": round(v, 2), "unite": POLLUANTS_DEMO[p]["unite"]}
        for p, v in vals.items()
    } | {"indice_atmo": indice}


def collect_air() -> int:
    t0  = time.time()
    now = datetime.now(timezone.utc)
    records = []

    # Villes principales — API OWM temps réel
    points = [
        {"id": f"owm-{v['nom'].lower()}", "nom": v["nom"],
         "lat": v["lat"], "lon": v["lon"]}
        for v in VILLES
    ]
    # Stations supplémentaires IDF
    points += STATIONS_SUPPLEMENTAIRES

    source = "OpenWeatherMap" if OPENWEATHERMAP_API_KEY else "simulation"

    for pt in points:
        mesures = _fetch_owm_air(pt["lat"], pt["lon"]) if OPENWEATHERMAP_API_KEY else None
        if mesures is None:
            mesures = _demo_mesures()

        indice = mesures.pop("indice_atmo")

        for polluant, info in mesures.items():
            records.append({
                "station_id":  pt["id"],
                "station_nom": pt["nom"],
                "polluant":    polluant,
                "valeur":      info["valeur"],
                "unite":       info["unite"],
                "indice_atmo": indice,
                "lat": pt["lat"],
                "lon": pt["lon"],
            })

    for r in records:
        execute_pg(
            """
            INSERT INTO qualite_air
              (source, station_id, station_nom, polluant,
               valeur, unite, indice_atmo, lat, lon, collecte_at)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
            """,
            (
                source,
                r["station_id"], r["station_nom"],
                r["polluant"], r["valeur"], r["unite"],
                r["indice_atmo"], r["lat"], r["lon"], now,
            ),
        )

    get_mongo_col("air_raw").insert_one({
        "run_at":  now.isoformat(),
        "source":  source,
        "records": records,
    })

    duree = int((time.time() - t0) * 1000)
    log_pipeline("air_collector", "success", len(records), source, duree)
    logger.info("[AIR] %d mesures insérées via %s en %d ms",
                len(records), source, duree)
    return len(records)