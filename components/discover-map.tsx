"use client";

import L from "leaflet";
import { LocateFixed, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  DEFAULT_MAP_CENTER,
  PLACE_CATEGORIES,
  placesAround,
  type Place,
  type PlaceCategoryKey,
} from "@/lib/mock-data";
import {
  eventsAround,
  filterEvents,
  formatEventWhen,
  type CityEvent,
} from "@/lib/events";
import type { DiscoverTraveler } from "@/lib/profile";
import {
  placesInSector,
  sectorFillColor,
  sectorsAround,
  type MapSector,
} from "@/lib/sectors";
import { cn } from "@/lib/utils";

import "leaflet/dist/leaflet.css";

type MapLayer = "places" | "events";

type DiscoverMapProps = {
  userLat?: number | null;
  userLng?: number | null;
  areaLabel?: string | null;
  travelers?: DiscoverTraveler[];
  title?: string;
  focusEventId?: string | null;
  initialLayer?: MapLayer;
};

const ACCENT_DOT: Record<NonNullable<Place["accent"]>, string> = {
  green: "#22c55e",
  orange: "#f97316",
  pink: "#ec4899",
  blue: "#3b82f6",
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function placeIcon(place: Place) {
  const accent = place.accent ? ACCENT_DOT[place.accent] : "#a78bfa";
  return L.divIcon({
    className: "avessa-place-marker",
    html: `
      <div class="avessa-place-bubble">
        <div class="avessa-place-bubble__icon">${place.emoji}</div>
        <div class="avessa-place-bubble__label">
          <div class="avessa-place-bubble__name">
            <span class="avessa-place-bubble__dot" style="background:${accent}"></span>
            ${escapeHtml(place.name)}
          </div>
          <div class="avessa-place-bubble__tag">${escapeHtml(place.category || place.tagline)}</div>
        </div>
      </div>
    `,
    iconSize: [200, 52],
    iconAnchor: [22, 26],
  });
}

function eventIcon(event: CityEvent) {
  return L.divIcon({
    className: "avessa-event-marker",
    html: `
      <div class="avessa-event-bubble">
        <div class="avessa-event-bubble__icon">${event.emoji}</div>
        <div class="avessa-event-bubble__label">
          <div class="avessa-event-bubble__name">${escapeHtml(event.title)}</div>
          <div class="avessa-event-bubble__tag">${escapeHtml(event.label)}</div>
        </div>
      </div>
    `,
    iconSize: [210, 52],
    iconAnchor: [22, 26],
  });
}

function sectorLabelIcon(sector: MapSector) {
  return L.divIcon({
    className: "avessa-sector-marker",
    html: `
      <div class="avessa-sector-badge">
        <span>${sector.emoji}</span>
        <span>${escapeHtml(sector.label)}</span>
      </div>
    `,
    iconSize: [120, 32],
    iconAnchor: [60, 16],
  });
}

function personIcon(traveler: DiscoverTraveler) {
  const initial = escapeHtml(traveler.firstName.charAt(0).toUpperCase());
  const name = escapeHtml(traveler.firstName);
  const meta = escapeHtml(
    [traveler.age != null ? String(traveler.age) : null, traveler.area]
      .filter(Boolean)
      .join(" · "),
  );
  const avatar =
    traveler.avatarUrl ||
    `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(traveler.id)}`;

  return L.divIcon({
    className: "avessa-person-marker",
    html: `
      <div class="avessa-person-bubble">
        <div class="avessa-person-bubble__avatar">
          <img src="${escapeHtml(avatar)}" alt="" />
          <span class="avessa-person-bubble__fallback">${initial}</span>
        </div>
        <div class="avessa-person-bubble__label">
          <div class="avessa-person-bubble__name">${name}</div>
          <div class="avessa-person-bubble__meta">${meta}</div>
        </div>
      </div>
    `,
    iconSize: [180, 56],
    iconAnchor: [28, 28],
  });
}

function polygonCentroid(polygon: [number, number][]): [number, number] {
  let lat = 0;
  let lng = 0;
  for (const [a, b] of polygon) {
    lat += a;
    lng += b;
  }
  return [lat / polygon.length, lng / polygon.length];
}

export function DiscoverMap({
  userLat,
  userLng,
  areaLabel,
  travelers = [],
  title = "Explore",
  focusEventId = null,
  initialLayer = "places",
}: DiscoverMapProps) {
  const router = useRouter();
  const routerRef = useRef(router);
  routerRef.current = router;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const overlaysRef = useRef<L.LayerGroup | null>(null);
  const centerKeyRef = useRef<string | null>(null);
  const focusedEventRef = useRef<string | null>(null);

  const [layer, setLayer] = useState<MapLayer>(initialLayer);
  const [category, setCategory] = useState<PlaceCategoryKey>("top");
  const [liveCoords, setLiveCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [remotePlaces, setRemotePlaces] = useState<Place[] | null>(null);
  const [placesSource, setPlacesSource] = useState<"google" | "mock">("mock");
  const [selectedSectorId, setSelectedSectorId] = useState<string | null>(null);

  const center = useMemo(() => {
    if (liveCoords) return liveCoords;
    if (userLat != null && userLng != null) {
      return { lat: userLat, lng: userLng };
    }
    return DEFAULT_MAP_CENTER;
  }, [liveCoords, userLat, userLng]);

  const sectors = useMemo(
    () => sectorsAround(center.lat, center.lng, category),
    [center.lat, center.lng, category],
  );

  const localPlaces = useMemo(() => {
    const around = placesAround(center.lat, center.lng);
    if (category === "top") return around;
    return around.filter((p) => p.categoryKey === category);
  }, [center.lat, center.lng, category]);

  const places = remotePlaces ?? localPlaces;

  const mapEvents = useMemo(
    () =>
      filterEvents(eventsAround(center.lat, center.lng), "week").slice(0, 12),
    [center.lat, center.lng],
  );

  const selectedSector = sectors.find((s) => s.id === selectedSectorId) ?? null;
  const sectorPlaces = selectedSector
    ? placesInSector(selectedSector, placesAround(center.lat, center.lng))
    : [];

  // Fetch Google Places when key is configured (API falls back to mock).
  useEffect(() => {
    if (layer !== "places") return;
    let cancelled = false;
    const controller = new AbortController();

    async function load() {
      try {
        const res = await fetch(
          `/api/places/nearby?lat=${center.lat}&lng=${center.lng}&category=${category}`,
          { signal: controller.signal },
        );
        if (!res.ok) return;
        const data = (await res.json()) as {
          places: Place[];
          source: "google" | "mock";
        };
        if (cancelled) return;
        setPlacesSource(data.source);
        setRemotePlaces(data.source === "google" ? data.places : null);
      } catch {
        /* keep local mock */
      }
    }

    void load();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [center.lat, center.lng, category, layer]);

  // Create / destroy the map imperatively — avoids react-leaflet remount bugs.
  useEffect(() => {
    const el = containerRef.current;
    if (!el || mapRef.current) return;

    const map = L.map(el, {
      zoomControl: false,
      attributionControl: false,
    }).setView([center.lat, center.lng], 14);

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
      },
    ).addTo(map);

    const overlays = L.layerGroup().addTo(map);
    mapRef.current = map;
    overlaysRef.current = overlays;
    centerKeyRef.current = `${center.lat.toFixed(5)},${center.lng.toFixed(5)}`;

    const resize = () => {
      map.invalidateSize({ animate: false });
    };
    const raf = window.requestAnimationFrame(resize);
    window.addEventListener("resize", resize);

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      map.remove();
      mapRef.current = null;
      overlaysRef.current = null;
      centerKeyRef.current = null;
    };
    // Intentionally mount once; center updates handled below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Geolocation fallback when profile has no coords.
  useEffect(() => {
    if (userLat != null && userLng != null) return;
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLiveCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      () => {
        /* keep default center */
      },
      { enableHighAccuracy: false, timeout: 8000 },
    );
  }, [userLat, userLng]);

  // Focus an event from Events tab deep link.
  useEffect(() => {
    if (!focusEventId || focusedEventRef.current === focusEventId) return;
    const event = mapEvents.find((e) => e.id === focusEventId);
    if (!event) return;
    focusedEventRef.current = focusEventId;
    setLayer("events");
    setSelectedSectorId(null);
    mapRef.current?.setView([event.lat, event.lng], 16, { animate: true });
  }, [focusEventId, mapEvents]);

  // Sync center + overlays when data changes.
  useEffect(() => {
    const map = mapRef.current;
    const overlays = overlaysRef.current;
    if (!map || !overlays) return;

    const key = `${center.lat.toFixed(5)},${center.lng.toFixed(5)}`;
    if (centerKeyRef.current !== key && !focusEventId) {
      centerKeyRef.current = key;
      map.setView([center.lat, center.lng], map.getZoom(), { animate: false });
    }

    overlays.clearLayers();

    L.circleMarker([center.lat, center.lng], {
      radius: 18,
      color: "#7c3aed",
      fillColor: "#8b5cf6",
      fillOpacity: 0.18,
      weight: 0,
    }).addTo(overlays);

    L.circleMarker([center.lat, center.lng], {
      radius: 7,
      color: "#fff",
      fillColor: "#7c3aed",
      fillOpacity: 1,
      weight: 3,
    }).addTo(overlays);

    if (layer === "places") {
      for (const sector of sectors) {
        const fill = sectorFillColor(sector.accent);
        const poly = L.polygon(sector.polygon, {
          color: fill,
          weight: 2,
          opacity: 0.85,
          fillColor: fill,
          fillOpacity: selectedSectorId === sector.id ? 0.28 : 0.14,
        })
          .on("click", () => {
            setSelectedSectorId(sector.id);
            map.fitBounds(poly.getBounds().pad(0.35), { animate: true });
          })
          .addTo(overlays);

        const [clat, clng] = polygonCentroid(sector.polygon);
        L.marker([clat, clng], {
          icon: sectorLabelIcon(sector),
          interactive: true,
        })
          .on("click", () => {
            setSelectedSectorId(sector.id);
            map.fitBounds(poly.getBounds().pad(0.35), { animate: true });
          })
          .addTo(overlays);
      }

      for (const place of places) {
        L.marker([place.lat, place.lng], { icon: placeIcon(place) })
          .on("click", () => {
            routerRef.current.push(`/discover/places/${place.id}?from=explore`);
          })
          .addTo(overlays);
      }

      for (const traveler of travelers) {
        L.marker([traveler.lat, traveler.lng], { icon: personIcon(traveler) })
          .on("click", () => {
            routerRef.current.push(`/discover/${traveler.id}`);
          })
          .addTo(overlays);
      }
    } else {
      for (const event of mapEvents) {
        L.marker([event.lat, event.lng], { icon: eventIcon(event) })
          .on("click", () => {
            routerRef.current.push(`/events/${event.id}?from=explore`);
          })
          .addTo(overlays);
      }
    }

    map.invalidateSize({ animate: false });
  }, [
    center.lat,
    center.lng,
    places,
    travelers,
    sectors,
    layer,
    mapEvents,
    selectedSectorId,
    focusEventId,
  ]);

  function recenter() {
    const fly = (lat: number, lng: number) => {
      setLiveCoords({ lat, lng });
      mapRef.current?.setView([lat, lng], 14, { animate: true });
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fly(pos.coords.latitude, pos.coords.longitude),
        () => fly(center.lat, center.lng),
        { enableHighAccuracy: false, timeout: 8000 },
      );
      return;
    }

    fly(center.lat, center.lng);
  }

  return (
    <div className="relative h-full min-h-0 w-full overflow-hidden bg-[#e8eef3]">
      <div ref={containerRef} className="h-full w-full" />

      <div className="pointer-events-none absolute inset-x-0 top-0 z-[1000] bg-gradient-to-b from-white via-white/70 to-transparent px-5 pb-14 pt-[max(1.25rem,env(safe-area-inset-top))]">
        <div className="pointer-events-auto">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            {title}
          </h1>
          <p className="mt-0.5 text-sm font-medium text-zinc-600">
            {areaLabel || "Near you"}
            {layer === "places" && placesSource === "google" ? (
              <span className="text-zinc-400"> · Google Places</span>
            ) : null}
          </p>

          <div className="mt-3 inline-flex rounded-full bg-white p-1 shadow-sm ring-1 ring-zinc-200">
            {(
              [
                { key: "places", label: "Places" },
                { key: "events", label: "Events" },
              ] as const
            ).map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => {
                  setLayer(item.key);
                  setSelectedSectorId(null);
                }}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-xs font-semibold transition",
                  layer === item.key
                    ? "bg-primary text-white shadow-sm"
                    : "text-zinc-600 hover:text-zinc-900",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={recenter}
        className="absolute bottom-[7.5rem] right-4 z-[1000] flex h-11 w-11 items-center justify-center rounded-full bg-white text-zinc-900 shadow-lg shadow-black/15 ring-1 ring-zinc-200 transition hover:bg-zinc-50"
        aria-label="Center on my location"
      >
        <LocateFixed className="h-5 w-5" />
      </button>

      {selectedSector && layer === "places" ? (
        <div className="absolute inset-x-0 bottom-0 z-[1100] rounded-t-3xl bg-white px-4 pb-4 pt-3 shadow-[0_-8px_30px_rgba(15,23,42,0.12)] ring-1 ring-zinc-200/80">
          <div className="mb-2 flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Popular sector
              </p>
              <h2 className="mt-0.5 text-lg font-bold text-zinc-900">
                <span aria-hidden className="mr-1.5">
                  {selectedSector.emoji}
                </span>
                {selectedSector.name}
              </h2>
              <p className="mt-1 text-sm text-zinc-600">
                {selectedSector.description}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedSectorId(null)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-700"
              aria-label="Close sector"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="mb-2 text-xs font-medium text-zinc-500">
            {selectedSector.label} · {sectorPlaces.length} places
          </p>
          <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-1">
            {sectorPlaces.map((place) => (
              <Link
                key={place.id}
                href={`/discover/places/${place.id}?from=explore`}
                className="w-40 shrink-0 overflow-hidden rounded-2xl bg-zinc-50 ring-1 ring-zinc-200"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={place.photo}
                  alt=""
                  className="h-20 w-full object-cover"
                />
                <div className="p-2.5">
                  <p className="truncate text-sm font-semibold text-zinc-900">
                    {place.name}
                  </p>
                  <p className="truncate text-xs text-zinc-500">
                    {place.emoji} {place.category}
                  </p>
                </div>
              </Link>
            ))}
            {sectorPlaces.length === 0 ? (
              <p className="py-4 text-sm text-zinc-500">
                No curated venues in this sector yet.
              </p>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="absolute inset-x-0 bottom-0 z-[1000] bg-gradient-to-t from-white via-white/95 to-transparent px-3 pb-3 pt-10">
          {layer === "places" ? (
            <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-1">
              {PLACE_CATEGORIES.map((cat) => {
                const active = category === cat.key;
                return (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => {
                      setCategory(cat.key);
                      setSelectedSectorId(null);
                    }}
                    className={cn(
                      "flex shrink-0 flex-col items-center gap-1 rounded-2xl px-3 py-2 text-[11px] font-semibold transition",
                      active
                        ? "bg-primary text-white shadow-md shadow-primary/25"
                        : "bg-white text-zinc-800 shadow-sm ring-1 ring-zinc-200",
                    )}
                  >
                    <span className="text-lg leading-none" aria-hidden>
                      {cat.emoji}
                    </span>
                    {cat.label}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-1">
              {mapEvents.slice(0, 6).map((event) => (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className="w-44 shrink-0 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-zinc-200"
                >
                  <p className="truncate text-sm font-semibold text-zinc-900">
                    {event.emoji} {event.title}
                  </p>
                  <p className="mt-1 truncate text-xs text-zinc-500">
                    {formatEventWhen(event.startsAt)}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
