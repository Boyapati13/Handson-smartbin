// ── Real device (from HY-CKX1 config screen) ──────────────────────────────
export const REAL_DEVICE = {
  deviceNo:  '26042400P101',
  imei:      '867105074732545',
  model:     'HY-CKX1',
  firmware:  '4.37.0 HY_HSP_ItalyCustomer 20260424.1937',
};

// ── E9xx frame reference — actual protocol ─────────────────────────────────
export const FRAME_CATALOG = [
  { byte:'E9 00', dir:'UART→TCP', label:'Handshake (IMEI)',    color:'#94a3b8' },
  { byte:'E9 10', dir:'UART→TCP', label:'Location',            color:'#60a5fa' },
  { byte:'E9 11', dir:'UART→TCP', label:'Alert (smoke / jam)', color:'#f87171' },
  { byte:'E9 06', dir:'UART→TCP', label:'Bucket status',       color:'#29ABE2' },
  { byte:'E9 07', dir:'UART→TCP', label:'Battery state',       color:'#34d399' },
  { byte:'E9 08', dir:'UART→TCP', label:'Capacity',            color:'#29ABE2' },
  { byte:'E9 09', dir:'UART→TCP', label:'Counts / heartbeat',  color:'#29ABE2' },
  { byte:'E9 AB', dir:'TCP→UART', label:'Server ACK',          color:'#a78bfa' },
  { byte:'E9 C1', dir:'TCP→UART', label:'CMD → open door',     color:'#fb923c' },
  { byte:'E9 C3', dir:'TCP→UART', label:'CMD → read status',   color:'#fb923c' },
  { byte:'E9 C5', dir:'TCP→UART', label:'CMD → read capacity', color:'#fb923c' },
];

// ── Real fleet — single unit, starts offline until device connects ─────────
export const BINS = [
  {
    id:'HS-001', deviceNo:'26042400P101', imei:'867105074732545',
    name:'HS-001', area:'Site A',
    fill:0, battery:0, status:'offline', cycles:0, temp:0, signal:0,
    smoke:0, doorOpen:false, lat:null, lng:null, seen:null,
  },
];

export const ALERTS = [];

// ── Demo fleet — full Malta dataset shown in demo mode ─────────────────────
export const DEMO_BINS = [
  { id:'HS-001', deviceNo:'26042400P101', imei:'867105074732545', name:'Valletta City Gate',    area:'Valletta',   fill:62,  battery:88, status:'online',  cycles:18, seen:'1m',  temp:28, signal:4, smoke:0, doorOpen:false, lat:35.8997, lng:14.5147 },
  { id:'HS-002', deviceNo:'26042400P102', imei:'867105074732546', name:'Sliema Promenade',      area:'Sliema',     fill:96,  battery:64, status:'full',    cycles:34, seen:'2m',  temp:29, signal:4, smoke:0, doorOpen:false, lat:35.9122, lng:14.5019 },
  { id:'HS-003', deviceNo:'26042400P103', imei:'867105074732547', name:'Bugibba Square',        area:'Bugibba',    fill:14,  battery:92, status:'online',  cycles:6,  seen:'3m',  temp:27, signal:3, smoke:0, doorOpen:false, lat:35.9514, lng:14.4197 },
  { id:'HS-004', deviceNo:'26042400P104', imei:'867105074732548', name:'Mdina Main Gate',       area:'Mdina',      fill:31,  battery:12, status:'warning', cycles:9,  seen:'5m',  temp:26, signal:2, smoke:0, doorOpen:false, lat:35.8876, lng:14.4036 },
  { id:'HS-005', deviceNo:'26042400P105', imei:'867105074732549', name:'Mosta Rotunda',         area:'Mosta',      fill:45,  battery:71, status:'online',  cycles:12, seen:'1m',  temp:28, signal:4, smoke:0, doorOpen:false, lat:35.9097, lng:14.4261 },
  { id:'HS-006', deviceNo:'26042400P106', imei:'867105074732550', name:'Marsaxlokk Waterfront', area:'Marsaxlokk', fill:0,   battery:0,  status:'offline', cycles:0,  seen:'4h',  temp:0,  signal:0, smoke:0, doorOpen:false, lat:35.8419, lng:14.5436 },
  { id:'HS-007', deviceNo:'26042400P107', imei:'867105074732551', name:'Birgu Waterfront',      area:'Birgu',      fill:88,  battery:71, status:'fault',   cycles:29, seen:'8m',  temp:29, signal:3, smoke:0, doorOpen:false, lat:35.8928, lng:14.5228 },
  { id:'HS-008', deviceNo:'26042400P108', imei:'867105074732552', name:'Golden Bay Beach',      area:'Mġarr',      fill:55,  battery:55, status:'online',  cycles:15, seen:'2m',  temp:30, signal:3, smoke:0, doorOpen:false, lat:35.9481, lng:14.3378 },
];

export const DEMO_ALERTS = [
  { id:1, bin:'HS-002', name:'Sliema Promenade',      type:'OVERFLOW',  msg:'Fill 96% — immediate collection required',                 age:'2m',  sev:'crit', raisedAt: new Date(Date.now()-120000).toISOString()  },
  { id:2, bin:'HS-007', name:'Birgu Waterfront',      type:'JAM',       msg:'Aperture jam — compaction mechanism stalled (fault 0x02)', age:'8m',  sev:'crit', raisedAt: new Date(Date.now()-480000).toISOString()  },
  { id:3, bin:'HS-006', name:'Marsaxlokk Waterfront', type:'COMM_LOSS', msg:'No heartbeat for 4h — 4G/LTE connection lost',             age:'4h',  sev:'crit', raisedAt: new Date(Date.now()-14400000).toISOString() },
  { id:4, bin:'HS-004', name:'Mdina Main Gate',       type:'BATTERY',   msg:'Battery at 12% — solar panel inspection required',         age:'1h',  sev:'warn', raisedAt: new Date(Date.now()-3600000).toISOString()  },
];

// ── Alert type metadata ────────────────────────────────────────────────────
export const ALERT_TYPES = {
  OVERFLOW:   { label:'Overflow',           color:'#ef4444', bg:'rgba(239,68,68,0.1)',  sev:'crit' },
  SMOKE_FIRE: { label:'Smoke / Fire',       color:'#ef4444', bg:'rgba(239,68,68,0.15)', sev:'crit' },
  JAM:        { label:'Aperture Jam',       color:'#ef4444', bg:'rgba(239,68,68,0.1)',  sev:'crit' },
  COMM_LOSS:  { label:'Communication Loss', color:'#f59e0b', bg:'rgba(245,158,11,0.1)', sev:'crit' },
  DOOR_OPEN:  { label:'Door / Tamper',      color:'#f59e0b', bg:'rgba(245,158,11,0.1)', sev:'warn' },
  BATTERY:    { label:'Low Battery',        color:'#f59e0b', bg:'rgba(245,158,11,0.1)', sev:'warn' },
  FAULT_CODE: { label:'System Fault',       color:'#ef4444', bg:'rgba(239,68,68,0.1)',  sev:'crit' },
};

// ── Colour helpers ─────────────────────────────────────────────────────────
export const fillColor = p => p >= 90 ? '#ef4444' : p >= 70 ? '#f59e0b' : '#29ABE2';

export const statusMap = {
  online:  { color:'#10b981', label:'Online'  },
  full:    { color:'#f59e0b', label:'Full'    },
  warning: { color:'#f59e0b', label:'Warning' },
  fault:   { color:'#ef4444', label:'Fault'   },
  offline: { color:'#475569', label:'Offline' },
  fire:    { color:'#ef4444', label:'Fire'    },
};

// ── Demo week chart data ───────────────────────────────────────────────────
export const WEEK_DATA = [
  {d:'Mon',v:54},{d:'Tue',v:61},{d:'Wed',v:58},{d:'Thu',v:73},{d:'Fri',v:82},{d:'Sat',v:91},{d:'Sun',v:69},
];
