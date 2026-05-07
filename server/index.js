/**
 * HandsOn SmartBin — unified server entry point
 *
 *  HTTP (REST API) : http://localhost:3001/api
 *  WebSocket       : ws://localhost:8765
 *  TCP Device      : tcp://0.0.0.0:8078  (real HY-CKX1 devices connect here)
 *
 * Environment variables:
 *   WS_PORT          WebSocket port                    (default: 8765)
 *   HTTP_PORT        HTTP / REST API port              (default: 3001)
 *   DEVICE_TCP_PORT  TCP port for real device server   (default: 8078)
 *   CLOUD_FORWARD    Forward frames to original cloud  (default: false)
 *   SIMULATION=false Disable simulation when using real devices
 *
 * Real device setup:
 *   1. Deploy the backend on a host with a static public IP
 *   2. Set DEVICE_PUBLIC_HOST to that IP or hostname
 *   3. Open inbound TCP port 8078 on the host firewall
 *   4. Point the device TCP IP to the public host and port 8078
 *   5. Device will appear as CONNECTED in Telemetry console
 */

import express from 'express';
import cors    from 'cors';
import os      from 'os';
import { WebSocketServer }  from 'ws';
import { createStore }       from './store.js';
import { createApiRouter }   from './api.js';
import { startTCPProxy, getConnectedDevices, sendCommand as tcpSendCommand } from './tcp-proxy.js';
import { tickBin, buildHeartbeatFrame, buildAckFrame, buildCompactCommandFrame, buildDiagnosticsRequestFrame, buildResetCommandFrame, buildDoorUnlockFrame, recordCompaction } from './simulator.js';
import { connectToDevice }   from './device-bridge.js';
import { DEVICE_REGISTRY }   from './device-registry.js';

/** Find the equipment card number for a given bin ID */
function cardForBin(binId) {
  return Object.keys(DEVICE_REGISTRY).find(k => DEVICE_REGISTRY[k]?.binId === binId) || null;
}

const WS_PORT         = parseInt(process.env.WS_PORT)         || 8765;
const HTTP_PORT       = parseInt(process.env.HTTP_PORT)       || 3001;
const DEVICE_TCP_PORT = parseInt(process.env.DEVICE_TCP_PORT) || 8078;
const DEVICE_PUBLIC_HOST = process.env.DEVICE_PUBLIC_HOST || process.env.PUBLIC_TCP_HOST || null;
const DEVICE_PUBLIC_PORT = parseInt(process.env.DEVICE_PUBLIC_PORT) || DEVICE_TCP_PORT;
const DEVICE_HOST     = process.env.DEVICE_HOST               || null;   // legacy client mode
const DEVICE_PORT     = parseInt(process.env.DEVICE_PORT)     || 8080;   // legacy client mode
const RUN_SIMULATION  = process.env.SIMULATION === 'true';   // off by default — real device only

// ── Shared store ──────────────────────────────────────────────────────────────
const store = createStore();

// ── WebSocket server ───────────────────────────────────────────────────────────
const wss = new WebSocketServer({ port: WS_PORT });

function broadcast(msg) {
  const payload = JSON.stringify(msg);
  wss.clients.forEach(ws => { if (ws.readyState === 1) ws.send(payload); });
}

// ── HTTP / REST API ────────────────────────────────────────────────────────────
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', createApiRouter(store, broadcast));

// Device status endpoint
app.get('/api/device/status', (req, res) => {
  const lanIPs = Object.values(os.networkInterfaces())
    .flat().filter(i => i.family === 'IPv4' && !i.internal)
    .map(i => i.address);

  res.json({
    tcpPort:          DEVICE_TCP_PORT,
    lanIPs,
    connectedDevices: getConnectedDevices(),
    cloudForward:     process.env.CLOUD_FORWARD === 'true',
    simulationActive: RUN_SIMULATION,
    publicEndpoint: DEVICE_PUBLIC_HOST ? {
      host: DEVICE_PUBLIC_HOST,
      port: DEVICE_PUBLIC_PORT,
    } : null,
    deviceSetup: {
      step1: DEVICE_PUBLIC_HOST
        ? `Use your public device endpoint: ${DEVICE_PUBLIC_HOST}:${DEVICE_PUBLIC_PORT}`
        : `Find your LAN IP: ${lanIPs[0] || 'run ipconfig'}`,
      step2: DEVICE_PUBLIC_HOST
        ? `On device config screen set TCP IP = ${DEVICE_PUBLIC_HOST}`
        : `On device config screen set TCP IP = ${lanIPs[0] || '<your LAN IP>'}`,
      step3: `Set TCP Port = ${DEVICE_TCP_PORT}`,
      step4: 'Tap SAVE and restart device app',
      step5: 'Device will appear as CONNECTED in Telemetry console',
    },
    cloudServer: {
      host: DEVICE_PUBLIC_HOST || 'recycle4g.lxhsoft.com',
      httpPort: parseInt(process.env.PUBLIC_HTTP_PORT) || 18052,
      tcpPort: DEVICE_PUBLIC_PORT,
    },
  });
});

app.listen(HTTP_PORT, () => {
  console.log(`[http] REST API listening on http://localhost:${HTTP_PORT}/api`);
});

// ── TCP Device Proxy — always active ──────────────────────────────────────────
// Real HY-CKX1 devices connect to this port when their TCP IP is set
// to this machine's LAN IP address.
const tcpServer = startTCPProxy({ port: DEVICE_TCP_PORT, store, broadcast });

// ── Simulation or legacy client bridge ───────────────────────────────────────
if (DEVICE_HOST) {
  // Legacy: outbound TCP client to cloud server
  console.log(`[ws] Legacy device bridge mode — ${DEVICE_HOST}:${DEVICE_PORT}`);
  connectToDevice({ host: DEVICE_HOST, port: DEVICE_PORT, store, broadcast });
} else if (RUN_SIMULATION) {
  console.log('[ws] Simulation mode active — real devices will override bin state when connected');
  setInterval(() => {
    store.getBins().forEach(bin => {
      // Skip simulation for bins that have a real device connected
      const connected = getConnectedDevices();
      if (connected.some(d => d.binId === bin.id && d.connected)) return;

      const { bin: updated, newAlerts, frames: alertFrames } = tickBin(bin, store);
      store.updateBin(bin.id, updated);

      const frame = store.addFrame(buildHeartbeatFrame(updated));
      broadcast({ type: 'frame', data: frame });
      if (Math.random() > 0.5) {
        const ack = store.addFrame(buildAckFrame());
        broadcast({ type: 'frame', data: ack });
      }

      broadcast({ type: 'bin_update', data: updated });

      for (const af of (alertFrames || [])) {
        const stored = store.addFrame(af);
        broadcast({ type: 'frame', data: stored });
      }

      for (const alert of newAlerts) {
        store.addAlert(alert);
        broadcast({ type: 'alert', data: alert });
        if (alert.type === 'SMOKE_FIRE') {
          broadcast({ type: 'fire_alert', data: { binId: alert.bin, binName: alert.name, msg: alert.msg, ts: alert.raisedAt } });
        }
      }
    });
  }, 4000);
}

// ── Print LAN IPs for easy device setup ───────────────────────────────────────
const lanIPs = Object.values(os.networkInterfaces())
  .flat().filter(i => i.family === 'IPv4' && !i.internal)
  .map(i => i.address);

console.log(`[ws]  WebSocket  : ws://localhost:${WS_PORT}`);
console.log(`[tcp] Device TCP : 0.0.0.0:${DEVICE_TCP_PORT}  ← set device TCP IP to one of:`);
lanIPs.forEach(ip => console.log(`       → ${ip}:${DEVICE_TCP_PORT}`));
if (DEVICE_PUBLIC_HOST) {
  console.log(`[tcp] Public endpoint: ${DEVICE_PUBLIC_HOST}:${DEVICE_PUBLIC_PORT}`);
}

// ── WebSocket connection handler ───────────────────────────────────────────────
wss.on('connection', (ws) => {
  console.log(`[ws] Browser client connected (total: ${wss.clients.size})`);

  ws.send(JSON.stringify({
    type: 'init',
    data: {
      bins:             store.getBins(),
      alerts:           store.getAlerts(),
      connectedDevices: getConnectedDevices(),
    },
  }));

  ws.on('message', (raw) => {
    let msg;
    try { msg = JSON.parse(raw); } catch { return; }
    if (msg.type !== 'cmd') return;

    const { cmd, binId } = msg;
    const bin = store.getBin(binId);
    if (!bin) return;

    // Command frames — exact per solar compressor protocol spec.
    // 0xC1 = open deposit door (x = 0xD1/D2/D3 for door 1/2/3)
    // 0xC2 = close deposit door
    // 0xC3 = read all bucket status (returns 0x06 frame)
    // 0xC4 = read battery status (returns 0x07 frame)
    // 0xC5 = read all bucket capacity (returns 0x08 frame)
    // 0xC6 = read open/compression counts (returns 0x09 frame)
    const OPEN_DOOR1_FRAME    = Buffer.from([0xE9, 0xC1, 0x01, 0xD1, 0x0D, 0x0A]);
    const CLOSE_DOOR1_FRAME   = Buffer.from([0xE9, 0xC2, 0x01, 0xD1, 0x0D, 0x0A]);
    const READ_STATUS_FRAME   = Buffer.from([0xE9, 0xC3, 0x00, 0x0D, 0x0A]);
    const READ_BATTERY_FRAME  = Buffer.from([0xE9, 0xC4, 0x00, 0x0D, 0x0A]);
    const READ_CAPACITY_FRAME = Buffer.from([0xE9, 0xC5, 0x00, 0x0D, 0x0A]);
    const READ_COUNTS_FRAME   = Buffer.from([0xE9, 0xC6, 0x00, 0x0D, 0x0A]);

    if (cmd === 'compact') {
      const frame = store.addFrame(buildCompactCommandFrame());
      broadcast({ type: 'frame', data: frame });

      // Real devices compact automatically — request fresh capacity data to get updated fill.
      const card = cardForBin(binId);
      if (card) {
        tcpSendCommand(card, READ_CAPACITY_FRAME);
        setTimeout(() => tcpSendCommand(card, READ_COUNTS_FRAME), 600);
      }

      // Optimistic simulation update for non-real-device bins.
      if (!card) {
        setTimeout(() => {
          const newFill   = Math.max(0, bin.fill - 30 - Math.random() * 10);
          const newCycles = bin.cycles + 1;
          const updated   = store.updateBin(binId, { fill: +newFill.toFixed(1), cycles: newCycles, status:'online' });
          recordCompaction(store, binId, bin.fill, newFill, newCycles);
          broadcast({ type: 'bin_update', data: updated });
          broadcast({ type: 'toast', data: { msg: `${bin.name} compaction → fill ${Math.round(newFill)}%`, sev:'info' } });
        }, 2000);
      }
    }

    if (cmd === 'acknowledge') {
      store.clearBinAlerts(binId);
      broadcast({ type: 'alerts_update', data: store.getAlerts() });
    }

    if (cmd === 'reset') {
      const f = store.addFrame(buildResetCommandFrame());
      broadcast({ type: 'frame', data: f });
      // Poll device for fresh status after reset.
      const card = cardForBin(binId);
      if (card) {
        tcpSendCommand(card, READ_STATUS_FRAME);
        setTimeout(() => tcpSendCommand(card, READ_BATTERY_FRAME), 500);
      }

      setTimeout(() => {
        store.updateBin(binId, { status:'online', smoke:0, doorOpen:false });
        broadcast({ type: 'bin_update', data: store.getBin(binId) });
        broadcast({ type: 'toast', data: { msg: `${bin.name} reset complete`, sev:'success' } });
      }, 3000);
    }

    if (cmd === 'door_unlock') {
      const f = store.addFrame(buildDoorUnlockFrame());
      broadcast({ type: 'frame', data: f });
      const card = cardForBin(binId);
      // 0xC1 opens deposit door 1; close it after 5 s to allow waste deposit.
      if (card) {
        tcpSendCommand(card, OPEN_DOOR1_FRAME);
        setTimeout(() => tcpSendCommand(card, CLOSE_DOOR1_FRAME), 5000);
      }
      broadcast({ type: 'toast', data: { msg: `${bin.name} door unlocked`, sev:'info' } });
    }

    if (cmd === 'diagnostics') {
      const req = store.addFrame(buildDiagnosticsRequestFrame());
      broadcast({ type: 'frame', data: req });
      // Send full poll sequence: status → battery → capacity → counts.
      const card = cardForBin(binId);
      if (card) {
        [READ_STATUS_FRAME, READ_BATTERY_FRAME, READ_CAPACITY_FRAME, READ_COUNTS_FRAME].forEach((f, i) => {
          setTimeout(() => tcpSendCommand(card, f), i * 400);
        });
      }

      setTimeout(() => {
        const diag = store.addFrame({
          dir:     'UART→TCP',
          hex:     `E9 C3 00 0D 0A`,
          decoded: `Diag poll sent · fill=${Math.round(bin.fill)}% · cycles=${bin.cycles} · temp=${bin.temp}°C`,
          ts:      new Date().toISOString().replace('T',' ').slice(0,19),
        });
        broadcast({ type: 'frame', data: diag });
      }, 800);
    }
  });

  ws.on('close', () => console.log(`[ws] Client disconnected (total: ${wss.clients.size})`));
  ws.on('error', (e) => console.error('[ws] Error:', e.message));
});
