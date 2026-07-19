import { Suspense } from "react";
import { redirect } from "next/navigation";

import { EventsFeed } from "@/components/events-feed";
import { OnboardingFallback } from "@/components/onboarding-fallback";
import { CITY_EVENTS } from "@/lib/events";
import { getCurrentProfile, getSessionUser } from "@/lib/profile";

export default function EventsPage() {
  return (
    <Suspense fallback={<OnboardingFallback />}>
      <EventsContent />
    </Suspense>
  );
}

async function EventsContent() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/auth/login");
  }

  const profile = await getCurrentProfile();
  if (!profile?.onboarding_complete) {
    redirect("/onboarding/profile");
  }

  return (
    <EventsFeed
      events={CITY_EVENTS}
      areaLabel={profile.area_label || profile.current_city}
    />
  );
}
