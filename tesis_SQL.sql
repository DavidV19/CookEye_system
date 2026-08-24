-- ============================================================
--  CookEye System Database Schema
--  Author: Carlos Veloz
--  Date: 2025-10-07
-- ============================================================



-- ============================================================
--  1. Tabla principal: cooking_process
-- ============================================================

CREATE TABLE cooking_process (
  id_process    SERIAL PRIMARY KEY,
  meat_product  TEXT NOT NULL,
  weight_kg     REAL,
  status        TEXT NOT NULL CHECK (status IN ('pending','active','completed','aborted')),
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_cooking_process_status ON cooking_process(status);

-- ============================================================
--  2. Tabla de datos de temperatura (telemetría ligera)
-- ============================================================

CREATE TABLE temperature_data (
  id              SERIAL PRIMARY KEY,
  process_id      INTEGER NOT NULL,
  ts              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ambient_c       REAL NOT NULL,
  product_c       REAL NOT NULL,
  sample_uuid     TEXT NOT NULL UNIQUE,
  FOREIGN KEY (process_id) REFERENCES cooking_process(id_process) ON DELETE CASCADE
);

CREATE INDEX idx_tempdata_process_ts ON temperature_data(process_id, ts);

-- ============================================================
--  3. Tabla de frames térmicos MLX90640 (opcional)
-- ============================================================

CREATE TABLE thermal_frames (
  id              SERIAL PRIMARY KEY,
  process_id      INTEGER NOT NULL,
  sample_uuid     TEXT NOT NULL UNIQUE,
  ts              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  shape_rows      SMALLINT NOT NULL DEFAULT 24,
  shape_cols      SMALLINT NOT NULL DEFAULT 32,
  min_c           REAL NOT NULL,
  max_c           REAL NOT NULL,
  encoding        TEXT NOT NULL DEFAULT 'int16_norm_v1',
  frame_blob      BYTEA NOT NULL,  -- usar BYTEA si es PostgreSQL
  FOREIGN KEY (process_id) REFERENCES cooking_process(id_process) ON DELETE CASCADE
);

CREATE INDEX idx_frames_process_ts ON thermal_frames(process_id, ts);

-- ============================================================
--  4. Configuración activa del sistema de enfriamiento
-- ============================================================

CREATE TABLE cooling_active_config (
  id             SERIAL PRIMARY KEY CHECK (id = 1),
  lower_limit_c  REAL NOT NULL,
  upper_limit_c  REAL NOT NULL,
  hysteresis_c   REAL NOT NULL DEFAULT 0.5,
  enabled        BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserta una configuración inicial por defecto
INSERT INTO cooling_active_config (id, lower_limit_c, upper_limit_c, hysteresis_c, enabled)
VALUES (1, 20.0, 28.0, 0.5, TRUE);
INSERT INTO cooking_process (meat_product, weight_kg, status)
VALUES ('Test batch', 1.0, 'pending')
RETURNING id_process;


-- ============================================================
--  5. Registro de eventos de enfriamiento (rele / turbina)
-- ============================================================

CREATE TABLE cooling_events (
  id           SERIAL PRIMARY KEY,
  process_id   INTEGER NOT NULL,
  ts           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  action       TEXT NOT NULL CHECK (action IN ('ON','OFF','ALARM')),
  ambient_c    REAL,
  product_c    REAL,
  device_id    TEXT,
  source       TEXT DEFAULT 'auto' CHECK (source IN ('auto','manual')),
  FOREIGN KEY (process_id) REFERENCES cooking_process(id_process)
);

CREATE INDEX idx_cooling_events_process_ts ON cooling_events(process_id, ts);


-- ============================================================
--  Pruebas y revisiones
-- ============================================================


select * from temperature_data
select * from thermal_frames