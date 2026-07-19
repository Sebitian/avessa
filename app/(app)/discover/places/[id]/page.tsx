import { notFound } from "next/navigation";

import { PlaceProfile } from "@/components/place-profile";
import { fetchGooglePlaceDetails } from "@/lib/google-places";
import { getPlaceById } from "@/lib/mock-data";

export default async function PlaceDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const { id } = await params;
  const { from } = await searchParams;

  const place =
    getPlaceById(id) ??
    (id.startsWith("g_") ? await fetchGooglePlaceDetails(id) : null);

  if (!place) {
    notFound();
  }

  const backHref = from === "explore" ? "/explore" : "/discover";

  return <PlaceProfile place={place} backHref={backHref} />;
}
