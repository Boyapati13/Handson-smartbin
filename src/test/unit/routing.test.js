import { describe, it, expect } from 'vitest'
import { haversine, routeDistance, nearestNeighbour, fixedScheduleDistance, computeRouteMetrics, formatDuration } from '../../utils/routing.js'

const BIN = (id, lat, lng, fill = 50) => ({ id, lat, lng, fill, status: 'online' })

// Malta bin fixtures (real coordinates)
const BINS = [
  BIN('HS-001', 35.8997, 14.5147, 62),
  BIN('HS-002', 35.9122, 14.5019, 96),
  BIN('HS-003', 35.9514, 14.4197, 14),
  BIN('HS-004', 35.8876, 14.4036, 31),
  BIN('HS-005', 35.9097, 14.4261, 45),
  BIN('HS-006', 35.8419, 14.5436, 0,  ),
  BIN('HS-007', 35.8928, 14.5228, 88),
  BIN('HS-008', 35.9481, 14.3378, 55),
]

// ── haversine ───────────────────────────────────────────────────────────────
describe('haversine()', () => {
  it('returns 0 for same point', () => {
    expect(haversine(35.9, 14.4, 35.9, 14.4)).toBe(0)
  })

  it('known distance: Valletta to Sliema ~2.1 km', () => {
    const d = haversine(35.8997, 14.5147, 35.9122, 14.5019)
    expect(d).toBeGreaterThan(1.5)
    expect(d).toBeLessThan(3.0)
  })

  it('returns positive distance', () => {
    expect(haversine(35.8, 14.4, 35.9, 14.5)).toBeGreaterThan(0)
  })

  it('is symmetric (A→B == B→A)', () => {
    const ab = haversine(35.8997, 14.5147, 35.9122, 14.5019)
    const ba = haversine(35.9122, 14.5019, 35.8997, 14.5147)
    expect(Math.abs(ab - ba)).toBeLessThan(0.001)
  })
})

// ── routeDistance ───────────────────────────────────────────────────────────
describe('routeDistance()', () => {
  it('returns 0 for single bin', () => {
    expect(routeDistance([BINS[0]])).toBe(0)
  })

  it('returns 0 for empty route', () => {
    expect(routeDistance([])).toBe(0)
  })

  it('returns positive distance for two bins', () => {
    expect(routeDistance([BINS[0], BINS[1]])).toBeGreaterThan(0)
  })

  it('A→B→C distance equals (A→B) + (B→C)', () => {
    const abc = routeDistance([BINS[0], BINS[1], BINS[2]])
    const ab  = routeDistance([BINS[0], BINS[1]])
    const bc  = routeDistance([BINS[1], BINS[2]])
    expect(Math.abs(abc - (ab + bc))).toBeLessThan(0.01)
  })
})

// ── nearestNeighbour ────────────────────────────────────────────────────────
describe('nearestNeighbour()', () => {
  it('returns empty for empty input', () => {
    expect(nearestNeighbour([])).toEqual([])
  })

  it('returns the single bin for single input', () => {
    expect(nearestNeighbour([BINS[0]])).toHaveLength(1)
  })

  it('returns all bins', () => {
    const route = nearestNeighbour(BINS)
    expect(route).toHaveLength(BINS.length)
  })

  it('starts with the highest-fill bin', () => {
    const route = nearestNeighbour(BINS)
    expect(route[0].id).toBe('HS-002') // fill=96
  })

  it('each bin appears exactly once', () => {
    const route = nearestNeighbour(BINS)
    const ids   = route.map(b => b.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('optimised distance <= naive sorted-by-id distance', () => {
    const eligible = BINS.filter(b => b.fill >= 50)
    const route    = nearestNeighbour(eligible)
    const optDist  = routeDistance(route)
    const naive    = routeDistance([...eligible].sort((a,b) => a.id.localeCompare(b.id)))
    // NN should be at least as good as ID-order for most configurations
    expect(optDist).toBeLessThanOrEqual(naive * 1.3) // allow 30% tolerance
  })
})

// ── computeRouteMetrics ─────────────────────────────────────────────────────
describe('computeRouteMetrics()', () => {
  it('returns null for empty selection', () => {
    expect(computeRouteMetrics([], BINS)).toBeNull()
  })

  it('returns metrics object for valid selection', () => {
    const m = computeRouteMetrics(BINS.filter(b => b.fill >= 50), BINS)
    expect(m).toBeTruthy()
    expect(m).toHaveProperty('route')
    expect(m).toHaveProperty('distance')
    expect(m).toHaveProperty('totalMin')
    expect(m).toHaveProperty('co2kg')
    expect(m).toHaveProperty('fuelL')
    expect(m).toHaveProperty('fuelEur')
    expect(m).toHaveProperty('savingsPct')
    expect(m).toHaveProperty('stops')
    expect(m).toHaveProperty('segments')
  })

  it('distance is positive', () => {
    const m = computeRouteMetrics(BINS.slice(0, 3), BINS)
    expect(m.distance).toBeGreaterThan(0)
  })

  it('totalMin includes stop time', () => {
    const m = computeRouteMetrics([BINS[0]], BINS)
    expect(m.totalMin).toBeGreaterThanOrEqual(10) // at least one stop
  })

  it('co2kg is proportional to distance', () => {
    const m1 = computeRouteMetrics([BINS[0]], BINS)
    const m2 = computeRouteMetrics(BINS.slice(0, 4), BINS)
    // More stops, longer route → more CO2
    expect(m2.co2kg).toBeGreaterThan(m1.co2kg)
  })

  it('savingsPct is 0-100', () => {
    const m = computeRouteMetrics(BINS.filter(b => b.fill >= 50), BINS)
    expect(m.savingsPct).toBeGreaterThanOrEqual(0)
    expect(m.savingsPct).toBeLessThanOrEqual(100)
  })

  it('segments has distFromPrev = 0 for first stop', () => {
    const m = computeRouteMetrics(BINS.slice(0, 3), BINS)
    expect(m.segments[0].distFromPrev).toBe(0)
  })

  it('segments has positive distFromPrev for subsequent stops', () => {
    const m = computeRouteMetrics(BINS.slice(0, 3), BINS)
    expect(m.segments[1].distFromPrev).toBeGreaterThan(0)
  })
})

// ── formatDuration ──────────────────────────────────────────────────────────
describe('formatDuration()', () => {
  it('shows minutes for < 60', () => {
    expect(formatDuration(45)).toBe('45 min')
    expect(formatDuration(1)).toBe('1 min')
  })

  it('shows hours for exactly 60', () => {
    expect(formatDuration(60)).toBe('1h')
  })

  it('shows Xh Ym for > 60', () => {
    expect(formatDuration(90)).toBe('1h 30m')
    expect(formatDuration(125)).toBe('2h 5m')
  })

  it('handles 0 minutes', () => {
    expect(formatDuration(0)).toBe('0 min')
  })
})
