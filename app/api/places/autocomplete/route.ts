import { NextResponse } from "next/server";

import { fetchPlaceAutocomplete } from "@/lib/google-places";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").trim();
  const lat = Number(searchParams.get("lat"));
  const lng = Number(searchParams.get("lng"));

  if (q.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  const bias =
    Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : undefined;

  try {
    const suggestions = await fetchPlaceAutocomplete(q, bias);
    return NextResponse.json({ suggestions });
  } catch (err) {
    console.error("autocomplete:", err);
    return NextResponse.json({ suggestions: [] });
  }
}
