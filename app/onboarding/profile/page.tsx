import { Suspense } from "react";
import { redirect } from "next/navigation";

import { CreateProfileForm } from "@/components/create-profile-form";
import { OnboardingFallback } from "@/components/onboarding-fallback";
import { getCurrentProfile, getSessionUser } from "@/lib/profile";

export default function CreateProfilePage() {
  return (
    <Suspense fallback={<OnboardingFallback />}>
      <CreateProfileContent />
    </Suspense>
  );
}

async function CreateProfileContent() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/auth/login");
  }

  const profile = await getCurrentProfile();
  return (
    <CreateProfileForm
      initialProfile={profile}
      afterSaveHref="/onboarding/interests"
    />
  );
}
