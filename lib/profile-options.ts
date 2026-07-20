export const NATIONALITIES = [
  "United States",
  "United Kingdom",
  "France",
  "Spain",
  "Germany",
  "Italy",
  "Canada",
  "Australia",
  "Brazil",
  "Japan",
  "Mexico",
  "Netherlands",
  "Portugal",
  "India",
  "South Korea",
  "Other",
] as const;

export const CITIES = [
  "Barcelona, Spain",
  "Paris, France",
  "London, United Kingdom",
  "Berlin, Germany",
  "Rome, Italy",
  "Amsterdam, Netherlands",
  "Lisbon, Portugal",
  "New York, United States",
  "Tokyo, Japan",
  "Mexico City, Mexico",
  "San Juan, Puerto Rico",
  "Chicago, United States",
  "Other",
] as const;

/** Stable city centers for Discover / Explore (Hinge-style location). */
export const CITY_CENTERS: Record<
  string,
  { lat: number; lng: number; area: string }
> = {
  "Barcelona, Spain": {
    lat: 41.3851,
    lng: 2.1734,
    area: "Near Gothic Quarter",
  },
  "Paris, France": { lat: 48.8566, lng: 2.3522, area: "Near Le Marais" },
  "London, United Kingdom": {
    lat: 51.5074,
    lng: -0.1278,
    area: "Near Soho",
  },
  "Berlin, Germany": {
    lat: 52.52,
    lng: 13.405,
    area: "Near Mitte",
  },
  "Rome, Italy": { lat: 41.9028, lng: 12.4964, area: "Near Trastevere" },
  "Amsterdam, Netherlands": {
    lat: 52.3676,
    lng: 4.9041,
    area: "Near Jordaan",
  },
  "Lisbon, Portugal": {
    lat: 38.7223,
    lng: -9.1393,
    area: "Near Alfama",
  },
  "New York, United States": {
    lat: 40.7128,
    lng: -74.006,
    area: "Near Lower Manhattan",
  },
  "Tokyo, Japan": { lat: 35.6762, lng: 139.6503, area: "Near Shibuya" },
  "Mexico City, Mexico": {
    lat: 19.4326,
    lng: -99.1332,
    area: "Near Roma Norte",
  },
  "San Juan, Puerto Rico": {
    lat: 18.4655,
    lng: -66.1057,
    area: "Near Old San Juan",
  },
  "Chicago, United States": {
    lat: 41.8781,
    lng: -87.6298,
    area: "Near River North",
  },
};

/** Slight per-user jitter so people in the same city aren’t stacked. */
export function coordsForCity(
  city: string,
  seed = "",
): { lat: number; lng: number; area: string; city: string } | null {
  const center = CITY_CENTERS[city];
  if (!center) return null;

  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (Math.imul(hash, 31) + seed.charCodeAt(i)) >>> 0;
  }
  const latJitter = (((hash % 200) - 100) / 10000) * 1.2; // ~±0.012°
  const lngJitter = ((((hash >> 8) % 200) - 100) / 10000) * 1.2;

  return {
    city,
    lat: center.lat + latJitter,
    lng: center.lng + lngJitter,
    area: center.area,
  };
}

export const LANGUAGE_OPTIONS = [
  "English",
  "Spanish",
  "French",
  "German",
  "Italian",
  "Portuguese",
  "Dutch",
  "Japanese",
  "Mandarin",
  "Arabic",
  "Korean",
  "Hindi",
] as const;

export const TRAVELER_STATUSES = [
  { value: "traveling", label: "Traveling" },
  { value: "local", label: "Living here" },
  { value: "both", label: "Both" },
] as const;

export const LOOKING_FOR_OPTIONS = [
  { value: "travelers", label: "Nearby travelers" },
  { value: "locals", label: "Locals" },
  { value: "places", label: "Places & experiences" },
] as const;

export const GENDER_OPTIONS = [
  "Woman",
  "Man",
  "Non-binary",
  "Prefer not to say",
] as const;

export type TravelerStatus = (typeof TRAVELER_STATUSES)[number]["value"];
export type LookingFor = (typeof LOOKING_FOR_OPTIONS)[number]["value"];
