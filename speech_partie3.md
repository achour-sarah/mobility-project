# 🎙️ Script Oral de Soutenance – Orateur 3 (Partie 3 : Démo, Décision & ROI)

Ce document contient le script mot-à-mot détaillé pour l'Orateur 3 (**Shamcya MOHAMED ELECTON**). Chaque section explique **ce qu'on voit à l'écran (le visuel)**, **ce qu'on dit (le speech)**, et **la provenance des données / modèles** associés à la volée.

---

## ⏱️ Découpage Temporel & Cheminement (Total : 6 min 30s)

```
[13:30 - 14:15]  Étape 1 : Le Dashboard Décisionnel (Visuels & Données de base)
[14:15 - 15:30]  Étape 2 : Mon Trajet Vert (Eco-Routage, Haversine & GTFS)
[15:30 - 16:30]  Étape 3 : L'Accessibilité Universelle (Inclusion & Démo handicap)
[16:30 - 17:30]  Étape 4 : Le Chat Citoyen (NLP, Claude API & Crowdsourcing)
[17:30 - 19:00]  Étape 5 : La Carte Paris 3D & Le Lab Urbain 2200 (Three.js & Simulation)
[19:00 - 20:00]  Étape 6 : Tests unitaires, Roadmap (CI/CD, Docker) & Clôture
```

---

## 🎙️ Script Détaillé Mot-à-Mot

### 1. Le Dashboard Décisionnel (13:30 - 14:15)
🖥️ **Action Visuelle :**
1.  Cliquez sur l'onglet **"Dashboard"** dans le menu du haut.
2.  Passez la souris sur les différentes cartes : la météo en haut à droite, l'indice ATMO à gauche, le graphique en barres Recharts et les jauges des gares.
🗣️ **Speech (Script) :**
> *"Merci Sarah. Je vais à présent vous guider à travers l'interface utilisateur de notre plateforme React et vous présenter nos outils de prise de décision.*
>
> *Nous arrivons sur l'onglet **Dashboard**, notre centre de supervision. Visuellement, il est découpé en plusieurs sections clés :*
> * *En haut, nous voyons les données climatiques en direct : la température et les conditions viennent de l'API **OpenWeatherMap** (table `meteo`), et l'indice de qualité de l'air ATMO provient en direct d'**Airparif** (table `qualite_air`).*
> * *Juste en dessous, notre graphique en barres dynamiques compare la vitesse réelle des voitures et le taux d'occupation des voies. Ces données brutes sont collectées en temps réel sur les flux de **Data.gouv** (table `trafic_temps_reel`).*
> * *À côté de ces données routières, nous affichons des cartes d'affluence pour les grands hubs de gares comme Châtelet-Les Halles ou Gare de Lyon. Cette affluence est calculée selon des **profils théoriques horaires** générés à partir des volumes de passages programmés dans notre base GTFS.*
> * *Enfin, les prévisions de vitesse pour les prochaines 25 minutes sur l'A1, visibles sous forme de petites cartes colorées, sont calculées en direct par le modèle **LSTM sous TensorFlow** présenté par Sarah."*

---

### 2. Le Calculateur Eco-Routage "Mon Trajet Vert" (14:15 - 15:30)
🖥️ **Action Visuelle :**
1.  Cliquez sur l'onglet **"Mon Trajet Vert"** dans le menu du haut.
2.  Saisissez *"Gare de Lyon"* dans le champ départ et *"Châtelet"* dans le champ arrivée en sélectionnant les suggestions de l'autocomplétion.
3.  Cliquez sur **"Calculer l'itinéraire"**. Les deux cartes comparatives (Voiture vs Métro/RER) apparaissent avec les détails de CO₂, temps de trajet et Score Santé.
4.  Cliquez sur le bouton vert **"Valider ce trajet vert"** ➔ La boîte d'alerte s'affiche et la barre d'XP de votre profil éco-citoyen en haut augmente.
🗣️ **Speech (Script) :**
> *"Passons maintenant côté citoyen avec l'onglet **Mon Trajet Vert**.*
>
> *Visuellement, cet écran se compose d'un formulaire de recherche d'itinéraires et d'un profil 'Éco-Citoyen' affichant un niveau et une barre de progression d'expérience (XP).*
>
> *Faisons une démonstration en direct : je saisis 'Gare de Lyon' en départ, et 'Châtelet' en arrivée. Nos suggestions proviennent d'une recherche textuelle dans notre table d'arrêts **GTFS** (`idf_stops`).*
>
> *Lorsque je clique sur 'Calculer', notre backend Flask effectue deux actions :*
> * *Il calcule la distance à vol d'oiseau entre les deux arrêts grâce à la **formule mathématique de Haversine** basée sur les coordonnées GPS.*
> * *Il recherche une liaison ferroviaire directe dans les horaires GTFS (`idf_stop_times`). Ici, il trouve bien le RER A et le métro 14.*
>
> *Le comparatif visuel montre le ROI direct pour l'usager :*
> * *Le trajet en **Voiture** affiche 25 minutes de trajet (temps pénalisé automatiquement par notre coefficient de congestion de 1.65x car nous sommes en heure de pointe) et rejette **0,8 kg de CO₂** (calculé sur un ratio standardisé de $180\text{g } CO_2/km$).*
> * *Le trajet en **Transports** prend seulement 6 minutes de transit et ne rejette que **0,08 kg de CO₂** (basé sur un ratio propre à l'électricité ferroviaire de $20\text{g}/km$). Le 'Score Santé' est excellent : 95/100.*
>
> *Pour inciter au changement, l'utilisateur clique sur 'Valider ce trajet vert'. Il gagne des points d'XP proportionnels au carbone économisé, persistés dans le navigateur via le **LocalStorage** de React."*

---

### 3. L'Accessibilité Universelle & Handicap (15:30 - 16:30)
🖥️ **Action Visuelle :**
1.  Amenez le curseur sur le **bouton bleu flottant avec le logo fauteuil roulant (♿)** en bas à gauche de l'écran.
2.  Cliquez dessus pour ouvrir le menu d'accessibilité.
3.  Cliquez sur **"Contraste Élevé"** ➔ Tout l'écran devient noir avec des écritures et bordures jaune fluo.
4.  Cliquez sur **"OpenDyslexic"** (Police d'aide à la lecture) ➔ La typographie globale change instantanément vers une police large et aérée.
5.  Cliquez sur **"Activé 🔊"** dans la section synthèse vocale.
6.  Passez doucement votre souris sur le titre "Espace Accessibilité" et sur d'autres boutons pour que le lecteur d'écran prononce le texte à voix haute.
7.  Désactivez le contraste et fermez le menu pour revenir à l'affichage normal.
🗣️ **Speech (Script) :**
> *"Un aspect dont notre équipe est particulièrement fière est la prise en compte de l'inclusivité et du handicap numérique, conformément aux directives nationales du **RGAA**.*
>
> *En bas à gauche de notre application, nous avons intégré un panneau flottant d'accessibilité universelle. En cliquant sur le bouton ♿, l'utilisateur peut personnaliser l'ensemble de l'interface :*
> * *Le mode **Contraste Élevé** injecte dynamiquement des styles CSS globaux pour forcer un arrière-plan noir et des textes jaune néon, facilitant la lecture pour les personnes malvoyantes.*
> * *Le mode **Police Confort (Dyslexie)** applique une typographie adaptée avec un espacement renforcé des caractères pour les personnes souffrant de troubles de l'attention ou de dyslexie.*
> * *Enfin, en activant le **Lecteur Vocal**, nous tirons parti de l'API de synthèse vocale du navigateur. Si je survole ce bouton, l'application prononce le texte à voix haute en direct, rendant notre outil pleinement utilisable sans écran."*

---

### 4. Le Crowdsourcing Citoyen (16:30 - 17:30)
🖥️ **Action Visuelle :**
1.  Cliquez sur le bouton bleu avec l'icône de message (💬) en bas à droite pour ouvrir le panneau **Signalements citoyens**.
2.  Saisissez dans la zone de texte : *"Accident sur l'A1, camion renversé, tout est bloqué"*.
3.  Cliquez sur la flèche pour envoyer ➔ Le message s'affiche en haut de la liste, et l'encadré vert **🤖 Analyse IA** apparaît en dessous.
4.  Passez la souris sur l'analyse IA (classification "accident", gravité "élevée", et la recommandation de déviation).
🗣️ **Speech (Script) :**
> *"Poursuivons sur l'aspect participatif avec nos **Signalements citoyens**.*
>
> *Visuellement, c'est un module de chat en temps réel. Lorsque j'envoie le signalement d'un incident comme 'Accident sur l'A1', notre backend Flask effectue une analyse NLP sémantique immédiate.*
>
> *Si notre clé d'API est configurée, le texte est envoyé au modèle **Claude 3.5 Sonnet d'Anthropic**, qui extrait et structure les métadonnées de l'incident au format JSON. Si l'API est indisponible, un **parser déterministe par expressions régulières** (regex) prend le relais en local pour identifier les mots clés comme 'accident' ou 'bloqué'.*
>
> *Comme vous le voyez sur l'étiquette d'analyse IA générée sous mon message, le système a classé automatiquement l'incident dans la catégorie 'accident', a détecté que l'axe concerné était l'autoroute A1, a évalué la gravité comme 'élevée' et a formulé une recommandation de déviation. Les signalements sont persistés dans la table `signalements_citoyens` et la communauté peut voter pour confirmer la véracité de l'alerte."*

---

### 5. La Carte Paris 3D & Le Lab Urbain 2200 (17:30 - 19:00)
🖥️ **Action Visuelle :**
1.  Cliquez sur l'onglet **"Paris 3D & Tourisme"** dans le menu du haut.
2.  Manipulez la carte : tournez la caméra, zoomez pour montrer la Tour Eiffel dorée en 3D filaire, le Louvre bleu cyan, Notre-Dame, et les petits blocs colorés (les métros et voitures) qui avancent.
3.  Si la météo réelle de Paris est pluvieuse, montrez les particules bleues de pluie tomber. Activez le mode nuit pour voir le ciel s'assombrir et le phare de la Tour Eiffel tourner en jaune.
4.  Cliquez sur l'onglet **"Lab Urbain 2200"** dans le menu du haut.
5.  Activez le bouton vert **"Lancer la transition"** ➔ La courbe du graphique commence à défiler et les années passent.
6.  Changez les boutons (Solaire au lieu de Mixte, 100% électrique au lieu de 40%) ➔ La courbe de pollution chute, l'usine cesse de fumer à gauche et le ciel de Paris devient bleu clair.
🗣️ **Speech (Script) :**
> *"Nous arrivons sur la partie la plus visuelle de notre MVP : **Paris 3D & Tourisme**.*
>
> *Il s'agit d'une carte interactive construite en intégrant des scènes **Three.js** vectorielles dans le moteur cartographique **Leaflet**. Nous avons modélisé géométriquement les principaux monuments parisiens : la Tour Eiffel, la pyramide en verre du Louvre ou encore la cathédrale Notre-Dame.*
>
> *Les données dynamiques de notre ETL animent cette carte :*
> * *Les voitures et les rames de métros se déplacent sur des splines 3D à une vitesse calquée sur le trafic réel.*
> * *La météo et le cycle jour/nuit s'adaptent : s'il pleut actuellement à Paris selon l'API OpenWeatherMap, un système de particules Three.js simule la pluie. La nuit, le ciel s'assombrit et le phare de la Tour Eiffel s'active pour balayer la ville.*
>
> *Pour finir, l'onglet **Lab Urbain 2200** est notre simulateur prospectif. Il permet aux décideurs d'observer les bénéfices d'une transition écologique.*
> * *Si nous laissons une énergie fossile et peu de voitures électriques, le graphique de pollution s'envole, l'usine crache de la fumée noire et le ciel de Paris devient orange sous un smog étouffant.*
> * *À l'inverse, si nous basculons sur une production solaire et 100% de véhicules électriques, l'indice de pollution chute de 80%, l'usine s'arrête et le ciel parisien retrouve toute sa clarté. C’est la démonstration visuelle du ROI à long terme des politiques vertes."*

---

### 6. Tests Unitaires, Perspectives & Clôture (19:00 - 20:00)
🖥️ **Action Visuelle :**
1.  Ouvrez rapidement votre éditeur de code ou affichez le fichier de test unitaire [test_geo_routing.py](file:///c:/Users/sacho/OneDrive/Desktop/mobility_project/test_geo_routing.py).
2.  Basculez sur l'onglet **"Équipe & Projet"** (`AboutPage.jsx`) en guise d'écran de fin.
🗣️ **Speech (Script) :**
> *"Pour valider scientifiquement nos développements, nous avons mis en place une suite de tests unitaires automatiques. Ce script `test_geo_routing.py` valide par exemple l'exactitude de nos calculs d'itinéraires et nos requêtes spatiales PostGIS en vérifiant que le système identifie correctement les gares à moins de 600 mètres.*
>
> *En termes de perspectives, notre architecture est entièrement conteneurisée avec **Docker**, ce qui permet de la déployer facilement sur le cloud via Kubernetes. Nous prévoyons également d'intégrer des flux GTFS-RealTime pour suivre la position des métros à la seconde près.*
>
> *SmartMobility IDF prouve qu'en associant des pipelines de données solides, des modèles prédictifs d'IA et des outils d'aide à la décision interactifs, nous pouvons accompagner nos métropoles vers un futur durable et respirable.*
>
> *Toute l'équipe – Romain, Sarah et moi-même – vous remercie pour votre attention, et nous sommes désormais ouverts à vos questions."*
