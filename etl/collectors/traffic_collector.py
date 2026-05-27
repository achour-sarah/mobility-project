import time
import random
import logging
import requests
from datetime import datetime, timezone
from etl.db import execute_pg, get_mongo_col, log_pipeline
from etl.config import TOMTOM_API_KEY, POINTS_TRAFIC

logger = logging.getLogger(__name__)

TOMTOM_URL = "https://api.tomtom.com/traffic/services/4/flowSegmentData/relative0/10/json"


def _fetch_tomtom(point: dict) -> dict | None:
    """Appel API TomTom Flow pour un point géographique."""
    if not TOMTOM_API_KEY:
        return None
    try:
        resp = requests.get(
            TOMTOM_URL,
            params={
                "point":   f"{point['lat']},{point['lon']}",
                "key":     TOMTOM_API_KEY,
                "unit":    "KMPH",
                "openLr":  "false",
            },
            timeout=10,
        )
        resp.raise_for_status()
        data = resp.json()
        fd = data.get("flowSegmentData", {})
        return {
            "segment_id":     point["id"],
            "nom_segment":    point["nom"],
            "vitesse_kmh":    round(fd.get("currentSpeed", 0), 1),
            "vitesse_libre":  round(fd.get("freeFlowSpeed", 0), 1),
            "taux_occupation": round(
                (1 - fd.get("currentSpeed", 1) /
                 max(fd.get("freeFlowSpeed", 1), 1)) * 100, 1
            ),
            "lat1": point["lat"], "lon1": point["lon"],
            "lat2": point["lat"] + 0.01, "lon2": point["lon"] + 0.01,
        }
    except Exception as e:
        logger.warning("TomTom erreur pour %s : %s", point["nom"], e)
        return None


def _fluidite(vitesse: float, vitesse_libre: float) -> str:
    if vitesse_libre == 0:
        return "inconnu"
    ratio = vitesse / vitesse_libre
    if ratio >= 0.8:
        return "libre"
    elif ratio >= 0.4:
        return "dense"
    return "bloqué"


def _demo_record(point: dict, heure: int) -> dict:
    """Fallback simulation si TomTom indisponible."""
    if 7 <= heure <= 9 or 17 <= heure <= 19:
        v = max(5.0, min(130.0, random.gauss(35, 18)))
    elif heure >= 22 or heure <= 5:
        v = max(5.0, min(130.0, random.gauss(95, 10)))
    else:
        v = max(5.0, min(130.0, random.gauss(70, 15)))
    vl = 110.0
    return {
        "segment_id":     point["id"],
        "nom_segment":    point["nom"],
        "vitesse_kmh":    round(v, 1),
        "vitesse_libre":  vl,
        "taux_occupation": round((1 - v / vl) * 100, 1),
        "lat1": point["lat"], "lon1": point["lon"],
        "lat2": point["lat"] + 0.01, "lon2": point["lon"] + 0.01,
    }


def collect_traffic() -> int:
    t0  = time.time()
    now = datetime.now(timezone.utc)
    h   = now.hour
    records = []
    source  = "TomTom" if TOMTOM_API_KEY else "simulation"

    for point in POINTS_TRAFIC:
        rec = _fetch_tomtom(point) if TOMTOM_API_KEY else None
        if rec is None:
            rec = _demo_record(point, h)
        rec["fluidite"] = _fluidite(rec["vitesse_kmh"], rec["vitesse_libre"])
        records.append(rec)

    for r in records:
        execute_pg(
            """
            INSERT INTO trafic_temps_reel
              (source, segment_id, nom_segment, vitesse_kmh,
               fluidite, taux_occupation,
               lat1, lon1, lat2, lon2, collecte_at)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
            """,
            (
                source,
                r["segment_id"], r["nom_segment"],
                r["vitesse_kmh"], r["fluidite"], r["taux_occupation"],
                r["lat1"], r["lon1"], r["lat2"], r["lon2"],
                now,
            ),
        )

    get_mongo_col("trafic_raw").insert_one({
        "run_at":  now.isoformat(),
        "source":  source,
        "records": records,
    })

    duree = int((time.time() - t0) * 1000)
    log_pipeline("traffic_collector", "success", len(records), source, duree)
    logger.info("[TRAFIC] %d segments insérés via %s en %d ms",
                len(records), source, duree)
    return len(records)