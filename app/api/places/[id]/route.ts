import { NextResponse } from "next/server";

import { fetchGooglePlaceDetails } from "@/lib/google-places";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const place = await fetchGooglePlaceDetails(id);

  if (!place) {
    return NextResponse.json({ error: "Place not found" }, { status: 404 });
  }

  return NextResponse.json({ place });
}
