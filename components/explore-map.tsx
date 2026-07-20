"use client";

import dynamic from "next/dynamic";

import type { DiscoverCategoryKey } from "@/lib/mock-data";
import type { DiscoverTraveler } from "@/lib/presence";

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
  discoverRadiusM?: number | null;
  userLat?: number | null;
  userLng?: number | null;
  travelers: DiscoverTraveler[];
  focusEventId?: string | null;
  initialCategory?: DiscoverCategoryKey;
};

export function ExploreMap({
  areaLabel,
  city,
  discoverRadiusM,
  userLat,
  userLng,
  travelers,
  focusEventId = null,
  initialCategory = "top",
}: ExploreMapProps) {
  const location = areaLabel || city || "Near you";

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-white">
      <DiscoverMap
        userLat={userLat}
        userLng={userLng}
        areaLabel={location}
        city={city}
        discoverRadiusM={discoverRadiusM}
        travelers={travelers}
        title="Explore"
        focusEventId={focusEventId}
        initialCategory={initialCategory}
      />
    </div>
  );
}
