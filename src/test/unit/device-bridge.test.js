import { describe, it, expect } from 'vitest';
import { decodeFrame, parseFrames } from '../../../server/device-bridge.js';

describe('decodeFrame()', () => {
  it('decodes capacity frame (E9 08)', () => {
    const buf = Buffer.from([0xE9, 0x08, 0x03, 0x3E, 0x58, 0x1C, 0x0D, 0x0A]);
    const out = decodeFrame(buf);
    expect(out).toContain('slot1=62%');
    expect(out).toContain('slot2=88%');
    expect(out).toContain('slot3=28%');
  });

  it('decodes ACK frame (E9 AB)', () => {
    const buf = Buffer.from([0xE9, 0xAB, 0x00, 0x0D, 0x0A]);
    expect(decodeFrame(buf)).toContain('ACK');
  });

  it('decodes compact CMD (E9 B1)', () => {
    const buf = Buffer.from([0xE9, 0xB1, 0x01, 0x0D, 0x0A]);
    expect(decodeFrame(buf)).toContain('compaction');
  });

  it('decodes close door CMD (E9 C2)', () => {
    const buf = Buffer.from([0xE9, 0xC2, 0x01, 0x0D, 0x0A]);
    expect(decodeFrame(buf)).toContain('close door');
  });

  it('decodes fault frame (E9 0F)', () => {
    const buf = Buffer.from([0xE9, 0x0F, 0x01, 0x00, 0x0D, 0x0A]);
    expect(decodeFrame(buf)).toContain('Fault');
  });

  it('handles unknown frame gracefully', () => {
    const buf = Buffer.from([0xE9, 0xFF, 0x00, 0x0D, 0x0A]);
    const out = decodeFrame(buf);
    expect(out).toContain('0xFF');
  });

  it('handles non-E9 frame', () => {
    const buf = Buffer.from([0x00, 0x01, 0x02]);
    expect(decodeFrame(buf)).toContain('Unknown frame');
  });

  it('handles null/undefined gracefully', () => {
    expect(() => decodeFrame(null)).not.toThrow();
    expect(decodeFrame(null)).toContain('Unknown frame');
  });
});

describe('parseFrames()', () => {
  it('parses a single complete frame', () => {
    const buf = Buffer.from([0xE9, 0xAB, 0x00, 0x0D, 0x0A]);
    const frames = parseFrames(buf);
    expect(frames).toHaveLength(1);
    expect(frames[0][0]).toBe(0xE9);
  });

  it('parses two frames in one buffer', () => {
    const frame1 = Buffer.from([0xE9, 0xAB, 0x00, 0x0D, 0x0A]);
    const frame2 = Buffer.from([0xE9, 0xB1, 0x01, 0x0D, 0x0A]);
    const frames = parseFrames(Buffer.concat([frame1, frame2]));
    expect(frames).toHaveLength(2);
  });

  it('returns empty array for garbage data', () => {
    expect(parseFrames(Buffer.from([0x00, 0x01, 0x02]))).toHaveLength(0);
  });

  it('ignores partial frame at end of buffer', () => {
    const complete  = Buffer.from([0xE9, 0xAB, 0x00, 0x0D, 0x0A]);
    const partial   = Buffer.from([0xE9, 0x09, 0x06]);
    const frames    = parseFrames(Buffer.concat([complete, partial]));
    expect(frames).toHaveLength(1);
  });
});
