/**
 * HandsOn SmartBin — Local TCP Proxy Server
 *
 * Listens on TCP port 8078 for real HY-CKX1 device connections.
 * The user changes the device's "TCP IP" setting from the legacy supplier
 * host to their own public cloud IP or hostname. The device then sends live
 * E9xx frames directly to this server.
 *
 * Features:
 *  - Accepts multiple simultaneous device connections
 *  - Identifies each device by its equipment card number (from frame or hello msg)
 *  - Sends proper ACK responses back to the device
 *  - Broadcasts decoded frames + bin state updates to WebSocket clients
 *  - Optionally forwards all traffic to the original cloud server
 *    (set CLOUD_FORWARD=true to mirror data to recycle4g.lxhsoft.com:8078)
 *
 * To connect your device:
 *   1. Run this server on a cloud VM with a static public IP
 *   2. Configure the device TCP IP to that public IP or hostname
 *   3. Keep the port on 8078 unless your firewall uses a different port
 *   4. Tap SAVE and restart the device app
 *   5. The dashboard will show DEVICE CONNECTED immediately
 */

import net from 'net';
import { parseFrames, decodeFrame } from './device-bridge.js';
import { resolveDevice } from './device-registry.js';

const CLOUD_HOST    = process.env.CLOUD_FORWARD_HOST || process.env.LEGACY_CLOUD_HOST || 'recycle4g.lxhsoft.com';
const CLOUD_PORT    = parseInt(process.env.CLOUD_FORWARD_PORT) || 8078;
const FORWARD_CLOUD = process.env.CLOUD_FORWARD === 'true';

// Active device sockets: cardNumber → { socket, binId, cloudSocket }
const activeDevices = new Map();

/**
 * Send an ACK back to the device after every status frame.
 * Without this the device may consider the connection broken.
 */
function sendAck(socket, code = 0xAB) {
  if (!socket.destroyed) {
    socket.write(buildFrame(code));
  }
}

/**
 * Parse the device identifier from the first data packet.
 * The protocol sends the IMEI after power-up, but we also accept the legacy
 * equipment card number format for compatibility.
 */
function extractDeviceId(buf) {
  const text = buf.toString('utf8', 0, Math.min(buf.length, 96)).replace(/\0/g, '').trim();
  const imei = text.match(/\b(\d{15})\b/);
  if (imei) return imei[1];

  const card = text.match(/\b(\d{8}[A-Z]\d{3})\b/);
  if (card) return card[1];

  return null;
}

function decodeStatusByte(value) {
  return {
    raw: value,
    doorOpen: !!(value & 0x01),
    overflow: !!(value & 0x02),
    missingBin: !!(value & 0x04),
    motorFault: !!(value & 0x08),
    sensorFault: !!(value & 0x10),
  };
}

function deriveBinStatus(slot) {
  if (!slot) return 'online';
  if (slot.overflow) return 'full';
  if (slot.missingBin || slot.motorFault || slot.sensorFault) return 'fault';
  if (slot.doorOpen) return 'warning';
  return 'online';
}

function parseLocation(payload) {
  const text = payload.toString('utf8').replace(/\0/g, '').trim();
  if (!text) return { text: '', lat: null, lng: null };
  const [latText, lngText] = text.split(',').map(part => part.trim());
  const lat = Number(latText);
  const lng = Number(lngText);
  return {
    text,
    lat: Number.isFinite(lat) ? lat : null,
    lng: Number.isFinite(lng) ? lng : null,
  };
}

function buildFrame(code, payload = []) {
  return Buffer.from([0xE9, code, payload.length, ...payload, 0x0D, 0x0A]);
}

/**
 * Start the TCP proxy server on the given port.
 * @param {object} opts
 * @param {number} opts.port    - TCP listen port (default 8078)
 * @param {object} opts.store   - data store instance
 * @param {function} opts.broadcast - WebSocket broadcast function
 * @returns {net.Server}
 */
export function startTCPProxy({ port = 8078, store, broadcast }) {
  const server = net.createServer((socket) => {
    const remote = `${socket.remoteAddress}:${socket.remotePort}`;
    console.log(`[tcp] Device connected from ${remote}`);

    let deviceKey           = null;
    let deviceId            = null;
    let deviceInfo          = null;
    let binId               = null;
    let cloudSocket         = null;
    let buffer              = Buffer.alloc(0);
    let connectionAnnounced = false;

    broadcast({ type: 'device_connecting', remote });

    function registerDevice(identifier) {
      const info = resolveDevice(identifier);
      const key = info?.cardNumber || info?.imei || identifier;
      if (!key) return null;

      if (deviceKey && deviceKey !== key) {
        activeDevices.delete(deviceKey);
      }

      deviceKey = key;
      deviceId = identifier;
      deviceInfo = info;
      binId = info?.binId || binId || null;

      activeDevices.set(key, {
        socket,
        binId,
        cardNumber: key,
        imei: info?.imei || (identifier?.length === 15 ? identifier : null),
        location: null,
        cloudSocket,
        lastSeen: new Date().toISOString().replace('T',' ').slice(0,19),
      });

      if (!connectionAnnounced) {
        connectionAnnounced = true;
        const bin = binId ? store.getBin(binId) : null;
        broadcast({
          type: 'device_connected',
          data: {
            cardNumber: key,
            deviceId: identifier,
            imei: info?.imei || null,
            binId,
            binName: bin?.name || info?.name || key,
            remote,
            ts: new Date().toISOString().replace('T',' ').slice(0,19),
          },
        });

        if (bin) {
          store.updateBin(binId, { status: 'online', seen: 'live' });
          broadcast({ type: 'bin_update', data: store.getBin(binId) });
          broadcast({ type: 'toast', data: { msg: `Real device connected: ${bin.name} (${key})`, sev: 'success' } });
        }

        // Poll device for current state immediately after it identifies itself.
        // Sequence: bucket status → battery → capacity → counts
        const POLL_FRAMES = [
          [0xC3, []],   // read all bucket status
          [0xC4, []],   // read battery status
          [0xC5, []],   // read all bucket capacity
          [0xC6, []],   // read open and compression counts
        ];
        POLL_FRAMES.forEach(([code, pl], i) => {
          setTimeout(() => {
            if (!socket.destroyed) {
              socket.write(buildFrame(code, pl));
            }
          }, 1500 + i * 500);
        });
      }

      return activeDevices.get(key);
    }

    function touchDevice(patch = {}) {
      if (!deviceKey) return;
      const current = activeDevices.get(deviceKey);
      if (!current) return;
      activeDevices.set(deviceKey, {
        ...current,
        ...patch,
        lastSeen: new Date().toISOString().replace('T',' ').slice(0,19),
      });
    }

    function updateMappedBin(patch, event) {
      if (!binId) return null;
      const updated = store.updateBin(binId, { ...patch, seen: 'live' });
      if (event) store.addBinEvent(binId, event);
      broadcast({ type: 'bin_update', data: updated });
      return updated;
    }

    // ── Optional cloud forward socket ────────────────────────────────────────
    if (FORWARD_CLOUD) {
      cloudSocket = net.createConnection({ host: CLOUD_HOST, port: CLOUD_PORT });
      cloudSocket.on('connect',  ()  => console.log(`[tcp] Cloud forward active → ${CLOUD_HOST}:${CLOUD_PORT}`));
      cloudSocket.on('data',     (d) => { if (!socket.destroyed) socket.write(d); }); // relay cloud→device
      cloudSocket.on('error',    (e) => console.warn('[tcp] Cloud forward error:', e.message));
    }

    // ── Incoming device data ─────────────────────────────────────────────────
    socket.on('data', (chunk) => {
      // Forward to cloud first (mirror)
      if (cloudSocket && !cloudSocket.destroyed) cloudSocket.write(chunk);

      // Buffer partial frames
      buffer = Buffer.concat([buffer, chunk]);

      // Try to extract device ID from the first packet if not yet known.
      if (!deviceKey) {
        const identifier = extractDeviceId(chunk);
        if (identifier) {
          registerDevice(identifier);
        }
      }

      // Parse all complete E9xx frames from the buffer
      const frames  = parseFrames(buffer);
      let consumed  = 0;

      for (const frameBuf of frames) {
        consumed += frameBuf.length;
        const hex     = [...frameBuf].map(b => b.toString(16).padStart(2,'0').toUpperCase()).join(' ');
        const decoded = decodeFrame(frameBuf);
        const ts      = new Date().toISOString().replace('T',' ').slice(0,19);
        const code    = frameBuf[1];
        const payload = frameBuf.slice(3, Math.max(3, frameBuf.length - 2));

        if (!deviceKey && code === 0x00) {
          const identifier = extractDeviceId(payload);
          if (identifier) registerDevice(identifier);
        }

        touchDevice();

        // Store and broadcast frame
        const stored = store.addFrame({ dir:'UART→TCP', hex, decoded, ts, deviceCard: deviceKey || deviceId });
        broadcast({ type: 'frame', data: stored });

        // Send ACK back to device per real protocol behaviour:
        //   All data / heartbeat frames → E9 AB 00 0D 0A
        //   Alert frames (0x11)         → E9 11 00 0D 0A
        // Without these ACKs the device reconnects after 3 missed responses.
        const DATA_FRAME_CODES = new Set([0x00, 0x01, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x10, 0xAB, 0xAC]);
        if (DATA_FRAME_CODES.has(code)) {
          sendAck(socket, 0xAB);
          const ackHex = [...buildFrame(0xAB)].map(b => b.toString(16).padStart(2,'0').toUpperCase()).join(' ');
          const ackFrame = store.addFrame({ dir:'TCP→UART', hex: ackHex, decoded: 'ACK · server confirmed receipt', ts, deviceCard: deviceKey || deviceId });
          broadcast({ type: 'frame', data: ackFrame });
        }
        if (code === 0x11) {
          sendAck(socket, 0x11);
          const ackHex = [...buildFrame(0x11)].map(b => b.toString(16).padStart(2,'0').toUpperCase()).join(' ');
          const ackFrame = store.addFrame({ dir:'TCP→UART', hex: ackHex, decoded: 'ACK · alert received', ts, deviceCard: deviceKey || deviceId });
          broadcast({ type: 'frame', data: ackFrame });
        }

        // Location update: lat,lng
        if (code === 0x10 && binId) {
          const location = parseLocation(payload);
          const updated = updateMappedBin(
            {
              lat: location.lat ?? store.getBin(binId)?.lat,
              lng: location.lng ?? store.getBin(binId)?.lng,
              lastLocation: location.text || null,
            },
            { type: 'LOCATION', location: location.text || null }
          );

          if (updated) {
            touchDevice({ location: location.text || null });
            broadcast({
              type: 'device_location',
              data: { cardNumber: deviceKey, deviceId: deviceId || deviceKey, binId, location: location.text || null, lat: updated.lat, lng: updated.lng, remote, ts },
            });
          }
        }

        // Door/smoke alert frame.
        if (code === 0x11 && binId) {
          const jam = payload[0] === 0x01;
          const smoke = payload[1] === 0x01;
          const bin = store.getBin(binId);
          if (bin) {
            const alert = {
              id: Date.now() + Math.random(),
              bin: binId,
              name: bin.name,
              type: smoke ? 'SMOKE_FIRE' : 'JAM',
              msg: smoke
                ? 'Smoke alarm triggered (real device)'
                : jam
                  ? 'Mechanical jam detected (real device)'
                  : `Alert frame received: ${hex}`,
              sev: 'crit',
              raisedAt: ts,
              hex,
            };
            store.addAlert(alert);
            updateMappedBin(
              { status: smoke ? 'fire' : 'fault', smoke: smoke ? 1 : 0 },
              { type: smoke ? 'SMOKE_FIRE' : 'JAM', hex }
            );
            broadcast({ type: 'alert', data: alert });
            if (smoke) {
              broadcast({ type: 'fire_alert', data: { binId, binName: bin.name, msg: alert.msg, ts } });
            }
            broadcast({ type: 'toast', data: { msg: alert.msg, sev: smoke ? 'error' : 'warning' } });
          }
        }

        // Bucket status bytes 1-3.
        if (code === 0x06 && binId) {
          const slots = [0, 1, 2].map(i => decodeStatusByte(payload[i] || 0));
          const updated = updateMappedBin(
            {
              bucketStatus: slots,
              doorOpen: slots[0].doorOpen,
              status: deriveBinStatus(slots[0]),
            },
            { type: 'BUCKET_STATUS', status: deriveBinStatus(slots[0]), slots }
          );

          if (updated) {
            store.recordUptimeTick(binId, true);
          }
        }

        // Battery bytes 5-8.
        if (code === 0x07 && binId) {
          const current = store.getBin(binId);
          const batteryVoltage = payload[0] ?? current?.batteryVoltage ?? null;
          const batteryCurrent = payload[1] ?? current?.batteryCurrent ?? null;
          const battery = payload[2] ?? current?.battery ?? null;
          const temp = payload[3] ?? current?.temp ?? null;
          const updated = updateMappedBin(
            {
              batteryVoltage,
              batteryCurrent,
              battery: battery ?? current?.battery ?? 0,
              temp: temp ?? current?.temp ?? 0,
            },
            { type: 'BATTERY', battery, batteryVoltage, batteryCurrent, temp }
          );

          if (updated) {
            store.addFillSnapshot(binId, {
              fill: updated.fill,
              battery: updated.battery,
              temp: updated.temp,
              status: updated.status,
            });
          }
        }

        // Capacity bytes 2-4.
        if (code === 0x08 && binId) {
          const current = store.getBin(binId);
          const fill = payload[0] ?? current?.fill ?? 0;
          const updated = updateMappedBin(
            {
              fill,
              capacitySlots: [payload[0] ?? null, payload[1] ?? null, payload[2] ?? null],
              status: fill >= 95 ? 'full' : current?.status === 'fault' ? 'fault' : current?.status === 'fire' ? 'fire' : 'online',
            },
            { type: 'CAPACITY', fill, capacitySlots: [payload[0] ?? null, payload[1] ?? null, payload[2] ?? null] }
          );

          if (updated) {
            store.addFillSnapshot(binId, {
              fill: updated.fill,
              battery: updated.battery,
              temp: updated.temp,
              status: updated.status,
            });
          }
        }

        // Sensor / button trigger — user touched or waved at a bin door.
        if (code === 0x01 && binId) {
          const doorNum = payload[0] ? (payload[0] & 0x0F) : 1;
          updateMappedBin(
            { doorOpen: true, status: 'online' },
            { type: 'SENSOR_TRIGGER', door: doorNum }
          );
          broadcast({ type: 'toast', data: { msg: `Sensor triggered on ${store.getBin(binId)?.name || binId} (door ${doorNum})`, sev: 'info' } });
        }

        // Compressor started compression cycle.
        if (code === 0x04 && binId) {
          const doorNum = payload[0] ? (payload[0] & 0x0F) : 1;
          updateMappedBin(
            { status: 'online' },
            { type: 'COMPRESS_START', door: doorNum }
          );
          broadcast({ type: 'toast', data: { msg: `Compressing — ${store.getBin(binId)?.name || binId} door ${doorNum}`, sev: 'info' } });
        }

        // Compressor finished compression cycle.
        if (code === 0x05 && binId) {
          const doorNum = payload[0] ? (payload[0] & 0x0F) : 1;
          const bin = store.getBin(binId);
          updateMappedBin(
            { cycles: (bin?.cycles ?? 0) + 1, status: 'online' },
            { type: 'COMPRESS_DONE', door: doorNum }
          );
          broadcast({ type: 'toast', data: { msg: `Compaction done — ${bin?.name || binId}`, sev: 'success' } });
        }

        // 0xAC is the alternate heartbeat code (same meaning as 0xAB).
        // No extra action needed — ACK already sent above.

        // Open and compaction counts bytes 5-10.
        if (code === 0x09 && binId) {
          const openCounts = [payload[0] ?? 0, payload[1] ?? 0, payload[2] ?? 0];
          const compactionCounts = [payload[3] ?? 0, payload[4] ?? 0, payload[5] ?? 0];
          updateMappedBin(
            {
              openCounts,
              compactionCounts,
              cycles: compactionCounts[0] ?? store.getBin(binId)?.cycles ?? 0,
            },
            { type: 'COUNTS', openCounts, compactionCounts }
          );
        }
      }

      // Trim consumed bytes from buffer
      if (consumed > 0) {
        buffer = buffer.slice(consumed);
      }
    });

    // ── Socket close / error ─────────────────────────────────────────────────
    socket.on('close', () => {
      console.log(`[tcp] Device disconnected: ${remote} (card=${deviceKey})`);
      if (deviceKey) activeDevices.delete(deviceKey);
      if (cloudSocket && !cloudSocket.destroyed) cloudSocket.destroy();

      if (binId) {
        store.updateBin(binId, { status:'offline', seen: 'disconnected' });
        broadcast({ type: 'bin_update', data: store.getBin(binId) });
      }

      broadcast({
        type: 'device_disconnected',
        data: { cardNumber: deviceKey, deviceId, imei: deviceInfo?.imei || null, binId, remote, ts: new Date().toISOString().replace('T',' ').slice(0,19) },
      });
      broadcast({ type: 'toast', data: { msg: `Device disconnected: ${deviceKey || remote}`, sev: 'warning' } });
    });

    socket.on('error', (err) => {
      console.error(`[tcp] Socket error (${remote}):`, err.message);
    });
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`[tcp] Port ${port} already in use. Is another process using it?`);
    } else {
      console.error('[tcp] Server error:', err.message);
    }
  });

  server.listen(port, '0.0.0.0', () => {
    console.log(`[tcp] Device TCP server listening on 0.0.0.0:${port}`);
    if (process.env.DEVICE_PUBLIC_HOST || process.env.PUBLIC_TCP_HOST) {
      const host = process.env.DEVICE_PUBLIC_HOST || process.env.PUBLIC_TCP_HOST;
      const publicPort = parseInt(process.env.DEVICE_PUBLIC_PORT) || port;
      console.log(`[tcp] Point device TCP IP to ${host}, port ${publicPort}`);
    } else {
      console.log(`[tcp] Point device TCP IP to your LAN IP, port ${port}`);
    }
    if (FORWARD_CLOUD) {
      console.log(`[tcp] Cloud forward enabled → ${CLOUD_HOST}:${CLOUD_PORT}`);
    }
  });

  return server;
}

/** Send a command frame to a specific device by card number */
export function sendCommand(cardNumber, frameBuffer) {
  const device = activeDevices.get(cardNumber);
  if (device && !device.socket.destroyed) {
    device.socket.write(frameBuffer);
    return true;
  }
  return false;
}

/** Get list of currently connected devices */
export function getConnectedDevices() {
  return [...activeDevices.entries()].map(([card, d]) => ({
    cardNumber: card,
    imei:       d.imei || null,
    binId:      d.binId,
    location:   d.location || null,
    lastSeen:   d.lastSeen || null,
    connected:  !d.socket.destroyed,
  }));
}
