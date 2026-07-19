import { Suspense } from "react";
import { redirect } from "next/navigation";

import { DiscoverHome } from "@/components/discover-home";
import { OnboardingFallback } from "@/components/onboarding-fallback";
import { getCurrentProfile, getSessionUser } from "@/lib/profile";

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

  return (
    <DiscoverHome
      areaLabel={profile.area_label}
      city={profile.current_city}
    />
  );
}
