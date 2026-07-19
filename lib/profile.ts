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

export type DiscoverTraveler = {
  id: string;
  firstName: string;
  age: number | null;
  nationality: string | null;
  area: string;
  city: string | null;
  bio: string | null;
  avatarUrl: string | null;
  interests: string[];
  languages: string[];
  lookingFor: string[];
  travelerStatus: string | null;
  lat: number;
  lng: number;
};

const DISCOVER_SELECT =
  "id, first_name, age, nationality, current_city, home_city, area_label, approx_lat, approx_lng, avatar_url, interests, bio, traveler_status, languages, looking_for, gender";

function toDiscoverTraveler(row: Profile): DiscoverTraveler | null {
  if (row.approx_lat == null || row.approx_lng == null) return null;
  const firstName = row.first_name?.trim() || "Traveler";
  return {
    id: row.id,
    firstName,
    age: row.age,
    nationality: row.nationality,
    area: row.area_label || row.current_city || "Nearby",
    city: row.current_city,
    bio: row.bio,
    avatarUrl: row.avatar_url,
    interests: row.interests ?? [],
    languages: row.languages ?? [],
    lookingFor: row.looking_for ?? [],
    travelerStatus: row.traveler_status,
    lat: row.approx_lat,
    lng: row.approx_lng,
  };
}

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

/** Other completed profiles with coordinates — for Discover map + strip. */
export async function getNearbyTravelers(): Promise<DiscoverTraveler[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("profiles")
    .select(DISCOVER_SELECT)
    .eq("onboarding_complete", true)
    .not("approx_lat", "is", null)
    .not("approx_lng", "is", null)
    .neq("id", user.id);

  if (error) {
    console.error("nearby travelers fetch:", error.message);
    return [];
  }

  return (data as Profile[])
    .map(toDiscoverTraveler)
    .filter((t): t is DiscoverTraveler => t != null);
}

export async function getDiscoverTravelerById(
  id: string,
): Promise<DiscoverTraveler | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select(DISCOVER_SELECT)
    .eq("id", id)
    .eq("onboarding_complete", true)
    .maybeSingle();

  if (error) {
    console.error("traveler fetch:", error.message);
    return null;
  }

  if (!data) return null;
  return toDiscoverTraveler(data as Profile);
}

/** Shape used by the TravelerProfile UI (mock + live profiles). */
export function discoverTravelerToCard(traveler: DiscoverTraveler) {
  const photo =
    traveler.avatarUrl ||
    `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(traveler.id)}`;

  return {
    id: traveler.id,
    firstName: traveler.firstName,
    nationality: traveler.nationality || "",
    flag: "",
    area: traveler.area,
    sharedInterests: traveler.interests,
    age: traveler.age ?? undefined,
    bio: traveler.bio || "Say hi and make a plan.",
    photo,
    photos: [photo],
    languages: traveler.languages,
    lookingFor: traveler.lookingFor,
    travelerStatus: traveler.travelerStatus || "Nearby",
    online: true,
  };
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
