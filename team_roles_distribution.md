# Répartition de la Soutenance MVP (3 Orateurs – 20 Minutes)

Ce document décrit la répartition équitable de la parole, des diapositives PowerPoint, des démonstrations sur le Dashboard, des lignes de code et des diagrammes à présenter par chaque membre de l'équipe (**Romain**, **Sarah**, **Shamcya**).

---

## 👤 ORATEUR 1 : ROMAIN VIGNARD – Ingénieur Données & API
**Focus :** Vision globale, gestion de projet, architecture système, pipelines de données.
**Timing ciblé :** 0:00 - 06:45 (environ 6 min 45s)

| Titre de la Section | Support visuel recommandé | Détails de la Démonstration / Contenu |
| :--- | :--- | :--- |
| **1. Introduction & Équipe** | 💻 **PowerPoint (Slide 1)** | Page de garde officielle, présentation du groupe et des rôles. |
| **2. Contexte & Problématique** | 📊 **PowerPoint (Slide 2)** | Chiffres clés de la mobilité en Île-de-France (pollution au $NO_2$, coût économique de la congestion, retards logistiques). |
| **3. Organisation Projet** | 🛠️ **PowerPoint (Slide 3)** | Présentation de la méthodologie Agile Scrum (sprints de 2 semaines), du Git Flow, du Kanban et de l'usage du GitHub Student Pack. |
| **4. Architecture Système** | 📐 **Diagramme d'Architecture** | Schéma des flux : Collecteurs ➔ BDD PostgreSQL + PostGIS ➔ API Flask ➔ Application React. |
| **5. Base de données Spatiale** | 🗄️ **Code SQL & Terminal** | Montrer le script [init.sql](file:///c:/Users/sacho/OneDrive/Desktop/mobility_project/database/init.sql) (extension PostGIS, index GIST, structure des tables `trafic_temps_reel` et `qualite_air`). |
| **6. Pipeline ETL Python** | 🐍 **Code Python & Terminal** | Montrer les collecteurs de données temps réel ([traffic_collector.py](file:///c:/Users/sacho/OneDrive/Desktop/mobility_project/etl/collectors/traffic_collector.py)). Afficher les logs du pipeline (`pipeline.log`) en cours d'écriture pour prouver que l'ETL tourne en direct. |

---

## 👤 ORATEUR 2 : SARAH ACHOUR – Data Scientist & Base de Données
**Focus :** Données volumineuses (GTFS), modélisation prédictive (ARIMA, LSTM), backend API.
**Timing ciblé :** 06:45 - 13:30 (environ 6 min 45s)

| Titre de la Section | Support visuel recommandé | Détails de la Démonstration / Contenu |
| :--- | :--- | :--- |
| **1. Ingestion de Données GTFS** | 🗄️ **PowerPoint (Slide 4)** | Présentation du défi de l'ingestion GTFS d'IDFM (8,6 millions de lignes d'horaires dans `idf_stop_times`). Justifier l'indexation SQL pour optimiser les calculs. |
| **2. Modèle ARIMA (Qualité de l'Air)** | 📈 **Code Python & Slide** | Expliquer le ré-échantillonnage temporel, le test statistique Dickey-Fuller augmenté (ADF) pour la stationnarité et le choix de l'ordre de différenciation *d*. Ouvrir [arima_model.py](file:///c:/Users/sacho/OneDrive/Desktop/mobility_project/models/arima_model.py). |
| **3. Modèle LSTM (Prédiction Trafic)** | 🧠 **Diagramme de Réseau de Neurones** | Schéma des couches Keras (LSTM 64 ➔ Dropout ➔ LSTM 32 ➔ Dense). Expliquer le Feature Engineering (vitesse, heure, jour, peak, et **passages GTFS**). Ouvrir [lstm_model.py](file:///c:/Users/sacho/OneDrive/Desktop/mobility_project/models/lstm_model.py). |
| **4. Évaluation & Fallback** | 💻 **Terminal (Démo live)** | Lancer le script d'évaluation `python models/evaluator.py` en direct. Expliquer les métriques d'erreur (MAE, RMSE, MAPE). Discuter du fallback automatique vers le Gradient Boosting en cas d'absence de TensorFlow. |
| **5. API Flask & Endpoints** | 🌐 **Navigateur / Postman (Live)** | Interroger l'endpoint des prédictions `/api/predictions/trafic` pour montrer la réponse JSON. Montrer le code du thread asynchrone pour l'entraînement à la demande (`POST /train/trafic`). |

---

## 👤 ORATEUR 3 : SHAMCYA MOHAMED ELECTON – Data Analyst & Expert JS
**Focus :** Interface utilisateur React, algorithmes d'éco-routage, gamification, accessibilité, 3D interactive et conclusion.
**Timing ciblé :** 13:30 - 20:00 (environ 6 min 30s)

| Titre de la Section | Support visuel recommandé | Détails de la Démonstration / Contenu (Sur Dashboard)** |
| :--- | :--- | :--- |
| **1. UI React & Dashboard** | 🖥️ **Dashboard React (Live)** | Naviguer dans l'onglet **Dashboard** (KPIs environnement, affluence théorique des gares, alertes de transports). |
| **2. Trajet Vert & Haversine** | 🖥️ **Mon Trajet Vert (Live)** | Lancer un calcul d'itinéraire. Expliquer le routage direct dans la base GTFS et la formule de Haversine pour la distance géodésique. Comparer le ROI écologique (CO₂ divisé par 9, temps de trajet réduit de 18% en heure de pointe). |
| **3. Gamification Comportementale** | 🖥️ **Mon Trajet Vert (Live)** | Cliquer sur "Valider le trajet vert". Montrer l'animation d'attribution d'XP et de niveau en direct (persistance dans LocalStorage). |
| **4. Accessibilité Numérique** | ♿ **Panel Accessibilité (Live)** | **DÉMO CRITIQUE (10 points de la grille)** : Ouvrir le module en bas à gauche. Activer le Contraste Élevé (l'application passe en noir et jaune), la Police Dyslexie, puis activer la synthèse vocale et survoler des boutons pour faire parler l'application. |
| **5. Crowdsourcing NLP IA** | 💬 **Chat Citoyen (Live)** | Écrire une alerte de trafic dans le chat. Montrer comment l'API Claude (ou le parser regex de secours) extrait automatiquement le type d'incident, sa gravité et émet une recommandation. |
| **6. Jumeau 3D & Lab Urbain** | 🖥️ **Paris 3D & Lab 2200 (Live)** | Manipuler la carte Three.js (phare Tour Eiffel, pluie 3D, métros qui bougent). Lancer la simulation 2200 dans le Lab Urbain et faire bouger les sliders pour voir le ciel s'assainir. |
| **7. Validation & Perspectives** | 💻 **Terminal / PowerPoint** | Présenter les tests de routage unitaire [test_geo_routing.py](file:///c:/Users/sacho/OneDrive/Desktop/mobility_project/test_geo_routing.py). Conclure avec la roadmap d'évolution (Docker/Kubernetes, GTFS-RT). |
