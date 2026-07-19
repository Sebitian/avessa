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
  "Other",
] as const;

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
