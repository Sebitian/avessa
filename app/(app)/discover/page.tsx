import { Suspense } from "react";
import { redirect } from "next/navigation";

import { DiscoverFeed } from "@/components/discover-feed";
import { OnboardingFallback } from "@/components/onboarding-fallback";
import {
  getCurrentProfile,
  getNearbyTravelers,
  getSessionUser,
} from "@/lib/profile";

export default function DiscoverPage() {
  return (
    <Suspense fallback={<OnboardingFallback />}>
      <DiscoverContent />
    </Suspense>
  );
}

async function DiscoverContent() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/auth/login");
  }

  const profile = await getCurrentProfile();
  if (!profile?.onboarding_complete) {
    redirect("/onboarding/profile");
  }

  const travelers = await getNearbyTravelers();

  return (
    <DiscoverFeed
      areaLabel={profile.area_label}
      city={profile.current_city}
      travelers={travelers}
    />
  );
}
