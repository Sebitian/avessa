import { Suspense } from "react";
import { redirect } from "next/navigation";

import { LocationPermission } from "@/components/location-permission";
import { OnboardingFallback } from "@/components/onboarding-fallback";
import { getSessionUser } from "@/lib/profile";

export default function LocationPage() {
  return (
    <Suspense fallback={<OnboardingFallback />}>
      <LocationContent />
    </Suspense>
  );
}

async function LocationContent() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/auth/login");
  }

  return <LocationPermission />;
}
