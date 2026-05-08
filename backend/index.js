import 'dotenv/config';
import { initDb, pool } from './db/pool.js';
import { startTCP } from './tcp.js';

const TCP_PORT = parseInt(process.env.TCP_PORT) || 8078;

async function main() {
  await initDb();
  startTCP(TCP_PORT);
  console.log(`[smartbin] Backend running. TCP on :${TCP_PORT}`);
}

main().catch(err => {
  console.error('[smartbin] Fatal startup error:', err);
  process.exit(1);
});

process.on('SIGINT',  () => { pool.end(); process.exit(0); });
process.on('SIGTERM', () => { pool.end(); process.exit(0); });
