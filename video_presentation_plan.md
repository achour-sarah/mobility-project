# Script et Plan de Présentation Vidéo MVP (20 minutes) – SmartMobility IDF

Ce document structure la présentation vidéo de votre projet **SmartMobility IDF** pour une soutenance de **20 minutes**. Le plan suit rigoureusement vos directives et met en avant votre équipe réelle (Romain VIGNARD, Sarah ACHOUR, Shamcya MOHAMED ELECTON) ainsi que les conseils pratiques d'enregistrement, de fluidité (Données → IA → Décision) et de retour sur investissement (ROI).

---

## 📋 Structure Générale et Timing

```
[00:00 - 03:00]  PARTIE 1 : Présentation de l'entreprise fictive & de l'équipe projet
[03:00 - 06:00]  PARTIE 2 : Analyse de la problématique & introduction de la solution
[06:00 - 09:00]  PARTIE 3 : Organisation, méthodologies appliquées (Agile, Git Flow, Stack)
[09:00 - 18:00]  PARTIE 4 : Présentation approfondie de la solution technique
                 └─ [09:00 - 11:30] Collecte & Stockage (Données)
                 └─ [11:30 - 14:30] Modèles de prédictions & IA (IA)
                 └─ [14:30 - 18:00] Interfaces, Aide à la décision & ROI (Décision)
[18:00 - 20:00]  PARTIE 5 : Conclusion, Validation (Tests unitaires) & Perspectives
```

---

## 🎙️ Script Détaillé & Visuels (Scène par Scène)

### 🎙️ PARTIE 1 : Présentation de l'entreprise et de l'équipe projet (0:00 - 3:00)
⏱ **Timing :** 3 minutes
🖥 **Visuel à l'écran :**
*   **0:00 - 0:45 :** Diapositive de garde soignée avec la charte graphique de **SmartMobility IDF** (dégradés éco-verts et sombres). Logo du projet et mention *Sup de Vinci — M2 Big Data & IA*.
*   **0:45 - 3:00 :** Page **"Équipe & Projet"** (`AboutPage.jsx`) ouverte sur l'application Web. L'animateur utilise sa souris pour surligner les rôles de chaque membre.
🗣 **Speech (Script mot-à-mot) :**
> *"Bonjour à toutes et à tous, et bienvenue dans cette présentation de notre plateforme **SmartMobility IDF**. Nous sommes ravis de vous présenter aujourd'hui le fruit de notre travail de fin d'études au sein du Mastère 2 Big Data & IA à Sup de Vinci.*
>
> *Pour mener à bien ce projet d'envergure, nous avons simulé une structure de conseil en ingénierie de la donnée et en IA urbaine. Notre équipe se compose de trois profils spécialisés et complémentaires :*
>
> * *Tout d'abord, **Romain VIGNARD**, notre Ingénieur Données & API. Romain a conçu l'architecture globale du backend, orchestré les pipelines de collecte en temps réel et optimisé les requêtes d'itinéraires sur le réseau GTFS.*
> * *Ensuite, **Sarah ACHOUR**, notre Data Scientist et administratrice de base de données. Sarah a modélisé l'infrastructure PostgreSQL et PostGIS, et a développé l'intégralité des modèles mathématiques et de prédiction de la qualité de l'air et du trafic.*
> * *Enfin, moi-même, **Shamcya MOHAMED ELECTON**, Data Analyst et développeur React. J'ai eu la charge de concevoir l'interface utilisateur en React, d'intégrer le moteur cartographique Leaflet, et de modéliser le jumeau numérique 3D vectoriel avec Three.js.*
>
> *Ensemble, nous avons combiné nos expertises pour répondre à une problématique majeure de nos métropoles : comment exploiter l'Open Data pour rendre la mobilité urbaine plus respirable, plus fluide et plus verte."*
💡 **Conseil d'enregistrement :** Parlez d'une voix posée et souriez en présentant vos collègues. Assurez-vous que votre micro n'a pas d'écho de pièce (mettez un filtre anti-pop ou enregistrez dans une pièce meublée).

---

### 🎙️ PARTIE 2 : Analyse de la problématique et introduction à la solution (3:00 - 6:00)
⏱ **Timing :** 3 minutes
🖥 **Visuel à l'écran :**
*   **3:00 - 4:30 :** Captures vidéo d'embouteillages parisiens ou slides présentant les chiffres clés d'Île-de-France (volume de trafic, pics de pollution au $NO_2$, retards cumulés des RER).
*   **4:30 - 6:00 :** Onglet **Dashboard** de la Web App. Curseur pointant le compteur dynamique de CO₂ rejeté par heure et l'indice ATMO moyen de pollution de l'air.
🗣 **Speech (Script mot-à-mot) :**
> *"Analysons d'abord le problème. La région Île-de-France fait face à des crises simultanées. Sur le plan environnemental, la pollution de l'air liée aux transports est responsable de milliers de décès prématurés chaque année. Sur le plan économique, la congestion routière représente un coût de plusieurs milliards d'euros en heures perdues et en carburant pour les entreprises et les citoyens. Enfin, sur le plan logistique, la saturation chronique des réseaux de transports publics rend les déplacements pénibles et imprévisibles.*
>
> *Le constat est clair : les infrastructures physiques ne peuvent plus être agrandies indéfiniment. La solution ne viendra pas de nouvelles routes, mais d'une gestion intelligente de l'existant.*
>
> *C’est là qu’intervient **SmartMobility IDF**. Plutôt que de stocker passivement des données historiques, nous proposons une plateforme dynamique. Elle offre :*
> * *Aux **décideurs et gestionnaires**, un dashboard de supervision intégrant des prévisions de trafic par IA et des outils de simulation d'impact carbone.*
> * *Aux **citoyens**, un assistant d'éco-mobilité qui calcule le trajet le plus vert, compare l'empreinte écologique par rapport à la voiture individuelle et récompense les comportements éco-responsables.*
>
> *Notre solution se positionne comme un agrégateur de valeur, transformant les flux de données ouverts en leviers d'action et d'aide à la décision immédiate."*
💡 **Conseil d'enregistrement :** Marquez des pauses après les phrases importantes (comme *"La solution ne viendra pas de nouvelles routes..."*) pour donner du poids à votre discours.

---

### 🎙️ PARTIE 3 : Organisation et méthodologies appliquées (6:00 - 9:00)
⏱ **Timing :** 3 minutes
🖥 **Visuel à l'écran :**
*   **6:00 - 7:30 :** Capture d'écran du tableau Kanban de votre projet (GitHub Projects, Trello ou Jira) montrant la répartition des tickets et les sprints Agile.
*   **7:30 - 9:00 :** Schéma du Git Flow de votre projet (branches `main`, `develop`, pull requests des différents membres de l'équipe). Mention du *GitHub Student Developer Pack* pour l'accès aux outils gratuits de développement.
🗣 **Speech (Script mot-à-mot) :**
> *"Pour organiser ce projet complexe mêlant ingénierie de données, science des données et développement web, nous avons adopté la méthodologie **Agile Scrum**.*
>
> *Notre projet a été découpé en trois sprints de deux semaines. Chaque sprint s'ouvrait par un Sprint Planning pour définir les objectifs et se fermait par une démonstration fonctionnelle du MVP. Nous avons tenu des réunions quotidiennes de type 'Daily Standup' pour lever rapidement les verrous techniques, notamment lors de l'interfaçage des modèles de Deep Learning avec les endpoints du backend Flask.*
>
> *Sur le plan de l'ingénierie logicielle, nous avons appliqué un **Git Flow** strict sur notre dépôt GitHub. Chaque développeur travaillait sur une branche de fonctionnalité dédiée. Les fusions vers la branche d'intégration `develop` étaient soumises à des Pull Requests avec relecture de code croisée. Pour maximiser la qualité du code et la standardisation, nous avons également exploité les ressources du **GitHub Student Developer Pack**.*
>
> *Cette organisation nous a permis de paralléliser efficacement le travail : pendant que Romain déployait l'architecture de base de données, Sarah affinait les algorithmes d'apprentissage et Shamcya préparait l'application React."*
💡 **Conseil d'enregistrement :** Ce passage montre votre professionnalisme en gestion de projet. Parlez avec assurance des méthodes industrielles appliquées (Git Flow, Scrum).

---

### 🎙️ PARTIE 4 : Présentation de la solution technique (9:00 - 18:00)
⏱ **Timing :** 9 minutes (La partie centrale de la vidéo, structurée en 3 étapes : Données → IA → Décision/ROI)

#### Étape A : Les Données - Collecte et Stockage (9:00 - 11:30)
🖥 **Visuel à l'écran :**
*   Le code SQL de création de tables ([init.sql](file:///c:/Users/sacho/OneDrive/Desktop/mobility_project/database/init.sql)). Surligner l'extension PostGIS.
*   Le code de [gtfs_collector.py](file:///c:/Users/sacho/OneDrive/Desktop/mobility_project/etl/collectors/gtfs_collector.py).
🗣 **Speech (Script mot-à-mot) :**
> *"Commençons par la première étape de notre chaîne de valeur : **la Donnée**.*
>
> *Aucun modèle d'IA ne peut fonctionner sans des données fiables et structurées. Notre socle repose sur une base de données **PostgreSQL** avec l'extension spatiale **PostGIS**, indispensable pour stocker et indexer les coordonnées géographiques des capteurs d'air, de météo et des segments de routes.*
>
> *Nos pipelines ETL en Python collectent automatiquement en tâche de fond les flux de trafic de Data.gouv, les concentrations de polluants d'Airparif et les prévisions OpenWeatherMap.*
>
> *Le défi majeur a été l'ingestion de la base statique **GTFS** d'Île-de-France Mobilités. Nous avons modélisé et importé plus de 8,6 millions de lignes d'horaires et d'arrêts théoriques. Grâce à un travail rigoureux d'indexation sur les identifiants d'arrêts et de trajets dans PostgreSQL, nos requêtes de liaison transit s'exécutent en moins de 50 millisecondes, posant les bases de notre calculateur d'itinéraire."*

#### Étape B : L'IA - Modélisation Prédictive & Feature Engineering (11:30 - 14:30)
🖥 **Visuel à l'écran :**
*   Le script [lstm_model.py](file:///c:/Users/sacho/OneDrive/Desktop/mobility_project/models/lstm_model.py) sur l'éditeur de code, montrant le tableau des features d'entrée et la structure séquentielle Keras.
*   Lancer la commande `python models/evaluator.py` dans le terminal et observer l'entraînement et l'évaluation s'exécuter.
🗣 **Speech (Script mot-à-mot) :**
> *"La seconde étape de notre chaîne est **l'Intelligence Artificielle**.*
>
> *Pour le trafic routier, nous avons développé un réseau de neurones récurrents **LSTM** sous **TensorFlow**. Notre innovation majeure réside dans le feature engineering. Au lieu d'utiliser uniquement l'historique des vitesses, notre modèle intègre des variables multimodales : l'heure, le jour, le taux d'occupation des voies, mais aussi le nombre de passages de métros/bus planifiés dans le secteur issu du GTFS. Cela permet au modèle de comprendre l'influence du réseau ferroviaire sur la congestion automobile.*
>
> *L'architecture comporte deux couches LSTM de 64 et 32 cellules avec Dropout à 20% pour éviter le surapprentissage. Si TensorFlow est absent de l'environnement de production, un fallback automatique bascule sur un modèle de **Gradient Boosting** de Scikit-Learn.*
>
> *Pour la qualité de l'air, nous utilisons un modèle de série temporelle statistique **ARIMA**. Il réalise en continu un test de stationnarité Dickey-Fuller (ADF) et applique automatiquement une différenciation pour corriger les tendances. Les prédictions sont exposées via des endpoints Flask et peuvent être recalculées de manière asynchrone sans bloquer l'application."*

#### Étape C : La Décision, Accessibilité & Valorisation du ROI (14:30 - 18:00)
🖥 **Visuel à l'écran :**
*   **14:30 - 15:15 :** Manipuler l'onglet **Mon Trajet Vert** (`RecoPage.jsx`). Saisir un trajet (ex: Gare de Lyon ➔ Châtelet). Montrer le comparatif de temps, l'économie de CO₂ et valider pour voir l'XP augmenter.
*   **15:15 - 16:00 :** Cliquer sur le bouton flottant d'accessibilité (♿) en bas à gauche. Ouvrir le panneau et activer le **Contraste Élevé** (l'app passe en noir et jaune), la **Police Dyslexie** (les polices s'ajustent), et le **Lecteur de survol** (passer la souris sur le titre du calculateur pour faire parler la synthèse vocale). Désactiver pour revenir à la normale.
*   **16:00 - 16:45 :** Ouvrir le panneau **ChatCitoyen** temps réel. Envoyer un message signalant une perturbation et montrer l'encadré vert de l'analyse IA NLP.
*   **16:45 - 18:00 :** Ouvrir l'onglet **Paris 3D** (`Simulation3DPage.jsx`). Déplacer la caméra, activer la pluie 3D, le mode nuit. Basculer sur le **Lab Urbain 2200** (`SimulationPage.jsx`) et lancer l'animation pour montrer l'évolution de l'air de Paris.
🗣 **Speech (Script mot-à-mot) :**
> *"Enfin, la troisième étape : **la Décision**, l'accessibilité et la valorisation du **Retour sur Investissement (ROI)**.*
>
> *Pour le citoyen, l'aide à la décision se matérialise dans l'onglet 'Mon Trajet Vert'. Grâce au calcul de distance de Haversine et à notre index GTFS, l'application compare les trajets. La voiture est pénalisée par un coefficient de congestion dynamique aux heures de pointe.*
>
> *Le ROI est immédiat : en moyenne, le choix des transports collectifs permet de réduire le temps de trajet de 18% par rapport à une route congestionnée, tout en divisant les émissions de CO₂ par 9 (avec $20\text{g } CO_2/km$ en métro électrique contre $180\text{g}$ en voiture).*
>
> *Pour valoriser ce ROI auprès du citoyen, la gamification récompense chaque trajet vert en points d'XP, stockés dans le LocalStorage. Le crowdsourcing participatif intègre l'IA NLP (Claude API ou regex de secours) pour classifier les messages des citoyens et émettre des alertes instantanées pour la communauté.*
>
> *Dans une démarche d'inclusion numérique forte et de respect des critères du RGAA, nous avons également intégré un module d'accessibilité universelle. Accessible via le bouton flottant en bas à gauche, il permet de modifier la taille des polices, d'appliquer un contraste ultra-élevé noir et jaune pour les malvoyants, de charger une police à forte lisibilité pour les dyslexiques, et d'activer une synthèse vocale au survol de la souris.*
>
> *Pour les décideurs, la décision s'appuie sur la simulation 3D vectorielle interactive sous Three.js et sur le 'Lab Urbain 2200'. Ce simulateur montre le ROI écologique à long terme : en passant à 100% de véhicules électriques et à une énergie solaire, l'indice de pollution de la capitale chute de 80% d'ici 2056, ce qui se traduit visuellement par la dissipation du smog et l'arrêt de la fumée des usines sur notre jumeau numérique 3D."*
💡 **Conseil d'enregistrement :** C'est la partie la plus spectaculaire visuellement. Assurez-vous que vos mouvements de souris soient lents et que les pages chargent rapidement (lancez le backend localement avant d'enregistrer). Retenez que pour le test de synthèse vocale, le son de votre système doit être capturé par votre logiciel d'enregistrement pour que le jury l'entende.

---

### 🎙️ PARTIE 5 : Conclusion, Validation et Perspectives (18:00 - 20:00)
⏱ **Timing :** 2 minutes
🖥 **Visuel à l'écran :**
*   **18:00 - 19:15 :** Afficher à l'écran le script de test unitaire [test_geo_routing.py](file:///c:/Users/sacho/OneDrive/Desktop/mobility_project/test_geo_routing.py). Montrer l'exécution réussie dans la console.
*   **19:15 - 20:00 :** Revenir sur l'onglet **Équipe & Projet** de la Web App en guise de générique de fin, avec vos noms bien visibles.
🗣 **Speech (Script mot-à-mot) :**
> *"Pour valider la robustesse de notre plateforme, nous avons implémenté des tests unitaires et d'intégration, à l'image du script `test_geo_routing.py` visible à l'écran. Il garantit la précision spatiale de nos calculs et la fiabilité de nos recherches d'arrêts à moins de 600 mètres.*
>
> *En guise de perspectives, nous envisageons d'intégrer des flux GTFS-RealTime pour ajuster nos prédictions LSTM en fonction des retards de métros en temps réel. De plus, notre architecture modulaire est entièrement conteneurisée avec Docker, ce qui garantit sa scalabilité pour un déploiement cloud Kubernetes sur d'autres grandes métropoles françaises.*
>
> *En résumé, SmartMobility IDF démontre qu'en liant les Données ouvertes, l'Intelligence Artificielle prédictive et des interfaces d'aide à la Décision ludiques et immersives, nous pouvons guider nos métropoles vers un futur plus respirable et décarboné.*
>
> *Toute l'équipe – Romain, Sarah et moi-même – vous remercie chaleureusement pour votre attention et nous sommes à votre disposition pour vos questions."*
💡 **Conseil d'enregistrement :** Terminez sur une note dynamique et souriante. Laissez l'écran de fin fixe pendant 5 secondes supplémentaires après avoir fini de parler pour faciliter le montage vidéo.

---

## ⚡ Check-list de Production Vidéo

*   **Le Son :** Enregistrez dans une pièce calme, sans écho. Privilégiez un micro cravate ou un micro USB de bonne qualité. Ajustez les niveaux pour que votre voix ne sature pas (Restez entre -12dB et -6dB).
*   **Le Visuel :** Utilisez un enregistreur d'écran fluide (OBS Studio configuré en 1080p, 60 FPS). Cachez les onglets personnels de votre navigateur et les fichiers privés de votre bureau.
*   **Les Transitions :** Lorsque vous passez du code à la Web App, dites explicitement ce que vous faites (ex: *"Voyons maintenant comment ce modèle s'exprime sur notre interface..."*).
*   **La Répétition :** Répétez le script deux à trois fois à voix haute avant de lancer l'enregistrement final. Si vous faites une erreur de parole, faites un silence de 3 secondes, reprenez le début de votre phrase et continuez (cela facilitera grandement le découpage au montage).
