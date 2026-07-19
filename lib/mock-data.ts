export type NearbyTraveler = {
  id: string;
  firstName: string;
  nationality: string;
  flag: string;
  area: string;
  sharedInterests: string[];
  age?: number;
  bio: string;
  photo: string;
  photos: string[];
  languages: string[];
  lookingFor: string[];
  travelerStatus: string;
  online?: boolean;
  /** Relative time when offline, e.g. "2h ago" */
  lastSeen?: string | null;
  prompts?: { question: string; answer: string }[];
};

export type PlaceCategoryKey =
  | "top"
  | "eat"
  | "cafes"
  | "bars"
  | "go-out"
  | "shops"
  | "leisure";

export type Place = {
  id: string;
  name: string;
  category: string;
  categoryKey: PlaceCategoryKey;
  tagline: string;
  description: string;
  photo: string;
  photos?: string[];
  neighborhood: string;
  vibes: string[];
  goodFor: string[];
  tip?: string;
  hours?: string;
  lat: number;
  lng: number;
  emoji: string;
  accent?: "green" | "orange" | "pink" | "blue";
};

/** Gothic Quarter / El Born — used when profile has no coords yet */
export const DEFAULT_MAP_CENTER = { lat: 41.3851, lng: 2.1734 };

export const PLACE_CATEGORIES: {
  key: PlaceCategoryKey;
  label: string;
  emoji: string;
}[] = [
  { key: "top", label: "top picks", emoji: "⭐" },
  { key: "eat", label: "eat", emoji: "🍣" },
  { key: "cafes", label: "coffee", emoji: "☕" },
  { key: "bars", label: "bars", emoji: "🍸" },
  { key: "go-out", label: "go out", emoji: "🪩" },
  { key: "shops", label: "shops", emoji: "👜" },
  { key: "leisure", label: "outdoors", emoji: "🌅" },
];

/** Discover / Explore chips — place filters plus events (no separate Events tab). */
export type DiscoverCategoryKey = PlaceCategoryKey | "events";

export const DISCOVER_CATEGORIES: {
  key: DiscoverCategoryKey;
  label: string;
  emoji: string;
}[] = [
  { key: "top", label: "top picks", emoji: "⭐" },
  { key: "events", label: "events", emoji: "🎟️" },
  { key: "eat", label: "eat", emoji: "🍣" },
  { key: "cafes", label: "coffee", emoji: "☕" },
  { key: "bars", label: "bars", emoji: "🍸" },
  { key: "go-out", label: "go out", emoji: "🪩" },
  { key: "shops", label: "shops", emoji: "👜" },
  { key: "leisure", label: "outdoors", emoji: "🌅" },
];

export function placeCategoryLabel(place: Place): string {
  const fromKey = PLACE_CATEGORIES.find((c) => c.key === place.categoryKey);
  return place.category || fromKey?.label || "nearby";
}

export const NEARBY_TRAVELERS: NearbyTraveler[] = [
  {
    id: "1",
    firstName: "Sophie",
    nationality: "France",
    flag: "🇫🇷",
    area: "Near Gothic Quarter",
    sharedInterests: ["Coffee", "Museums", "Photography", "Food"],
    age: 27,
    bio: "In Barcelona for two weeks. Always looking for the best cortado and a quiet gallery. Love exploring new places, meeting new people, and spontaneous adventures!",
    photo:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&h=1000&fit=crop",
    photos: [
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=800&h=1000&fit=crop",
    ],
    languages: ["French", "English", "Spanish"],
    lookingFor: ["Coffee chats", "Museum buddies", "Day trips"],
    travelerStatus: "Here for 2 weeks",
    online: true,
    prompts: [
      {
        question: "Ideal Sunday here",
        answer: "Slow coffee, then wandering Gothic Quarter until we find a terrace.",
      },
      {
        question: "Ask me about",
        answer: "The best film photography spots in the city.",
      },
    ],
  },
  {
    id: "2",
    firstName: "Marco",
    nationality: "Italy",
    flag: "🇮🇹",
    area: "Near El Born",
    sharedInterests: ["Food", "Nightlife", "Culture"],
    age: 31,
    bio: "Local food guide energy. Happy to share hidden tapas spots and late-night vermouth bars.",
    photo:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=1000&fit=crop",
    photos: [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&h=1000&fit=crop",
    ],
    languages: ["Italian", "English", "Spanish"],
    lookingFor: ["Dinner plans", "Nightlife"],
    travelerStatus: "Living here",
    online: false,
    lastSeen: "2h ago",
    prompts: [
      {
        question: "My go-to order",
        answer: "Patatas bravas and a cold Estrella — then we keep walking.",
      },
    ],
  },
  {
    id: "3",
    firstName: "Aya",
    nationality: "Japan",
    flag: "🇯🇵",
    area: "Near Gràcia",
    sharedInterests: ["Hiking", "Wellness", "Photography"],
    age: 24,
    bio: "Digital nomad. Sunrise hikes and calm cafés preferred. Always packing a camera.",
    photo:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800&h=1000&fit=crop",
    photos: [
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&h=1000&fit=crop",
    ],
    languages: ["Japanese", "English"],
    lookingFor: ["Hiking partners", "Quiet cafés"],
    travelerStatus: "Nomading this month",
    online: true,
    prompts: [
      {
        question: "Wake me up for",
        answer: "Sunrise at Bunkers del Carmel. Worth every early alarm.",
      },
    ],
  },
  {
    id: "4",
    firstName: "Leo",
    nationality: "Brazil",
    flag: "🇧🇷",
    area: "Near Barceloneta",
    sharedInterests: ["Beaches", "Sports", "Music"],
    age: 29,
    bio: "Beach volleyball in the morning, live music at night. Easy energy, zero itinerary stress.",
    photo:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&h=1000&fit=crop",
    photos: [
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1463453091185-61582044d556?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1507595578773-b6f5f5c4ad4d?w=800&h=1000&fit=crop",
    ],
    languages: ["Portuguese", "English", "Spanish"],
    lookingFor: ["Beach days", "Concerts"],
    travelerStatus: "Here for the summer",
    online: true,
    prompts: [
      {
        question: "Perfect afternoon",
        answer: "Volleyball, swim, then a cerveza while the sun drops.",
      },
    ],
  },
];

export function getTravelerById(id: string): NearbyTraveler | undefined {
  return NEARBY_TRAVELERS.find((t) => t.id === id);
}

export const PLACES: Place[] = [
  {
    id: "p1",
    name: "El Nacional",
    category: "eat",
    categoryKey: "eat",
    tagline: "food hall classics",
    description:
      "A grand food hall in a restored palace — oysters, grill, tapas, and wine under one roof. Easy to meet other travelers over a long lunch.",
    photo:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=1000&fit=crop",
    photos: [
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&h=1000&fit=crop",
    ],
    neighborhood: "Eixample",
    vibes: ["Lively", "Shareable", "Indoor"],
    goodFor: ["Groups", "First meetups", "Long lunches"],
    tip: "Go early for a table, or grab bar seats at the oyster counter.",
    hours: "Noon – midnight",
    lat: 41.3926,
    lng: 2.1664,
    emoji: "🍽️",
    accent: "orange",
  },
  {
    id: "p2",
    name: "Satan's Coffee",
    category: "coffee",
    categoryKey: "cafes",
    tagline: "serious espresso",
    description:
      "Serious coffee, small space, perfect for a quick chat before you wander the Gothic Quarter.",
    photo:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&h=1000&fit=crop",
    photos: [
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&h=1000&fit=crop",
    ],
    neighborhood: "Gothic Quarter",
    vibes: ["Focused", "Local", "Quick"],
    goodFor: ["Solo work", "Coffee dates", "Morning plans"],
    tip: "Tiny shop — takeaway if the bar is packed.",
    hours: "8am – 6pm",
    lat: 41.3839,
    lng: 2.1776,
    emoji: "☕",
    accent: "green",
  },
  {
    id: "p3",
    name: "Bunkers del Carmel",
    category: "outdoors",
    categoryKey: "leisure",
    tagline: "sunset views",
    description:
      "Old anti-aircraft bunkers with the best free sunset over the city. Bring a drink and a light jacket.",
    photo:
      "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&h=1000&fit=crop",
    photos: [
      "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1562883676-8c7feb83f09b?w=800&h=1000&fit=crop",
    ],
    neighborhood: "El Carmel",
    vibes: ["Scenic", "Golden hour", "Open air"],
    goodFor: ["Sunsets", "Photos", "Chill hangs"],
    tip: "Arrive 45 minutes before sunset — it fills up fast.",
    hours: "Open 24h",
    lat: 41.4188,
    lng: 2.1609,
    emoji: "🌅",
    accent: "pink",
  },
  {
    id: "p4",
    name: "Parc de la Ciutadella",
    category: "outdoors",
    categoryKey: "leisure",
    tagline: "picnic lawns",
    description:
      "Local favorite for afternoon walks, boat rides, and lazy picnics near the fountain.",
    photo:
      "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&h=1000&fit=crop",
    photos: [
      "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=1000&fit=crop",
    ],
    neighborhood: "El Born",
    vibes: ["Relaxed", "Green", "Weekend"],
    goodFor: ["Picnics", "Walks", "People watching"],
    tip: "Grab snacks on Passeig del Born before you settle on the grass.",
    hours: "10am – sunset",
    lat: 41.3881,
    lng: 2.187,
    emoji: "🌳",
    accent: "green",
  },
  {
    id: "p5",
    name: "Bar del Pla",
    category: "bars",
    categoryKey: "bars",
    tagline: "tapas + vermouth",
    description:
      "Cozy corner bar with excellent small plates and a classic vermouth hour crowd.",
    photo:
      "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&h=1000&fit=crop",
    photos: [
      "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800&h=1000&fit=crop",
    ],
    neighborhood: "El Born",
    vibes: ["Cozy", "Tapas", "Neighborhood"],
    goodFor: ["Drinks", "Small groups", "Warm-up night"],
    tip: "Order the croquetas and a vermut — then share the rest.",
    hours: "6pm – 1am",
    lat: 41.3848,
    lng: 2.1812,
    emoji: "🍷",
    accent: "orange",
  },
  {
    id: "p6",
    name: "La Central",
    category: "shops",
    categoryKey: "shops",
    tagline: "bookstore café",
    description:
      "Browse books across languages, then linger over coffee in the quiet café corner.",
    photo:
      "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800&h=1000&fit=crop",
    photos: [
      "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=1000&fit=crop",
    ],
    neighborhood: "Raval",
    vibes: ["Quiet", "Creative", "Rainy day"],
    goodFor: ["Solo time", "Gifts", "Slow afternoons"],
    tip: "English + Spanish sections are solid for travel reads.",
    hours: "10am – 9pm",
    lat: 41.3815,
    lng: 2.1698,
    emoji: "📚",
    accent: "blue",
  },
  {
    id: "p7",
    name: "Razzmatazz",
    category: "go out",
    categoryKey: "go-out",
    tagline: "late-night rooms",
    description:
      "Multi-room club for dancing until late — different floors, different moods.",
    photo:
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=1000&fit=crop",
    photos: [
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&h=1000&fit=crop",
    ],
    neighborhood: "Poblenou",
    vibes: ["Loud", "Late", "Dance"],
    goodFor: ["Going out", "Groups", "Live DJ nights"],
    tip: "Check which room is open the night you go — lineups change.",
    hours: "1am – 6am (weekends)",
    lat: 41.3978,
    lng: 2.1912,
    emoji: "🪩",
    accent: "pink",
  },
  {
    id: "p8",
    name: "Federal Café",
    category: "coffee",
    categoryKey: "cafes",
    tagline: "brunch terrace",
    description:
      "Bright café with a sunny upstairs terrace — brunch plates and good people-watching.",
    photo:
      "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&h=1000&fit=crop",
    photos: [
      "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1493770348161-369560ae630e?w=800&h=1000&fit=crop",
    ],
    neighborhood: "Sant Antoni",
    vibes: ["Sunny", "Brunchy", "Social"],
    goodFor: ["Brunch", "Catch-ups", "Weekend plans"],
    tip: "Upstairs terrace is the move if the weather’s good.",
    hours: "9am – 5pm",
    lat: 41.3799,
    lng: 2.1635,
    emoji: "🥑",
    accent: "green",
  },
  {
    id: "p9",
    name: "Pastisseria Hofmann",
    category: "pastries",
    categoryKey: "cafes",
    tagline: "legendary croissants",
    description:
      "Tiny pastry counter famous for buttery croissants and seasonal tarts — grab one and keep walking.",
    photo:
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&h=1000&fit=crop",
    photos: [
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&h=1000&fit=crop",
    ],
    neighborhood: "Born",
    vibes: ["Sweet", "Quick", "Local favorite"],
    goodFor: ["Morning walks", "Takeaway", "Treat yourself"],
    tip: "Go for the croissant — lines move fast in the morning.",
    hours: "8am – 8pm",
    lat: 41.3856,
    lng: 2.1824,
    emoji: "🥐",
    accent: "orange",
  },
  {
    id: "p10",
    name: "Paradiso",
    category: "bars",
    categoryKey: "bars",
    tagline: "speakeasy cocktails",
    description:
      "Hidden cocktail bar behind a pastrami shop — inventive drinks and a late-night buzz.",
    photo:
      "https://images.unsplash.com/photo-1514362545857-3bc16549766b?w=800&h=1000&fit=crop",
    photos: [
      "https://images.unsplash.com/photo-1514362545857-3bc16549766b?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&h=1000&fit=crop",
    ],
    neighborhood: "El Born",
    vibes: ["Hidden", "Cocktails", "Date night"],
    goodFor: ["Night out", "Small groups", "Special occasions"],
    tip: "Walk through the fridge door — yes, really.",
    hours: "7pm – 2am",
    lat: 41.3832,
    lng: 2.1835,
    emoji: "🍸",
    accent: "blue",
  },
  {
    id: "p11",
    name: "Sala Apolo",
    category: "go out",
    categoryKey: "go-out",
    tagline: "concerts + club nights",
    description:
      "Classic venue for live shows and sweaty dance floors — a staple of Barcelona nightlife.",
    photo:
      "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=1000&fit=crop",
    photos: [
      "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=1000&fit=crop",
    ],
    neighborhood: "Poble Sec",
    vibes: ["Live music", "Dance", "Late"],
    goodFor: ["Concerts", "Club nights", "Groups"],
    tip: "Check the lineup — one night is indie, the next is techno.",
    hours: "Doors from 10pm",
    lat: 41.3745,
    lng: 2.1692,
    emoji: "🎤",
    accent: "pink",
  },
];

export function getPlaceById(id: string): Place | undefined {
  return PLACES.find((place) => place.id === id);
}

/** Stable hash for deterministic demo stats / place picks per traveler. */
export function seedFromId(id: string, salt = 0): number {
  let h = salt >>> 0;
  for (let i = 0; i < id.length; i++) {
    h = (Math.imul(h, 31) + id.charCodeAt(i)) >>> 0;
  }
  return h;
}

/** Curated “recent places” for a traveler profile — from our place list, not screenshot data. */
export function recentPlacesForTraveler(travelerId: string, count = 3): Place[] {
  if (PLACES.length === 0) return [];
  const start = seedFromId(travelerId, 17) % PLACES.length;
  const picked: Place[] = [];
  for (let i = 0; i < Math.min(count, PLACES.length); i++) {
    picked.push(PLACES[(start + i * 3) % PLACES.length]);
  }
  return picked;
}

export function travelerProfileStats(travelerId: string) {
  const a = seedFromId(travelerId, 1);
  const b = seedFromId(travelerId, 2);
  const c = seedFromId(travelerId, 3);
  const d = seedFromId(travelerId, 4);
  return {
    allPlaces: 8 + (a % 40),
    wantToTry: 2 + (b % 18),
    favorites: 1 + (c % 14),
    recommend: 1 + (d % 10),
    following: 20 + (a % 180),
    followers: 10 + (b % 220),
  };
}

/** Remap Barcelona mock POIs so they cluster around the user's coords. */
export function placesAround(
  userLat: number,
  userLng: number,
  places: Place[] = PLACES,
): Place[] {
  return places.map((place) => ({
    ...place,
    lat: userLat + (place.lat - DEFAULT_MAP_CENTER.lat),
    lng: userLng + (place.lng - DEFAULT_MAP_CENTER.lng),
  }));
}

export const SAFETY_TIP = {
  title: "Stay safe tonight",
  body: "Avoid Las Ramblas after midnight. Keep bags zipped in crowded areas. Emergency: 112.",
};
