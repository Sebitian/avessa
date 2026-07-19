import { createClient } from "@/lib/supabase/client";
import type { ProfileUpdate } from "@/lib/profile";

export async function upsertCurrentProfile(update: ProfileUpdate) {
  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw userError;
  if (!user) throw new Error("Not signed in");

  const { error } = await supabase.from("profiles").upsert({
    id: user.id,
    ...update,
    updated_at: new Date().toISOString(),
  });

  if (error) throw error;
}

export async function getClientPostAuthPath(): Promise<string> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return "/auth/login";

  const { data } = await supabase
    .from("profiles")
    .select("onboarding_complete")
    .eq("id", user.id)
    .maybeSingle();

  if (!data?.onboarding_complete) {
    return "/onboarding/profile";
  }

  return "/discover";
}
