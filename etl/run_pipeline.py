import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import time
import logging
import argparse
import traceback
import threading

from etl.collectors.traffic_collector  import collect_traffic
from etl.collectors.gtfs_collector     import collect_gtfs
from etl.collectors.airparif_collector import collect_air
from etl.collectors.weather_collector  import collect_weather
from etl.config import (
    INTERVAL_TRAFIC, INTERVAL_TRANSPORT,
    INTERVAL_AIR, INTERVAL_METEO,
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s — %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler("etl/pipeline.log", encoding="utf-8"),
    ],
)
logger = logging.getLogger("pipeline")

COLLECTORS = {
    "traffic": {"fn": collect_traffic,  "interval": INTERVAL_TRAFIC},
    "gtfs":    {"fn": collect_gtfs,     "interval": INTERVAL_TRANSPORT},
    "air":     {"fn": collect_air,      "interval": INTERVAL_AIR},
    "weather": {"fn": collect_weather,  "interval": INTERVAL_METEO},
}


def run_once_all():
    logger.info("=== RUN ONCE - tous les collecteurs ===")
    for name, cfg in COLLECTORS.items():
        try:
            t0 = time.time()
            nb = cfg["fn"]()
            ms = int((time.time() - t0) * 1000)
            logger.info("  %-10s OK  %d enregistrements  (%d ms)", name, nb, ms)
        except Exception as e:
            logger.error("  %-10s ERREUR : %s", name, e)
            traceback.print_exc()


def _loop(name, fn, interval, stop):
    logger.info("[%s] demarre - toutes les %ds", name.upper(), interval)
    while not stop.is_set():
        try:
            fn()
        except Exception as e:
            logger.error("[%s] erreur : %s", name.upper(), e)
            traceback.print_exc()
        stop.wait(timeout=interval)


def run_realtime():
    stop = threading.Event()
    threads = []
    for name, cfg in COLLECTORS.items():
        t = threading.Thread(
            target=_loop,
            args=(name, cfg["fn"], cfg["interval"], stop),
            daemon=True,
        )
        threads.append(t)
        t.start()
    logger.info("Pipeline temps reel actif - Ctrl+C pour arreter")
    try:
        while True:
            time.sleep(5)
    except KeyboardInterrupt:
        stop.set()
        for t in threads:
            t.join(timeout=10)
        logger.info("Pipeline arrêté.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--once", action="store_true")
    args = parser.parse_args()
    if args.once:
        run_once_all()
    else:
        run_realtime()