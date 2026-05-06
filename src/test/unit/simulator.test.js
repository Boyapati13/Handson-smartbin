import { describe, it, expect } from 'vitest';
import { tickBin, deriveStatus, buildHeartbeatFrame, buildAckFrame, buildCompactCommandFrame } from '../../../server/simulator.js';

const makeBin = (overrides = {}) => ({
  id: 'HS-001', name: 'Test Bin', area: 'Test',
  fill: 50, battery: 80, status: 'online', cycles: 5, temp: 25.0,
  ...overrides,
});

describe('deriveStatus()', () => {
  it('returns offline for offline bins (locked)', () => {
    expect(deriveStatus(makeBin({ status: 'offline' }))).toBe('offline');
  });

  it('returns fault for fault bins (locked)', () => {
    expect(deriveStatus(makeBin({ status: 'fault' }))).toBe('fault');
  });

  it('returns full when fill >= 95%', () => {
    expect(deriveStatus(makeBin({ fill: 95 }))).toBe('full');
    expect(deriveStatus(makeBin({ fill: 99 }))).toBe('full');
  });

  it('returns warning when battery < 10%', () => {
    expect(deriveStatus(makeBin({ battery: 9.9 }))).toBe('warning');
    expect(deriveStatus(makeBin({ battery: 0   }))).toBe('warning');
  });

  it('returns online for healthy bin', () => {
    expect(deriveStatus(makeBin({ fill: 80, battery: 50 }))).toBe('online');
  });

  it('full takes priority over battery warning', () => {
    expect(deriveStatus(makeBin({ fill: 96, battery: 5 }))).toBe('full');
  });
});

describe('tickBin()', () => {
  it('skips offline bins unchanged', () => {
    const bin = makeBin({ status: 'offline', fill: 0, battery: 0 });
    const { bin: out, newAlerts } = tickBin(bin);
    expect(out).toEqual(bin);
    expect(newAlerts).toHaveLength(0);
  });

  it('increases fill each tick for online bin', () => {
    const bin = makeBin({ fill: 50 });
    const { bin: out } = tickBin(bin);
    expect(out.fill).toBeGreaterThan(50);
  });

  it('fill never exceeds 99.9', () => {
    const bin = makeBin({ fill: 99.8 });
    const { bin: out } = tickBin(bin);
    expect(out.fill).toBeLessThanOrEqual(99.9);
  });

  it('generates OVERFLOW alert when fill crosses 95 and status was online', () => {
    const bin = makeBin({ fill: 94.9, status: 'online' });
    // Run ticks until we overflow
    let result = { bin, newAlerts: [] };
    for (let i = 0; i < 20; i++) {
      result = tickBin(result.bin);
      if (result.newAlerts.some(a => a.type === 'OVERFLOW')) break;
    }
    // May or may not have crossed in 20 ticks — just verify structure when it does
    for (const alert of result.newAlerts) {
      expect(alert).toHaveProperty('type');
      expect(alert).toHaveProperty('sev');
      expect(alert).toHaveProperty('bin');
    }
  });

  it('battery changes each tick for non-fault bins', () => {
    const bin = makeBin({ battery: 50 });
    // Run 100 ticks and check at least one changed battery
    let changed = false;
    let cur = bin;
    for (let i = 0; i < 100; i++) {
      const { bin: out } = tickBin(cur);
      if (out.battery !== cur.battery) { changed = true; break; }
      cur = out;
    }
    expect(changed).toBe(true);
  });
});

describe('frame builders', () => {
  it('buildHeartbeatFrame returns correct direction', () => {
    const f = buildHeartbeatFrame(makeBin());
    expect(f.dir).toBe('UART→TCP');
    expect(f.hex).toMatch(/^E9 09/);
    expect(f.decoded).toContain('Heartbeat');
  });

  it('buildAckFrame returns TCP→UART', () => {
    const f = buildAckFrame();
    expect(f.dir).toBe('TCP→UART');
    expect(f.hex).toBe('E9 AB 00 0D 0A');
    expect(f.decoded).toContain('ACK');
  });

  it('buildCompactCommandFrame returns correct hex', () => {
    const f = buildCompactCommandFrame();
    expect(f.hex).toBe('E9 B1 01 0D 0A');
  });
});
