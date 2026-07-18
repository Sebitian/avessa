import { Suspense } from "react";
import { redirect } from "next/navigation";
import { InfoIcon } from "lucide-react";

import { FetchDataSteps } from "@/components/tutorial/fetch-data-steps";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/profile";

export default function ProtectedPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 w-full p-5 text-sm text-muted-foreground">
          Loading...
        </div>
      }
    >
      <ProtectedContent />
    </Suspense>
  );
}

async function ProtectedContent() {
  const profile = await getCurrentProfile();
  if (profile && !profile.onboarding_complete) {
    redirect("/onboarding/profile");
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <div className="w-full">
        <div className="bg-accent text-sm p-3 px-5 rounded-md text-foreground flex gap-3 items-center">
          <InfoIcon size="16" strokeWidth={2} />
          This is a protected page that you can only see as an authenticated
          user
        </div>
      </div>
      <div className="flex flex-col gap-2 items-start">
        <h2 className="font-bold text-2xl mb-4">Your user details</h2>
        <pre className="text-xs font-mono p-3 rounded border max-h-32 overflow-auto">
          <Suspense fallback="Loading user...">
            <UserDetails />
          </Suspense>
        </pre>
      </div>
      <div>
        <h2 className="font-bold text-2xl mb-4">Next steps</h2>
        <FetchDataSteps />
      </div>
    </div>
  );
}

async function UserDetails() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  return JSON.stringify(data.claims, null, 2);
}
