import {
  DEFAULT_MAP_CENTER,
  type Place,
  type PlaceCategoryKey,
  PLACES,
} from "@/lib/mock-data";

export type MapSector = {
  id: string;
  name: string;
  label: string;
  categoryKey: Exclude<PlaceCategoryKey, "top">;
  emoji: string;
  description: string;
  /** Soft zone polygon relative to Barcelona default center */
  polygon: [number, number][];
  /** Place ids that belong in this sector */
  placeIds: string[];
  accent: "green" | "orange" | "pink" | "blue";
  popularity: number;
};

const SECTOR_FILL: Record<MapSector["accent"], string> = {
  green: "#22c55e",
  orange: "#f97316",
  pink: "#ec4899",
  blue: "#3b82f6",
};

export function sectorFillColor(accent: MapSector["accent"]) {
  return SECTOR_FILL[accent];
}

/** Popular areas / intents — Barcelona MVP, remapped around the user. */
export const MAP_SECTORS: MapSector[] = [
  {
    id: "s-born-nightlife",
    name: "El Born nights",
    label: "go out",
    categoryKey: "go-out",
    emoji: "🪩",
    description: "Bars, speakeasies, and late rooms around El Born.",
    polygon: [
      [41.3822, 2.1798],
      [41.3858, 2.1805],
      [41.3864, 2.1858],
      [41.3835, 2.1872],
      [41.3816, 2.1836],
    ],
    placeIds: ["p5", "p10", "p7"],
    accent: "pink",
    popularity: 96,
  },
  {
    id: "s-gothic-eat",
    name: "Gothic eats",
    label: "eat",
    categoryKey: "eat",
    emoji: "🍣",
    description: "Food halls and tapas walks through the old city.",
    polygon: [
      [41.3818, 2.1742],
      [41.3852, 2.1748],
      [41.3858, 2.1795],
      [41.3826, 2.1802],
      [41.3809, 2.177],
    ],
    placeIds: ["p1", "p2"],
    accent: "orange",
    popularity: 92,
  },
  {
    id: "s-portal-shops",
    name: "Portal shopping",
    label: "shopping",
    categoryKey: "shops",
    emoji: "👜",
    description: "Bookstores, boutiques, and gift stops near Raval / Portal.",
    polygon: [
      [41.3802, 2.1678],
      [41.3834, 2.1684],
      [41.3838, 2.1726],
      [41.381, 2.1734],
      [41.3794, 2.1704],
    ],
    placeIds: ["p6"],
    accent: "blue",
    popularity: 84,
  },
  {
    id: "s-apolo-out",
    name: "Poble Sec nights",
    label: "go out",
    categoryKey: "go-out",
    emoji: "🎤",
    description: "Concerts and club nights around Sala Apolo.",
    polygon: [
      [41.3728, 2.1668],
      [41.3762, 2.1674],
      [41.3768, 2.1718],
      [41.3736, 2.1726],
      [41.3722, 2.1696],
    ],
    placeIds: ["p11"],
    accent: "pink",
    popularity: 88,
  },
  {
    id: "s-sant-antoni-coffee",
    name: "Sant Antoni coffee",
    label: "coffee",
    categoryKey: "cafes",
    emoji: "☕",
    description: "Brunch terraces and specialty coffee in Sant Antoni.",
    polygon: [
      [41.3782, 2.1608],
      [41.3816, 2.1614],
      [41.3822, 2.1658],
      [41.379, 2.1666],
      [41.3776, 2.1636],
    ],
    placeIds: ["p8"],
    accent: "green",
    popularity: 80,
  },
  {
    id: "s-ciutadella",
    name: "Ciutadella green",
    label: "outdoors",
    categoryKey: "leisure",
    emoji: "🌳",
    description: "Park lawns, picnic spots, and easy outdoor hangs.",
    polygon: [
      [41.3862, 2.1845],
      [41.3902, 2.1852],
      [41.3908, 2.1902],
      [41.3872, 2.191],
      [41.3854, 2.1878],
    ],
    placeIds: ["p4"],
    accent: "green",
    popularity: 86,
  },
];

function offsetLatLng(
  lat: number,
  lng: number,
  userLat: number,
  userLng: number,
): [number, number] {
  return [
    userLat + (lat - DEFAULT_MAP_CENTER.lat),
    userLng + (lng - DEFAULT_MAP_CENTER.lng),
  ];
}

export function sectorsAround(
  userLat: number,
  userLng: number,
  category: PlaceCategoryKey = "top",
): MapSector[] {
  const remapped = MAP_SECTORS.map((sector) => ({
    ...sector,
    polygon: sector.polygon.map(([lat, lng]) =>
      offsetLatLng(lat, lng, userLat, userLng),
    ),
  }));

  if (category === "top") return remapped;
  return remapped.filter((s) => s.categoryKey === category);
}

export function placesInSector(
  sector: MapSector,
  places: Place[] = PLACES,
): Place[] {
  const ids = new Set(sector.placeIds);
  return places.filter((p) => ids.has(p.id));
}

export function getSectorById(id: string): MapSector | undefined {
  return MAP_SECTORS.find((s) => s.id === id);
}
