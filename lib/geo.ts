/** Earth-radius haversine distance in meters. */
export function distanceMeters(
  aLat: number,
  aLng: number,
  bLat: number,
  bLng: number,
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const lat1 = toRad(aLat);
  const lat2 = toRad(bLat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371000 * Math.asin(Math.min(1, Math.sqrt(h)));
}

export const MIN_DISCOVER_RADIUS_M = 500;
export const MAX_DISCOVER_RADIUS_M = 10000;
export const DEFAULT_DISCOVER_RADIUS_M = 1500;

export function clampDiscoverRadiusM(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_DISCOVER_RADIUS_M;
  return Math.min(
    MAX_DISCOVER_RADIUS_M,
    Math.max(MIN_DISCOVER_RADIUS_M, Math.round(value)),
  );
}

const METERS_PER_MILE = 1609.344;

export function formatRadiusLabel(meters: number): string {
  const miles = meters / METERS_PER_MILE;
  if (miles < 0.1) return "0.1 mi";
  if (miles >= 10) return `${Math.round(miles)} mi`;
  const rounded = Math.round(miles * 10) / 10;
  return `${rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1)} mi`;
}

/** Rough zoom that fits a circle of the given radius. */
export function zoomForRadiusMeters(meters: number): number {
  if (meters <= 600) return 16;
  if (meters <= 1200) return 15;
  if (meters <= 2500) return 14;
  if (meters <= 5000) return 13;
  if (meters <= 8000) return 12;
  return 11;
}
