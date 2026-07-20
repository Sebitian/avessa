import { createClient } from "@/lib/supabase/server";
import { NEARBY_TRAVELERS } from "@/lib/mock-data";
import {
  demoLastSeenFromId,
  demoOnlineFromId,
  type DiscoverTraveler,
} from "@/lib/presence";

export type { DiscoverTraveler } from "@/lib/presence";
export { presenceLabel, demoLastSeenFromId } from "@/lib/presence";

/** Prefer portrait crop when the avatar is an Unsplash URL. */
function portraitPhotoUrl(url: string): string {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes("images.unsplash.com")) return url;
    parsed.searchParams.set("w", "800");
    parsed.searchParams.set("h", "1000");
    parsed.searchParams.set("fit", "crop");
    return parsed.toString();
  } catch {
    return url;
  }
}

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
  discover_radius_m: number | null;
  onboarding_complete: boolean | null;
};

export type ProfileUpdate = Partial<
  Omit<Profile, "id"> & { updated_at?: string }
>;

const DISCOVER_SELECT =
  "id, first_name, age, nationality, current_city, home_city, area_label, approx_lat, approx_lng, discover_radius_m, avatar_url, interests, bio, traveler_status, languages, looking_for, gender";

function toDiscoverTraveler(row: Profile): DiscoverTraveler | null {
  if (row.approx_lat == null || row.approx_lng == null) return null;
  const firstName = row.first_name?.trim() || "Traveler";
  const online = demoOnlineFromId(row.id);
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
    online,
    lastSeen: online ? null : demoLastSeenFromId(row.id),
    lat: row.approx_lat,
    lng: row.approx_lng,
    discoverRadiusM: row.discover_radius_m ?? undefined,
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
  // Seeded demo accounts share first names with curated mock cards — reuse their
  // portrait stacks / prompts so prod doesn't look like random stock photos.
  const mockTwin = NEARBY_TRAVELERS.find(
    (t) => t.firstName.toLowerCase() === traveler.firstName.toLowerCase(),
  );

  const rawPhoto =
    traveler.avatarUrl ||
    mockTwin?.photo ||
    `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(traveler.id)}`;
  const photo = portraitPhotoUrl(rawPhoto);

  const photos =
    mockTwin?.photos?.length && mockTwin.photos.length > 1
      ? mockTwin.photos
      : [photo];

  return {
    id: traveler.id,
    firstName: traveler.firstName,
    nationality: traveler.nationality || mockTwin?.nationality || "",
    flag: mockTwin?.flag || "",
    area: traveler.area,
    sharedInterests:
      traveler.interests.length > 0
        ? traveler.interests
        : (mockTwin?.sharedInterests ?? []),
    age: traveler.age ?? mockTwin?.age,
    bio: traveler.bio || mockTwin?.bio || "Say hi and make a plan.",
    photo,
    photos,
    languages:
      traveler.languages.length > 0
        ? traveler.languages
        : (mockTwin?.languages ?? []),
    lookingFor:
      traveler.lookingFor.length > 0
        ? traveler.lookingFor
        : (mockTwin?.lookingFor ?? []),
    travelerStatus:
      traveler.travelerStatus || mockTwin?.travelerStatus || "Nearby",
    online: traveler.online,
    lastSeen: traveler.lastSeen,
    prompts: mockTwin?.prompts,
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
