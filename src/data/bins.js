// ── Real device (captured live from HY-CKX1 display) ──────────────────────
export const REAL_DEVICE = {
  deviceNo:  '26042400P101',
  imei:      '867105074732545',
  model:     'HY-CKX1',
  brand:     'EcoDisposer / The Green City',
  protocol:  'UART ↔ TCP · E9xx frame format',
  firmware:  'v2.4.1',
  certifiedBy: 'CE · RoHS · IP54',
};

// ── Complete E9xx frame reference (actual device protocol) ─────────────────
export const FRAME_CATALOG = [
  // ── Device → Server ───────────────────────────────────────────────────
  { byte:'E9 09', dir:'UART→TCP', label:'Heartbeat / Status',         color:'#29ABE2', sev:'info'   },
  { byte:'E9 0A', dir:'UART→TCP', label:'Battery / Fill Warning',     color:'#f59e0b', sev:'warn'   },
  { byte:'E9 0B', dir:'UART→TCP', label:'Door Opened',                color:'#f59e0b', sev:'warn'   },
  { byte:'E9 0C', dir:'UART→TCP', label:'Door Closed',                color:'#64748b', sev:'info'   },
  { byte:'E9 0E', dir:'UART→TCP', label:'Smoke / Fire Detected',      color:'#ef4444', sev:'crit'   },
  { byte:'E9 0F', dir:'UART→TCP', label:'Fault / JAM Report',         color:'#ef4444', sev:'crit'   },
  { byte:'E9 10', dir:'UART→TCP', label:'System Fault Code',          color:'#ef4444', sev:'crit'   },
  { byte:'E9 D0', dir:'UART→TCP', label:'Extended Diagnostics',       color:'#64748b', sev:'info'   },
  // ── Server → Device ───────────────────────────────────────────────────
  { byte:'E9 AB', dir:'TCP→UART', label:'Server ACK',                 color:'#38bdf8', sev:'info'   },
  { byte:'E9 B1', dir:'TCP→UART', label:'CMD · Compact',              color:'#a78bfa', sev:'info'   },
  { byte:'E9 B2', dir:'TCP→UART', label:'CMD · Reset',                color:'#a78bfa', sev:'info'   },
  { byte:'E9 B3', dir:'TCP→UART', label:'CMD · Open Door Lock',       color:'#a78bfa', sev:'info'   },
  { byte:'E9 C2', dir:'TCP→UART', label:'CMD · Diagnostics Request',  color:'#a78bfa', sev:'info'   },
  { byte:'E9 C3', dir:'TCP→UART', label:'CMD · Fire Extinguisher Test',color:'#ef4444', sev:'crit'  },
];

// ── System fault codes (E9 10 XX) ─────────────────────────────────────────
export const FAULT_CODES = {
  0x01: { label:'Motor Overcurrent',     msg:'Compaction motor drawing excess current — mechanical obstruction likely',  sev:'crit' },
  0x02: { label:'Motor Timeout / JAM',   msg:'Compaction cycle did not complete within expected window',                  sev:'crit' },
  0x03: { label:'Fill Sensor Failure',   msg:'Ultrasonic fill sensor returning invalid readings',                         sev:'crit' },
  0x04: { label:'Temperature Sensor',    msg:'Internal temperature sensor disconnected or out of range',                  sev:'warn' },
  0x05: { label:'Battery Critical',      msg:'Battery voltage below safe operating threshold — immediate charge required', sev:'crit' },
  0x06: { label:'Solar Panel Fault',     msg:'PV input voltage absent — panel may be damaged or shaded',                  sev:'warn' },
  0x07: { label:'GSM Modem Fault',       msg:'4G/LTE modem unresponsive — network connectivity degraded',                 sev:'crit' },
  0x08: { label:'Smoke Sensor Fault',    msg:'Smoke/fire detection sensor reporting abnormal values',                     sev:'warn' },
  0x09: { label:'Door Lock Fault',       msg:'Electronic door lock mechanism failed to respond',                          sev:'warn' },
  0x0A: { label:'Extinguisher Empty',    msg:'Built-in fire suppression canister pressure low — requires refill',         sev:'warn' },
};

// ── Simulated UART↔TCP protocol log (frames captured from live device) ────
export const PROTOCOL_LOG = [
  { dir:'UART→TCP', ts:'2026-05-06 14:10:13', hex:'E9 09 06 01 00 00 00 00 00 00 00 0D 0A', decoded:'Heartbeat · fill=0% · bat=0% · status=OK' },
  { dir:'TCP→UART', ts:'2026-05-06 14:10:14', hex:'E9 AB 00 0D 0A',                         decoded:'ACK · server confirmed receipt' },
  { dir:'UART→TCP', ts:'2026-05-06 14:11:13', hex:'E9 09 06 01 3E 58 1C 00 00 00 00 0D 0A', decoded:'Heartbeat · fill=62% · bat=88% · temp=28°C · OK' },
  { dir:'TCP→UART', ts:'2026-05-06 14:11:14', hex:'E9 AB 00 0D 0A',                         decoded:'ACK · server confirmed receipt' },
  { dir:'UART→TCP', ts:'2026-05-06 14:12:01', hex:'E9 09 06 01 60 40 1D 00 00 00 00 0D 0A', decoded:'Heartbeat · fill=96% · bat=64% · OVERFLOW threshold crossed' },
  { dir:'TCP→UART', ts:'2026-05-06 14:12:02', hex:'E9 B1 01 0D 0A',                         decoded:'CMD · trigger compaction cycle' },
  { dir:'UART→TCP', ts:'2026-05-06 14:12:10', hex:'E9 09 06 03 60 40 1D 00 00 00 00 0D 0A', decoded:'Status · compacting · motor active · fill=96%' },
  { dir:'UART→TCP', ts:'2026-05-06 14:12:22', hex:'E9 09 06 01 52 40 1D 00 00 00 00 0D 0A', decoded:'Status · compaction complete · fill=82% · OK' },
  { dir:'TCP→UART', ts:'2026-05-06 14:12:23', hex:'E9 AB 00 0D 0A',                         decoded:'ACK · server confirmed receipt' },
  { dir:'UART→TCP', ts:'2026-05-06 14:13:05', hex:'E9 0B 01 0D 0A',                         decoded:'DOOR OPEN · service access detected' },
  { dir:'UART→TCP', ts:'2026-05-06 14:13:37', hex:'E9 0C 01 0D 0A',                         decoded:'DOOR CLOSE · service access completed (32 s)' },
  { dir:'UART→TCP', ts:'2026-05-06 14:15:00', hex:'E9 0A 06 01 1F 0C 00 00 00 00 00 0D 0A', decoded:'WARNING · fill=31% · bat=12% · LOW BATTERY' },
  { dir:'TCP→UART', ts:'2026-05-06 14:15:01', hex:'E9 C2 01 0D 0A',                         decoded:'CMD · send extended diagnostics' },
  { dir:'UART→TCP', ts:'2026-05-06 14:15:02', hex:'E9 D0 06 58 40 0C 1A 00 02 09 00 0D 0A', decoded:'Diag · solar=0W · cycles=9 · jams=2 · temp=26°C' },
];

export const BINS = [
  { id:'HS-001', deviceNo:'26042400P101', imei:'867105074732545', name:'Valletta City Gate',    area:'Valletta',   fill:62,  battery:88, status:'online',  cycles:18, seen:'1m',  temp:28, signal:4, smoke:0, doorOpen:false, lat:35.8997, lng:14.5147 },
  { id:'HS-002', deviceNo:'26042400P102', imei:'867105074732546', name:'Sliema Promenade',      area:'Sliema',     fill:96,  battery:64, status:'full',    cycles:34, seen:'2m',  temp:29, signal:4, smoke:0, doorOpen:false, lat:35.9122, lng:14.5019 },
  { id:'HS-003', deviceNo:'26042400P103', imei:'867105074732547', name:'Bugibba Square',        area:'Bugibba',    fill:14,  battery:92, status:'online',  cycles:6,  seen:'3m',  temp:27, signal:3, smoke:0, doorOpen:false, lat:35.9514, lng:14.4197 },
  { id:'HS-004', deviceNo:'26042400P104', imei:'867105074732548', name:'Mdina Main Gate',       area:'Mdina',      fill:31,  battery:12, status:'warning', cycles:9,  seen:'5m',  temp:26, signal:2, smoke:0, doorOpen:false, lat:35.8876, lng:14.4036 },
  { id:'HS-005', deviceNo:'26042400P105', imei:'867105074732549', name:'Mosta Rotunda',         area:'Mosta',      fill:45,  battery:71, status:'online',  cycles:12, seen:'1m',  temp:28, signal:4, smoke:0, doorOpen:false, lat:35.9097, lng:14.4261 },
  { id:'HS-006', deviceNo:'26042400P106', imei:'867105074732550', name:'Marsaxlokk Waterfront', area:'Marsaxlokk', fill:0,   battery:0,  status:'offline', cycles:0,  seen:'4h',  temp:0,  signal:0, smoke:0, doorOpen:false, lat:35.8419, lng:14.5436 },
  { id:'HS-007', deviceNo:'26042400P107', imei:'867105074732551', name:'Birgu Waterfront',      area:'Birgu',      fill:88,  battery:71, status:'fault',   cycles:29, seen:'8m',  temp:29, signal:3, smoke:0, doorOpen:false, lat:35.8928, lng:14.5228 },
  { id:'HS-008', deviceNo:'26042400P108', imei:'867105074732552', name:'Golden Bay Beach',      area:'Mġarr',      fill:55,  battery:55, status:'online',  cycles:15, seen:'2m',  temp:30, signal:3, smoke:0, doorOpen:false, lat:35.9481, lng:14.3378 },
];

// Timestamps use ISO 8601 local Malta time
export const ALERTS = [
  { id:1, bin:'HS-002', name:'Sliema Promenade',     type:'OVERFLOW',   msg:'Fill 96% — immediate collection required',                          age:'2m',  sev:'crit', raisedAt:'2026-05-06 14:08:22', hex:'E9 09 06 01 60 40 1D 00 0D 0A' },
  { id:2, bin:'HS-007', name:'Birgu Waterfront',     type:'JAM',        msg:'Aperture jam — compaction mechanism stalled (fault 0x02)',           age:'8m',  sev:'crit', raisedAt:'2026-05-06 14:02:15', hex:'E9 0F 02 01 00 00 00 00 0D 0A' },
  { id:3, bin:'HS-006', name:'Marsaxlokk Waterfront',type:'COMM_LOSS',  msg:'No heartbeat for 4 h 2 m — 4G/LTE connection lost',                 age:'4h',  sev:'crit', raisedAt:'2026-05-06 10:08:00', hex:null },
  { id:4, bin:'HS-004', name:'Mdina Main Gate',      type:'BATTERY',    msg:'Battery at 12% — solar panel inspection required (fault 0x05)',      age:'1h',  sev:'warn', raisedAt:'2026-05-06 13:10:00', hex:'E9 0A 06 01 1F 0C 00 00 0D 0A' },
];

export const WEEK_DATA = [
  {d:'Mon',v:54},{d:'Tue',v:61},{d:'Wed',v:58},{d:'Thu',v:73},{d:'Fri',v:82},{d:'Sat',v:91},{d:'Sun',v:69},
];

// Fill colour: HandsOn blue = normal, amber = caution, red = overflow/fire
export const fillColor = p => p >= 90 ? '#ef4444' : p >= 70 ? '#f59e0b' : '#29ABE2';

export const statusMap = {
  online:  { color: '#10b981', label: 'Online',  icon: 'wifi'   },
  full:    { color: '#f59e0b', label: 'Full',    icon: 'alert'  },
  warning: { color: '#f59e0b', label: 'Warning', icon: 'alert'  },
  fault:   { color: '#ef4444', label: 'Fault',   icon: 'x'      },
  offline: { color: '#475569', label: 'Offline', icon: 'wifi-off'},
  fire:    { color: '#ef4444', label: 'FIRE',    icon: 'flame'  },
};

// Alert type metadata (icon, colour, label, severity, frame prefix)
export const ALERT_TYPES = {
  OVERFLOW:  { label:'Overflow',            color:'#ef4444', bg:'rgba(239,68,68,0.1)',   sev:'crit', frame:'E9 09', description:'Fill level reached 95% capacity' },
  SMOKE_FIRE:{ label:'Smoke / Fire',        color:'#ef4444', bg:'rgba(239,68,68,0.15)',  sev:'crit', frame:'E9 0E', description:'Internal temperature or smoke above safe threshold — fire suppression activated' },
  JAM:       { label:'Aperture Jam',        color:'#ef4444', bg:'rgba(239,68,68,0.1)',   sev:'crit', frame:'E9 0F', description:'Compaction mechanism mechanically jammed' },
  COMM_LOSS: { label:'Communication Loss',  color:'#f59e0b', bg:'rgba(245,158,11,0.1)',  sev:'crit', frame:null,    description:'Bin offline for more than 30 minutes' },
  DOOR_OPEN: { label:'Door / Tamper',       color:'#f59e0b', bg:'rgba(245,158,11,0.1)',  sev:'warn', frame:'E9 0B', description:'Service access door opened — possible tampering' },
  BATTERY:   { label:'Low Battery',         color:'#f59e0b', bg:'rgba(245,158,11,0.1)',  sev:'warn', frame:'E9 0A', description:'Battery voltage below safe threshold' },
  FAULT_CODE:{ label:'System Fault',        color:'#ef4444', bg:'rgba(239,68,68,0.1)',   sev:'crit', frame:'E9 10', description:'Hardware or software malfunction detected' },
};
