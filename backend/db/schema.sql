-- HandsOn SmartBin — PostgreSQL schema
-- Safe to re-run: all statements use IF NOT EXISTS / OR REPLACE

CREATE TABLE IF NOT EXISTS sessions (
  id              BIGSERIAL    PRIMARY KEY,
  card_number     TEXT         NOT NULL,
  remote_addr     TEXT,
  connected_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  disconnected_at TIMESTAMPTZ
);

-- Raw frame log — full audit trail of every byte exchange
CREATE TABLE IF NOT EXISTS frames (
  id          BIGSERIAL   PRIMARY KEY,
  session_id  BIGINT      REFERENCES sessions(id) ON DELETE SET NULL,
  card_number TEXT,
  direction   TEXT        NOT NULL CHECK (direction IN ('in', 'out')),
  func_code   SMALLINT,
  hex         TEXT        NOT NULL,
  decoded     TEXT,
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_frames_card     ON frames (card_number);
CREATE INDEX IF NOT EXISTS idx_frames_received ON frames (received_at DESC);

-- Sensor readings — time-series table, one row per frame that carries sensor data
CREATE TABLE IF NOT EXISTS readings (
  id              BIGSERIAL    PRIMARY KEY,
  bin_id          TEXT         NOT NULL,
  card_number     TEXT,
  reading_type    TEXT         NOT NULL, -- battery | capacity | status | location | counts
  fill_pct        SMALLINT,
  battery_pct     SMALLINT,
  battery_voltage SMALLINT,
  temperature     SMALLINT,
  lat             DOUBLE PRECISION,
  lng             DOUBLE PRECISION,
  raw_payload     JSONB,
  recorded_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_readings_bin_time ON readings (bin_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_readings_type     ON readings (bin_id, reading_type);

-- Current bin state — one row per bin_id, updated in-place on every frame
CREATE TABLE IF NOT EXISTS bin_state (
  bin_id              TEXT        PRIMARY KEY,
  card_number         TEXT,
  fill_pct            SMALLINT,
  battery_pct         SMALLINT,
  battery_voltage     SMALLINT,
  battery_current     SMALLINT,
  temperature         SMALLINT,
  door_open           BOOLEAN     DEFAULT FALSE,
  overflow            BOOLEAN     DEFAULT FALSE,
  motor_fault         BOOLEAN     DEFAULT FALSE,
  sensor_fault        BOOLEAN     DEFAULT FALSE,
  lat                 DOUBLE PRECISION,
  lng                 DOUBLE PRECISION,
  status              TEXT        NOT NULL DEFAULT 'offline',
  open_counts         INTEGER[],
  compaction_counts   INTEGER[],
  last_seen           TIMESTAMPTZ
);

-- Alerts — raised by device frames, acknowledged by operators
CREATE TABLE IF NOT EXISTS alerts (
  id          BIGSERIAL    PRIMARY KEY,
  bin_id      TEXT         NOT NULL,
  card_number TEXT,
  alert_type  TEXT         NOT NULL, -- JAM | SMOKE_FIRE | OVERFLOW | MOTOR_FAULT | SENSOR_FAULT
  message     TEXT,
  severity    TEXT         NOT NULL DEFAULT 'warning', -- warning | error | critical
  hex         TEXT,
  raised_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  acked_at    TIMESTAMPTZ,
  acked_by    TEXT
);

CREATE INDEX IF NOT EXISTS idx_alerts_bin    ON alerts (bin_id);
CREATE INDEX IF NOT EXISTS idx_alerts_raised ON alerts (raised_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_open   ON alerts (bin_id) WHERE acked_at IS NULL;
