import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(
    os.path.dirname(os.path.abspath(__file__)))))

import json
import logging
import requests
from flask import Blueprint, jsonify, request
from etl.db import execute_pg

logger = logging.getLogger(__name__)
signalements_bp = Blueprint("signalements", __name__)

CLAUDE_API_URL = "https://api.anthropic.com/v1/messages"
CLAUDE_MODEL   = "claude-sonnet-4-20250514"


def analyser_avec_ia(texte: str) -> dict:
    """
    Envoie le texte citoyen à Claude pour analyse.
    Retourne un dict structuré avec type, ligne, gravité, recommandation.
    """
    api_key = os.getenv("ANTHROPIC_API_KEY", "")
    if not api_key:
        # Fallback analyse basique sans IA
        return _analyse_basique(texte)

    prompt = f"""Tu es un assistant spécialisé en mobilité urbaine IDF.
Analyse ce signalement citoyen et réponds UNIQUEMENT en JSON valide sans markdown.

Signalement : "{texte}"

Réponds avec exactement ce format JSON :
{{
  "type_incident": "panne|accident|travaux|embouteillage|pollution|autre",
  "ligne_concernee": "nom de la ligne ou axe concerné, ou null",
  "localisation": "lieu précis si mentionné, ou null",
  "gravite": "faible|moyen|élevé|critique",
  "resume_ia": "résumé en 1 phrase de l'incident",
  "recommandation": "conseil concret pour les usagers en 1 phrase",
  "impact_trafic": "faible|moyen|fort"
}}"""

    try:
        resp = requests.post(
            CLAUDE_API_URL,
            headers={
                "x-api-key":         api_key,
                "anthropic-version": "2023-06-01",
                "content-type":      "application/json",
            },
            json={
                "model":      CLAUDE_MODEL,
                "max_tokens": 300,
                "messages":   [{"role": "user", "content": prompt}],
            },
            timeout=15,
        )
        resp.raise_for_status()
        content = resp.json()["content"][0]["text"].strip()
        return json.loads(content)
    except Exception as e:
        logger.warning("Analyse IA échouée : %s — fallback basique", e)
        return _analyse_basique(texte)


def _analyse_basique(texte: str) -> dict:
    """Analyse sans IA — détection par mots-clés."""
    texte_lower = texte.lower()

    type_incident = "autre"
    if any(w in texte_lower for w in ["panne","arrêt","bloqué","en rade"]):
        type_incident = "panne"
    elif any(w in texte_lower for w in ["accident","collision","choc"]):
        type_incident = "accident"
    elif any(w in texte_lower for w in ["travaux","chantier"]):
        type_incident = "travaux"
    elif any(w in texte_lower for w in ["bouchon","embouteillage","ralentissement"]):
        type_incident = "embouteillage"
    elif any(w in texte_lower for w in ["pollution","odeur","fumée"]):
        type_incident = "pollution"

    gravite = "moyen"
    if any(w in texte_lower for w in ["bloqué","interrompu","fermé","critique"]):
        gravite = "critique"
    elif any(w in texte_lower for w in ["panne","accident"]):
        gravite = "élevé"
    elif any(w in texte_lower for w in ["ralentissement","léger"]):
        gravite = "faible"

    lignes = ["RER A","RER B","RER C","RER D","RER E",
              "M1","M2","M3","M4","M5","M6","M7","M8","M9","M10","M11","M12","M13","M14",
              "T1","T2","T3","T3a","T3b","T4","T5","T6","T7","T8",
              "A1","A3","A4","A6","A13","N118","Périphérique"]
    ligne = None
    for l in lignes:
        if l.lower() in texte_lower:
            ligne = l
            break

    return {
        "type_incident":   type_incident,
        "ligne_concernee": ligne,
        "localisation":    None,
        "gravite":         gravite,
        "resume_ia":       f"Signalement citoyen : {type_incident} détecté.",
        "recommandation":  "Consultez les informations officielles et privilégiez les alternatives.",
        "impact_trafic":   "moyen",
    }


@signalements_bp.route("/signalements", methods=["GET"])
def get_signalements():
    """Retourne les derniers signalements citoyens."""
    limite = request.args.get("limite", 20, type=int)
    rows = execute_pg(
        """
        SELECT id, texte_original, auteur, type_incident,
               ligne_concernee, localisation, gravite,
               resume_ia, recommandation, statut,
               votes_utile, collecte_at
        FROM signalements_citoyens
        ORDER BY collecte_at DESC
        LIMIT %s
        """,
        (limite,),
        fetch=True,
    )
    data = [{
        "id":             r["id"],
        "texte":          r["texte_original"],
        "auteur":         r["auteur"],
        "type_incident":  r["type_incident"],
        "ligne":          r["ligne_concernee"],
        "localisation":   r["localisation"],
        "gravite":        r["gravite"],
        "resume_ia":      r["resume_ia"],
        "recommandation": r["recommandation"],
        "statut":         r["statut"],
        "votes":          r["votes_utile"],
        "collecte_at":    str(r["collecte_at"]),
    } for r in rows]

    return jsonify({"status":"ok","count":len(data),"data":data})


@signalements_bp.route("/signalements", methods=["POST"])
def post_signalement():
    """Reçoit un signalement citoyen, l'analyse avec l'IA et le stocke."""
    body  = request.get_json()
    texte = (body or {}).get("texte", "").strip()
    auteur = (body or {}).get("auteur", "Anonyme").strip() or "Anonyme"

    if not texte or len(texte) < 5:
        return jsonify({"status":"error","message":"Texte trop court"}), 400
    if len(texte) > 500:
        return jsonify({"status":"error","message":"Texte trop long (max 500 caractères)"}), 400

    # Analyse IA
    analyse = analyser_avec_ia(texte)

    # Insertion en base
    execute_pg(
        """
        INSERT INTO signalements_citoyens
          (texte_original, auteur, type_incident, ligne_concernee,
           localisation, gravite, resume_ia, recommandation)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s)
        """,
        (
            texte, auteur,
            analyse.get("type_incident"),
            analyse.get("ligne_concernee"),
            analyse.get("localisation"),
            analyse.get("gravite"),
            analyse.get("resume_ia"),
            analyse.get("recommandation"),
        ),
    )

    logger.info("Signalement reçu — %s — gravité: %s",
                analyse.get("type_incident"), analyse.get("gravite"))

    return jsonify({
        "status":  "ok",
        "message": "Signalement enregistré et analysé",
        "analyse": analyse,
    })


@signalements_bp.route("/signalements/<int:signal_id>/vote", methods=["POST"])
def voter_signalement(signal_id):
    """Vote 'utile' sur un signalement."""
    execute_pg(
        "UPDATE signalements_citoyens SET votes_utile = votes_utile + 1 WHERE id = %s",
        (signal_id,),
    )
    return jsonify({"status":"ok"})


@signalements_bp.route("/signalements/stats", methods=["GET"])
def stats_signalements():
    """Statistiques des signalements pour le dashboard."""
    rows = execute_pg(
        """
        SELECT type_incident, gravite, COUNT(*) as nb
        FROM signalements_citoyens
        WHERE collecte_at > NOW() - INTERVAL '2 hours'
        GROUP BY type_incident, gravite
        ORDER BY nb DESC
        """,
        fetch=True,
    )
    return jsonify({
        "status": "ok",
        "data":   [dict(r) for r in rows],
    })