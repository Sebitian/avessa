/** Client-safe presence helpers — do not import server Supabase here. */

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
  /** Demo presence — replace with realtime presence later */
  online: boolean;
  /** Human-readable last seen, e.g. "2h ago" — empty when online */
  lastSeen: string | null;
  lat: number;
  lng: number;
};

function hashId(id: string, salt = 0): number {
  let h = salt >>> 0;
  for (let i = 0; i < id.length; i++) {
    h = (Math.imul(h, 31) + id.charCodeAt(i)) >>> 0;
  }
  return h;
}

export function demoOnlineFromId(id: string): boolean {
  // ~2/3 of nearby travelers show as online for the MVP demo.
  return hashId(id, 0) % 3 !== 0;
}

/** Stable relative last-seen label for offline demo users. */
export function demoLastSeenFromId(id: string): string {
  const bucket = hashId(id, 11) % 8;
  switch (bucket) {
    case 0:
      return "5m ago";
    case 1:
      return "20m ago";
    case 2:
      return "1h ago";
    case 3:
      return "2h ago";
    case 4:
      return "yesterday";
    case 5:
      return "2d ago";
    case 6:
      return "3d ago";
    default:
      return "last week";
  }
}

export function presenceLabel(traveler: {
  online: boolean;
  lastSeen?: string | null;
}): string {
  if (traveler.online) return "Online";
  if (traveler.lastSeen) return `Last seen ${traveler.lastSeen}`;
  return "Last seen recently";
}
