// ── Real device from live capture ─────────────────────────────
export const REAL_DEVICE = {
  deviceNo: '26042400P101',
  imei:     '867105074732545',
  model:    'HY-CKX1',
  brand:    'EcoDisposer / The Green City',
};

// ── Simulated UART↔TCP protocol log (hex frames as seen on device) ──
export const PROTOCOL_LOG = [
  { dir:'UART→TCP', ts:'2026-05-05 14:10:13', hex:'E9 09 06 01 00 00 00 00 00 00 00 0D 0A', decoded:'Heartbeat · fill=0x01 · bat=0x00 · status=OK' },
  { dir:'TCP→UART', ts:'2026-05-05 14:10:14', hex:'E9 AB 00 0D 0A',                        decoded:'ACK · server confirmed receipt' },
  { dir:'UART→TCP', ts:'2026-05-05 14:11:13', hex:'E9 09 06 01 3E 58 00 00 00 00 00 0D 0A', decoded:'Fill=62% · Bat=88% · temp=28°C · status=OK' },
  { dir:'TCP→UART', ts:'2026-05-05 14:11:14', hex:'E9 AB 00 0D 0A',                        decoded:'ACK · server confirmed receipt' },
  { dir:'UART→TCP', ts:'2026-05-05 14:12:01', hex:'E9 09 06 01 60 40 1D 00 00 00 00 0D 0A', decoded:'Fill=96% · Bat=64% · OVERFLOW ALERT' },
  { dir:'TCP→UART', ts:'2026-05-05 14:12:02', hex:'E9 B1 01 0D 0A',                        decoded:'CMD · trigger compaction cycle' },
  { dir:'UART→TCP', ts:'2026-05-05 14:12:10', hex:'E9 09 06 03 60 40 1D 00 00 00 00 0D 0A', decoded:'Compacting · motor active · fill=96%' },
  { dir:'UART→TCP', ts:'2026-05-05 14:12:22', hex:'E9 09 06 01 52 40 1D 00 00 00 00 0D 0A', decoded:'Compaction complete · fill=82% · status=OK' },
  { dir:'TCP→UART', ts:'2026-05-05 14:12:23', hex:'E9 AB 00 0D 0A',                        decoded:'ACK · server confirmed receipt' },
  { dir:'UART→TCP', ts:'2026-05-05 14:15:00', hex:'E9 0A 06 01 1F 0C 00 00 00 00 00 0D 0A', decoded:'Fill=31% · Bat=12% · LOW BATTERY WARNING' },
  { dir:'TCP→UART', ts:'2026-05-05 14:15:01', hex:'E9 C2 01 0D 0A',                        decoded:'CMD · send extended diagnostics' },
  { dir:'UART→TCP', ts:'2026-05-05 14:15:02', hex:'E9 D0 06 58 40 0C 1A 00 02 09 00 0D 0A', decoded:'Diag · solar=0W · cycles=9 · jams=2 · temp=26°C' },
];

export const BINS = [
  { id:'HS-001', deviceNo:'26042400P101', imei:'867105074732545', name:'Valletta City Gate',   area:'Valletta',     fill:62,  battery:88, status:'online',  cycles:18, seen:'1m',  temp:28, signal:4, lat:35.8997, lng:14.5147, mapX:78, mapY:52 },
  { id:'HS-002', deviceNo:'26042400P102', imei:'867105074732546', name:'Sliema Promenade',     area:'Sliema',       fill:96,  battery:64, status:'full',    cycles:34, seen:'2m',  temp:29, signal:4, lat:35.9122, lng:14.5019, mapX:55, mapY:62 },
  { id:'HS-003', deviceNo:'26042400P103', imei:'867105074732547', name:'Bugibba Square',       area:'Bugibba',      fill:14,  battery:92, status:'online',  cycles:6,  seen:'3m',  temp:27, signal:3, lat:35.9514, lng:14.4197, mapX:22, mapY:38 },
  { id:'HS-004', deviceNo:'26042400P104', imei:'867105074732548', name:'Mdina Main Gate',      area:'Mdina',        fill:31,  battery:12, status:'warning', cycles:9,  seen:'5m',  temp:26, signal:2, lat:35.8876, lng:14.4036, mapX:68, mapY:30 },
  { id:'HS-005', deviceNo:'26042400P105', imei:'867105074732549', name:'Mosta Rotunda',        area:'Mosta',        fill:45,  battery:71, status:'online',  cycles:12, seen:'1m',  temp:28, signal:4, lat:35.9097, lng:14.4261, mapX:44, mapY:36 },
  { id:'HS-006', deviceNo:'26042400P106', imei:'867105074732550', name:'Marsaxlokk Waterfront',area:'Marsaxlokk',   fill:0,   battery:0,  status:'offline', cycles:0,  seen:'4h',  temp:0,  signal:0, lat:35.8419, lng:14.5436, mapX:90, mapY:72 },
  { id:'HS-007', deviceNo:'26042400P107', imei:'867105074732551', name:'Birgu Waterfront',     area:'Birgu',        fill:88,  battery:71, status:'fault',   cycles:29, seen:'8m',  temp:29, signal:3, lat:35.8928, lng:14.5228, mapX:80, mapY:60 },
  { id:'HS-008', deviceNo:'26042400P108', imei:'867105074732552', name:'Golden Bay Beach',     area:'Mġarr',        fill:55,  battery:55, status:'online',  cycles:15, seen:'2m',  temp:30, signal:3, lat:35.9481, lng:14.3378, mapX:18, mapY:22 },
];

export const ALERTS = [
  { id:1, bin:'HS-002', name:'Sliema Promenade',    type:'OVERFLOW', msg:'Fill 96% — immediate collection required',      age:'2m',  sev:'crit', hex:'E9 09 06 01 60 40 1D 00 0D 0A' },
  { id:2, bin:'HS-007', name:'Birgu Waterfront',    type:'JAM',      msg:'Aperture jam — compaction mechanism stalled',   age:'8m',  sev:'crit', hex:'E9 0F 01 01 00 00 00 00 0D 0A' },
  { id:3, bin:'HS-006', name:'Marsaxlokk Waterfront',type:'OFFLINE', msg:'No heartbeat for 4+ hours',                     age:'4h',  sev:'warn', hex:null },
  { id:4, bin:'HS-004', name:'Mdina Main Gate',     type:'BATTERY',  msg:'Battery at 12% — solar panel check required',   age:'1h',  sev:'warn', hex:'E9 0A 06 01 1F 0C 00 00 0D 0A' },
];

export const WEEK_DATA = [
  {d:'Mon',v:54},{d:'Tue',v:61},{d:'Wed',v:58},{d:'Thu',v:73},{d:'Fri',v:82},{d:'Sat',v:91},{d:'Sun',v:69},
];

export const fillColor  = p => p>=90?'#ff3b55':p>=70?'#ffb347':'#8fff00';
export const statusMap  = {
  online:  {color:'#8fff00', label:'Online'},
  full:    {color:'#ffb347', label:'Full'},
  warning: {color:'#ffb347', label:'Warning'},
  fault:   {color:'#ff3b55', label:'Fault'},
  offline: {color:'#3a4a64', label:'Offline'},
};
