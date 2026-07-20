import { NextResponse } from "next/server";

import {
  fetchPlaceLocation,
  reverseGeocode,
} from "@/lib/google-places";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const placeId = (searchParams.get("placeId") || "").trim();
  const lat = Number(searchParams.get("lat"));
  const lng = Number(searchParams.get("lng"));

  try {
    if (placeId) {
      const location = await fetchPlaceLocation(placeId);
      if (!location) {
        return NextResponse.json(
          { error: "Could not resolve place" },
          { status: 404 },
        );
      }
      return NextResponse.json({ location });
    }

    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      const location = await reverseGeocode(lat, lng);
      if (!location) {
        return NextResponse.json(
          { error: "Could not reverse geocode" },
          { status: 404 },
        );
      }
      return NextResponse.json({ location });
    }

    return NextResponse.json(
      { error: "placeId or lat/lng required" },
      { status: 400 },
    );
  } catch (err) {
    console.error("geocode:", err);
    return NextResponse.json({ error: "Geocode failed" }, { status: 500 });
  }
}
