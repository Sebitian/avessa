import { Suspense } from "react";
import { redirect } from "next/navigation";

import { OnboardingFallback } from "@/components/onboarding-fallback";
import { ProfileView } from "@/components/profile-view";
import { getCurrentProfile, getSessionUser } from "@/lib/profile";

export default function ProfilePage() {
  return (
    <Suspense fallback={<OnboardingFallback />}>
      <ProfileContent />
    </Suspense>
  );
}

async function ProfileContent() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/auth/login");
  }

  const profile = await getCurrentProfile();
  if (!profile?.onboarding_complete) {
    redirect("/onboarding/profile");
  }

  return <ProfileView profile={profile} email={user.email} />;
}
