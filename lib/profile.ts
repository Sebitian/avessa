import { createClient } from "@/lib/supabase/server";

export type Profile = {
  id: string;
  first_name: string | null;
  age: number | null;
  nationality: string | null;
  current_city: string | null;
  home_city: string | null;
  languages: string[] | null;
  bio: string | null;
  avatar_url: string | null;
  interests: string[] | null;
  traveler_status: "traveling" | "local" | "both" | null;
  looking_for: string[] | null;
  gender: string | null;
  approx_lat: number | null;
  approx_lng: number | null;
  area_label: string | null;
  onboarding_complete: boolean | null;
};

export type ProfileUpdate = Partial<
  Omit<Profile, "id"> & { updated_at?: string }
>;

export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    console.error("profiles fetch:", error.message);
    return null;
  }

  return data as Profile | null;
}

export async function getSessionUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/** Where to send a signed-in user after auth. */
export async function getPostAuthPath(): Promise<string> {
  const profile = await getCurrentProfile();
  if (!profile?.onboarding_complete) {
    return "/onboarding/profile";
  }
  return "/discover";
}
