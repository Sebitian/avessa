"use client";

import dynamic from "next/dynamic";

import type { DiscoverTraveler } from "@/lib/profile";

const DiscoverMap = dynamic(
  () =>
    import("@/components/discover-map").then((mod) => mod.DiscoverMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-0 w-full items-center justify-center bg-[#e8eef3]">
        <p className="text-sm font-medium text-zinc-600">Loading map…</p>
      </div>
    ),
  },
);

type ExploreMapProps = {
  areaLabel?: string | null;
  city?: string | null;
  userLat?: number | null;
  userLng?: number | null;
  travelers: DiscoverTraveler[];
  focusEventId?: string | null;
  initialLayer?: "places" | "events";
};

export function ExploreMap({
  areaLabel,
  city,
  userLat,
  userLng,
  travelers,
  focusEventId = null,
  initialLayer = "places",
}: ExploreMapProps) {
  const location = areaLabel || city || "Near you";

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-white">
      <DiscoverMap
        userLat={userLat}
        userLng={userLng}
        areaLabel={location}
        travelers={travelers}
        title="Explore"
        focusEventId={focusEventId}
        initialLayer={initialLayer}
      />
    </div>
  );
}
