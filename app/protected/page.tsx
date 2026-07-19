import { Suspense } from "react";
import { redirect } from "next/navigation";

import { getCurrentProfile, getSessionUser } from "@/lib/profile";

/** Legacy starter route — send people to Discover / onboarding. */
export default function ProtectedPage() {
  return (
    <Suspense fallback={null}>
      <ProtectedRedirect />
    </Suspense>
  );
}

async function ProtectedRedirect(): Promise<never> {
  const user = await getSessionUser();
  if (!user) {
    redirect("/auth/login");
  }

  const profile = await getCurrentProfile();
  if (!profile?.onboarding_complete) {
    redirect("/onboarding/profile");
  }

  redirect("/discover");
}
