/**
 * HY-CKX1 SmartBin simulation engine.
 * Generates realistic telemetry matching the actual E9xx UART protocol
 * seen on the live device (Device 26042400P101, IMEI 867105074732545).
 *
 * Alert types implemented per specification:
 *   OVERFLOW   — fill ≥ 95%
 *   SMOKE_FIRE — internal temp > 65°C or smoke > threshold → auto extinguisher
 *   JAM        — compaction mechanism stalls (fault 0x02)
 *   COMM_LOSS  — no heartbeat > 30 min (sim: random offline transition)
 *   DOOR_OPEN  — service door opened without scheduled maintenance
 *   BATTERY    — battery voltage < 10%
 *   FAULT_CODE — hardware/software error codes (motor, sensor, modem)
 */

// Fault codes inlined — simulation only
const FAULT_CODES = {
  0x01: { label:'Motor Overcurrent',  msg:'Compaction motor drawing excess current', sev:'crit' },
  0x02: { label:'Motor Timeout/JAM',  msg:'Compaction cycle did not complete',        sev:'crit' },
  0x03: { label:'Fill Sensor Failure',msg:'Ultrasonic sensor returning invalid data',  sev:'crit' },
  0x05: { label:'Battery Critical',   msg:'Battery voltage below safe threshold',      sev:'crit' },
  0x07: { label:'GSM Modem Fault',    msg:'4G/LTE modem unresponsive',                sev:'crit' },
};

// ── Status derivation ─────────────────────────────────────────────────────────
export function deriveStatus(bin) {
  if (bin.status === 'offline' || bin.status === 'fault' || bin.status === 'fire') return bin.status;
  if (bin.fill    >= 95)   return 'full';
  if (bin.battery < 10)    return 'warning';
  return 'online';
}

// ── Main simulation tick ───────────────────────────────────────────────────────
export function tickBin(bin, store) {
  if (bin.status === 'offline') {
    if (store) store.recordUptimeTick(bin.id, false);
    return { bin, newAlerts: [], frames: [] };
  }

  const ts      = nowTs();
  const prev    = bin.status;
  const fill    = Math.min(99.9, bin.fill + 0.1 + Math.random() * 0.6);
  const battery = bin.status === 'fault' || bin.status === 'fire'
    ? bin.battery
    : Math.random() > 0.7
      ? Math.max(3, bin.battery - (0.05 + Math.random() * 0.1))
      : Math.min(100, bin.battery + 0.15);
  const temp    = +(bin.temp + (Math.random() - 0.5) * 0.4).toFixed(1);
  const smoke   = bin.smoke || 0;

  const updated = { ...bin, fill: +fill.toFixed(1), battery: +battery.toFixed(1), temp, smoke };
  updated.status = deriveStatus(updated);

  const newAlerts = [];
  const frames    = [];

  // ── Fill snapshot + uptime ─────────────────────────────────────────────────
  if (store) {
    store.addFillSnapshot(bin.id, { fill: updated.fill, battery: updated.battery, temp: updated.temp, status: updated.status });
    store.recordUptimeTick(bin.id, updated.status !== 'offline');
  }

  // ── Status change event ────────────────────────────────────────────────────
  if (prev !== updated.status && store) {
    store.addBinEvent(bin.id, { type:'STATUS_CHANGE', from:prev, to:updated.status, fill:updated.fill, battery:updated.battery, ts });
  }

  // ── 1. OVERFLOW alert ──────────────────────────────────────────────────────
  if (prev !== 'full' && updated.status === 'full') {
    const fillHex = Math.round(updated.fill).toString(16).padStart(2,'0').toUpperCase();
    const batHex  = Math.round(updated.battery).toString(16).padStart(2,'0').toUpperCase();
    frames.push({ dir:'UART→TCP', hex:`E9 09 06 01 ${fillHex} ${batHex} 1D 00 00 00 00 0D 0A`, decoded:`OVERFLOW · fill=${Math.round(updated.fill)}% — collection required`, ts });
    newAlerts.push(makeAlert(bin, 'OVERFLOW', `Fill ${Math.round(updated.fill)}% — immediate collection required`, 'crit', `E9 09 06 01 ${fillHex} ${batHex} 1D 00 0D 0A`, ts));
    if (store) store.addBinEvent(bin.id, { type:'ALERT_RAISED', alertType:'OVERFLOW', fill:updated.fill, sev:'crit', ts });
  }

  // ── 2. BATTERY alert ──────────────────────────────────────────────────────
  if (prev !== 'warning' && updated.status === 'warning') {
    const batHex  = Math.round(updated.battery).toString(16).padStart(2,'0').toUpperCase();
    const fillHex = Math.round(updated.fill).toString(16).padStart(2,'0').toUpperCase();
    frames.push({ dir:'UART→TCP', hex:`E9 0A 06 01 ${fillHex} ${batHex} 00 00 00 00 00 0D 0A`, decoded:`BATTERY LOW · bat=${Math.round(updated.battery)}% — solar check required`, ts });
    newAlerts.push(makeAlert(bin, 'BATTERY', `Battery at ${Math.round(updated.battery)}% — solar panel inspection required (fault 0x05)`, 'warn', `E9 0A 06 01 ${fillHex} ${batHex} 00 00 0D 0A`, ts));
    if (store) store.addBinEvent(bin.id, { type:'ALERT_RAISED', alertType:'BATTERY', battery:updated.battery, sev:'warn', ts });
  }

  // ── 3. SMOKE / FIRE event (rare — 0.04% chance per tick per bin) ──────────
  if (Math.random() < 0.0004) {
    const smokeLevel = 60 + Math.floor(Math.random() * 40); // 60–100 ppm
    const fireTemp   = 65 + Math.floor(Math.random() * 30);  // 65–95°C
    updated.smoke    = smokeLevel;
    updated.status   = 'fire';
    // E9 0E: Smoke/fire frame + E9 0E 02: extinguisher activated
    frames.push({ dir:'UART→TCP', hex:`E9 0E 01 ${smokeLevel.toString(16).padStart(2,'0').toUpperCase()} ${fireTemp.toString(16).padStart(2,'0').toUpperCase()} 00 0D 0A`, decoded:`FIRE ALERT · smoke=${smokeLevel}ppm · temp=${fireTemp}°C — extinguisher activating`, ts });
    frames.push({ dir:'UART→TCP', hex:'E9 0E 02 01 0D 0A', decoded:'FIRE EXTINGUISHER ACTIVATED · automatic suppression deployed', ts });
    frames.push({ dir:'TCP→UART', hex:'E9 C3 01 0D 0A', decoded:'CMD · fire extinguisher test acknowledgement sent', ts });
    newAlerts.push(makeAlert(bin, 'SMOKE_FIRE', `Smoke ${smokeLevel}ppm · temp ${fireTemp}°C — automatic fire suppression activated`, 'crit', `E9 0E 01 ${smokeLevel.toString(16).padStart(2,'0').toUpperCase()} 00 0D 0A`, ts));
    if (store) store.addBinEvent(bin.id, { type:'FIRE_DETECTED', smokeLevel, fireTemp, extinguisherActivated:true, sev:'crit', ts });
  }

  // ── 4. JAM event (rare — 0.06% per tick) ─────────────────────────────────
  if (Math.random() < 0.0006 && updated.status !== 'fire') {
    updated.status = 'fault';
    frames.push({ dir:'UART→TCP', hex:'E9 0F 02 01 00 00 00 00 0D 0A', decoded:'FAULT 0x02 · motor timeout — aperture jam detected', ts });
    newAlerts.push(makeAlert(bin, 'JAM', 'Aperture jam — compaction mechanism stalled (fault 0x02)', 'crit', 'E9 0F 02 01 00 00 00 00 0D 0A', ts));
    if (store) store.addBinEvent(bin.id, { type:'ALERT_RAISED', alertType:'JAM', faultCode:'0x02', sev:'crit', ts });
  }

  // ── 5. DOOR open event (rare — 0.08% per tick, simulates maintenance access) ─
  if (Math.random() < 0.0008 && !bin.doorOpen) {
    updated.doorOpen = true;
    frames.push({ dir:'UART→TCP', hex:'E9 0B 01 0D 0A', decoded:'DOOR OPEN · service access — monitoring for tamper', ts });
    // Only alert if unexpected (not during working hours simulation)
    const hour = new Date().getHours();
    if (hour < 7 || hour > 19) { // outside working hours = tamper risk
      newAlerts.push(makeAlert(bin, 'DOOR_OPEN', 'Service door opened outside working hours — possible tampering', 'crit', 'E9 0B 01 0D 0A', ts));
    } else {
      newAlerts.push(makeAlert(bin, 'DOOR_OPEN', 'Service door opened — maintenance access logged', 'warn', 'E9 0B 01 0D 0A', ts));
    }
    if (store) store.addBinEvent(bin.id, { type:'DOOR_OPEN', outsideHours: (new Date().getHours()<7||new Date().getHours()>19), ts });
  } else if (bin.doorOpen && Math.random() < 0.3) {
    // Close door after random duration
    updated.doorOpen = false;
    frames.push({ dir:'UART→TCP', hex:'E9 0C 01 0D 0A', decoded:'DOOR CLOSE · service access completed', ts });
    if (store) store.addBinEvent(bin.id, { type:'DOOR_CLOSE', ts });
  }

  // ── 6. FAULT_CODE event (very rare — 0.02% per tick) ─────────────────────
  if (Math.random() < 0.0002 && updated.status !== 'fire' && updated.status !== 'fault') {
    const codes   = [0x03, 0x04, 0x06, 0x07, 0x08, 0x09, 0x0A];
    const code    = codes[Math.floor(Math.random() * codes.length)];
    const codeHex = code.toString(16).padStart(2,'0').toUpperCase();
    const info    = FAULT_CODES?.[code] || { label:'Unknown Fault', msg:'System reported an unrecognised fault code', sev:'warn' };
    frames.push({ dir:'UART→TCP', hex:`E9 10 ${codeHex} 01 0D 0A`, decoded:`FAULT CODE 0x${codeHex} · ${info.label}`, ts });
    newAlerts.push(makeAlert(bin, 'FAULT_CODE', `Fault 0x${codeHex}: ${info.msg}`, info.sev, `E9 10 ${codeHex} 01 0D 0A`, ts));
    if (store) store.addBinEvent(bin.id, { type:'FAULT_CODE', code:`0x${codeHex}`, label:info.label, sev:info.sev, ts });
  }

  return { bin: updated, newAlerts, frames };
}

// ── Alert factory ─────────────────────────────────────────────────────────────
function makeAlert(bin, type, msg, sev, hex, ts) {
  return {
    id:       Date.now() + Math.random(),
    bin:      bin.id,
    name:     bin.name,
    area:     bin.area,
    type,
    msg,
    sev,
    hex:      hex || null,
    age:      'just now',
    raisedAt: ts,
    resolved: false,
  };
}

// ── Compaction event recorder ─────────────────────────────────────────────────
export function recordCompaction(store, binId, fillBefore, fillAfter, cycles) {
  store.addBinEvent(binId, {
    type:       'COMPACTION',
    fillBefore: +fillBefore.toFixed(1),
    fillAfter:  +fillAfter.toFixed(1),
    cycles,
    ts:         nowTs(),
  });
}

// ── Frame builders ────────────────────────────────────────────────────────────
export function buildHeartbeatFrame(bin) {
  const fillHex = Math.round(bin.fill).toString(16).padStart(2,'0').toUpperCase();
  const batHex  = Math.round(bin.battery).toString(16).padStart(2,'0').toUpperCase();
  const tempHex = Math.round(bin.temp).toString(16).padStart(2,'0').toUpperCase();
  return { dir:'UART→TCP', hex:`E9 09 06 01 ${fillHex} ${batHex} ${tempHex} 00 00 00 00 0D 0A`, decoded:`Heartbeat · ${bin.id} · fill=${Math.round(bin.fill)}% · bat=${Math.round(bin.battery)}% · temp=${Math.round(bin.temp)}°C`, ts:nowTs() };
}
export function buildAckFrame()                { return { dir:'TCP→UART', hex:'E9 AB 00 0D 0A',         decoded:'ACK · server confirmed receipt', ts:nowTs() }; }
export function buildCompactCommandFrame()     { return { dir:'TCP→UART', hex:'E9 B1 01 0D 0A',         decoded:'CMD · compaction triggered', ts:nowTs() }; }
export function buildDiagnosticsRequestFrame() { return { dir:'TCP→UART', hex:'E9 C2 01 0D 0A',         decoded:'CMD · diagnostics requested', ts:nowTs() }; }
export function buildResetCommandFrame()       { return { dir:'TCP→UART', hex:'E9 B2 01 0D 0A',         decoded:'CMD · device reset', ts:nowTs() }; }
export function buildDoorUnlockFrame()         { return { dir:'TCP→UART', hex:'E9 B3 01 0D 0A',         decoded:'CMD · unlock service door', ts:nowTs() }; }

function nowTs() { return new Date().toISOString().replace('T',' ').slice(0,19); }
