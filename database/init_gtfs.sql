-- Création des tables pour les données statiques GTFS d'Île-de-France

-- (PostGIS a été retiré temporairement car il n'est pas installé sur votre machine)

DROP TABLE IF EXISTS idf_agency CASCADE;
CREATE TABLE idf_agency (
    agency_id TEXT PRIMARY KEY,
    agency_name TEXT,
    agency_url TEXT,
    agency_timezone TEXT,
    agency_lang TEXT,
    agency_phone TEXT,
    agency_fare_url TEXT,
    agency_email TEXT,
    ticketing_deep_link_id TEXT
);

DROP TABLE IF EXISTS idf_routes CASCADE;
CREATE TABLE idf_routes (
    route_id TEXT PRIMARY KEY,
    agency_id TEXT,
    route_short_name TEXT,
    route_long_name TEXT,
    route_desc TEXT,
    route_type INT,
    route_url TEXT,
    route_color TEXT,
    route_text_color TEXT,
    route_sort_order INT
);

DROP TABLE IF EXISTS idf_stops CASCADE;
CREATE TABLE idf_stops (
    stop_id TEXT PRIMARY KEY,
    stop_code TEXT,
    stop_name TEXT,
    stop_desc TEXT,
    stop_lat DOUBLE PRECISION,
    stop_lon DOUBLE PRECISION,
    zone_id TEXT,
    stop_url TEXT,
    location_type INT,
    parent_station TEXT,
    stop_timezone TEXT,
    wheelchair_boarding INT,
    level_id TEXT,
    platform_code TEXT,
    stop_access TEXT
);
-- Index classique sur l'identifiant
CREATE INDEX IF NOT EXISTS idx_idf_stops_id ON idf_stops(stop_id);

DROP TABLE IF EXISTS idf_trips CASCADE;
CREATE TABLE idf_trips (
    route_id TEXT,
    service_id TEXT,
    trip_id TEXT PRIMARY KEY,
    trip_headsign TEXT,
    trip_short_name TEXT,
    direction_id INT,
    block_id TEXT,
    shape_id TEXT,
    wheelchair_accessible INT,
    bikes_allowed INT
);

DROP TABLE IF EXISTS idf_stop_times CASCADE;
CREATE TABLE idf_stop_times (
    trip_id TEXT,
    arrival_time TEXT,
    departure_time TEXT,
    start_pickup_drop_off_window TEXT,
    end_pickup_drop_off_window TEXT,
    stop_id TEXT,
    stop_sequence INT,
    pickup_type INT,
    drop_off_type INT,
    local_zone_id TEXT,
    stop_headsign TEXT,
    timepoint INT,
    pickup_booking_rule_id TEXT,
    drop_off_booking_rule_id TEXT,
    shape_dist_traveled DOUBLE PRECISION
);
-- Index de performance pour les jointures des horaires
CREATE INDEX IF NOT EXISTS idx_idf_stop_times_trip ON idf_stop_times(trip_id);
CREATE INDEX IF NOT EXISTS idx_idf_stop_times_stop ON idf_stop_times(stop_id);

DROP TABLE IF EXISTS idf_shapes CASCADE;
CREATE TABLE idf_shapes (
    shape_id TEXT,
    shape_pt_lat DOUBLE PRECISION,
    shape_pt_lon DOUBLE PRECISION,
    shape_pt_sequence INT,
    shape_dist_traveled DOUBLE PRECISION
);
CREATE INDEX IF NOT EXISTS idx_idf_shapes_id ON idf_shapes(shape_id);

DROP TABLE IF EXISTS idf_calendar CASCADE;
CREATE TABLE idf_calendar (
    service_id TEXT PRIMARY KEY,
    monday INT,
    tuesday INT,
    wednesday INT,
    thursday INT,
    friday INT,
    saturday INT,
    sunday INT,
    start_date TEXT,
    end_date TEXT
);

DROP TABLE IF EXISTS idf_calendar_dates CASCADE;
CREATE TABLE idf_calendar_dates (
    service_id TEXT,
    date TEXT,
    exception_type INT
);

DROP TABLE IF EXISTS idf_transfers CASCADE;
CREATE TABLE idf_transfers (
    from_stop_id TEXT,
    to_stop_id TEXT,
    transfer_type INT,
    min_transfer_time INT
);
