import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from etl.db import execute_pg

SEP = "─" * 65

def section(titre):
    print(f"\n{SEP}\n  {titre}\n{SEP}")

def check_trafic():
    section("TRAFIC — 10 derniers segments")
    rows = execute_pg(
        "SELECT nom_segment, vitesse_kmh, fluidite, "
        "taux_occupation, collecte_at "
        "FROM trafic_temps_reel ORDER BY collecte_at DESC LIMIT 10",
        fetch=True,
    )
    if not rows:
        print("  Aucune donnée.")
        return
    print(f"  {'Segment':<30} {'Vitesse':>8} {'Fluidité':<10} {'Occup.':>6}")
    print(f"  {'─'*30} {'─'*8} {'─'*10} {'─'*6}")
    for r in rows:
        print(f"  {r['nom_segment']:<30} {r['vitesse_kmh']:>7.1f}  "
              f"{r['fluidite']:<10} {r['taux_occupation']:>5.1f}%")

def check_transports():
    section("TRANSPORTS — 8 dernières perturbations")
    rows = execute_pg(
        "SELECT ligne, type_transport, statut, message, collecte_at "
        "FROM transports_perturbations ORDER BY collecte_at DESC LIMIT 8",
        fetch=True,
    )
    if not rows:
        print("  Aucune donnée.")
        return
    print(f"  {'Ligne':<12} {'Type':<10} {'Statut':<14} {'Message':<30}")
    print(f"  {'─'*12} {'─'*10} {'─'*14} {'─'*30}")
    for r in rows:
        print(f"  {r['ligne']:<12} {r['type_transport']:<10} "
              f"{r['statut']:<14} {(r['message'] or '')[:30]}")

def check_air():
    section("QUALITÉ DE L'AIR — 15 dernières mesures")
    rows = execute_pg(
        "SELECT station_nom, polluant, valeur, unite, indice_atmo "
        "FROM qualite_air ORDER BY collecte_at DESC LIMIT 15",
        fetch=True,
    )
    if not rows:
        print("  Aucune donnée.")
        return
    print(f"  {'Station':<30} {'Polluant':<8} {'Valeur':>8} {'Unité':<8} {'Indice':>6}")
    print(f"  {'─'*30} {'─'*8} {'─'*8} {'─'*8} {'─'*6}")
    for r in rows:
        print(f"  {r['station_nom']:<30} {r['polluant']:<8} "
              f"{r['valeur']:>8.2f} {r['unite']:<8} {r['indice_atmo']:>6}")

def check_meteo():
    section("MÉTÉO — dernière collecte par ville")
    rows = execute_pg(
        "SELECT DISTINCT ON (ville) ville, temperature, humidite, "
        "pression, vent_vitesse, description "
        "FROM meteo ORDER BY ville, collecte_at DESC",
        fetch=True,
    )
    if not rows:
        print("  Aucune donnée.")
        return
    print(f"  {'Ville':<12} {'Temp.':>7} {'Hum.':>6} {'Pres.':>8} {'Vent':>7} {'Description'}")
    print(f"  {'─'*12} {'─'*7} {'─'*6} {'─'*8} {'─'*7} {'─'*20}")
    for r in rows:
        print(f"  {r['ville']:<12} {r['temperature']:>6.1f}°C "
              f"{r['humidite']:>5}%  {r['pression']:>7.1f}  "
              f"{r['vent_vitesse']:>5.1f}  {r['description']}")

def check_logs():
    section("LOGS PIPELINE — 10 derniers runs")
    rows = execute_pg(
        "SELECT collecteur, statut, nb_enregistrements, duree_ms, run_at "
        "FROM pipeline_logs ORDER BY run_at DESC LIMIT 10",
        fetch=True,
    )
    if not rows:
        print("  Aucune donnée.")
        return
    print(f"  {'Collecteur':<22} {'Statut':<10} {'Nb':>5} {'ms':>6}  {'Run at'}")
    print(f"  {'─'*22} {'─'*10} {'─'*5} {'─'*6}  {'─'*19}")
    for r in rows:
        print(f"  {r['collecteur']:<22} {r['statut']:<10} "
              f"{r['nb_enregistrements']:>5}  {r['duree_ms']:>5}  "
              f"{str(r['run_at'])[:19]}")


if __name__ == "__main__":
    print("\n" + "═"*65)
    print("  VÉRIFICATION DES DONNÉES COLLECTÉES")
    print("═"*65)
    check_trafic()
    check_transports()
    check_air()
    check_meteo()
    check_logs()
    print(f"\n{'═'*65}\n")