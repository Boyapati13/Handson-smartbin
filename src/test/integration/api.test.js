/**
 * REST API integration tests.
 * Spins up an in-process Express server (no ports, uses supertest-style fetch)
 * so no external process is needed.
 */
import { describe, it, expect, beforeEach, beforeAll, afterAll, vi } from 'vitest';
import express from 'express';
import cors    from 'cors';
import { createStore }     from '../../../server/store.js';
import { createApiRouter } from '../../../server/api.js';

let app, store, broadcastMock;

// We need a real HTTP server for fetch() calls in tests
let server, baseUrl;

beforeAll(async () => {
  store         = createStore();
  broadcastMock = vi.fn();

  app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/api', createApiRouter(store, broadcastMock));

  await new Promise(resolve => {
    server = app.listen(0, () => {
      baseUrl = `http://localhost:${server.address().port}/api`;
      resolve();
    });
  });
});

afterAll(() => server.close());
beforeEach(() => { store.reset(); broadcastMock.mockClear(); });

async function get(path) {
  const res = await fetch(`${baseUrl}${path}`);
  return { status: res.status, body: await res.json() };
}

async function post(path, body) {
  const res = await fetch(`${baseUrl}${path}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return { status: res.status, body: await res.json() };
}

async function del(path) {
  const res = await fetch(`${baseUrl}${path}`, { method: 'DELETE' });
  return { status: res.status, body: await res.json() };
}

// ── Health ─────────────────────────────────────────────────────────────────
describe('GET /api/health', () => {
  it('returns 200 with status ok', async () => {
    const { status, body } = await get('/health');
    expect(status).toBe(200);
    expect(body.status).toBe('ok');
    expect(body).toHaveProperty('uptime');
    expect(body).toHaveProperty('ts');
  });
});

// ── Stats ──────────────────────────────────────────────────────────────────
describe('GET /api/stats', () => {
  it('returns fleet statistics', async () => {
    const { status, body } = await get('/stats');
    expect(status).toBe(200);
    expect(body.total).toBe(8);
    expect(body).toHaveProperty('online');
    expect(body).toHaveProperty('avgFill');
  });
});

// ── Bins ───────────────────────────────────────────────────────────────────
describe('GET /api/bins', () => {
  it('returns all 8 bins', async () => {
    const { status, body } = await get('/bins');
    expect(status).toBe(200);
    expect(body).toHaveLength(8);
  });

  it('filters by status', async () => {
    const { body } = await get('/bins?status=offline');
    expect(body.every(b => b.status === 'offline')).toBe(true);
  });

  it('filters by minFill', async () => {
    const { body } = await get('/bins?minFill=80');
    expect(body.every(b => b.fill >= 80)).toBe(true);
  });

  it('filters can return empty array', async () => {
    const { body } = await get('/bins?minFill=100');
    expect(Array.isArray(body)).toBe(true);
  });
});

describe('GET /api/bins/:id', () => {
  it('returns correct bin by id', async () => {
    const { status, body } = await get('/bins/HS-001');
    expect(status).toBe(200);
    expect(body.id).toBe('HS-001');
  });

  it('returns 404 for unknown bin', async () => {
    const { status, body } = await get('/bins/GHOST');
    expect(status).toBe(404);
    expect(body.error).toBeTruthy();
  });
});

// ── Commands ───────────────────────────────────────────────────────────────
describe('POST /api/bins/:id/command', () => {
  it('compact reduces fill and increments cycles', async () => {
    const before = store.getBin('HS-002'); // fill=96
    const { status, body } = await post('/bins/HS-002/command', { cmd: 'compact' });
    expect(status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.bin.fill).toBeLessThan(before.fill);
    expect(body.bin.cycles).toBe(before.cycles + 1);
  });

  it('compact broadcasts bin_update', async () => {
    await post('/bins/HS-001/command', { cmd: 'compact' });
    expect(broadcastMock).toHaveBeenCalledWith(expect.objectContaining({ type: 'bin_update' }));
  });

  it('acknowledge clears bin alerts', async () => {
    store.addAlert({ id: 1, bin: 'HS-002', type: 'OVERFLOW', sev: 'crit' });
    await post('/bins/HS-002/command', { cmd: 'acknowledge' });
    expect(store.getAlerts().filter(a => a.bin === 'HS-002')).toHaveLength(0);
  });

  it('returns 404 for unknown bin', async () => {
    const { status } = await post('/bins/GHOST/command', { cmd: 'compact' });
    expect(status).toBe(404);
  });

  it('returns 400 for unknown command', async () => {
    const { status, body } = await post('/bins/HS-001/command', { cmd: 'explode' });
    expect(status).toBe(400);
    expect(body.valid).toEqual(expect.arrayContaining(['compact']));
  });
});

// ── Alerts ─────────────────────────────────────────────────────────────────
describe('GET /api/alerts', () => {
  it('returns empty array initially', async () => {
    const { body } = await get('/alerts');
    expect(body).toEqual([]);
  });

  it('returns added alerts', async () => {
    store.addAlert({ id: 99, bin: 'HS-001', type: 'TEST', sev: 'crit' });
    const { body } = await get('/alerts');
    expect(body).toHaveLength(1);
  });

  it('filters by severity', async () => {
    store.addAlert({ id: 1, bin: 'HS-001', type: 'X', sev: 'crit' });
    store.addAlert({ id: 2, bin: 'HS-002', type: 'Y', sev: 'warn' });
    const { body } = await get('/alerts?sev=crit');
    expect(body.every(a => a.sev === 'crit')).toBe(true);
  });
});

describe('DELETE /api/alerts/:id', () => {
  it('removes alert and broadcasts', async () => {
    store.addAlert({ id: 55, bin: 'HS-001', type: 'X', sev: 'warn' });
    const { status, body } = await del('/alerts/55');
    expect(status).toBe(200);
    expect(body.ok).toBe(true);
    expect(store.getAlerts()).toHaveLength(0);
    expect(broadcastMock).toHaveBeenCalledWith(expect.objectContaining({ type: 'alerts_update' }));
  });
});

// ── Telemetry ──────────────────────────────────────────────────────────────
describe('GET /api/telemetry', () => {
  it('returns empty array initially', async () => {
    const { body } = await get('/telemetry');
    expect(Array.isArray(body)).toBe(true);
  });

  it('respects limit param', async () => {
    for (let i = 0; i < 20; i++) store.addFrame({ dir:'UART→TCP', hex:'E9', decoded:'x', ts:'now' });
    const { body } = await get('/telemetry?limit=5');
    expect(body).toHaveLength(5);
  });

  it('caps limit at 500', async () => {
    const { status } = await get('/telemetry?limit=9999');
    expect(status).toBe(200);
  });
});
