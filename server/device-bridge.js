/**
 * TCP ↔ WebSocket device bridge.
 * Connects to a real HY-CKX1 gateway over raw TCP,
 * parses E9xx frames, updates the store, and broadcasts to all WS clients.
 */
import net from 'net';

/** Decode a raw E9xx frame buffer to a human-readable string. */
export function decodeFrame(buf) {
  if (!buf || buf[0] !== 0xE9) {
    const hex = [...(buf || [])].map(b => b.toString(16).padStart(2,'0').toUpperCase()).join(' ');
    return `Unknown frame: ${hex}`;
  }
  const type = buf[1];
  const payload = buf.slice(3, Math.max(3, buf.length - 2));
  const ascii = payload.toString('utf8').replace(/\0/g, '').trim();
  const payloadHex = [...payload].map(b => b.toString(16).padStart(2,'0').toUpperCase()).join(' ');

  // Bit0=0 → door open, Bit1-4=0 → fault/abnormal (inverted polarity per protocol PDF)
  const statusBits = (value) => {
    const flags = [];
    if (!(value & 0x01)) flags.push('door=open');
    if (!(value & 0x02)) flags.push('overflow');
    if (!(value & 0x04)) flags.push('missing-bin');
    if (!(value & 0x08)) flags.push('motor-fault');
    if (!(value & 0x10)) flags.push('sensor-fault');
    return flags.length ? flags.join(', ') : 'normal';
  };

  const map = {
    // Device → Server frames
    0x00: () => `Handshake · device=${ascii || payloadHex}`,
    0x01: () => `Sensor/button · door ${(payload[0] ?? 0) & 0x0F || 1} triggered`,
    0x04: () => `Compressor start · door ${(payload[0] ?? 0) & 0x0F || 1}`,
    0x05: () => `Compressor done  · door ${(payload[0] ?? 0) & 0x0F || 1}`,
    0x06: () => `Bucket status · ${[0, 1, 2].map(i => `slot${i + 1}=${statusBits(payload[i] || 0)}`).join(' · ')}`,
    0x07: () => `Battery · voltage=${payload[0] ?? 0} · current=${payload[1] ?? 0} · level=${payload[2] ?? 0}% · temp=${payload[3] ?? 0}°C`,
    0x08: () => `Capacity · slot1=${payload[0] ?? 0}% · slot2=${payload[1] ?? 0}% · slot3=${payload[2] ?? 0}%`,
    0x09: () => `Counts · open=${payload.slice(0, 3).join('/')} · compress=${payload.slice(3, 6).join('/')}`,
    0x10: () => `Location · ${ascii || payloadHex}`,
    0x11: () => payload[0] === 0x01 ? 'Alert · jam detected' : payload[1] === 0x01 ? 'Alert · smoke detected' : `Alert · ${payloadHex}`,
    0xAB: () => 'ACK · heartbeat keep-alive from device',
    0xAC: () => 'ACK · heartbeat keep-alive from device (alt)',
    // Server → Device commands
    0xC1: () => `CMD → open deposit door ${(payload[0] ?? 0) & 0x0F || 1}`,
    0xC2: () => `CMD → close deposit door ${(payload[0] ?? 0) & 0x0F || 1}`,
    0xC3: () => 'CMD → read all bucket status',
    0xC4: () => 'CMD → read battery status',
    0xC5: () => 'CMD → read all bucket capacity',
    0xC6: () => 'CMD → read open/compression counts',
    0xC7: () => `CMD → set overflow distance${payload[0] !== undefined ? ` ${payload[0]}cm` : ''}`,
  };
  return (map[type] || (() => `Frame 0xE9 0x${type.toString(16).toUpperCase()})`))();
}

/** Parse raw TCP bytes into an array of complete E9xx frames. */
export function parseFrames(buf) {
  const frames = [];
  let i = 0;
  while (i < buf.length) {
    if (buf[i] !== 0xE9) { i++; continue; }
    // Find EOF marker 0x0D 0x0A
    const eofIdx = buf.indexOf(0x0D, i + 1);
    if (eofIdx === -1 || buf[eofIdx + 1] !== 0x0A) break;
    frames.push(buf.slice(i, eofIdx + 2));
    i = eofIdx + 2;
  }
  return frames;
}

export function connectToDevice({ host, port, store, broadcast, onConnect, onDisconnect }) {
  const tcp = net.createConnection({ host, port });

  tcp.on('connect', () => {
    console.log(`[bridge] TCP device connected at ${host}:${port}`);
    broadcast({ type: 'device_connected', host, port });
    onConnect?.();
  });

  tcp.on('data', (rawBuf) => {
    const frames = parseFrames(rawBuf);
    for (const frameBuf of frames) {
      const hex     = [...frameBuf].map(b => b.toString(16).padStart(2,'0').toUpperCase()).join(' ');
      const decoded = decodeFrame(frameBuf);
      const frame   = store.addFrame({ dir:'UART→TCP', hex, decoded, ts: new Date().toISOString().replace('T',' ').slice(0,19) });
      broadcast({ type: 'frame', data: frame });

      // Status frame (E9 09) → update bin 0 state (real impl needs device routing table)
      if (frameBuf[1] === 0x09 && frameBuf.length >= 8) {
        const bin = store.getBins()[0];
        if (bin) {
          const updated = store.updateBin(bin.id, {
            fill:    frameBuf[4],
            battery: frameBuf[5],
            temp:    frameBuf[6] || bin.temp,
          });
          broadcast({ type: 'bin_update', data: updated });
        }
      }
    }
  });

  tcp.on('error', (err) => {
    console.error('[bridge] TCP error:', err.message);
    broadcast({ type: 'device_error', error: err.message });
  });

  tcp.on('close', () => {
    console.warn('[bridge] TCP closed — reconnecting in 5 s');
    broadcast({ type: 'device_disconnected' });
    onDisconnect?.();
    setTimeout(() => connectToDevice({ host, port, store, broadcast, onConnect, onDisconnect }), 5000);
  });

  return tcp;
}
