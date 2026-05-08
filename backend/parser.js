/**
 * E9xx binary frame parser for HY-CKX1 smart bin devices.
 *
 * Frame format:  E9 <func_code> <data_len> <data...> 0D 0A
 * Total length:  3 (header) + data_len + 2 (trailer)
 *
 * NOTE: Do NOT scan for 0x0D to find the end of a frame — payload bytes
 * can legitimately equal 0x0D (e.g. temperature=13°C, fill=13%).
 * Always use data_len from byte 2 to calculate frame boundaries.
 */

export function parseFrames(buf) {
  const frames = [];
  let i = 0;
  while (i < buf.length) {
    if (buf[i] !== 0xE9) { i++; continue; }
    if (i + 2 >= buf.length) break;

    const dataLen  = buf[i + 2];
    const frameLen = 3 + dataLen + 2;

    if (i + frameLen > buf.length) break;

    if (buf[i + frameLen - 2] !== 0x0D || buf[i + frameLen - 1] !== 0x0A) {
      i++;
      continue;
    }

    frames.push(buf.slice(i, i + frameLen));
    i += frameLen;
  }
  return frames;
}

export function decodeFrame(buf) {
  if (!buf || buf[0] !== 0xE9) {
    return `Unknown: ${hex(buf)}`;
  }
  const code    = buf[1];
  const payload = buf.slice(3, Math.max(3, buf.length - 2));
  const ascii   = payload.toString('utf8').replace(/\0/g, '').trim();
  const phex    = hex(payload);

  const statusBits = (v) => {
    const f = [];
    if (!(v & 0x01)) f.push('door=open');
    if (!(v & 0x02)) f.push('overflow');
    if (!(v & 0x04)) f.push('missing-bin');
    if (!(v & 0x08)) f.push('motor-fault');
    if (!(v & 0x10)) f.push('sensor-fault');
    return f.length ? f.join(', ') : 'normal';
  };

  const map = {
    0x00: () => `Handshake · device=${ascii || phex}`,
    0x01: () => `Sensor/button · door ${(payload[0] ?? 0) & 0x0F || 1} triggered`,
    0x04: () => `Compressor start · door ${(payload[0] ?? 0) & 0x0F || 1}`,
    0x05: () => `Compressor done  · door ${(payload[0] ?? 0) & 0x0F || 1}`,
    0x06: () => `Bucket status · ${[0,1,2].map(i => `slot${i+1}=${statusBits(payload[i]||0)}`).join(' · ')}`,
    0x07: () => `Battery · voltage=${payload[0]??0} · current=${payload[1]??0} · level=${payload[2]??0}% · temp=${payload[3]??0}°C`,
    0x08: () => `Capacity · slot1=${payload[0]??0}% · slot2=${payload[1]??0}% · slot3=${payload[2]??0}%`,
    0x09: () => `Counts · open=${payload.slice(0,3).join('/')} · compress=${payload.slice(3,6).join('/')}`,
    0x10: () => `Location · ${ascii || phex}`,
    0x11: () => payload[0]===0x01 ? 'Alert · jam detected' : payload[1]===0x01 ? 'Alert · smoke detected' : `Alert · ${phex}`,
    0xAB: () => 'ACK · heartbeat keep-alive from device',
    0xAC: () => 'ACK · heartbeat keep-alive from device (alt)',
    0xC1: () => `CMD → open door ${(payload[0]??0)&0x0F||1}`,
    0xC2: () => `CMD → close door ${(payload[0]??0)&0x0F||1}`,
    0xC3: () => 'CMD → read all bucket status',
    0xC4: () => 'CMD → read battery status',
    0xC5: () => 'CMD → read all bucket capacity',
    0xC6: () => 'CMD → read open/compression counts',
  };

  return (map[code] || (() => `Frame 0xE9 0x${code.toString(16).toUpperCase()}`))();
}

function hex(buf) {
  return [...(buf || [])].map(b => b.toString(16).padStart(2,'0').toUpperCase()).join(' ');
}
