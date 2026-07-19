import { Suspense } from "react";
import { redirect } from "next/navigation";

import { ExploreMap } from "@/components/explore-map";
import { OnboardingFallback } from "@/components/onboarding-fallback";
import type { DiscoverCategoryKey } from "@/lib/mock-data";
import { DISCOVER_CATEGORIES } from "@/lib/mock-data";
import {
  getCurrentProfile,
  getNearbyTravelers,
  getSessionUser,
} from "@/lib/profile";

function parseCategory(value?: string): DiscoverCategoryKey {
  if (value && DISCOVER_CATEGORIES.some((c) => c.key === value)) {
    return value as DiscoverCategoryKey;
  }
  return "top";
}

export default function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ event?: string; category?: string }>;
}) {
  return (
    <Suspense fallback={<OnboardingFallback />}>
      <ExploreContent searchParams={searchParams} />
    </Suspense>
  );
}

async function ExploreContent({
  searchParams,
}: {
  searchParams: Promise<{ event?: string; category?: string }>;
}) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/auth/login");
  }

  const profile = await getCurrentProfile();
  if (!profile?.onboarding_complete) {
    redirect("/onboarding/profile");
  }

  const { event, category } = await searchParams;
  const travelers = await getNearbyTravelers();
  const initialCategory = event ? "events" : parseCategory(category);

  return (
    <ExploreMap
      areaLabel={profile.area_label}
      city={profile.current_city}
      userLat={profile.approx_lat}
      userLng={profile.approx_lng}
      travelers={travelers}
      focusEventId={event ?? null}
      initialCategory={initialCategory}
    />
  );
}
