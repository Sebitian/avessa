"use client";

import L from "leaflet";
import { Clock3, LocateFixed } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  DEFAULT_MAP_CENTER,
  DISCOVER_CATEGORIES,
  placesAround,
  type DiscoverCategoryKey,
  type Place,
  type PlaceCategoryKey,
} from "@/lib/mock-data";
import {
  eventsAround,
  filterEvents,
  formatEventWhen,
  type CityEvent,
} from "@/lib/events";
import { presenceLabel, type DiscoverTraveler } from "@/lib/presence";
import { cn } from "@/lib/utils";

import "leaflet/dist/leaflet.css";

type DiscoverMapProps = {
  userLat?: number | null;
  userLng?: number | null;
  areaLabel?: string | null;
  travelers?: DiscoverTraveler[];
  title?: string;
  focusEventId?: string | null;
  initialCategory?: DiscoverCategoryKey;
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

/** Figma-style: emoji pin + tiny name / tagline (no big cards). */
function placeIcon(place: Place) {
  const accent = place.accent ? ACCENT_DOT[place.accent] : "#a78bfa";
  const tag = place.tagline || place.category || "";
  return L.divIcon({
    className: "avessa-place-marker",
    html: `
      <div class="avessa-place-chip">
        <div class="avessa-place-chip__pin">${place.emoji}</div>
        <div class="avessa-place-chip__copy">
          <div class="avessa-place-chip__name">
            <span class="avessa-place-chip__dot" style="background:${accent}"></span>
            ${escapeHtml(place.name)}
          </div>
          <div class="avessa-place-chip__tag">${escapeHtml(tag)}</div>
        </div>
      </div>
    `,
    iconSize: [168, 40],
    iconAnchor: [18, 20],
  });
}

function eventIcon(event: CityEvent) {
  return L.divIcon({
    className: "avessa-event-marker",
    html: `
      <div class="avessa-place-chip">
        <div class="avessa-place-chip__pin avessa-place-chip__pin--event">${event.emoji}</div>
        <div class="avessa-place-chip__copy">
          <div class="avessa-place-chip__name">${escapeHtml(event.title)}</div>
          <div class="avessa-place-chip__tag">${escapeHtml(event.label)}</div>
        </div>
      </div>
    `,
    iconSize: [168, 40],
    iconAnchor: [18, 20],
  });
}

/** Small avatar + tiny name — same scale as place chips. */
function personIcon(traveler: DiscoverTraveler) {
  const initial = escapeHtml(traveler.firstName.charAt(0).toUpperCase());
  const meta = escapeHtml(presenceLabel(traveler));
  const avatar =
    traveler.avatarUrl ||
    `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(traveler.id)}`;
  const onlineDot = traveler.online
    ? `<span class="avessa-person-chip__online" aria-hidden="true"></span>`
    : "";

  return L.divIcon({
    className: "avessa-person-marker",
    html: `
      <div class="avessa-person-chip">
        <div class="avessa-person-chip__avatar">
          <img src="${escapeHtml(avatar)}" alt="" />
          <span class="avessa-person-chip__fallback">${initial}</span>
          ${onlineDot}
        </div>
        <div class="avessa-person-chip__copy">
          <div class="avessa-person-chip__name">${escapeHtml(traveler.firstName)}</div>
          ${
            meta
              ? `<div class="avessa-person-chip__meta${traveler.online ? " is-online" : ""}">${meta}</div>`
              : ""
          }
        </div>
      </div>
    `,
    iconSize: [140, 36],
    iconAnchor: [16, 18],
  });
}

function distanceSq(
  aLat: number,
  aLng: number,
  bLat: number,
  bLng: number,
) {
  const dLat = aLat - bLat;
  const dLng = aLng - bLng;
  return dLat * dLat + dLng * dLng;
}

export function DiscoverMap({
  userLat,
  userLng,
  areaLabel,
  travelers = [],
  title: _title = "Explore",
  focusEventId = null,
  initialCategory = "top",
}: DiscoverMapProps) {
  const router = useRouter();
  const routerRef = useRef(router);
  routerRef.current = router;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const overlaysRef = useRef<L.LayerGroup | null>(null);
  const centerKeyRef = useRef<string | null>(null);
  const focusedEventRef = useRef<string | null>(null);

  const [category, setCategory] =
    useState<DiscoverCategoryKey>(initialCategory);
  const [showPeople, setShowPeople] = useState(true);
  const [liveCoords, setLiveCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [remotePlaces, setRemotePlaces] = useState<Place[] | null>(null);

  const showingEvents = category === "events";
  const placeCategory: PlaceCategoryKey =
    category === "events" ? "top" : category;

  const center = useMemo(() => {
    if (liveCoords) return liveCoords;
    if (userLat != null && userLng != null) {
      return { lat: userLat, lng: userLng };
    }
    return DEFAULT_MAP_CENTER;
  }, [liveCoords, userLat, userLng]);

  const localPlaces = useMemo(() => {
    if (showingEvents) return [];
    const around = placesAround(center.lat, center.lng);
    if (placeCategory === "top") return around;
    return around.filter((p) => p.categoryKey === placeCategory);
  }, [center.lat, center.lng, placeCategory, showingEvents]);

  const places = useMemo(() => {
    const source = remotePlaces ?? localPlaces;
    const ranked = [...source].sort(
      (a, b) =>
        distanceSq(center.lat, center.lng, a.lat, a.lng) -
        distanceSq(center.lat, center.lng, b.lat, b.lng),
    );
    return ranked.slice(0, placeCategory === "top" ? 8 : 10);
  }, [remotePlaces, localPlaces, center.lat, center.lng, placeCategory]);

  const mapEvents = useMemo(
    () =>
      filterEvents(eventsAround(center.lat, center.lng), "week").slice(0, 6),
    [center.lat, center.lng],
  );

  const nearbyPeople = useMemo(() => {
    if (!showPeople || showingEvents) return [];
    return [...travelers]
      .sort(
        (a, b) =>
          distanceSq(center.lat, center.lng, a.lat, a.lng) -
          distanceSq(center.lat, center.lng, b.lat, b.lng),
      )
      .slice(0, 6);
  }, [travelers, showPeople, showingEvents, center.lat, center.lng]);

  // Fetch Google Places when key is configured (API falls back to mock).
  useEffect(() => {
    if (showingEvents) return;
    let cancelled = false;
    const controller = new AbortController();

    async function load() {
      try {
        const res = await fetch(
          `/api/places/nearby?lat=${center.lat}&lng=${center.lng}&category=${placeCategory}`,
          { signal: controller.signal },
        );
        if (!res.ok) return;
        const data = (await res.json()) as {
          places: Place[];
          source: "google" | "mock";
        };
        if (cancelled) return;
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
  }, [center.lat, center.lng, placeCategory, showingEvents]);

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

  // Focus an event deep link from an event profile.
  useEffect(() => {
    if (!focusEventId || focusedEventRef.current === focusEventId) return;
    const event = mapEvents.find((e) => e.id === focusEventId);
    if (!event) return;
    focusedEventRef.current = focusEventId;
    setCategory("events");
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
      fillOpacity: 0.16,
      weight: 0,
    }).addTo(overlays);

    L.circleMarker([center.lat, center.lng], {
      radius: 7,
      color: "#fff",
      fillColor: "#7c3aed",
      fillOpacity: 1,
      weight: 3,
    }).addTo(overlays);

    if (showingEvents) {
      for (const event of mapEvents) {
        L.marker([event.lat, event.lng], { icon: eventIcon(event) })
          .on("click", () => {
            routerRef.current.push(`/events/${event.id}?from=explore`);
          })
          .addTo(overlays);
      }
    } else {
      for (const place of places) {
        L.marker([place.lat, place.lng], {
          icon: placeIcon(place),
          zIndexOffset: 80,
        })
          .on("click", () => {
            routerRef.current.push(`/discover/places/${place.id}?from=explore`);
          })
          .addTo(overlays);
      }

      for (const traveler of nearbyPeople) {
        L.marker([traveler.lat, traveler.lng], {
          icon: personIcon(traveler),
          zIndexOffset: 120,
        })
          .on("click", () => {
            routerRef.current.push(`/discover/${traveler.id}`);
          })
          .addTo(overlays);
      }
    }

    map.invalidateSize({ animate: false });
  }, [
    center.lat,
    center.lng,
    places,
    nearbyPeople,
    showingEvents,
    mapEvents,
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

      {/* Quiet top chrome — locate only, like Figma */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[1000] flex items-start justify-end px-4 pt-[max(0.85rem,env(safe-area-inset-top))]">
        <button
          type="button"
          onClick={recenter}
          className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-zinc-800 shadow-md shadow-black/10 ring-1 ring-black/5 backdrop-blur-sm transition hover:bg-white"
          aria-label="Center on my location"
        >
          <LocateFixed className="h-[18px] w-[18px]" />
        </button>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1000] bg-gradient-to-t from-white via-white/80 to-transparent px-3 pb-3 pt-16">
        <div className="pointer-events-auto space-y-2.5">
          <div className="flex gap-2 px-0.5">
            {!showingEvents ? (
              <button
                type="button"
                onClick={() => setShowPeople((v) => !v)}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium shadow-sm ring-1 transition",
                  showPeople
                    ? "bg-white/95 text-zinc-800 ring-zinc-200/80"
                    : "bg-zinc-100/90 text-zinc-500 ring-zinc-200/70",
                )}
              >
                {showPeople ? "everyone" : "places only"}
              </button>
            ) : null}
            <span className="inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-medium text-zinc-700 shadow-sm ring-1 ring-zinc-200/80">
              <Clock3 className="h-3 w-3 text-zinc-500" />
              {showingEvents ? "this week" : "open now"}
            </span>
            {areaLabel ? (
              <span className="inline-flex items-center rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-medium text-zinc-500 shadow-sm ring-1 ring-zinc-200/70">
                {areaLabel}
              </span>
            ) : null}
          </div>

          <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-0.5">
            {DISCOVER_CATEGORIES.map((cat) => {
              const active = category === cat.key;
              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setCategory(cat.key)}
                  className={cn(
                    "flex shrink-0 flex-col items-center gap-0.5 rounded-2xl px-2.5 py-1.5 text-[10px] font-medium capitalize transition",
                    active
                      ? "bg-white text-zinc-900 shadow-md shadow-black/10 ring-1 ring-zinc-200"
                      : "bg-white/80 text-zinc-600 shadow-sm ring-1 ring-zinc-200/70 hover:bg-white",
                  )}
                >
                  <span className="text-[1.35rem] leading-none" aria-hidden>
                    {cat.emoji}
                  </span>
                  {cat.label}
                </button>
              );
            })}
          </div>

          {showingEvents ? (
            <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-0.5">
              {mapEvents.map((event) => (
                <Link
                  key={event.id}
                  href={`/events/${event.id}?from=explore`}
                  className="w-40 shrink-0 rounded-2xl bg-white/95 p-2.5 shadow-sm ring-1 ring-zinc-200/80 backdrop-blur-sm"
                >
                  <p className="truncate text-[12px] font-semibold text-zinc-900">
                    {event.emoji} {event.title}
                  </p>
                  <p className="mt-0.5 truncate text-[10px] text-zinc-500">
                    {formatEventWhen(event.startsAt)}
                  </p>
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
