/**
 * HandsOn SmartBin — unified server entry point
 *
 *  HTTP (REST API) : http://localhost:3001/api
 *  WebSocket       : ws://localhost:8765
 *
 * Environment variables (all optional):
 *   DEVICE_HOST   TCP host of real HY-CKX1 gateway
 *   DEVICE_PORT   TCP port of gateway           (default: 8080)
 *   WS_PORT       WebSocket port                (default: 8765)
 *   HTTP_PORT     HTTP / REST API port          (default: 3001)
 */

import express from 'express';
import cors    from 'cors';
import { WebSocketServer } from 'ws';
import { createStore }      from './store.js';
import { createApiRouter }  from './api.js';
import { tickBin, buildHeartbeatFrame, buildAckFrame, buildCompactCommandFrame, buildDiagnosticsRequestFrame, buildResetCommandFrame, buildDoorUnlockFrame, recordCompaction } from './simulator.js';
import { connectToDevice }  from './device-bridge.js';

const WS_PORT   = parseInt(process.env.WS_PORT)   || 8765;
const HTTP_PORT = parseInt(process.env.HTTP_PORT)  || 3001;
const DEVICE_HOST = process.env.DEVICE_HOST        || null;
const DEVICE_PORT = parseInt(process.env.DEVICE_PORT) || 8080;

// ── Shared store ──────────────────────────────────────────────────────────
const store = createStore();

// ── WebSocket server ──────────────────────────────────────────────────────
const wss = new WebSocketServer({ port: WS_PORT });

function broadcast(msg) {
  const payload = JSON.stringify(msg);
  wss.clients.forEach(ws => { if (ws.readyState === 1) ws.send(payload); });
}

// ── HTTP / REST API ───────────────────────────────────────────────────────
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', createApiRouter(store, broadcast));

app.listen(HTTP_PORT, () => {
  console.log(`[http] REST API listening on http://localhost:${HTTP_PORT}/api`);
});

// ── Simulation OR device bridge ───────────────────────────────────────────
if (DEVICE_HOST) {
  console.log(`[ws] Device bridge mode — ${DEVICE_HOST}:${DEVICE_PORT}`);
  connectToDevice({ host: DEVICE_HOST, port: DEVICE_PORT, store, broadcast });
} else {
  console.log('[ws] Simulation mode');
  setInterval(() => {
    store.getBins().forEach(bin => {
      const { bin: updated, newAlerts, frames: alertFrames } = tickBin(bin, store);
      store.updateBin(bin.id, updated);

      // Heartbeat frame
      const frame = store.addFrame(buildHeartbeatFrame(updated));
      broadcast({ type: 'frame', data: frame });
      if (Math.random() > 0.5) {
        const ack = store.addFrame(buildAckFrame());
        broadcast({ type: 'frame', data: ack });
      }

      broadcast({ type: 'bin_update', data: updated });

      // Broadcast alert-specific frames (smoke/fire, door, fault codes, etc.)
      for (const af of (alertFrames || [])) {
        const stored = store.addFrame(af);
        broadcast({ type: 'frame', data: stored });
      }

      for (const alert of newAlerts) {
        store.addAlert(alert);
        broadcast({ type: 'alert', data: alert });
        // Fire alerts get a special broadcast for the dashboard banner
        if (alert.type === 'SMOKE_FIRE') {
          broadcast({ type: 'fire_alert', data: { binId: alert.bin, binName: alert.name, msg: alert.msg, ts: alert.raisedAt } });
        }
      }
    });
  }, 4000);
}

// ── WebSocket connection handler ──────────────────────────────────────────
wss.on('connection', (ws) => {
  console.log(`[ws] Client connected (total: ${wss.clients.size})`);

  ws.send(JSON.stringify({
    type: 'init',
    data: { bins: store.getBins(), alerts: store.getAlerts() },
  }));

  ws.on('message', (raw) => {
    let msg;
    try { msg = JSON.parse(raw); } catch { return; }

    if (msg.type !== 'cmd') return;
    const { cmd, binId } = msg;
    const bin = store.getBin(binId);
    if (!bin) return;

    if (cmd === 'compact') {
      const frame = store.addFrame(buildCompactCommandFrame());
      broadcast({ type: 'frame', data: frame });
      setTimeout(() => {
        const newFill   = Math.max(0, bin.fill - 30 - Math.random() * 10);
        const newCycles = bin.cycles + 1;
        const updated   = store.updateBin(binId, { fill: +newFill.toFixed(1), cycles: newCycles, status: 'online' });
        recordCompaction(store, binId, bin.fill, newFill, newCycles);
        broadcast({ type: 'bin_update', data: updated });
        broadcast({ type: 'toast', data: { msg: `${bin.name} compaction complete — fill ${Math.round(newFill)}%`, sev: 'info' } });
      }, 2000);
    }

    if (cmd === 'acknowledge') {
      store.clearBinAlerts(binId);
      broadcast({ type: 'alerts_update', data: store.getAlerts() });
    }

    if (cmd === 'reset') {
      const f = store.addFrame(buildResetCommandFrame());
      broadcast({ type: 'frame', data: f });
      setTimeout(() => {
        store.updateBin(binId, { status: 'online', smoke: 0, doorOpen: false });
        broadcast({ type: 'bin_update', data: store.getBin(binId) });
        broadcast({ type: 'toast', data: { msg: `${bin.name} reset complete — unit back online`, sev: 'success' } });
      }, 3000);
    }

    if (cmd === 'door_unlock') {
      const f = store.addFrame(buildDoorUnlockFrame());
      broadcast({ type: 'frame', data: f });
      broadcast({ type: 'toast', data: { msg: `${bin.name} door unlocked — service access enabled`, sev: 'info' } });
    }

    if (cmd === 'diagnostics') {
      const req  = store.addFrame(buildDiagnosticsRequestFrame());
      broadcast({ type: 'frame', data: req });
      setTimeout(() => {
        const diag = store.addFrame({
          dir:     'UART→TCP',
          hex:     `E9 D0 06 ${Math.round(bin.fill).toString(16).padStart(2,'0').toUpperCase()} ${Math.round(bin.battery).toString(16).padStart(2,'0').toUpperCase()} 0C 1A 00 02 09 00 0D 0A`,
          decoded: `Diag · cycles=${bin.cycles} · temp=${bin.temp}°C`,
          ts:      new Date().toISOString().replace('T',' ').slice(0,19),
        });
        broadcast({ type: 'frame', data: diag });
      }, 800);
    }
  });

  ws.on('close', () => console.log(`[ws] Client disconnected (total: ${wss.clients.size})`));
  ws.on('error', (e) => console.error('[ws] Error:', e.message));
});

console.log(`[ws] WebSocket listening on ws://localhost:${WS_PORT}`);
