import { DEFAULT_MAP_CENTER } from "@/lib/mock-data";

export type EventCategory = "music" | "nightlife" | "festival" | "outdoor" | "market";

export type CityEvent = {
  id: string;
  title: string;
  category: EventCategory;
  label: string;
  emoji: string;
  description: string;
  venue: string;
  neighborhood: string;
  photo: string;
  /** ISO start time */
  startsAt: string;
  endsAt?: string;
  lat: number;
  lng: number;
  sourceUrl?: string;
  tip?: string;
};

export const EVENT_CATEGORIES: {
  key: EventCategory | "all" | "tonight" | "week";
  label: string;
}[] = [
  { key: "all", label: "All" },
  { key: "tonight", label: "Tonight" },
  { key: "week", label: "This week" },
  { key: "music", label: "Music" },
  { key: "nightlife", label: "Nightlife" },
  { key: "festival", label: "Festival" },
  { key: "outdoor", label: "Outdoor" },
];

/** Anchor “today” for deterministic demo dates (Barcelona summer). */
function atLocal(daysFromToday: number, hour: number, minute = 0): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + daysFromToday);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

export const CITY_EVENTS: CityEvent[] = [
  {
    id: "e1",
    title: "Sunset Sessions at the Bunkers",
    category: "outdoor",
    label: "outdoor",
    emoji: "🌅",
    description:
      "Open-air DJ set as the sun drops over the city. Bring a blanket and a friend — best free view in Barcelona.",
    venue: "Bunkers del Carmel",
    neighborhood: "El Carmel",
    photo:
      "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&h=1000&fit=crop",
    startsAt: atLocal(0, 19, 30),
    endsAt: atLocal(0, 22, 0),
    lat: 41.4188,
    lng: 2.1609,
    tip: "Arrive early for a spot on the wall facing the sea.",
  },
  {
    id: "e2",
    title: "Indie Night at Sala Apolo",
    category: "music",
    label: "music",
    emoji: "🎤",
    description:
      "Live indie lineup downstairs, afterparty upstairs. Classic Poble Sec night out.",
    venue: "Sala Apolo",
    neighborhood: "Poble Sec",
    photo:
      "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=1000&fit=crop",
    startsAt: atLocal(0, 22, 0),
    endsAt: atLocal(1, 3, 0),
    lat: 41.3745,
    lng: 2.1692,
    sourceUrl: "https://www.sala-apolo.com/",
    tip: "Doors at 10 — check which room for the headliner.",
  },
  {
    id: "e3",
    title: "Razzmatazz Club Night",
    category: "nightlife",
    label: "nightlife",
    emoji: "🪩",
    description:
      "Multi-room club night with rotating DJs — techno, pop, and indie floors.",
    venue: "Razzmatazz",
    neighborhood: "Poblenou",
    photo:
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=1000&fit=crop",
    startsAt: atLocal(1, 1, 0),
    endsAt: atLocal(1, 6, 0),
    lat: 41.3978,
    lng: 2.1912,
    tip: "Lines get long after 1:30am on weekends.",
  },
  {
    id: "e4",
    title: "Born Street Market",
    category: "market",
    label: "market",
    emoji: "🛍️",
    description:
      "Weekend stalls with vintage, ceramics, and snacks — easy afternoon wander through El Born.",
    venue: "Passeig del Born",
    neighborhood: "El Born",
    photo:
      "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=800&h=1000&fit=crop",
    startsAt: atLocal(2, 11, 0),
    endsAt: atLocal(2, 18, 0),
    lat: 41.3845,
    lng: 2.1828,
  },
  {
    id: "e5",
    title: "Ciutadella Picnic Concert",
    category: "music",
    label: "music",
    emoji: "🎸",
    description:
      "Acoustic sets on the lawn — bring wine, cheese, and a speaker-free picnic.",
    venue: "Parc de la Ciutadella",
    neighborhood: "El Born",
    photo:
      "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&h=1000&fit=crop",
    startsAt: atLocal(3, 17, 0),
    endsAt: atLocal(3, 20, 0),
    lat: 41.3881,
    lng: 2.187,
    tip: "Shade near the fountain fills up first.",
  },
  {
    id: "e6",
    title: "Sónar Warm-up Weekend",
    category: "festival",
    label: "festival",
    emoji: "🎧",
    description:
      "City-wide electronic warm-up parties ahead of festival season — stages across Poblenou.",
    venue: "Poblenou stages",
    neighborhood: "Poblenou",
    photo:
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=1000&fit=crop",
    startsAt: atLocal(5, 16, 0),
    endsAt: atLocal(6, 4, 0),
    lat: 41.4036,
    lng: 2.1945,
    sourceUrl: "https://sonar.es/",
    tip: "Day passes and night stages sell out — grab tickets early.",
  },
  {
    id: "e7",
    title: "Vermouth Hour Crawl",
    category: "nightlife",
    label: "nightlife",
    emoji: "🍷",
    description:
      "Guided-style meet-up hopping classic vermouth bars around El Born — travelers welcome.",
    venue: "Bar del Pla start",
    neighborhood: "El Born",
    photo:
      "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&h=1000&fit=crop",
    startsAt: atLocal(4, 18, 30),
    endsAt: atLocal(4, 21, 0),
    lat: 41.3848,
    lng: 2.1812,
  },
];

export function getEventById(id: string): CityEvent | undefined {
  return CITY_EVENTS.find((e) => e.id === id);
}

export function eventsAround(
  userLat: number,
  userLng: number,
  events: CityEvent[] = CITY_EVENTS,
): CityEvent[] {
  return events.map((event) => ({
    ...event,
    lat: userLat + (event.lat - DEFAULT_MAP_CENTER.lat),
    lng: userLng + (event.lng - DEFAULT_MAP_CENTER.lng),
  }));
}

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

export function filterEvents(
  events: CityEvent[],
  filter: EventCategory | "all" | "tonight" | "week",
): CityEvent[] {
  const now = new Date();
  const sorted = [...events].sort(
    (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
  );

  if (filter === "all") return sorted;

  if (filter === "tonight") {
    const start = startOfDay(now);
    const end = endOfDay(now);
    return sorted.filter((e) => {
      const t = new Date(e.startsAt);
      return t >= start && t <= end;
    });
  }

  if (filter === "week") {
    const start = startOfDay(now);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    return sorted.filter((e) => {
      const t = new Date(e.startsAt);
      return t >= start && t < end;
    });
  }

  return sorted.filter((e) => e.category === filter);
}

export function formatEventWhen(startsAt: string, endsAt?: string): string {
  const start = new Date(startsAt);
  const dateFmt = new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const timeFmt = new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });

  const datePart = dateFmt.format(start);
  const timePart = timeFmt.format(start);

  if (!endsAt) return `${datePart} · ${timePart}`;

  const end = new Date(endsAt);
  const sameDay = start.toDateString() === end.toDateString();
  if (sameDay) {
    return `${datePart} · ${timePart} – ${timeFmt.format(end)}`;
  }
  return `${datePart} ${timePart} → ${dateFmt.format(end)} ${timeFmt.format(end)}`;
}

export function isTonight(startsAt: string): boolean {
  const t = new Date(startsAt);
  const now = new Date();
  return t.toDateString() === now.toDateString();
}
