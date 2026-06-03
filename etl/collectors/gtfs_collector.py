import time
import logging
import requests
import re
import html
from datetime import datetime, timezone
from etl.db import execute_pg, get_mongo_col, log_pipeline
from etl.config import IDFM_API_KEY

logger = logging.getLogger(__name__)

# Liste des lignes majeures de transport en IDF pour le dashboard.
# Si elles ne sont pas renvoyées en perturbation par l'API, elles seront insérées comme "normal".
MAJOR_LINES = {
    # RERs
    "RER A": "RER",
    "RER B": "RER",
    "RER C": "RER",
    "RER D": "RER",
    "RER E": "RER",
    # Métros
    "M1": "Métro", "M2": "Métro", "M3": "Métro", "M3bis": "Métro",
    "M4": "Métro", "M5": "Métro", "M6": "Métro", "M7": "Métro", "M7bis": "Métro",
    "M8": "Métro", "M9": "Métro", "M10": "Métro", "M11": "Métro",
    "M12": "Métro", "M13": "Métro", "M14": "Métro",
    # Tramways
    "T1": "Tramway", "T2": "Tramway", "T3a": "Tramway", "T3b": "Tramway",
    "T4": "Tramway", "T5": "Tramway", "T6": "Tramway", "T7": "Tramway",
    "T8": "Tramway", "T9": "Tramway", "T10": "Tramway", "T11": "Tramway",
    "T12": "Tramway", "T13": "Tramway",
    # Bus et lignes d'origine / clés
    "Bus 62": "Bus",
    "Bus 20": "Bus",
    "Bus 21": "Bus",
    "Bus 30": "Bus",
    "Bus 24": "Bus",
    "Bus 88": "Bus",
    # Trains de banlieue (Transilien)
    "Ligne H": "Train",
    "Ligne J": "Train",
    "Ligne K": "Train",
    "Ligne L": "Train",
    "Ligne N": "Train",
    "Ligne P": "Train",
    "Ligne R": "Train",
    "Ligne U": "Train",
    "TGV Paris-Lyon": "Train",
}

def parse_disruption_line(title):
    # Remove calendar dates (e.g. "29 mai", "18/05") to avoid mistaking day numbers for line numbers
    title_clean = re.sub(
        r"\b\d+\s*(?:janvier|f[eé]vrier|mars|avril|mai|juin|juillet|ao[uû]t|septembre|octobre|novembre|d[eé]cembre)\b",
        "",
        title,
        flags=re.IGNORECASE
    )
    title_clean = re.sub(r"\b\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?\b", "", title_clean)
    
    title_upper = title_clean.upper()
    
    # 1. Détecter le type de transport par mots-clés ou émojis
    inferred_type = None
    if "RER" in title_upper or "🚆" in title:
        inferred_type = "RER"
    elif "TRAM" in title_upper or "TRAMWAY" in title_upper or "🚊" in title:
        inferred_type = "Tramway"
    elif "MÉTRO" in title_upper or "METRO" in title_upper or "🚇" in title:
        inferred_type = "Métro"
    elif "BUS" in title_upper or "🚍" in title or "🚏" in title:
        inferred_type = "Bus"
    elif "TRAIN" in title_upper or "TRANSILIEN" in title_upper:
        inferred_type = "Train"

    # 2. Extraire la ligne
    # RER A, B, C, D, E
    for letter in ['A', 'B', 'C', 'D', 'E']:
        if f"RER {letter}" in title_upper or f"RER{letter}" in title_upper:
            return f"RER {letter}", "RER"

    # Train lines (Transilien H, J, K, L, N, P, R, U)
    for letter in ['H', 'J', 'K', 'L', 'N', 'P', 'R', 'U']:
        if f"LIGNE {letter}" in title_upper or f"LIGNE{letter}" in title_upper or f"TRAIN {letter}" in title_upper:
            return f"Ligne {letter}", "Train"
            
    # Métros
    metro_match = re.search(r"\b(?:MÉTRO|METRO)\s*(\d+)\b", title_upper)
    if metro_match:
        return f"M{metro_match.group(1)}", "Métro"
    m_match = re.search(r"\bM([1-9]|1[0-8])\b", title_upper)
    if m_match:
        return f"M{m_match.group(1)}", "Métro"

    # Tramways
    tram_match = re.search(r"\b(?:TRAMWAY|TRAM|T)\s*(\d+[A-Z]?)\b", title_upper)
    if tram_match:
        return f"T{tram_match.group(1)}", "Tramway"
    t_match = re.search(r"\bT(\d+[A-Z]?)\b", title_upper)
    if t_match:
        return f"T{t_match.group(1)}", "Tramway"

    # Bus
    bus_match = re.search(r"\bBUS\s*(\w+)\b", title_upper)
    if bus_match:
        return f"Bus {bus_match.group(1)}", "Bus"

    # Recherche générique par "Ligne X"
    ligne_match = re.search(r"\bLIGNE\s*(\w+)\b", title_upper)
    if ligne_match:
        val = ligne_match.group(1)
        if val.isdigit():
            if inferred_type == "Métro" or (int(val) <= 18 and inferred_type != "Bus"):
                return f"M{val}", "Métro"
            else:
                return f"Bus {val}", "Bus"
        else:
            return f"Ligne {val}", inferred_type or "Autre"

    # Extraction par défaut avec premier nombre trouvé si un type est connu
    if inferred_type:
        nums = re.findall(r"\d+", title)
        if nums:
            prefix = "M" if inferred_type == "Métro" else "T" if inferred_type == "Tramway" else "Bus " if inferred_type == "Bus" else ""
            return f"{prefix}{nums[0]}", inferred_type
        return f"Ligne {inferred_type}", inferred_type

    return "Autre", "Autre"


MONTH_MAP = {
    "janvier": 1, "jan": 1,
    "fevrier": 2, "février": 2, "fev": 2,
    "mars": 3, "mar": 3,
    "avril": 4, "avr": 4,
    "mai": 5,
    "juin": 6,
    "juillet": 7, "juil": 7,
    "aout": 8, "août": 8,
    "septembre": 9, "sept": 9, "sep": 9,
    "octobre": 10, "oct": 10,
    "novembre": 11, "nov": 11,
    "decembre": 12, "décembre": 12, "dec": 12
}

def parse_dates_from_text(text: str):
    if not text:
        return None, None
    debut_at = None
    fin_at = None
    text_lower = text.lower()
    
    # 1. Quand : dimanche 7 juin 2026, de 11h00 à 13h00
    quand_pattern = r"quand\s*:\s*(?:[a-zà-ÿ]+)?\s*(\d{1,2})\s*([a-zà-ÿ]+)\s*(\d{4})?,?\s*(?:de|à partir de)\s*(\d{1,2})[h:](\d{2})?\s*(?:à|au)\s*(\d{1,2})[h:](\d{2})?"
    m_quand = re.search(quand_pattern, text_lower)
    if m_quand:
        day = int(m_quand.group(1))
        month_str = m_quand.group(2)
        year_str = m_quand.group(3)
        h1 = int(m_quand.group(4))
        m1 = int(m_quand.group(5)) if m_quand.group(5) else 0
        h2 = int(m_quand.group(6))
        m2 = int(m_quand.group(7)) if m_quand.group(7) else 0
        
        month = MONTH_MAP.get(month_str, 6)
        year = int(year_str) if year_str else 2026
        
        try:
            debut_at = datetime(year, month, day, h1, m1, tzinfo=timezone.utc)
            fin_at = datetime(year, month, day, h2, m2, tzinfo=timezone.utc)
            return debut_at, fin_at
        except ValueError:
            pass

    # 2. Du lundi 18 Mai au dimanche 05 Juillet 2026
    du_au_pattern = r"du\s*(?:[a-zà-ÿ]+)?\s*(\d{1,2})\s*([a-zà-ÿ]+)\s*(\d{4})?\s*(?:au|à)\s*(?:[a-zà-ÿ]+)?\s*(\d{1,2})\s*([a-zà-ÿ]+)\s*(\d{4})?"
    m_du_au = re.search(du_au_pattern, text_lower)
    if m_du_au:
        day1 = int(m_du_au.group(1))
        month1_str = m_du_au.group(2)
        year1_str = m_du_au.group(3)
        
        day2 = int(m_du_au.group(4))
        month2_str = m_du_au.group(5)
        year2_str = m_du_au.group(6)
        
        month1 = MONTH_MAP.get(month1_str, 5)
        month2 = MONTH_MAP.get(month2_str, 7)
        
        year2 = int(year2_str) if year2_str else 2026
        year1 = int(year1_str) if year1_str else year2
        
        try:
            debut_at = datetime(year1, month1, day1, 0, 0, tzinfo=timezone.utc)
            fin_at = datetime(year2, month2, day2, 23, 59, tzinfo=timezone.utc)
            return debut_at, fin_at
        except ValueError:
            pass
            
    # 3. du 07/06/2026 au 09/06/2026
    slash_pattern = r"du\s*(\d{1,2})[/-](\d{1,2})(?:[/-](\d{2,4}))?\s*(?:au|à)\s*(\d{1,2})[/-](\d{1,2})(?:[/-](\d{2,4}))?"
    m_slash = re.search(slash_pattern, text_lower)
    if m_slash:
        day1 = int(m_slash.group(1))
        month1 = int(m_slash.group(2))
        year1_str = m_slash.group(3)
        
        day2 = int(m_slash.group(4))
        month2 = int(m_slash.group(5))
        year2_str = m_slash.group(6)
        
        year2 = int(year2_str) if year2_str else 2026
        if year2 < 100:
            year2 += 2000
        year1 = int(year1_str) if year1_str else year2
        if year1 < 100:
            year1 += 2000
            
        try:
            debut_at = datetime(year1, month1, day1, 0, 0, tzinfo=timezone.utc)
            fin_at = datetime(year2, month2, day2, 23, 59, tzinfo=timezone.utc)
            return debut_at, fin_at
        except ValueError:
            pass

    # 4. le dimanche 7 juin 2026
    le_pattern = r"le\s*(?:[a-zà-ÿ]+)?\s*(\d{1,2})\s*([a-zà-ÿ]+)(?:\s*(\d{4}))?"
    m_le = re.search(le_pattern, text_lower)
    if m_le:
        day = int(m_le.group(1))
        month_str = m_le.group(2)
        year_str = m_le.group(3)
        
        month = MONTH_MAP.get(month_str)
        if month:
            year = int(year_str) if year_str else 2026
            try:
                debut_at = datetime(year, month, day, 0, 0, tzinfo=timezone.utc)
                fin_at = datetime(year, month, day, 23, 59, tzinfo=timezone.utc)
                return debut_at, fin_at
            except ValueError:
                pass

    return None, None


def parse_api_date(date_str):
    if not date_str:
        return None
    try:
        return datetime.strptime(date_str, "%Y%m%dT%H%M%S").replace(tzinfo=timezone.utc)
    except Exception:
        try:
            return datetime.fromisoformat(date_str.replace("Z", "+00:00"))
        except Exception:
            return None


def collect_gtfs() -> int:
    t0  = time.time()
    now = datetime.now(timezone.utc)
    
    if not IDFM_API_KEY:
        logger.error("[GTFS] Clé IDFM_API_KEY non configurée dans l'environnement (.env).")
        log_pipeline("gtfs_collector", "error", 0, "Clé API absente", 0)
        return 0

    # 1. Requête de l'API PRIM
    url = "https://prim.iledefrance-mobilites.fr/marketplace/disruptions_bulk/disruptions/v2"
    headers = {"apikey": IDFM_API_KEY}
    
    try:
        response = requests.get(url, headers=headers, timeout=15)
        if response.status_code != 200:
            logger.error(f"[GTFS] Erreur HTTP {response.status_code} de la part de l'API PRIM")
            log_pipeline("gtfs_collector", "error", 0, f"HTTP {response.status_code}", int((time.time()-t0)*1000))
            return 0
        data = response.json()
    except Exception as e:
        logger.error(f"[GTFS] Impossible d'interroger l'API PRIM : {e}")
        log_pipeline("gtfs_collector", "error", 0, str(e), int((time.time()-t0)*1000))
        return 0

    disruptions = data.get("disruptions", [])
    logger.info(f"[GTFS] {len(disruptions)} perturbations récupérées depuis PRIM.")

    # 2. Initialisation des lignes majeures de référence à l'état normal
    parsed_records = {}
    for line, trans_type in MAJOR_LINES.items():
        parsed_records[line] = {
            "ligne": line,
            "type_transport": trans_type,
            "statut": "normal",
            "message": "Trafic normal sur l'ensemble de la ligne.",
            "debut_at": None,
            "fin_at": None,
        }

    # 3. Analyse et filtrage des perturbations
    other_disruptions = {}
    severity_order = {"bloqué": 3, "interrompu": 3, "perturbé": 2, "information": 1, "normal": 0}

    for disp in disruptions:
        title = disp.get("title", "")
        message_html = disp.get("message", "")
        
        # Nettoyage HTML et décodage des entités de caractères (ex: &#233; -> é)
        clean_msg = html.unescape(re.sub(r'<[^>]*>', '', message_html)).strip()
        
        severity_api = disp.get("severity", "PERTURBEE").upper()
        if severity_api == "BLOQUANTE":
            statut = "interrompu"
        elif severity_api == "PERTURBEE":
            statut = "perturbé"
        elif severity_api == "INFORMATION":
            statut = "information"
        else:
            statut = "perturbé"

        line, trans_type = parse_disruption_line(title)
        if line == "Autre" or trans_type == "Autre":
            continue

        # Extraction des périodes (priorité à l'analyse du texte)
        text_to_parse = f"{title} - {clean_msg}"
        debut_at, fin_at = parse_dates_from_text(text_to_parse)
        
        if not debut_at or not fin_at:
            periods = disp.get("applicationPeriods", [])
            if periods:
                debut_at = parse_api_date(periods[0].get("begin"))
                fin_at = parse_api_date(periods[0].get("end"))

        record = {
            "ligne": line,
            "type_transport": trans_type,
            "statut": statut,
            "message": clean_msg or title,
            "debut_at": debut_at,
            "fin_at": fin_at,
        }

        # Mise à jour des lignes majeures
        if line in parsed_records:
            current = parsed_records[line]
            if severity_order.get(statut, 0) > severity_order.get(current["statut"], 0):
                parsed_records[line] = record
        else:
            # Regroupement des autres lignes par niveau de gravité maximal
            if line in other_disruptions:
                current = other_disruptions[line]
                if severity_order.get(statut, 0) > severity_order.get(current["statut"], 0):
                    other_disruptions[line] = record
            else:
                other_disruptions[line] = record

    # Agrégation finale des enregistrements
    all_records = list(parsed_records.values()) + list(other_disruptions.values())

    # 4. Insertion dans PostgreSQL
    for r in all_records:
        try:
            execute_pg(
                """
                INSERT INTO transports_perturbations
                  (source, ligne, type_transport, statut,
                   message, debut_at, fin_at, collecte_at)
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s)
                """,
                (
                    "IDF-Mobilités",
                    r["ligne"], r["type_transport"],
                    r["statut"], r["message"],
                    r["debut_at"], r["fin_at"], now,
                ),
            )
        except Exception as e:
            logger.error(f"[GTFS] Erreur insertion SQL pour {r['ligne']} : {e}")

    # Enregistrement brut dans le document Mongo simulé
    try:
        get_mongo_col("gtfs_raw").insert_one({
            "run_at":  now.isoformat(),
            "records": [{"ligne": r["ligne"], "statut": r["statut"]} for r in all_records],
        })
    except Exception:
        pass

    duree = int((time.time() - t0) * 1000)
    log_pipeline("gtfs_collector", "success", len(all_records), "", duree)
    logger.info("[GTFS] %d lignes insérées en %d ms", len(all_records), duree)
    
    return len(all_records)