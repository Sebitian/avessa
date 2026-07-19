import { NextResponse } from "next/server";

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

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json(
      { error: "lat and lng are required" },
      { status: 400 },
    );
  }

  const category = CATEGORIES.has(categoryParam) ? categoryParam : "top";
  const { places, source } = await fetchNearbyPlaces({ lat, lng, category });

  return NextResponse.json({ places, source });
}
