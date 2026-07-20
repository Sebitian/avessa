import { NextResponse } from "next/server";

import { clampDiscoverRadiusM } from "@/lib/geo";
import { fetchNearbyPlaces } from "@/lib/google-places";
import type { PlaceCategoryKey } from "@/lib/mock-data";

const CATEGORIES = new Set<PlaceCategoryKey>([
  "top",
  "eat",
  "cafes",
  "bars",
  "go-out",
  "shops",
  "leisure",
]);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = Number(searchParams.get("lat"));
  const lng = Number(searchParams.get("lng"));
  const categoryParam = (searchParams.get("category") ||
    "top") as PlaceCategoryKey;
  const radiusParam = Number(searchParams.get("radius"));

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json(
      { error: "lat and lng are required" },
      { status: 400 },
    );
  }

  const category = CATEGORIES.has(categoryParam) ? categoryParam : "top";
  const radiusMeters = Number.isFinite(radiusParam)
    ? clampDiscoverRadiusM(radiusParam)
    : undefined;
  const { places, source } = await fetchNearbyPlaces({
    lat,
    lng,
    category,
    radiusMeters,
  });

  return NextResponse.json({ places, source });
}
