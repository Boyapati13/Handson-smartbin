export const BINS = [
  { id: 'HS-001', name: 'Valletta City Gate', location: 'Freedom Square, Valletta', lat: 35.8997, lng: 14.5147, fill: 62, battery: 88, status: 'online', compactions: 18, lastSeen: '1 min ago', temp: 28, signal: 4 },
  { id: 'HS-002', name: 'Sliema Promenade', location: 'The Strand, Sliema', lat: 35.9122, lng: 14.5019, fill: 96, battery: 64, status: 'full', compactions: 34, lastSeen: '2 min ago', temp: 29, signal: 4 },
  { id: 'HS-003', name: 'Bugibba Square', location: 'Main Square, Bugibba', lat: 35.9514, lng: 14.4197, fill: 14, battery: 92, status: 'online', compactions: 6, lastSeen: '3 min ago', temp: 27, signal: 3 },
  { id: 'HS-004', name: 'Mdina Main Gate', location: 'Mdina Gate, Mdina', lat: 35.8876, lng: 14.4036, fill: 31, battery: 12, status: 'warning', compactions: 9, lastSeen: '5 min ago', temp: 26, signal: 2 },
  { id: 'HS-005', name: 'Mosta Rotunda', location: 'Pjazza Rotunda, Mosta', lat: 35.9097, lng: 14.4261, fill: 45, battery: 71, status: 'online', compactions: 12, lastSeen: '1 min ago', temp: 28, signal: 4 },
  { id: 'HS-006', name: 'Marsaxlokk Waterfront', location: 'Xatt is-Sajjieda, Marsaxlokk', lat: 35.8419, lng: 14.5436, fill: 0, battery: 0, status: 'offline', compactions: 0, lastSeen: '4h ago', temp: 0, signal: 0 },
  { id: 'HS-007', name: 'Birgu Waterfront', location: 'Vittoriosa Waterfront', lat: 35.8928, lng: 14.5228, fill: 88, battery: 71, status: 'fault', compactions: 29, lastSeen: '8 min ago', temp: 29, signal: 3 },
  { id: 'HS-008', name: 'Golden Bay Beach', location: 'Golden Bay, Mgarr', lat: 35.9481, lng: 14.3378, fill: 55, battery: 55, status: 'online', compactions: 15, lastSeen: '2 min ago', temp: 30, signal: 3 },
]

export const ALERTS = [
  { id: 1, binId: 'HS-002', binName: 'Sliema Promenade', type: 'full', msg: 'Fill level 96% — collection required', time: '2 min ago', severity: 'warning' },
  { id: 2, binId: 'HS-004', binName: 'Mdina Main Gate', type: 'battery', msg: 'Battery 12% — panel may need inspection', time: '1h ago', severity: 'warning' },
  { id: 3, binId: 'HS-006', binName: 'Marsaxlokk Waterfront', type: 'offline', msg: 'Unit offline for > 30 min', time: '4h ago', severity: 'critical' },
  { id: 4, binId: 'HS-007', binName: 'Birgu Waterfront', type: 'fault', msg: 'Jam detected in aperture', time: '8 min ago', severity: 'critical' },
]

export const ACTIVITY = [
  { id: 1, msg: 'Sliema Promenade compacted', sub: 'Cycle 142 → 148 complete', time: '2 min ago' },
  { id: 2, msg: 'Collection route #A12 dispatched', sub: '5 bins assigned to Operator 03', time: '18 min ago' },
  { id: 3, msg: 'Mdina Main Gate low battery alert', sub: 'Battery dropped below 15%', time: '1h ago' },
  { id: 4, msg: 'Bugibba Square emptied', sub: 'Fill reset 100% → 0%', time: '3h ago' },
  { id: 5, msg: 'Firmware update deployed', sub: 'All 8 bins updated to v2.4.1', time: '6h ago' },
]

export const SPECS = [
  { group: 'Physical', items: [
    { label: 'Model', value: 'Ecodisposer HY-CKX1' },
    { label: 'Dimensions (W × D × H)', value: '650 × 700 × 1400 mm' },
    { label: 'Weight (Empty)', value: 'Approx. 80 kg' },
    { label: 'Main Body Material', value: '1.5 mm #304 stainless steel, powder-coated' },
    { label: 'Waste Aperture', value: '2.0 mm #304 SS, 400 × 300 mm' },
    { label: 'Operating Temperature', value: '−20°C to +60°C' },
  ]},
  { group: 'Compaction', items: [
    { label: 'Compactor Type', value: 'Built-in electric linear press' },
    { label: 'Compaction Force', value: '7,000 N (7 kN) maximum' },
    { label: 'Compression Ratio', value: 'Up to 8:1 (mixed paper waste)' },
    { label: 'Nominal Capacity', value: '120 L (EN 840 wheelie bin liner)' },
    { label: 'Effective Capacity', value: 'Up to 960 L uncompacted equivalent' },
    { label: 'Safety Interlock', value: 'Compactor stops on service-door open' },
  ]},
  { group: 'Power', items: [
    { label: 'Power Source', value: 'Top-mounted PV solar panel (tempered glass)' },
    { label: 'Energy Storage', value: '2 × 12V 20Ah gel batteries (maintenance-free)' },
    { label: 'Total Stored Energy', value: '400 Wh nominal' },
    { label: 'Vandalism Protection', value: 'Extra tempered-glass layer over solar panel' },
    { label: 'Low-Voltage Mode', value: 'Prioritises essential functions; auto-shutdown of non-critical systems' },
  ]},
  { group: 'Telemetry & Connectivity', items: [
    { label: 'Modem', value: '4G/LTE cellular (800/1800/2600 MHz)' },
    { label: 'Transmission Frequency', value: 'Every 15–30 min (high activity) / event-driven' },
    { label: 'Data Direction', value: 'Bidirectional — remote config & OTA firmware' },
    { label: 'GPS', value: 'Integrated — real-time tracking & geofence alerts' },
    { label: 'Cloud Platform SLA', value: '99.6% uptime guarantee' },
    { label: 'API', value: 'Authenticated REST + webhook event streaming' },
  ]},
  { group: 'Sensors', items: [
    { label: 'Fill-Level Sensor', value: 'Real-time 0–100% detection' },
    { label: 'Motion Sensor', value: 'Touch-free aperture flap activation' },
    { label: 'Door-Open Sensor', value: 'Triggers immediate compactor stop' },
    { label: 'Jam Detection', value: 'Aperture jam alert to management system' },
    { label: 'Smoke / Fire Sensor', value: 'Continuous monitoring + auto-extinguisher' },
    { label: 'Battery Monitor', value: 'Real-time voltage + charge %' },
  ]},
  { group: 'Safety & Certifications', items: [
    { label: 'CE Marking', value: 'CE marked with Certificate of Conformity per unit' },
    { label: 'ISO', value: 'ISO Certified (quality management)' },
    { label: 'RoHS', value: 'RoHS Compliant' },
    { label: 'Accessibility', value: 'Foot pedal + pull-door; PWD compliant' },
    { label: 'Fire Suppression', value: 'Integrated automatic extinguisher with alarm' },
    { label: 'Cigarette Disposal', value: 'Integrated extinguisher plate + ash receptacle' },
  ]},
]

export const FILL_TREND = [
  { day: 'Mon', avg: 54 },
  { day: 'Tue', avg: 61 },
  { day: 'Wed', avg: 58 },
  { day: 'Thu', avg: 73 },
  { day: 'Fri', avg: 82 },
  { day: 'Sat', avg: 91 },
  { day: 'Sun', avg: 69 },
]

export const COLLECTION_TREND = [
  { week: 'W1', collections: 12, compactions: 234 },
  { week: 'W2', collections: 9,  compactions: 198 },
  { week: 'W3', collections: 11, compactions: 221 },
  { week: 'W4', collections: 8,  compactions: 187 },
]

export const statusColor = (status) => ({
  online:  { dot: '#a3e635', label: 'Online',  badge: 'badge-online' },
  full:    { dot: '#f59e0b', label: 'Full',     badge: 'badge-warning' },
  warning: { dot: '#f59e0b', label: 'Warning',  badge: 'badge-warning' },
  fault:   { dot: '#ef4444', label: 'Fault',    badge: 'badge-fault' },
  offline: { dot: '#64748b', label: 'Offline',  badge: 'badge-offline' },
}[status] || { dot: '#64748b', label: 'Unknown', badge: 'badge-offline' })

export const fillColor = (pct) => {
  if (pct >= 90) return '#ef4444'
  if (pct >= 70) return '#f59e0b'
  return '#a3e635'
}
