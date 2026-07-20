import {
  PLACE_CATEGORIES,
  PLACES,
  placesAround,
  type Place,
  type PlaceCategoryKey,
} from "@/lib/mock-data";

/** Google Nearby Search types per Avessa category */
const GOOGLE_TYPE_BY_CATEGORY: Record<
  Exclude<PlaceCategoryKey, "top">,
  string
> = {
  eat: "restaurant",
  cafes: "cafe",
  bars: "bar",
  "go-out": "night_club",
  shops: "shopping_mall",
  leisure: "park",
};

const EMOJI_BY_CATEGORY: Record<Exclude<PlaceCategoryKey, "top">, string> = {
  eat: "🍽️",
  cafes: "☕",
  bars: "🍸",
  "go-out": "🪩",
  shops: "👜",
  leisure: "🌅",
};

const ACCENT_BY_CATEGORY: Record<
  Exclude<PlaceCategoryKey, "top">,
  NonNullable<Place["accent"]>
> = {
  eat: "orange",
  cafes: "green",
  bars: "blue",
  "go-out": "pink",
  shops: "blue",
  leisure: "green",
};

type GoogleNearbyResult = {
  place_id: string;
  name: string;
  vicinity?: string;
  rating?: number;
  user_ratings_total?: number;
  types?: string[];
  geometry?: { location?: { lat: number; lng: number } };
  photos?: { photo_reference: string }[];
  opening_hours?: { open_now?: boolean };
};

function categoryFromGoogleTypes(
  types: string[] | undefined,
  fallback: Exclude<PlaceCategoryKey, "top">,
): Exclude<PlaceCategoryKey, "top"> {
  if (!types?.length) return fallback;
  if (types.includes("night_club")) return "go-out";
  if (types.includes("bar") || types.includes("liquor_store")) return "bars";
  if (types.includes("cafe") || types.includes("bakery")) return "cafes";
  if (
    types.includes("restaurant") ||
    types.includes("meal_takeaway") ||
    types.includes("food")
  ) {
    return "eat";
  }
  if (
    types.includes("shopping_mall") ||
    types.includes("clothing_store") ||
    types.includes("store")
  ) {
    return "shops";
  }
  if (types.includes("park") || types.includes("tourist_attraction")) {
    return "leisure";
  }
  return fallback;
}

function avessaLabel(categoryKey: PlaceCategoryKey): string {
  return PLACE_CATEGORIES.find((c) => c.key === categoryKey)?.label ?? "nearby";
}

function photoUrl(photoRef: string | undefined, apiKey: string): string {
  if (!photoRef) {
    return "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=1000&fit=crop";
  }
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${encodeURIComponent(photoRef)}&key=${apiKey}`;
}

function toPlace(
  result: GoogleNearbyResult,
  fallbackCategory: Exclude<PlaceCategoryKey, "top">,
  apiKey: string,
): Place | null {
  const lat = result.geometry?.location?.lat;
  const lng = result.geometry?.location?.lng;
  if (lat == null || lng == null || !result.place_id) return null;

  const categoryKey = categoryFromGoogleTypes(result.types, fallbackCategory);
  const rating = result.rating;
  const reviews = result.user_ratings_total;
  const tagline =
    rating != null
      ? `${rating.toFixed(1)}★${reviews != null ? ` · ${reviews}` : ""}`
      : "popular nearby";

  const photo = photoUrl(result.photos?.[0]?.photo_reference, apiKey);

  return {
    id: `g_${result.place_id}`,
    name: result.name,
    category: avessaLabel(categoryKey),
    categoryKey,
    tagline,
    description: result.vicinity
      ? `${result.name} — ${result.vicinity}. Pulled from Google Places popularity signals.`
      : `${result.name}. Pulled from Google Places nearby search.`,
    photo,
    photos: [photo],
    neighborhood: result.vicinity?.split(",").slice(-1)[0]?.trim() || "Nearby",
    vibes: ["Popular", "Nearby"],
    goodFor: ["Meetups", "Exploring"],
    hours: result.opening_hours?.open_now ? "Open now" : undefined,
    lat,
    lng,
    emoji: EMOJI_BY_CATEGORY[categoryKey],
    accent: ACCENT_BY_CATEGORY[categoryKey],
  };
}

export function hasGooglePlacesKey(): boolean {
  return Boolean(process.env.GOOGLE_MAPS_API_KEY?.trim());
}

export type LocationSuggestion = {
  id: string;
  label: string;
  secondary?: string;
  source: "google" | "nominatim";
  /** Present for Nominatim hits so we can place without a second lookup. */
  lat?: number;
  lng?: number;
  currentCity?: string;
};

export type ResolvedLocation = {
  lat: number;
  lng: number;
  areaLabel: string;
  currentCity: string;
  placeId?: string;
};

export async function fetchNearbyPlaces(opts: {
  lat: number;
  lng: number;
  category?: PlaceCategoryKey;
  radiusMeters?: number;
}): Promise<{ places: Place[]; source: "google" | "mock" }> {
  const category = opts.category ?? "top";
  const apiKey = process.env.GOOGLE_MAPS_API_KEY?.trim();

  if (!apiKey) {
    const around = placesAround(opts.lat, opts.lng);
    const places =
      category === "top"
        ? around
        : around.filter((p) => p.categoryKey === category);
    return { places, source: "mock" };
  }

  const categories: Exclude<PlaceCategoryKey, "top">[] =
    category === "top"
      ? ["eat", "cafes", "bars", "go-out", "shops", "leisure"]
      : [category];

  const radius = opts.radiusMeters ?? 1500;
  const collected: Place[] = [];
  const seen = new Set<string>();

  for (const cat of categories) {
    const type = GOOGLE_TYPE_BY_CATEGORY[cat];
    const url = new URL(
      "https://maps.googleapis.com/maps/api/place/nearbysearch/json",
    );
    url.searchParams.set("location", `${opts.lat},${opts.lng}`);
    url.searchParams.set("radius", String(radius));
    url.searchParams.set("type", type);
    url.searchParams.set("key", apiKey);

    try {
      const res = await fetch(url.toString(), { next: { revalidate: 300 } });
      if (!res.ok) continue;
      const data = (await res.json()) as {
        status: string;
        results?: GoogleNearbyResult[];
      };
      if (data.status !== "OK" && data.status !== "ZERO_RESULTS") continue;

      const ranked = [...(data.results ?? [])].sort((a, b) => {
        const scoreA = (a.rating ?? 0) * Math.log10((a.user_ratings_total ?? 1) + 1);
        const scoreB = (b.rating ?? 0) * Math.log10((b.user_ratings_total ?? 1) + 1);
        return scoreB - scoreA;
      });

      for (const result of ranked.slice(0, category === "top" ? 2 : 8)) {
        const place = toPlace(result, cat, apiKey);
        if (!place || seen.has(place.id)) continue;
        seen.add(place.id);
        collected.push(place);
      }
    } catch {
      /* try next category */
    }
  }

  if (collected.length === 0) {
    const around = placesAround(opts.lat, opts.lng);
    const places =
      category === "top"
        ? around
        : around.filter((p) => p.categoryKey === category);
    return { places, source: "mock" };
  }

  return { places: collected, source: "google" };
}

export function mockPlacesFallback(
  lat: number,
  lng: number,
  category: PlaceCategoryKey = "top",
): Place[] {
  const around = placesAround(lat, lng, PLACES);
  if (category === "top") return around;
  return around.filter((p) => p.categoryKey === category);
}

type GoogleDetailsResult = {
  place_id: string;
  name: string;
  formatted_address?: string;
  rating?: number;
  user_ratings_total?: number;
  types?: string[];
  geometry?: { location?: { lat: number; lng: number } };
  photos?: { photo_reference: string }[];
  opening_hours?: { weekday_text?: string[]; open_now?: boolean };
  editorial_summary?: { overview?: string };
  website?: string;
};

export async function fetchGooglePlaceDetails(
  rawId: string,
): Promise<Place | null> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY?.trim();
  if (!apiKey) return null;

  const placeId = rawId.startsWith("g_") ? rawId.slice(2) : rawId;
  const url = new URL(
    "https://maps.googleapis.com/maps/api/place/details/json",
  );
  url.searchParams.set("place_id", placeId);
  url.searchParams.set(
    "fields",
    "place_id,name,formatted_address,rating,user_ratings_total,types,geometry,photos,opening_hours,editorial_summary,website",
  );
  url.searchParams.set("key", apiKey);

  try {
    const res = await fetch(url.toString(), { next: { revalidate: 600 } });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      status: string;
      result?: GoogleDetailsResult;
    };
    if (data.status !== "OK" || !data.result) return null;

    const result = data.result;
    const lat = result.geometry?.location?.lat;
    const lng = result.geometry?.location?.lng;
    if (lat == null || lng == null) return null;

    const categoryKey = categoryFromGoogleTypes(result.types, "eat");
    const photo = photoUrl(result.photos?.[0]?.photo_reference, apiKey);

    return {
      id: `g_${result.place_id}`,
      name: result.name,
      category: avessaLabel(categoryKey),
      categoryKey,
      tagline:
        result.rating != null
          ? `${result.rating.toFixed(1)}★ popular`
          : "popular nearby",
      description:
        result.editorial_summary?.overview ||
        result.formatted_address ||
        `${result.name} from Google Places.`,
      photo,
      photos: [photo],
      neighborhood:
        result.formatted_address?.split(",").slice(-3, -2)[0]?.trim() ||
        "Nearby",
      vibes: ["Popular", "Google Places"],
      goodFor: ["Meetups", "Exploring"],
      tip: result.website ? `More info: ${result.website}` : undefined,
      hours: result.opening_hours?.weekday_text?.[0],
      lat,
      lng,
      emoji: EMOJI_BY_CATEGORY[categoryKey],
      accent: ACCENT_BY_CATEGORY[categoryKey],
    };
  } catch {
    return null;
  }
}

function shortAreaLabel(primary: string, address?: string): string {
  const name = primary.trim();
  if (name) return name.length > 48 ? `${name.slice(0, 45)}…` : name;
  if (!address) return "Nearby";
  const first = address.split(",")[0]?.trim();
  return first || "Nearby";
}

function cityFromAddress(address?: string, fallbackName?: string): string {
  if (!address) return fallbackName?.trim() || "Nearby";
  const parts = address
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length >= 2) {
    // Prefer "City, Country" from the end of the address.
    const country = parts[parts.length - 1];
    const city = parts[parts.length - 2];
    if (city && country) return `${city}, ${country}`;
  }
  return parts[0] || fallbackName?.trim() || "Nearby";
}

async function nominatimSearch(
  query: string,
): Promise<LocationSuggestion[]> {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", query);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("limit", "6");

  const res = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
      "User-Agent": "AvessaMVP/1.0 (explore-location)",
    },
    next: { revalidate: 0 },
  });
  if (!res.ok) return [];
  const data = (await res.json()) as Array<{
    place_id: number;
    display_name: string;
    name?: string;
    lat: string;
    lon: string;
    address?: Record<string, string>;
  }>;

  return data.map((item) => {
    const label = item.name || item.display_name.split(",")[0]?.trim() || "Place";
    const secondary = item.display_name
      .split(",")
      .slice(1, 3)
      .map((s) => s.trim())
      .join(", ");
    const cityBits = [
      item.address?.city ||
        item.address?.town ||
        item.address?.village ||
        item.address?.municipality,
      item.address?.country,
    ]
      .filter(Boolean)
      .join(", ");
    return {
      id: `osm_${item.place_id}`,
      label,
      secondary: secondary || undefined,
      source: "nominatim" as const,
      lat: Number(item.lat),
      lng: Number(item.lon),
      currentCity: cityBits || cityFromAddress(item.display_name, label),
    };
  });
}

async function nominatimReverse(
  lat: number,
  lng: number,
): Promise<ResolvedLocation | null> {
  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lon", String(lng));
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("addressdetails", "1");

  const res = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
      "User-Agent": "AvessaMVP/1.0 (explore-location)",
    },
    next: { revalidate: 0 },
  });
  if (!res.ok) return null;
  const data = (await res.json()) as {
    display_name?: string;
    name?: string;
    address?: Record<string, string>;
  };

  const name =
    data.name ||
    data.address?.neighbourhood ||
    data.address?.suburb ||
    data.address?.quarter ||
    data.address?.city_district ||
    data.address?.city ||
    "Nearby";
  const cityBits = [
    data.address?.city ||
      data.address?.town ||
      data.address?.village ||
      data.address?.municipality,
    data.address?.country,
  ]
    .filter(Boolean)
    .join(", ");

  return {
    lat,
    lng,
    areaLabel: shortAreaLabel(name, data.display_name),
    currentCity: cityBits || cityFromAddress(data.display_name, name),
  };
}

export async function fetchPlaceAutocomplete(
  query: string,
  bias?: { lat: number; lng: number },
): Promise<LocationSuggestion[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const apiKey = process.env.GOOGLE_MAPS_API_KEY?.trim();
  if (!apiKey) {
    try {
      return await nominatimSearch(q);
    } catch {
      return [];
    }
  }

  const url = new URL(
    "https://maps.googleapis.com/maps/api/place/autocomplete/json",
  );
  url.searchParams.set("input", q);
  url.searchParams.set("key", apiKey);
  if (bias) {
    url.searchParams.set("location", `${bias.lat},${bias.lng}`);
    url.searchParams.set("radius", "50000");
  }

  try {
    const res = await fetch(url.toString(), { next: { revalidate: 0 } });
    if (!res.ok) return nominatimSearch(q);
    const data = (await res.json()) as {
      status: string;
      predictions?: Array<{
        place_id: string;
        description: string;
        structured_formatting?: {
          main_text?: string;
          secondary_text?: string;
        };
      }>;
    };
    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      return nominatimSearch(q);
    }
    return (data.predictions ?? []).slice(0, 6).map((p) => ({
      id: p.place_id,
      label:
        p.structured_formatting?.main_text ||
        p.description.split(",")[0]?.trim() ||
        p.description,
      secondary:
        p.structured_formatting?.secondary_text ||
        p.description.split(",").slice(1).join(",").trim() ||
        undefined,
      source: "google" as const,
    }));
  } catch {
    return nominatimSearch(q);
  }
}

export async function fetchPlaceLocation(
  placeId: string,
): Promise<ResolvedLocation | null> {
  if (placeId.startsWith("osm_")) {
    // Nominatim suggestions already include lat/lng; client should use those.
    return null;
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY?.trim();
  if (!apiKey) return null;

  const url = new URL(
    "https://maps.googleapis.com/maps/api/place/details/json",
  );
  url.searchParams.set("place_id", placeId);
  url.searchParams.set(
    "fields",
    "place_id,name,formatted_address,geometry,address_component",
  );
  url.searchParams.set("key", apiKey);

  try {
    const res = await fetch(url.toString(), { next: { revalidate: 300 } });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      status: string;
      result?: {
        place_id: string;
        name?: string;
        formatted_address?: string;
        geometry?: { location?: { lat: number; lng: number } };
        address_components?: Array<{
          long_name: string;
          short_name: string;
          types: string[];
        }>;
      };
    };
    if (data.status !== "OK" || !data.result) return null;
    const lat = data.result.geometry?.location?.lat;
    const lng = data.result.geometry?.location?.lng;
    if (lat == null || lng == null) return null;

    const comps = data.result.address_components ?? [];
    const locality =
      comps.find((c) => c.types.includes("locality"))?.long_name ||
      comps.find((c) => c.types.includes("postal_town"))?.long_name ||
      comps.find((c) => c.types.includes("administrative_area_level_2"))
        ?.long_name;
    const country = comps.find((c) => c.types.includes("country"))?.long_name;
    const currentCity =
      locality && country
        ? `${locality}, ${country}`
        : cityFromAddress(data.result.formatted_address, data.result.name);

    return {
      lat,
      lng,
      areaLabel: shortAreaLabel(
        data.result.name || "Nearby",
        data.result.formatted_address,
      ),
      currentCity,
      placeId: data.result.place_id,
    };
  } catch {
    return null;
  }
}

export async function reverseGeocode(
  lat: number,
  lng: number,
): Promise<ResolvedLocation | null> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY?.trim();
  if (!apiKey) {
    try {
      return await nominatimReverse(lat, lng);
    } catch {
      return {
        lat,
        lng,
        areaLabel: "Nearby",
        currentCity: "Nearby",
      };
    }
  }

  const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
  url.searchParams.set("latlng", `${lat},${lng}`);
  url.searchParams.set("key", apiKey);

  try {
    const res = await fetch(url.toString(), { next: { revalidate: 0 } });
    if (!res.ok) return nominatimReverse(lat, lng);
    const data = (await res.json()) as {
      status: string;
      results?: Array<{
        formatted_address?: string;
        address_components?: Array<{
          long_name: string;
          types: string[];
        }>;
      }>;
    };
    if (data.status !== "OK" || !data.results?.[0]) {
      return nominatimReverse(lat, lng);
    }

    const result = data.results[0];
    const comps = result.address_components ?? [];
    const neighborhood =
      comps.find((c) => c.types.includes("neighborhood"))?.long_name ||
      comps.find((c) => c.types.includes("sublocality"))?.long_name ||
      comps.find((c) => c.types.includes("sublocality_level_1"))?.long_name ||
      comps.find((c) => c.types.includes("route"))?.long_name ||
      comps.find((c) => c.types.includes("locality"))?.long_name ||
      "Nearby";
    const locality =
      comps.find((c) => c.types.includes("locality"))?.long_name ||
      comps.find((c) => c.types.includes("postal_town"))?.long_name;
    const country = comps.find((c) => c.types.includes("country"))?.long_name;

    return {
      lat,
      lng,
      areaLabel: shortAreaLabel(neighborhood, result.formatted_address),
      currentCity:
        locality && country
          ? `${locality}, ${country}`
          : cityFromAddress(result.formatted_address, neighborhood),
    };
  } catch {
    return nominatimReverse(lat, lng);
  }
}
