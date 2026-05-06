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
  const map = {
    0x09: () => `Status · fill=${buf[4]}% · bat=${buf[5]}% · temp=${buf[6]}°C`,
    0xAB: () => 'ACK · server confirmed receipt',
    0xB1: () => 'CMD · compaction triggered',
    0xC2: () => 'CMD · diagnostics requested',
    0x0A: () => `Alert · fill=${buf[4]}% · bat=${buf[5]}%`,
    0x0F: () => 'Fault report · mechanism stalled',
    0xD0: () => `Diag · cycles=${buf[8]} · temp=${buf[6]}°C`,
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
