import { Suspense } from "react";
import { redirect } from "next/navigation";

import { InterestsForm } from "@/components/interests-form";
import { OnboardingFallback } from "@/components/onboarding-fallback";
import { getCurrentProfile, getSessionUser } from "@/lib/profile";

export default function InterestsPage() {
  return (
    <Suspense fallback={<OnboardingFallback />}>
      <InterestsContent />
    </Suspense>
  );
}

async function InterestsContent() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/auth/login");
  }

  const profile = await getCurrentProfile();
  if (profile?.onboarding_complete) {
    redirect("/discover");
  }

  return <InterestsForm initialInterests={profile?.interests} />;
}
