import 'dotenv/config';
import { initDb, pool } from './pool.js';

await initDb();
await pool.end();
console.log('[db] Done.');
