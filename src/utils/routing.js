/**
 * Route optimisation utilities for the SmartBin fleet.
 *
 * Uses a nearest-neighbour TSP heuristic starting from the highest-fill bin.
 * All geo calculations use the Haversine formula.
 *
 * Bins without valid GPS coordinates are silently excluded — routing only
 * operates on bins with known positions.
 */

/** Returns true only if a bin has valid, finite GPS coordinates. */
export function hasValidCoords(bin) {
  return bin != null &&
    bin.lat != null && bin.lng != null &&
    Number.isFinite(Number(bin.lat)) && Number.isFinite(Number(bin.lng));
}

const TRUCK_SPEED_KMH   = 25;   // average urban Malta collection speed
const STOP_TIME_MIN     = 10;   // minutes per bin stop (empty + move off)
const TRUCK_CO2_G_PER_KM = 180; // grams CO2 per km (diesel collection truck)
const TRUCK_FUEL_L_PER_KM = 0.28;
const FUEL_PRICE_EUR    = 1.65; // € per litre, Malta 2025

/** Haversine distance in kilometres between two lat/lng points. */
export function haversine(lat1, lng1, lat2, lng2) {
  const R   = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(lat1 * Math.PI / 180)
    * Math.cos(lat2 * Math.PI / 180)
    * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Total route distance for an ordered array of bins. */
export function routeDistance(route) {
  let d = 0;
  for (let i = 0; i < route.length - 1; i++) {
    d += haversine(route[i].lat, route[i].lng, route[i + 1].lat, route[i + 1].lng);
  }
  return +d.toFixed(3);
}

/**
 * Nearest-neighbour TSP heuristic.
 * Starts at the highest-fill bin, then always picks the closest unvisited bin.
 * Returns the ordered route array.
 */
export function nearestNeighbour(bins) {
  if (!bins.length) return [];
  if (bins.length === 1) return [...bins];

  const sorted    = [...bins].sort((a, b) => b.fill - a.fill);
  const unvisited = sorted.slice(1);
  const route     = [sorted[0]];

  while (unvisited.length > 0) {
    const last    = route[route.length - 1];
    let bestIdx   = 0;
    let bestDist  = Infinity;
    for (let i = 0; i < unvisited.length; i++) {
      const d = haversine(last.lat, last.lng, unvisited[i].lat, unvisited[i].lng);
      if (d < bestDist) { bestDist = d; bestIdx = i; }
    }
    route.push(unvisited.splice(bestIdx, 1)[0]);
  }

  return route;
}

/**
 * Fixed schedule baseline: collect ALL bins in ID order regardless of fill.
 * Used as the comparison point to compute savings.
 */
export function fixedScheduleDistance(allBins) {
  const ordered = [...allBins].sort((a, b) => a.id.localeCompare(b.id));
  return routeDistance(ordered);
}

/**
 * Compute full route metrics for a set of bins to collect.
 * Returns null if no bins selected or none have valid GPS coordinates.
 */
export function computeRouteMetrics(selectedBins, allBins) {
  const geoSelected = selectedBins.filter(hasValidCoords);
  if (!geoSelected.length) return null;

  const route        = nearestNeighbour(geoSelected);
  const optDist      = routeDistance(route);
  const fixedDist    = fixedScheduleDistance(allBins.filter(hasValidCoords));
  const savingsPct   = fixedDist > 0
    ? Math.max(0, Math.round((1 - optDist / fixedDist) * 100))
    : 0;

  const driveMin  = optDist / TRUCK_SPEED_KMH * 60;
  const totalMin  = Math.round(driveMin + route.length * STOP_TIME_MIN);
  const co2kg     = +(optDist * TRUCK_CO2_G_PER_KM / 1000).toFixed(2);
  const fuelL     = +(optDist * TRUCK_FUEL_L_PER_KM).toFixed(2);
  const fuelEur   = +(fuelL * FUEL_PRICE_EUR).toFixed(2);

  // Inter-stop segment distances for the route card display
  const segments = route.map((bin, i) => ({
    bin,
    distFromPrev: i === 0
      ? 0
      : +haversine(route[i-1].lat, route[i-1].lng, bin.lat, bin.lng).toFixed(2),
  }));

  return {
    route,
    segments,
    distance:   optDist,
    fixedDist,
    savingsPct,
    totalMin,
    co2kg,
    fuelL,
    fuelEur,
    stops: route.length,
  };
}

/** Format minutes as "Xh Ym" or "Y min". */
export function formatDuration(min) {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}
