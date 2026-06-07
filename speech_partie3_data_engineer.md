# 🎙️ Script Oral de Soutenance (Partie 3 : Démo, Décision & Infrastructure de Données)
## Rôle : Orateur 3 (Data Engineer – Shamcya MOHAMED ELECTON)

Ce document fournit le script oral complet et structuré pour la troisième partie de la présentation. Il détaille **les actions à faire à l'écran**, **le texte mot-à-mot à dire (ton Data Engineer / Tech)**, et **la justification technique sous-jacente** (flux de données, bases de données, modèles, robustesse) pour impressionner le jury.

---

## ⏱️ Chronologie & Enchaînement des Onglets (Durée : ~6-7 minutes)

```
[00:00 - 01:30]  Étape 1 : Espace Citoyen – "Mon Trajet Vert" (GTFS, Haversine, LocalStorage)
[01:30 - 03:00]  Étape 2 : Espace Citoyen – "Paris 3D & Tourisme" (Three.js, Leaflet, Splines de trafic & API Météo)
[03:00 - 04:45]  Étape 3 : Espace Gestionnaire – "Dashboard" (ETL, Airparif/Data.gouv, Dual Y-Axis, Modèle LSTM TensorFlow & Fallback)
[04:45 - 05:45]  Étape 4 : Espace Gestionnaire – "Lab Urbain 2200" (Simulation What-If, Rétroaction en temps réel)
[05:45 - 06:30]  Étape 5 : Tests Unitaires, DevOps (Docker, CI/CD) & Clôture générale
```

---

## 🎙️ Script Détaillé Mot-à-Mot

### 💻 1. Espace Citoyen : "Mon Trajet Vert" (00:00 - 01:30)

🖥️ **Actions Visuelles :**
1. Cliquez sur l'onglet **"Mon Trajet Vert"** dans le menu du haut.
2. Dans le formulaire, commencez à tapez `"Gare de Lyon"` dans le champ de départ (montrez l'autocomplétion rapide) et `"Châtelet-Les Halles"` en arrivée.
3. Cliquez sur **"Calculer l'itinéraire"** ➔ Les deux cartes comparatives (Voiture vs Transports) s'affichent avec le détail des émissions et du temps de trajet.
4. Cliquez sur le bouton vert **"Valider ce trajet vert"** ➔ La boîte d'alerte s'affiche et la barre de progression d'expérience (XP) en haut à droite augmente.

🗣️ **Speech (Script) :**
> *"Merci Sarah. Je vais maintenant vous guider à travers la démonstration applicative de notre MVP et vous exposer l'infrastructure de données qui la soutient.*
>
> *Commençons par l'**Espace Citoyen**, conçu pour responsabiliser l'utilisateur dans ses choix de mobilité. Nous arrivons sur l'onglet **Mon Trajet Vert**.*
>
> *Derrière ce formulaire simple se cache une architecture de données robuste. Lorsque je saisis un point de départ, l'autocomplétion interroge en temps réel notre base de données relationnelle **PostgreSQL**, spécifiquement la table `idf_stops` contenant les arrêts du réseau **GTFS d'Île-de-France Mobilités** (8,6 millions de lignes). Nous avons indexé textuellement et spatialement cette table pour renvoyer des suggestions en moins de 15 millisecondes.*
>
> *En cliquant sur 'Calculer l'itinéraire', notre backend Flask effectue une double résolution :*
> * *D'abord, il calcule la distance à vol d'oiseau via la **formule de Haversine** directement codée en Python à partir des coordonnées de latitude et longitude.*
> * *Ensuite, il cherche une liaison directe via une requête SQL optimisée sur la table des horaires GTFS (`idf_stop_times`), trouvant instantanément notre ligne de RER A.*
>
> *Le comparatif met en évidence les métriques clés calculées par notre pipeline :*
> * *Pour la **Voiture**, nous appliquons un ratio standard de **180g de CO₂/km**, pénalisé en temps réel par un coefficient de congestion routière de 1,65x en heure de pointe.*
> * *Pour le **RER**, nous nous basons sur l'empreinte carbone réelle du ferroviaire électrique, soit **20g de CO₂/km**, avec un Score Santé optimal de 95/100.*
>
> *Enfin, la gamification avec le bouton 'Valider ce trajet vert' permet à l'utilisateur de gagner de l'expérience (XP). Pour maximiser la scalabilité et éviter les requêtes d'écriture superflues en base de données pour de simples profils, cet état est mis en cache et persisté directement côté client dans le **LocalStorage** de React."*

---

### 💻 2. Espace Citoyen : "Paris 3D & Tourisme" (01:30 - 03:00)

🖥️ **Actions Visuelles :**
1. Cliquez sur l'onglet **"Paris 3D & Tourisme"** dans le menu du haut.
2. Manipulez la carte interactive avec le bouton gauche de la souris : effectuez des rotations de caméra, zoomez sur les monuments phares (la Tour Eiffel en doré, le Louvre en cyan, Notre-Dame).
3. Montrez les petits cubes de couleur (les rames de métro et les bus/voitures) qui avancent le long des axes.
4. Pointez du doigt l'effet météorologique (les particules bleues s'il pleut actuellement à Paris) et expliquez que s'il faisait nuit (cycle jour/nuit), le ciel deviendrait sombre et le phare de la Tour Eiffel s'allumerait.

🗣️ **Speech (Script) :**
> *"Poursuivons dans l'espace citoyen avec l'onglet **Paris 3D & Tourisme**. Il s'agit du jumeau numérique immersif de notre application.*
>
> *Le défi technique ici était de rendre des volumes 3D complexes dans un navigateur web sans détruire les performances du processeur client. Pour cela, nous avons développé une intégration hybride : nous faisons tourner un moteur de rendu vectoriel **Three.js** directement superposé sur un canevas géographique **Leaflet**.*
>
> *Les données statiques, comme les modèles géométriques des monuments parisiens (Tour Eiffel, Louvre, Notre-Dame), sont chargées de manière asynchrone au format JSON.*
>
> *Les données dynamiques viennent quant à elles de nos pipelines temps réel :*
> * *Les véhicules et métros se déplacent le long de trajectoires définies (des splines géométriques calculées à partir des coordonnées de notre table de trafic).*
> * *De plus, nous avons connecté la scène 3D à l'API **OpenWeatherMap** (table `meteo`). Si l'API indique qu'il pleut actuellement à Paris, un système de particules Three.js simule la chute de la pluie. De même, le cycle jour/nuit modifie l'éclairage de la scène et active le phare rotatif de la Tour Eiffel, offrant une représentation vivante et fidèle de la métropole."*

---

### 💻 3. Espace Gestionnaire : "Dashboard" (03:00 - 04:45)

🖥️ **Actions Visuelles :**
1. Cliquez sur l'onglet **"Dashboard"** dans le menu du haut.
2. Pointez les KPI en haut (Climat à gauche avec l'indice ATMO, Empreinte Carbone Active au milieu).
3. Dirigez l'attention du jury sur le graphique central **"Vitesse vs Occupation"**.
4. Interagissez avec le sélecteur de segment (choisissez par exemple *"Autoroute A3"* ou *"Périphérique (BD)"*), et montrez comment les prévisions à +5, +10, +15, +20 et +25 minutes s'actualisent instantanément en dessous.

🗣️ **Speech (Script) :**
> *"Basculons à présent côté **Gestionnaires Urbains** avec notre **Dashboard de Supervision**.*
>
> *Ici, en tant que Data Engineers, notre objectif était de centraliser et d'homogénéiser des flux de données hautement hétérogènes. C’est le rôle de nos pipelines d'ingestion (ETL) :*
> * *Les données environnementales combinent l'API d'**Airparif** pour l'indice de qualité de l'air ATMO (ingéré toutes les heures dans la table `qualite_air`) et l'API d'**OpenWeatherMap** pour la météo locale.*
> * *L'empreinte carbone active estime les rejets de CO₂ en direct sur l'ensemble du réseau routier grâce à une agrégation continue des volumes de trafic.*
>
> *Le graphique central, baptisé **Vitesse vs Occupation**, a fait l'objet d'un soin particulier. Pour éviter les erreurs d'interprétation analytique classiques consistant à mélanger des vitesses en km/h et des pourcentages d'occupation sur une échelle unique, nous avons conçu un graphique à **double axe Y indépendant** (axe vert de vitesse à gauche, axe orange d'occupation à droite). Les axes et le titre ont été simplifiés pour une lisibilité instantanée en salle de contrôle.*
>
> *Sous le graphique, nous présentons la fonctionnalité clé d'aide à la décision : les prévisions de trafic à court terme sur les flux autoroutiers. Lorsque le gestionnaire change de segment (comme l'A1, l'A3 ou le périphérique), l'application appelle notre backend.*
>
> *Celui-ci interroge notre modèle de Deep Learning **LSTM (Long Short-Term Memory)** sous **TensorFlow** pour prédire les vitesses des 25 prochaines minutes. Pour garantir une haute disponibilité (HA) en conditions réelles, si le serveur de calcul TensorFlow est indisponible ou surchargé, notre API Flask bascule automatiquement et de manière transparente sur une **couche de secours algorithmique** cohérente. Cela garantit aux gestionnaires un affichage fluide sans blocage ni message d'erreur bloquant."*

---

### 💻 4. Espace Gestionnaire : "Lab Urbain 2200" (04:45 - 05:45)

🖥️ **Actions Visuelles :**
1. Cliquez sur l'onglet **"Lab Urbain 2200"** dans le menu du haut.
2. Cliquez sur le bouton vert **"Lancer la transition"** ➔ La simulation démarre, le temps défile et la courbe de pollution commence à se tracer.
3. Changez les paramètres en direct : activez le mode **"Solaire"** pour l'énergie et poussez le curseur à **"100% Électrique"** pour les transports.
4. Montrez la réaction immédiate à l'écran : la courbe de pollution s'effondre, la fumée noire de l'usine s'arrête de monter et le smog orange de Paris se dissipe pour laisser place à un ciel bleu limpide.

🗣️ **Speech (Script) :**
> *"Pour clore l'espace gestionnaire, voici notre outil prospectif : le **Lab Urbain 2200**.*
>
> *Ce module permet de simuler des scénarios 'what-if' pour planifier les transitions écologiques à l'horizon des prochaines décennies. Le gestionnaire peut faire varier les curseurs du mix énergétique (fossile, nucléaire, renouvelables) et le taux de pénétration des véhicules électriques.*
>
> *D'un point de vue architecture, nous avons implémenté un **moteur de règles analytiques côté client** basé sur des équations d'impact environnemental. Cela permet de calculer instantanément la réduction des émissions de gaz à effet de serre et les indices de pollution sans solliciter le backend. Cette réactivité est essentielle pour offrir une expérience fluide et interactive lors des comités de direction ou de planification urbaine, démontrant le ROI immédiat des investissements écologiques."*

---

### ⚙️ 5. Tests Unitaires, DevOps & Clôture (05:45 - 06:30)

🖥️ **Actions Visuelles :**
1. Basculez rapidement sur l'onglet **"Équipe & Projet"** (`AboutPage.jsx`) en guise d'écran de fin.
2. Si vous présentez sur un IDE ou une console, montrez brièvement le fichier de test unitaire [test_geo_routing.py](file:///c:/Users/sacho/OneDrive/Desktop/mobility_project/test_geo_routing.py).

🗣️ **Speech (Script) :**
> *"Pour valider la robustesse et la rigueur scientifique de notre code, nous avons mis en place une suite de tests automatisés. Par exemple, le script `test_geo_routing.py` valide nos calculs d'éco-routage et nos requêtes géospatiales PostGIS en vérifiant que le système identifie précisément les gares situées à moins de 600 mètres d'un point géographique.*
>
> *Côté infrastructure et déploiement, notre application est entièrement conteneurisée avec **Docker** et orchestrée pour être déployable sur des infrastructures cloud comme Kubernetes ou Render, garantissant une scalabilité horizontale en cas de forte affluence citoyenne.*
>
> *En guise de roadmap future, nous prévoyons d'intégrer des flux **GTFS-RT (Real-Time)** pour capter la position des métros et bus à la seconde près via des protocoles de streaming de données comme WebSockets ou gRPC.*
>
> *SmartMobility IDF démontre qu'en alliant des bases de données spatiales optimisées, des pipelines de données consolidés et des modèles d'IA prédictifs, nous pouvons transformer des millions de lignes de données brutes en décisions concrètes pour rendre nos métropoles plus respirables.*
>
> *Romain, Sarah et moi-même vous remercie pour votre attention, et nous sommes à présent ouverts à vos questions."*
