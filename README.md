# SmartMobility IDF

Plateforme de supervision et d'aide à la décision pour la mobilité urbaine en Île-de-France, combinant données temps réel, modèles prédictifs et visualisations interactives (carte, 3D, gamification).

Projet réalisé dans le cadre du Mastère 2 Big Data & Intelligence Artificielle — Sup de Vinci.

**Équipe**
- Romain VIGNARD — Backend & API
- Sarah ACHOUR — Data Science & Base de données
- Shamcya MOHAMED-ELECTON — Frontend & Visualisation

## Aperçu

L'application s'organise en 5 pages principales :

| Page | Description |
|---|---|
| Dashboard | Supervision globale : trafic, transports, qualité de l'air, alertes |
| Mon Trajet Vert | Calculateur d'itinéraire multimodal avec gamification éco-citoyenne |
| Paris 3D & Tourisme | Carte interactive multi-vues (satellite, street view, transit & air, maquette 3D) |
| Lab Urbain 2200 | Simulateur de transition énergétique et de qualité de l'air à long terme |
| Équipe & Projet | Présentation du projet et de l'équipe |

## Stack technique

- **Frontend** : React.js, Leaflet, Three.js
- **Backend** : Flask (API REST, Python)
- **Base de données** : PostgreSQL + PostGIS
- **Pipeline ETL** : Python (collecte trafic, météo, transports, qualité de l'air)
- **Modèles prédictifs** : ARIMA (statsmodels), LSTM (TensorFlow) avec fallback Gradient Boosting

## Démarrage rapide

Deux façons de découvrir le projet :

- **Sans rien installer** : l'application est déployée et accessible directement sur [mobility-project-one.vercel.app](https://mobility-project-one.vercel.app).
- **En local** : suivre les étapes d'installation ci-dessous pour faire tourner le projet complet (frontend, backend, base de données, pipeline ETL) sur sa propre machine.

### Prérequis
- Python 3.10+
- Node.js 16+
- PostgreSQL 13+ avec l'extension PostGIS

### Installation

```bash
# Base de données
createdb mobilite_urbaine
psql -d mobilite_urbaine -f database/init.sql
python database/import_idf.py

# Backend
python -m venv venv
source venv/bin/activate  # ou venv\Scripts\Activate.ps1 sous Windows
pip install -r requirements.txt
pip install pandas numpy scikit-learn statsmodels tensorflow
python backend/app.py

# Frontend (dans un autre terminal)
cd frontend
npm install
npm start
```

L'application est accessible sur `http://localhost:3000`, l'API sur `http://localhost:5000`.

Un fichier `.env` est requis à la racine (clés API OpenWeatherMap, TomTom, IDFM, configuration PostgreSQL). Voir la documentation utilisateur complète pour le détail des variables.

### Tâches en arrière-plan

```bash
# Pipeline d'ingestion des données
python etl/run_pipeline.py

# Entraînement et évaluation des modèles
python models/evaluator.py
```

## Licence

Projet académique — Sup de Vinci, Mastère 2 Big Data & IA, 2025-2026.



