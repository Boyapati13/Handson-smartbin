import { pool } from './pool.js';

// ── Sessions ─────────────────────────────────────────────────────────────────

export async function insertSession(cardNumber, remoteAddr) {
  const { rows } = await pool.query(
    `INSERT INTO sessions (card_number, remote_addr) VALUES ($1, $2) RETURNING id`,
    [cardNumber, remoteAddr]
  );
  return rows[0].id;
}

export async function closeSession(sessionId) {
  await pool.query(
    `UPDATE sessions SET disconnected_at = NOW() WHERE id = $1`,
    [sessionId]
  );
}

// ── Frames ────────────────────────────────────────────────────────────────────

export async function insertFrame(sessionId, cardNumber, direction, funcCode, hexStr, decoded) {
  await pool.query(
    `INSERT INTO frames (session_id, card_number, direction, func_code, hex, decoded)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [sessionId ?? null, cardNumber ?? null, direction, funcCode ?? null, hexStr, decoded ?? null]
  );
}

// ── Bin state (upsert) ────────────────────────────────────────────────────────

/**
 * Upsert only the columns provided in `patch`.
 * Columns absent from patch are left untouched on conflict.
 */
export async function upsertBinState(binId, patch) {
  const cols = Object.keys(patch).filter(k => patch[k] !== undefined);
  if (!cols.length) return;

  const insertCols   = ['bin_id', ...cols, 'last_seen'];
  const insertVals   = [binId, ...cols.map(c => patch[c]), new Date()];
  const placeholders = insertCols.map((_, i) => `$${i + 1}`).join(', ');
  const updateSet    = cols.map(c => `${c} = EXCLUDED.${c}`).join(', ');

  await pool.query(
    `INSERT INTO bin_state (${insertCols.join(', ')})
     VALUES (${placeholders})
     ON CONFLICT (bin_id) DO UPDATE SET ${updateSet}, last_seen = EXCLUDED.last_seen`,
    insertVals
  );
}

// ── Readings ──────────────────────────────────────────────────────────────────

export async function insertReading(binId, cardNumber, readingType, data = {}) {
  await pool.query(
    `INSERT INTO readings
       (bin_id, card_number, reading_type, fill_pct, battery_pct, battery_voltage, temperature, lat, lng, raw_payload)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    [
      binId,
      cardNumber     ?? null,
      readingType,
      data.fill_pct        ?? null,
      data.battery_pct     ?? null,
      data.battery_voltage ?? null,
      data.temperature     ?? null,
      data.lat             ?? null,
      data.lng             ?? null,
      data.raw_payload ? JSON.stringify(data.raw_payload) : null,
    ]
  );
}

// ── Alerts ────────────────────────────────────────────────────────────────────

export async function insertAlert(binId, cardNumber, alertType, message, severity, hexStr) {
  const { rows } = await pool.query(
    `INSERT INTO alerts (bin_id, card_number, alert_type, message, severity, hex)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
    [binId, cardNumber ?? null, alertType, message ?? null, severity ?? 'warning', hexStr ?? null]
  );
  return rows[0].id;
}

/**
 * Returns true if an unacknowledged alert of this type already exists for the bin.
 * Used to prevent alert spam when the device sends repeated status frames.
 */
export async function alertIsOpen(binId, alertType) {
  const { rows } = await pool.query(
    `SELECT id FROM alerts WHERE bin_id = $1 AND alert_type = $2 AND acked_at IS NULL LIMIT 1`,
    [binId, alertType]
  );
  return rows.length > 0;
}

/**
 * Increment slot-1 of compaction_counts in bin_state by 1.
 * Called on every 0x05 (compress done) frame for live cycle tracking,
 * separate from the authoritative 0x09 counts poll.
 */
export async function incrementCompactionCount(binId) {
  await pool.query(
    `UPDATE bin_state
     SET compaction_counts = CASE
       WHEN compaction_counts IS NULL THEN ARRAY[1, 0, 0]
       ELSE ARRAY[
         COALESCE(compaction_counts[1], 0) + 1,
         COALESCE(compaction_counts[2], 0),
         COALESCE(compaction_counts[3], 0)
       ]
     END,
     last_seen = NOW()
     WHERE bin_id = $1`,
    [binId]
  );
}
