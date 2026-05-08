import net from 'net';
import { parseFrames, decodeFrame } from './parser.js';
import { resolveDevice } from './registry.js';
import {
  insertSession, closeSession,
  insertFrame,
  upsertBinState,
  insertReading,
  insertAlert,
} from './db/queries.js';

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildFrame(code, payload = []) {
  return Buffer.from([0xE9, code, payload.length, ...payload, 0x0D, 0x0A]);
}

function toHex(buf) {
  return [...buf].map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(' ');
}

function extractDeviceId(buf) {
  const text = buf.toString('utf8', 0, Math.min(buf.length, 96)).replace(/\0/g, '').trim();
  return (text.match(/\b(\d{15})\b/) || text.match(/\b(\d{8}[A-Z]\d{3})\b/) || [])[1] ?? null;
}

function decodeStatusByte(v) {
  return {
    doorOpen:    !(v & 0x01),
    overflow:    !(v & 0x02),
    missingBin:  !(v & 0x04),
    motorFault:  !(v & 0x08),
    sensorFault: !(v & 0x10),
  };
}

function deriveBinStatus(s) {
  if (s.overflow)                              return 'full';
  if (s.missingBin || s.motorFault || s.sensorFault) return 'fault';
  if (s.doorOpen)                              return 'warning';
  return 'online';
}

// ── ACK frame codes that require an 0xAB reply ────────────────────────────────
const ACK_CODES = new Set([0x00, 0x01, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x10, 0xAB, 0xAC]);

// ── TCP server ────────────────────────────────────────────────────────────────

export function startTCP(port) {
  const server = net.createServer((socket) => {
    const remote = `${socket.remoteAddress}:${socket.remotePort}`;
    console.log(`[tcp] connected: ${remote}`);

    let cardNumber  = null;
    let binId       = null;
    let sessionId   = null;
    let identifying = false;
    let buffer      = Buffer.alloc(0);

    // ── Identify device and open a DB session ─────────────────────────────────
    async function identify(rawIdentifier) {
      if (cardNumber || identifying) return;
      identifying = true;

      const info = resolveDevice(rawIdentifier);
      cardNumber  = info?.cardNumber ?? rawIdentifier.trim();
      binId       = info?.binId ?? null;

      sessionId = await insertSession(cardNumber, remote);
      console.log(`[tcp] device=${cardNumber} bin=${binId ?? 'unknown'} session=${sessionId}`);

      if (binId) {
        await upsertBinState(binId, { card_number: cardNumber, status: 'online' });
      }

      // Poll device for its current state immediately after it identifies
      const polls = [[0xC3, []], [0xC4, []], [0xC5, []], [0xC6, []]];
      polls.forEach(([code, pl], i) => {
        setTimeout(() => {
          if (!socket.destroyed) socket.write(buildFrame(code, pl));
        }, 1500 + i * 500);
      });
    }

    // ── Handle each parsed frame ───────────────────────────────────────────────
    async function handleFrame(frame) {
      const code    = frame[1];
      const payload = frame.slice(3, Math.max(3, frame.length - 2));
      const hexStr  = toHex(frame);
      const decoded = decodeFrame(frame);

      // Identify from handshake frame if not yet identified
      if (!cardNumber && code === 0x00) {
        const id = extractDeviceId(payload);
        if (id) await identify(id);
      }

      // Persist inbound frame
      await insertFrame(sessionId, cardNumber, 'in', code, hexStr, decoded);

      // ACK back to device
      if (ACK_CODES.has(code)) {
        const ack = buildFrame(0xAB);
        if (!socket.destroyed) socket.write(ack);
        await insertFrame(sessionId, cardNumber, 'out', 0xAB, toHex(ack), 'ACK · server confirmed receipt');
      }
      if (code === 0x11) {
        const ack = buildFrame(0x11);
        if (!socket.destroyed) socket.write(ack);
        await insertFrame(sessionId, cardNumber, 'out', 0x11, toHex(ack), 'ACK · alert received');
      }

      if (!binId) return; // can't store per-bin data without a mapped bin ID

      // ── Frame-specific DB writes ─────────────────────────────────────────────
      switch (code) {

        case 0x07: { // Battery: voltage, current, level%, temp
          const voltage = payload[0] ?? null;
          const current = payload[1] ?? null;
          const pct     = payload[2] ?? null;
          const temp    = payload[3] ?? null;
          await upsertBinState(binId, {
            battery_pct: pct, battery_voltage: voltage,
            battery_current: current, temperature: temp,
          });
          await insertReading(binId, cardNumber, 'battery', {
            battery_pct: pct, battery_voltage: voltage, temperature: temp,
            raw_payload: { voltage, current, level: pct, temp },
          });
          break;
        }

        case 0x08: { // Capacity: fill% per slot
          const fill = payload[0] ?? null;
          await upsertBinState(binId, {
            fill_pct: fill,
            status: fill != null && fill >= 95 ? 'full' : 'online',
          });
          await insertReading(binId, cardNumber, 'capacity', {
            fill_pct: fill,
            raw_payload: { slot1: payload[0] ?? null, slot2: payload[1] ?? null, slot3: payload[2] ?? null },
          });
          break;
        }

        case 0x06: { // Bucket status: 3 status bytes (inverted polarity)
          const slots = [0, 1, 2].map(i => decodeStatusByte(payload[i] ?? 0));
          const s = slots[0];
          await upsertBinState(binId, {
            door_open: s.doorOpen, overflow: s.overflow,
            motor_fault: s.motorFault, sensor_fault: s.sensorFault,
            status: deriveBinStatus(s),
          });
          await insertReading(binId, cardNumber, 'status', {
            raw_payload: { slots: slots.map(sl => ({ ...sl })) },
          });
          if (s.overflow)    await insertAlert(binId, cardNumber, 'OVERFLOW',     'Bin overflow detected', 'warning', hexStr);
          if (s.motorFault)  await insertAlert(binId, cardNumber, 'MOTOR_FAULT',  'Motor fault detected',  'error',   hexStr);
          if (s.sensorFault) await insertAlert(binId, cardNumber, 'SENSOR_FAULT', 'Sensor fault detected', 'error',   hexStr);
          break;
        }

        case 0x10: { // Location: "lat,lng\0" ASCII
          const text = payload.toString('utf8').replace(/\0/g, '').trim();
          const [latStr, lngStr] = text.split(',');
          const lat = parseFloat(latStr);
          const lng = parseFloat(lngStr);
          if (Number.isFinite(lat) && Number.isFinite(lng)) {
            await upsertBinState(binId, { lat, lng });
            await insertReading(binId, cardNumber, 'location', { lat, lng, raw_payload: { text } });
          }
          break;
        }

        case 0x11: { // Alert: jam or smoke
          const jam   = payload[0] === 0x01;
          const smoke = payload[1] === 0x01;
          if (smoke) {
            await upsertBinState(binId, { status: 'fire' });
            await insertAlert(binId, cardNumber, 'SMOKE_FIRE', 'Smoke alarm triggered', 'critical', hexStr);
          } else if (jam) {
            await upsertBinState(binId, { status: 'fault' });
            await insertAlert(binId, cardNumber, 'JAM', 'Mechanical jam detected', 'warning', hexStr);
          }
          break;
        }

        case 0x09: { // Open/compaction counts: 3 open + 3 compress per slot
          const openCounts       = [payload[0] ?? 0, payload[1] ?? 0, payload[2] ?? 0];
          const compactionCounts = [payload[3] ?? 0, payload[4] ?? 0, payload[5] ?? 0];
          await upsertBinState(binId, { open_counts: openCounts, compaction_counts: compactionCounts });
          await insertReading(binId, cardNumber, 'counts', {
            raw_payload: { openCounts, compactionCounts },
          });
          break;
        }

        // 0x01 sensor trigger, 0x04 compress start, 0x05 compress done:
        // frame is logged above; no extra DB writes needed for these events
      }
    }

    // ── Socket data event ─────────────────────────────────────────────────────
    socket.on('data', (chunk) => {
      buffer = Buffer.concat([buffer, chunk]);

      // Try to identify from the raw first packet (pre-frame text handshake)
      if (!cardNumber) {
        const id = extractDeviceId(chunk);
        if (id) identify(id).catch(err => console.error('[tcp] identify error:', err));
      }

      const frames = parseFrames(buffer);
      let consumed = 0;

      for (const frame of frames) {
        consumed += frame.length;
        handleFrame(frame).catch(err =>
          console.error(`[tcp] frame handler error (card=${cardNumber}):`, err.message)
        );
      }

      if (consumed > 0) buffer = buffer.slice(consumed);
    });

    // ── Socket close ──────────────────────────────────────────────────────────
    socket.on('close', async () => {
      console.log(`[tcp] disconnected: ${remote} (card=${cardNumber})`);
      try {
        if (sessionId) await closeSession(sessionId);
        if (binId)     await upsertBinState(binId, { status: 'offline' });
      } catch (err) {
        console.error('[tcp] cleanup error:', err.message);
      }
    });

    socket.on('error', (err) => {
      console.error(`[tcp] socket error (${remote}):`, err.message);
    });
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`[tcp] Port ${port} is already in use. Stop any existing process first.`);
    } else {
      console.error('[tcp] Server error:', err.message);
    }
    process.exit(1);
  });

  server.listen(port, '0.0.0.0', () => {
    console.log(`[tcp] Listening on 0.0.0.0:${port}`);
  });

  return server;
}
