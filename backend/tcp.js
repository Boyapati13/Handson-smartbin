import net from 'net';
import { parseFrames, decodeFrame } from './parser.js';
import { resolveDevice } from './registry.js';
import {
  insertSession, closeSession,
  insertFrame,
  upsertBinState,
  insertReading,
  insertAlert,
  alertIsOpen,
  incrementCompactionCount,
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
  if (s.overflow)                                    return 'full';
  if (s.missingBin || s.motorFault || s.sensorFault) return 'fault';
  if (s.doorOpen)                                    return 'warning';
  return 'online';
}

// Codes that receive an 0xAB ACK. Alert frame 0x11 gets its own 0x11 ACK separately.
const ACK_CODES = new Set([0x00, 0x01, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x10, 0xAB, 0xAC]);

// ── TCP server ────────────────────────────────────────────────────────────────

export function startTCP(port) {
  const server = net.createServer((socket) => {
    const remote = `${socket.remoteAddress}:${socket.remotePort}`;
    console.log(`[tcp] connected: ${remote}`);

    let cardNumber = null;
    let binId      = null;
    let binName    = null;
    let sessionId  = null;
    let buffer     = Buffer.alloc(0);

    // All data events are chained through this promise so frames are always
    // processed sequentially and identify() always completes before handleFrame().
    let processingChain = Promise.resolve();

    // ── Identify device and open a DB session ─────────────────────────────────
    async function identify(rawIdentifier) {
      const info = resolveDevice(rawIdentifier);
      cardNumber  = info?.cardNumber ?? rawIdentifier.trim();
      binId       = info?.binId      ?? null;
      binName     = info?.name       ?? null;

      sessionId = await insertSession(cardNumber, remote);
      console.log(`[tcp] device=${cardNumber} bin=${binId ?? 'unknown'} session=${sessionId}`);

      if (binId) {
        await upsertBinState(binId, {
          card_number: cardNumber,
          bin_name:    binName,
          status:      'online',
        });
      }

      // Immediately poll the device for its full current state.
      // Sequence matches the server layer: status → battery → capacity → counts
      const polls = [[0xC3, []], [0xC4, []], [0xC5, []], [0xC6, []]];
      polls.forEach(([code, pl], i) => {
        setTimeout(() => {
          if (!socket.destroyed) socket.write(buildFrame(code, pl));
        }, 1500 + i * 500);
      });
    }

    // ── Handle one parsed frame ───────────────────────────────────────────────
    async function handleFrame(frame) {
      const code    = frame[1];
      const payload = frame.slice(3, Math.max(3, frame.length - 2));
      const hexStr  = toHex(frame);
      const decoded = decodeFrame(frame);

      // Identify from handshake frame (0x00) if still unknown after raw-text check
      if (!cardNumber && code === 0x00) {
        const id = extractDeviceId(payload);
        if (id) await identify(id);
      }

      // Log frame (sessionId may be null for the very first pre-handshake frames)
      await insertFrame(sessionId, cardNumber, 'in', code, hexStr, decoded);

      // ACK
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

      if (!binId) return;

      // ── Frame-specific DB writes ──────────────────────────────────────────
      switch (code) {

        case 0x07: { // Battery: [voltage, current, level%, temp]
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
          // Only override status when the bin is genuinely full (>=95%).
          // Never clobber an existing 'fault' or 'fire' status with 'online'.
          const patch = { fill_pct: fill };
          if (fill != null && fill >= 95) patch.status = 'full';
          await upsertBinState(binId, patch);
          await insertReading(binId, cardNumber, 'capacity', {
            fill_pct: fill,
            raw_payload: { slot1: payload[0] ?? null, slot2: payload[1] ?? null, slot3: payload[2] ?? null },
          });
          break;
        }

        case 0x06: { // Bucket status: 3 bytes, inverted polarity (0=fault, 1=normal)
          const slots = [0, 1, 2].map(i => decodeStatusByte(payload[i] ?? 0));
          const s = slots[0];
          await upsertBinState(binId, {
            door_open:    s.doorOpen,
            overflow:     s.overflow,
            missing_bin:  s.missingBin,
            motor_fault:  s.motorFault,
            sensor_fault: s.sensorFault,
            status:       deriveBinStatus(s),
          });
          await insertReading(binId, cardNumber, 'status', {
            raw_payload: { slots: slots.map(sl => ({ ...sl })) },
          });
          // Deduplicated alert inserts — only raise if no open alert of that type exists.
          // The device sends 0x06 on every heartbeat, so without this check we'd get
          // hundreds of duplicate alert rows per hour.
          if (s.overflow    && !(await alertIsOpen(binId, 'OVERFLOW')))
            await insertAlert(binId, cardNumber, 'OVERFLOW',     'Bin overflow detected', 'warning', hexStr);
          if (s.motorFault  && !(await alertIsOpen(binId, 'MOTOR_FAULT')))
            await insertAlert(binId, cardNumber, 'MOTOR_FAULT',  'Motor fault detected',  'error',   hexStr);
          if (s.sensorFault && !(await alertIsOpen(binId, 'SENSOR_FAULT')))
            await insertAlert(binId, cardNumber, 'SENSOR_FAULT', 'Sensor fault detected', 'error',   hexStr);
          if (s.missingBin  && !(await alertIsOpen(binId, 'BIN_MISSING')))
            await insertAlert(binId, cardNumber, 'BIN_MISSING',  'Bin not present',       'error',   hexStr);
          break;
        }

        case 0x10: { // Location: "lat,lng\0" ASCII
          const text = payload.toString('utf8').replace(/\0/g, '').trim();
          const [latStr = '', lngStr = ''] = text.split(',').map(s => s.trim());
          const lat = parseFloat(latStr);
          const lng = parseFloat(lngStr);
          if (Number.isFinite(lat) && Number.isFinite(lng)) {
            await upsertBinState(binId, { lat, lng });
            await insertReading(binId, cardNumber, 'location', { lat, lng, raw_payload: { text } });
          }
          break;
        }

        case 0x11: { // Alert: byte 0 = jam, byte 1 = smoke (smoke takes priority)
          const jam   = payload[0] === 0x01;
          const smoke = payload[1] === 0x01;
          if (smoke) {
            await upsertBinState(binId, { status: 'fire' });
            if (!(await alertIsOpen(binId, 'SMOKE_FIRE')))
              await insertAlert(binId, cardNumber, 'SMOKE_FIRE', 'Smoke alarm triggered', 'critical', hexStr);
          } else if (jam) {
            await upsertBinState(binId, { status: 'fault' });
            if (!(await alertIsOpen(binId, 'JAM')))
              await insertAlert(binId, cardNumber, 'JAM', 'Mechanical jam detected', 'warning', hexStr);
          }
          break;
        }

        case 0x09: { // Counts: 3 open + 3 compress (authoritative poll response)
          const openCounts       = [payload[0] ?? 0, payload[1] ?? 0, payload[2] ?? 0];
          const compactionCounts = [payload[3] ?? 0, payload[4] ?? 0, payload[5] ?? 0];
          await upsertBinState(binId, { open_counts: openCounts, compaction_counts: compactionCounts });
          await insertReading(binId, cardNumber, 'counts', {
            raw_payload: { openCounts, compactionCounts },
          });
          break;
        }

        case 0x05: { // Compress done — live cycle tally (0x09 poll is authoritative but infrequent)
          await incrementCompactionCount(binId);
          break;
        }

        // 0x01 sensor trigger, 0x04 compress start: logged above, no extra DB writes
      }
    }

    // ── Socket data — sequential processing chain ─────────────────────────────
    //
    // Each 'data' event is chained onto the previous one via processingChain.
    // This guarantees:
    //   1. identify() finishes before any frame from the same packet is handled
    //   2. No two frames are processed concurrently (avoids sessionId race)
    //   3. Buffer trimming happens in the correct order
    socket.on('data', (chunk) => {
      buffer = Buffer.concat([buffer, chunk]);

      processingChain = processingChain.then(async () => {
        if (!cardNumber) {
          const id = extractDeviceId(chunk);
          if (id) await identify(id);
        }

        const frames = parseFrames(buffer);
        let consumed = 0;

        for (const frame of frames) {
          consumed += frame.length;
          await handleFrame(frame);
        }

        if (consumed > 0) buffer = buffer.slice(consumed);
      }).catch(err => console.error('[tcp] processing error:', err));
    });

    // ── Socket close ──────────────────────────────────────────────────────────
    socket.on('close', async () => {
      console.log(`[tcp] disconnected: ${remote} (card=${cardNumber})`);
      await processingChain.catch(() => {}); // drain in-flight work first
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
