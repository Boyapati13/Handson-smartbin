import { describe, it, expect } from 'vitest';
import { fillColor, statusMap } from '../../data/bins';

describe('fillColor()', () => {
  it('returns HandsOn blue for normal fill (0–69%)', () => {
    expect(fillColor(0)).toBe('#29ABE2');
    expect(fillColor(50)).toBe('#29ABE2');
    expect(fillColor(69)).toBe('#29ABE2');
  });

  it('returns amber at caution threshold (70–89%)', () => {
    expect(fillColor(70)).toBe('#f59e0b');
    expect(fillColor(80)).toBe('#f59e0b');
    expect(fillColor(89)).toBe('#f59e0b');
  });

  it('returns red at overflow threshold (90%+)', () => {
    expect(fillColor(90)).toBe('#ef4444');
    expect(fillColor(96)).toBe('#ef4444');
    expect(fillColor(100)).toBe('#ef4444');
  });

  it('treats exact boundary 70 as amber not blue', () => {
    expect(fillColor(70)).toBe('#f59e0b');
    expect(fillColor(69.9)).toBe('#29ABE2');
  });

  it('treats exact boundary 90 as red not amber', () => {
    expect(fillColor(90)).toBe('#ef4444');
    expect(fillColor(89.9)).toBe('#f59e0b');
  });
});

describe('statusMap', () => {
  it('has all 5 required statuses', () => {
    expect(Object.keys(statusMap)).toEqual(expect.arrayContaining(['online','full','warning','fault','offline']));
  });

  it('each entry has a color and label', () => {
    for (const [, v] of Object.entries(statusMap)) {
      expect(v).toHaveProperty('color');
      expect(v).toHaveProperty('label');
      expect(typeof v.color).toBe('string');
      expect(typeof v.label).toBe('string');
    }
  });

  it('online is green (semantically correct)', () => {
    expect(statusMap.online.color).toBe('#10b981');
  });

  it('fault is red (semantically correct)', () => {
    expect(statusMap.fault.color).toBe('#ef4444');
  });
});
