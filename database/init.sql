-- Extension géospatiale obligatoire
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLE : trafic_temps_reel
-- ============================================================
CREATE TABLE IF NOT EXISTS trafic_temps_reel (
    id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    source        VARCHAR(50)  NOT NULL,
    segment_id    VARCHAR(100),
    nom_segment   VARCHAR(255),
    vitesse_kmh   FLOAT,
    fluidite      VARCHAR(20),  -- libre / dense / bloqué
    taux_occupation FLOAT,
    geom          GEOMETRY(LineString, 4326),
    collecte_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_trafic_geom    ON trafic_temps_reel USING GIST(geom);
CREATE INDEX idx_trafic_time    ON trafic_temps_reel (collecte_at DESC);

-- ============================================================
-- TABLE : transports_perturbations
-- ============================================================
CREATE TABLE IF NOT EXISTS transports_perturbations (
    id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    source        VARCHAR(50)  NOT NULL,
    ligne         VARCHAR(50),
    type_transport VARCHAR(30),
    statut        VARCHAR(50),
    message       TEXT,
    debut_at      TIMESTAMPTZ,
    fin_at        TIMESTAMPTZ,
    collecte_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_transport_time ON transports_perturbations (collecte_at DESC);

-- ============================================================
-- TABLE : qualite_air
-- ============================================================
CREATE TABLE IF NOT EXISTS qualite_air (
    id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    source        VARCHAR(50)  NOT NULL,
    station_id    VARCHAR(100),
    station_nom   VARCHAR(255),
    polluant      VARCHAR(20),  -- NO2, PM10, PM2.5, O3, CO
    valeur        FLOAT,
    unite         VARCHAR(20),
    indice_atmo   INT,
    geom          GEOMETRY(Point, 4326),
    collecte_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_air_geom  ON qualite_air USING GIST(geom);
CREATE INDEX idx_air_time  ON qualite_air (collecte_at DESC);

-- ============================================================
-- TABLE : meteo
-- ============================================================
CREATE TABLE IF NOT EXISTS meteo (
    id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    source        VARCHAR(50)  NOT NULL,
    ville         VARCHAR(100),
    temperature   FLOAT,
    humidite      INT,
    pression      FLOAT,
    vent_vitesse  FLOAT,
    vent_direction INT,
    description   VARCHAR(100),
    pluie_1h      FLOAT,
    geom          GEOMETRY(Point, 4326),
    collecte_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_meteo_time ON meteo (collecte_at DESC);

-- ============================================================
-- TABLE : pipeline_logs  (suivi santé ETL)
-- ============================================================
CREATE TABLE IF NOT EXISTS pipeline_logs (
    id            SERIAL PRIMARY KEY,
    collecteur    VARCHAR(100) NOT NULL,
    statut        VARCHAR(20)  NOT NULL,  -- success / error / warning
    nb_enregistrements INT DEFAULT 0,
    message       TEXT,
    duree_ms      INT,
    run_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);