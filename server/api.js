/**
 * REST API — Express router mounted at /api
 * All endpoints are JSON. No auth (add JWT middleware here when needed).
 */
import { Router } from 'express';

export function createApiRouter(store, broadcast) {
  const router = Router();

  // ── Health ────────────────────────────────────────────────────────────────
  router.get('/health', (req, res) => {
    res.json({ status: 'ok', uptime: Math.round(process.uptime()), ts: new Date().toISOString() });
  });

  // ── Stats ─────────────────────────────────────────────────────────────────
  router.get('/stats', (req, res) => {
    res.json(store.getStats());
  });

  // ── Bins ──────────────────────────────────────────────────────────────────
  router.get('/bins', (req, res) => {
    const { status, minFill, maxFill } = req.query;
    let bins = store.getBins();
    if (status)  bins = bins.filter(b => b.status === status);
    if (minFill) bins = bins.filter(b => b.fill >= Number(minFill));
    if (maxFill) bins = bins.filter(b => b.fill <= Number(maxFill));
    res.json(bins);
  });

  router.get('/bins/:id', (req, res) => {
    const bin = store.getBin(req.params.id);
    if (!bin) return res.status(404).json({ error: 'Bin not found', id: req.params.id });
    res.json(bin);
  });

  // ── Commands ──────────────────────────────────────────────────────────────
  router.post('/bins/:id/command', (req, res) => {
    const bin = store.getBin(req.params.id);
    if (!bin) return res.status(404).json({ error: 'Bin not found' });

    const { cmd } = req.body;
    if (!['compact', 'acknowledge', 'diagnostics'].includes(cmd)) {
      return res.status(400).json({ error: 'Unknown command', valid: ['compact','acknowledge','diagnostics'] });
    }

    if (cmd === 'compact') {
      const newFill = Math.max(0, bin.fill - 30 - Math.random() * 10);
      const updated = store.updateBin(bin.id, { fill: +newFill.toFixed(1), cycles: bin.cycles + 1, status: 'online' });
      broadcast({ type: 'bin_update', data: updated });
      broadcast({ type: 'toast', data: { msg: `${bin.name} compaction complete — fill reduced to ${Math.round(newFill)}%`, sev: 'info' } });
      return res.json({ ok: true, bin: updated });
    }

    if (cmd === 'acknowledge') {
      store.clearBinAlerts(bin.id);
      broadcast({ type: 'alerts_update', data: store.getAlerts() });
      return res.json({ ok: true });
    }

    if (cmd === 'diagnostics') {
      return res.json({ ok: true, bin, frameQueued: true });
    }

    res.json({ ok: true });
  });

  // ── Alerts ────────────────────────────────────────────────────────────────
  router.get('/alerts', (req, res) => {
    const { sev } = req.query;
    let alerts = store.getAlerts();
    if (sev) alerts = alerts.filter(a => a.sev === sev);
    res.json(alerts);
  });

  router.delete('/alerts/:id', (req, res) => {
    store.removeAlert(Number(req.params.id));
    broadcast({ type: 'alerts_update', data: store.getAlerts() });
    res.json({ ok: true });
  });

  // ── Telemetry ─────────────────────────────────────────────────────────────
  router.get('/telemetry', (req, res) => {
    const limit = Math.min(Number(req.query.limit) || 100, 500);
    res.json(store.getFrames(limit));
  });

  // ── Reports ───────────────────────────────────────────────────────────────

  /** Fleet-wide summary: stats + per-bin overview + alert breakdown */
  router.get('/reports/fleet', (req, res) => {
    const bins  = store.getBins();
    const stats = store.getStats();
    const uptimes = store.getAllUptimes();
    const alertHistory = store.getAlertHistory();

    // Alert breakdown by type and by bin
    const alertsByType = alertHistory.reduce((acc, a) => {
      acc[a.type] = (acc[a.type] || 0) + 1; return acc;
    }, {});
    const alertsByBin = alertHistory.reduce((acc, a) => {
      acc[a.bin] = (acc[a.bin] || 0) + 1; return acc;
    }, {});
    const alertsBySev = { crit: alertHistory.filter(a=>a.sev==='crit').length, warn: alertHistory.filter(a=>a.sev==='warn').length };

    // Per-bin summary row — includes ALL device fields from E9xx protocol
    const binSummary = bins.map(b => ({
      id:               b.id,
      name:             b.name,
      area:             b.area,
      deviceNo:         b.deviceNo    || null,
      imei:             b.imei        || null,
      fill:             +b.fill.toFixed(1),
      capacitySlots:    b.capacitySlots  || [null, null, null],
      battery:          +(b.battery||0).toFixed(1),
      batteryVoltage:   b.batteryVoltage ?? null,
      batteryCurrent:   b.batteryCurrent ?? null,
      status:           b.status,
      doorOpen:         b.doorOpen    || false,
      bucketStatus:     b.bucketStatus || null,
      cycles:           b.cycles      || 0,
      openCounts:       b.openCounts  || [0, 0, 0],
      compactionCounts: b.compactionCounts || [0, 0, 0],
      temp:             b.temp        || 0,
      lat:              b.lat         ?? null,
      lng:              b.lng         ?? null,
      lastLocation:     b.lastLocation || null,
      seen:             b.seen        || null,
      uptimePct:        uptimes[b.id] ?? (b.status !== 'offline' ? 100 : 0),
      alertCount:       alertsByBin[b.id] || 0,
    }));

    res.json({
      generatedAt: new Date().toISOString(),
      stats,
      binSummary,
      alertsByType,
      alertsBySev,
      totalAlertHistory: alertHistory.length,
    });
  });

  /** Per-bin detailed report: performance metrics + event log + fill history */
  router.get('/reports/bins/:id', (req, res) => {
    const report = store.getBinReport(req.params.id);
    if (!report) return res.status(404).json({ error: 'Bin not found' });
    res.json({ generatedAt: new Date().toISOString(), ...report });
  });

  /** All bins detailed reports in one shot */
  router.get('/reports/bins', (req, res) => {
    const reports = store.getBins().map(b => store.getBinReport(b.id)).filter(Boolean);
    res.json({ generatedAt: new Date().toISOString(), reports });
  });

  /** Alert analytics: full alert history with filters */
  router.get('/reports/alerts', (req, res) => {
    const { binId, type, sev, limit } = req.query;
    const history = store.getAlertHistory({
      binId, type, sev, limit: limit ? Math.min(Number(limit), 500) : 200,
    });
    const byType = history.reduce((acc, a) => { acc[a.type]=(acc[a.type]||0)+1; return acc; }, {});
    const byBin  = history.reduce((acc, a) => { acc[a.bin] =(acc[a.bin] ||0)+1; return acc; }, {});
    const bySev  = { crit: history.filter(a=>a.sev==='crit').length, warn: history.filter(a=>a.sev==='warn').length };
    const resolved   = history.filter(a => a.resolved).length;
    const unresolved = history.filter(a => !a.resolved).length;
    res.json({ generatedAt: new Date().toISOString(), history, byType, byBin, bySev, resolved, unresolved });
  });

  /** Fill history for a specific bin (time-series for charts) */
  router.get('/reports/bins/:id/history', (req, res) => {
    const limit = Math.min(Number(req.query.limit) || 60, 120);
    res.json(store.getFillHistory(req.params.id, limit));
  });

  // ── Maintenance logs ──────────────────────────────────────────────────────

  router.get('/maintenance', (req, res) => {
    const { binId, limit } = req.query;
    res.json(store.getMaintenanceLogs({ binId, limit: limit ? Math.min(Number(limit), 200) : 100 }));
  });

  router.post('/maintenance', (req, res) => {
    const { binId, technician, workDone, partsReplaced, nextScheduled, visitDate, type } = req.body;
    if (!binId || !workDone) return res.status(400).json({ error: 'binId and workDone are required' });
    const bin = store.getBin(binId);
    if (!bin) return res.status(404).json({ error: 'Bin not found' });
    const log = store.addMaintenanceLog({ binId, binName: bin.name, area: bin.area, technician: technician || 'Unassigned', workDone, partsReplaced: partsReplaced || 'None', nextScheduled: nextScheduled || null, visitDate: visitDate || new Date().toISOString().slice(0,10), type: type || 'routine' });
    store.addBinEvent(binId, { type:'MAINTENANCE', technician: log.technician, workDone: log.workDone, ts: log.createdAt });
    broadcast({ type:'toast', data:{ msg:`Maintenance logged for ${bin.name}`, sev:'success' } });
    res.json({ ok: true, log });
  });

  // ── Operator comments ─────────────────────────────────────────────────────
  router.get('/bins/:id/comments', (req, res) => {
    res.json(store.getComments(req.params.id));
  });

  router.post('/bins/:id/comments', (req, res) => {
    const bin = store.getBin(req.params.id);
    if (!bin) return res.status(404).json({ error: 'Bin not found' });
    const { author, text } = req.body;
    if (!text) return res.status(400).json({ error: 'text is required' });
    const comment = store.addComment({ binId: req.params.id, binName: bin.name, author: author || 'Operator', text });
    res.json({ ok: true, comment });
  });

  // ── Public fault reports ──────────────────────────────────────────────────
  router.get('/public/reports', (req, res) => {
    const { binId, status, limit } = req.query;
    res.json(store.getPublicReports({ binId, status, limit: limit ? Number(limit) : 50 }));
  });

  router.post('/public/report', (req, res) => {
    const { binId, type, description, contactName, contactEmail, location } = req.body;
    if (!type || !description) return res.status(400).json({ error: 'type and description are required' });
    const bin = binId ? store.getBin(binId) : null;
    const report = store.addPublicReport({ binId: binId || null, binName: bin?.name || 'Unknown', type, description, contactName: contactName || 'Anonymous', contactEmail: contactEmail || null, location: location || null });
    if (bin) broadcast({ type:'toast', data:{ msg:`Public report received for ${bin.name}: ${type}`, sev:'warning' } });
    res.json({ ok: true, id: report.id, receivedAt: report.receivedAt });
  });

  router.patch('/public/reports/:id', (req, res) => {
    store.updatePublicReport(Number(req.params.id), req.body);
    res.json({ ok: true });
  });

  /** Full CSV export — returns JSON that the client converts to CSV */
  router.get('/reports/export', (req, res) => {
    const bins        = store.getBins();
    const uptimes     = store.getAllUptimes();
    const alertHistory = store.getAlertHistory();
    const alertsByBin = alertHistory.reduce((acc, a) => { acc[a.bin]=(acc[a.bin]||0)+1; return acc; }, {});

    const csvRows = bins.map(b => ({
      ID:                  b.id,
      'Device Card':       b.deviceNo         || '—',
      IMEI:                b.imei             || '—',
      Name:                b.name,
      Area:                b.area,
      Status:              b.status,
      'Fill % (Slot 1)':   +(b.fill||0).toFixed(1),
      'Fill % (Slot 2)':   b.capacitySlots?.[1] ?? '—',
      'Fill % (Slot 3)':   b.capacitySlots?.[2] ?? '—',
      'Battery %':         +(b.battery||0).toFixed(1),
      'Battery Voltage V': b.batteryVoltage   ?? '—',
      'Battery Current A': b.batteryCurrent   ?? '—',
      'Temp °C':           b.temp             || 0,
      'Door Open':         b.doorOpen         ? 'Yes' : 'No',
      'Cycles (Total)':    b.cycles           || 0,
      'Opens D1':          b.openCounts?.[0]  ?? 0,
      'Opens D2':          b.openCounts?.[1]  ?? 0,
      'Opens D3':          b.openCounts?.[2]  ?? 0,
      'Compactions D1':    b.compactionCounts?.[0] ?? 0,
      'Compactions D2':    b.compactionCounts?.[1] ?? 0,
      'Compactions D3':    b.compactionCounts?.[2] ?? 0,
      'Lat':               b.lat              ?? '—',
      'Lng':               b.lng              ?? '—',
      'Uptime %':          uptimes[b.id]      ?? (b.status!=='offline' ? 100 : 0),
      'Alert Count':       alertsByBin[b.id]  || 0,
      'Last Seen':         b.seen             || '—',
    }));

    res.json({ generatedAt: new Date().toISOString(), format: 'csv', rows: csvRows });
  });

  /** Full JSON export — all data for open-standards compliance */
  router.get('/reports/export/json', (req, res) => {
    res.setHeader('Content-Disposition', `attachment; filename="smartbin-export-${new Date().toISOString().slice(0,10)}.json"`);
    res.json({
      exportVersion:    '1.0',
      generatedAt:      new Date().toISOString(),
      dataOwner:        'Contracting Authority — all rights reserved',
      format:           'HandsOn SmartBin Open Data Export v1',
      fleet:            store.getBins(),
      activeAlerts:     store.getAlerts(),
      alertHistory:     store.getAlertHistory({ limit: 500 }),
      maintenanceLogs:  store.getMaintenanceLogs({ limit: 500 }),
      publicReports:    store.getPublicReports({ limit: 200 }),
      stats:            store.getStats(),
      fillHistories:    store.getAllFillHistory(),
    });
  });

  return router;
}
