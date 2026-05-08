import pg from 'pg';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  console.error('[db] DATABASE_URL is not set. Copy .env.example to .env and fill it in.');
  process.exit(1);
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

pool.on('error', (err) => {
  console.error('[db] Pool error:', err.message);
});

const __dir = dirname(fileURLToPath(import.meta.url));

export async function initDb() {
  const sql = await readFile(join(__dir, 'schema.sql'), 'utf8');
  await pool.query(sql);
  console.log('[db] Schema ready');
}
