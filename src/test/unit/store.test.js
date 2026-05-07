import { describe, it, expect, beforeEach } from 'vitest';
import { createStore, INITIAL_BINS } from '../../../server/store.js';

let store;
beforeEach(() => { store = createStore(); });

describe('createStore — bins', () => {
  it('returns all initial bins', () => {
    expect(store.getBins()).toHaveLength(INITIAL_BINS.length);
  });

  it('getBin returns matching bin', () => {
    const bin = store.getBin('HS-001');
    expect(bin).toBeTruthy();
    expect(bin.id).toBe('HS-001');
  });

  it('getBin returns null for unknown id', () => {
    expect(store.getBin('GHOST')).toBeNull();
  });

  it('updateBin applies patch and returns updated bin', () => {
    const updated = store.updateBin('HS-001', { fill: 99 });
    expect(updated.fill).toBe(99);
    expect(store.getBin('HS-001').fill).toBe(99);
  });

  it('getBins returns copies (immutable guard)', () => {
    const bins = store.getBins();
    bins[0].fill = 999;
    expect(store.getBin('HS-001').fill).not.toBe(999);
  });

  it('reset restores initial state', () => {
    store.updateBin('HS-001', { fill: 99 });
    store.reset();
    expect(store.getBin('HS-001').fill).toBe(INITIAL_BINS[0].fill);
  });
});

describe('createStore — alerts', () => {
  it('starts with no alerts', () => {
    expect(store.getAlerts()).toHaveLength(0);
  });

  it('addAlert inserts and retrieves alert', () => {
    store.addAlert({ id: 1, bin: 'HS-002', type: 'OVERFLOW', sev: 'crit' });
    expect(store.getAlerts()).toHaveLength(1);
  });

  it('alerts are capped at 50', () => {
    for (let i = 0; i < 60; i++) store.addAlert({ id: i, bin: 'HS-001', type: 'X', sev: 'warn' });
    expect(store.getAlerts()).toHaveLength(50);
  });

  it('removeAlert removes by id', () => {
    store.addAlert({ id: 42, bin: 'HS-001', type: 'X', sev: 'warn' });
    store.removeAlert(42);
    expect(store.getAlerts()).toHaveLength(0);
  });

  it('clearBinAlerts removes all alerts for a bin', () => {
    store.addAlert({ id: 1, bin: 'HS-001', type: 'X', sev: 'warn' });
    store.addAlert({ id: 2, bin: 'HS-002', type: 'Y', sev: 'crit' });
    store.clearBinAlerts('HS-001');
    const remaining = store.getAlerts();
    expect(remaining).toHaveLength(1);
    expect(remaining[0].bin).toBe('HS-002');
  });
});

describe('createStore — frames', () => {
  it('starts empty', () => {
    expect(store.getFrames()).toHaveLength(0);
  });

  it('addFrame increments id and stores frame', () => {
    const f = store.addFrame({ dir: 'UART→TCP', hex: 'E9 AB', decoded: 'ACK', ts: 'now' });
    expect(f.id).toBe(1);
    expect(store.getFrames()).toHaveLength(1);
  });

  it('getFrames respects limit parameter', () => {
    for (let i = 0; i < 20; i++) store.addFrame({ dir: 'UART→TCP', hex: 'E9', decoded: '', ts: '' });
    expect(store.getFrames(5)).toHaveLength(5);
    expect(store.getFrames(100)).toHaveLength(20);
  });

  it('frames capped at 1000', () => {
    for (let i = 0; i < 1010; i++) store.addFrame({ dir: 'UART→TCP', hex: 'E9', decoded: '', ts: '' });
    expect(store.getFrames(2000)).toHaveLength(1000);
  });
});

describe('createStore — stats', () => {
  it('returns correct online count', () => {
    const { online } = store.getStats();
    const expected   = INITIAL_BINS.filter(b => b.status !== 'offline').length;
    expect(online).toBe(expected);
  });

  it('returns correct total', () => {
    expect(store.getStats().total).toBe(INITIAL_BINS.length);
  });

  it('criticalAlerts is 0 with no alerts', () => {
    expect(store.getStats().criticalAlerts).toBe(0);
  });

  it('criticalAlerts counts only crit severity', () => {
    store.addAlert({ id: 1, bin: 'HS-001', type: 'X', sev: 'crit' });
    store.addAlert({ id: 2, bin: 'HS-002', type: 'Y', sev: 'warn' });
    expect(store.getStats().criticalAlerts).toBe(1);
  });
});
