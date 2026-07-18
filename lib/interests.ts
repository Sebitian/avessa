export const INTERESTS = [
  "Food",
  "Coffee",
  "Hiking",
  "Beaches",
  "Nightlife",
  "Museums",
  "Photography",
  "Sports",
  "Culture",
  "Adventure",
  "Music",
  "Wellness",
  "Shopping",
  "Art",
  "Nature",
] as const;

export type Interest = (typeof INTERESTS)[number];
