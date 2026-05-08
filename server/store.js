/**
 * In-memory data store — single source of truth for all server state.
 * Framework-free so it can be imported in tests without spinning up servers.
 */

export const INITIAL_BINS = [
  { id:'HS-001', deviceNo:'26042400P101', imei:'867105074732545', name:'HS-001', area:'Site A', fill:0, battery:0, status:'offline', cycles:0, temp:0, signal:0, lat:null, lng:null },
];

function nowTs() { return new Date().toISOString().replace('T',' ').slice(0,19); }

export function createStore() {
  let bins           = INITIAL_BINS.map(b => ({ ...b }));
  let alerts         = [];           // active alerts
  let alertHistory   = [];           // all alerts ever raised (max 500)
  let frames         = [];
  let frameId        = 0;
  let maintenanceLogs = [];          // all maintenance visits (max 1000)
  let publicReports  = [];           // public fault reports (max 500)
  let operatorComments = [];         // per-bin operator comments

  // Per-bin time-series: fill + battery snapshots (last 120 per bin ≈ 8 min @ 4s ticks)
  const fillHistory  = Object.fromEntries(INITIAL_BINS.map(b => [b.id, []]));
  // Per-bin event log: status changes, alerts, compactions, diagnostics (last 200)
  const binEvents    = Object.fromEntries(INITIAL_BINS.map(b => [b.id, []]));
  // Per-bin uptime counters: { online, total }
  const uptimeTicks  = Object.fromEntries(INITIAL_BINS.map(b => [b.id, { online: 0, total: 0 }]));

  return {
    // ── Bins ─────────────────────────────────────────────────────────────────
    getBins:  ()     => bins.map(b => ({ ...b })),
    getBin:   (id)   => { const b = bins.find(b => b.id === id); return b ? { ...b } : null; },
    updateBin:(id, patch) => {
      bins = bins.map(b => b.id === id ? { ...b, ...patch } : b);
      return bins.find(b => b.id === id);
    },

    // ── Active alerts ─────────────────────────────────────────────────────────
    getAlerts:      ()      => [...alerts],
    addAlert:       (a)     => {
      const withTs = { ...a, raisedAt: a.raisedAt || nowTs() };
      alerts       = [withTs, ...alerts].slice(0, 50);
      alertHistory = [withTs, ...alertHistory].slice(0, 500);
    },
    removeAlert:    (id)    => { alerts = alerts.filter(a => a.id !== id); },
    clearBinAlerts: (binId) => {
      const resolved = alerts.filter(a => a.bin === binId).map(a => ({ ...a, resolvedAt: nowTs(), resolved: true }));
      alertHistory   = alertHistory.map(a => resolved.find(r => r.id === a.id) || a);
      alerts         = alerts.filter(a => a.bin !== binId);
    },

    // ── Alert history (all-time, including resolved) ──────────────────────────
    getAlertHistory: (opts = {}) => {
      let h = [...alertHistory];
      if (opts.binId)   h = h.filter(a => a.bin === opts.binId);
      if (opts.type)    h = h.filter(a => a.type === opts.type);
      if (opts.sev)     h = h.filter(a => a.sev === opts.sev);
      if (opts.limit)   h = h.slice(0, opts.limit);
      return h;
    },

    // ── Fill history (time-series snapshots) ──────────────────────────────────
    addFillSnapshot: (binId, snap) => {
      if (!fillHistory[binId]) fillHistory[binId] = [];
      fillHistory[binId] = [...fillHistory[binId].slice(-119), { ...snap, ts: nowTs() }];
    },
    getFillHistory: (binId, n = 60) => (fillHistory[binId] || []).slice(-n),
    getAllFillHistory: () => ({ ...fillHistory }),

    // ── Bin event log ─────────────────────────────────────────────────────────
    addBinEvent: (binId, event) => {
      if (!binEvents[binId]) binEvents[binId] = [];
      binEvents[binId] = [...binEvents[binId].slice(-199), { ...event, ts: event.ts || nowTs() }];
    },
    getBinEvents: (binId, n = 50) => (binEvents[binId] || []).slice(-n).reverse(),
    getAllBinEvents: () => ({ ...binEvents }),

    // ── Uptime tracking ───────────────────────────────────────────────────────
    recordUptimeTick: (binId, isOnline) => {
      if (!uptimeTicks[binId]) uptimeTicks[binId] = { online: 0, total: 0 };
      uptimeTicks[binId].total  += 1;
      if (isOnline) uptimeTicks[binId].online += 1;
    },
    getUptimePct: (binId) => {
      const t = uptimeTicks[binId];
      if (!t || t.total === 0) return null;
      return Math.round((t.online / t.total) * 100);
    },
    getAllUptimes: () => Object.fromEntries(
      Object.entries(uptimeTicks).map(([id, t]) => [
        id, t.total === 0 ? null : Math.round((t.online / t.total) * 100),
      ])
    ),

    // ── Telemetry frames ─────────────────────────────────────────────────────
    getFrames:  (n = 100) => frames.slice(-n),
    addFrame:   (f)       => { frames = [...frames.slice(-999), { ...f, id: ++frameId }]; return frames.at(-1); },
    frameCount: ()        => frameId,

    // ── Fleet stats ───────────────────────────────────────────────────────────
    getStats: () => ({
      total:          bins.length,
      online:         bins.filter(b => b.status !== 'offline').length,
      full:           bins.filter(b => b.status === 'full').length,
      fault:          bins.filter(b => b.status === 'fault').length,
      offline:        bins.filter(b => b.status === 'offline').length,
      warning:        bins.filter(b => b.status === 'warning').length,
      avgFill:        bins.length ? Math.round(bins.reduce((s,b) => s + b.fill, 0) / bins.length) : 0,
      avgBattery:     bins.length ? Math.round(bins.reduce((s,b) => s + (b.battery||0), 0) / bins.length) : 0,
      totalCycles:    bins.reduce((s,b) => s + (b.cycles||0), 0),
      totalOpenCounts:bins.reduce((s,b) => s + (b.openCounts||[]).reduce((a,c) => a+c, 0), 0),
      criticalAlerts: alerts.filter(a => a.sev === 'crit').length,
      warnAlerts:     alerts.filter(a => a.sev === 'warn').length,
      totalAlertHistory: alertHistory.length,
    }),

    // ── Per-bin performance report ────────────────────────────────────────────
    getBinReport: (binId) => {
      const bin     = bins.find(b => b.id === binId);
      if (!bin) return null;
      const history = fillHistory[binId] || [];
      const events  = binEvents[binId] || [];
      const uptime  = uptimeTicks[binId] || { online: 0, total: 0 };
      const alerts_ = alertHistory.filter(a => a.bin === binId);
      const alertsByType = alerts_.reduce((acc, a) => { acc[a.type] = (acc[a.type]||0)+1; return acc; }, {});
      const collections  = events.filter(e => e.type === 'COMPACTION').length;
      const avgFillHist  = history.length
        ? Math.round(history.reduce((s,h) => s + h.fill, 0) / history.length) : bin.fill;
      const peakFill     = history.length ? Math.max(...history.map(h => h.fill)) : bin.fill;
      const minBattery   = history.length ? Math.min(...history.map(h => h.battery)) : bin.battery;
      const uptimePct    = uptime.total === 0 ? (bin.status !== 'offline' ? 100 : 0)
        : Math.round((uptime.online / uptime.total) * 100);
      return {
        ...bin,
        uptimePct,
        collections,
        alertCount:    alerts_.length,
        alertsByType,
        avgFill:       avgFillHist,
        peakFill,
        minBattery,
        fillHistory:   history.slice(-60),
        recentEvents:  events.slice(-30).reverse(),
        recentAlerts:  alerts_.slice(0, 20),
      };
    },

    // ── Maintenance logs ──────────────────────────────────────────────────────
    addMaintenanceLog: (log) => {
      const entry = { ...log, id: Date.now() + Math.random(), createdAt: log.createdAt || new Date().toISOString().replace('T',' ').slice(0,19) };
      maintenanceLogs = [entry, ...maintenanceLogs].slice(0, 1000);
      return entry;
    },
    getMaintenanceLogs: (opts = {}) => {
      let logs = [...maintenanceLogs];
      if (opts.binId) logs = logs.filter(l => l.binId === opts.binId);
      if (opts.limit) logs = logs.slice(0, opts.limit);
      return logs;
    },

    // ── Public fault reports ──────────────────────────────────────────────────
    addPublicReport: (report) => {
      const entry = { ...report, id: Date.now() + Math.random(), receivedAt: new Date().toISOString().replace('T',' ').slice(0,19), status: 'pending' };
      publicReports = [entry, ...publicReports].slice(0, 500);
      return entry;
    },
    getPublicReports: (opts = {}) => {
      let reports = [...publicReports];
      if (opts.binId)  reports = reports.filter(r => r.binId === opts.binId);
      if (opts.status) reports = reports.filter(r => r.status === opts.status);
      if (opts.limit)  reports = reports.slice(0, opts.limit);
      return reports;
    },
    updatePublicReport: (id, patch) => {
      publicReports = publicReports.map(r => r.id === id ? { ...r, ...patch } : r);
    },

    // ── Operator comments ─────────────────────────────────────────────────────
    addComment: (comment) => {
      const entry = { ...comment, id: Date.now() + Math.random(), ts: new Date().toISOString().replace('T',' ').slice(0,19) };
      operatorComments = [entry, ...operatorComments].slice(0, 1000);
      return entry;
    },
    getComments: (binId) => operatorComments.filter(c => c.binId === binId),

    // ── Test helpers ──────────────────────────────────────────────────────────
    reset: () => {
      bins              = INITIAL_BINS.map(b => ({ ...b }));
      alerts            = [];
      alertHistory      = [];
      frames            = [];
      frameId           = 0;
      maintenanceLogs   = [];
      publicReports     = [];
      operatorComments  = [];
      Object.keys(fillHistory).forEach(k  => { fillHistory[k]  = []; });
      Object.keys(binEvents).forEach(k    => { binEvents[k]    = []; });
      Object.keys(uptimeTicks).forEach(k  => { uptimeTicks[k]  = { online: 0, total: 0 }; });
    },
  };
}
