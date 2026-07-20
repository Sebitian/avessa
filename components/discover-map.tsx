"use client";

import L from "leaflet";
import {
  Clock3,
  LocateFixed,
  MapPinned,
  Search,
  UserRound,
  MapPin,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  ExploreLocationPanel,
  defaultDraftLocation,
  type DraftLocation,
} from "@/components/explore-location-panel";
import {
  eventsAround,
  filterEvents,
  formatEventWhen,
  type CityEvent,
} from "@/lib/events";
import {
  DEFAULT_DISCOVER_RADIUS_M,
  clampDiscoverRadiusM,
  distanceMeters,
  formatRadiusLabel,
  zoomForRadiusMeters,
} from "@/lib/geo";
import {
  DEFAULT_MAP_CENTER,
  DISCOVER_CATEGORIES,
  placesAround,
  placeCategoryLabel,
  type DiscoverCategoryKey,
  type Place,
  type PlaceCategoryKey,
} from "@/lib/mock-data";
import { presenceLabel, type DiscoverTraveler } from "@/lib/presence";
import { upsertCurrentProfile } from "@/lib/profile-client";
import { cn } from "@/lib/utils";

import "leaflet/dist/leaflet.css";

type DiscoverMapProps = {
  userLat?: number | null;
  userLng?: number | null;
  areaLabel?: string | null;
  city?: string | null;
  discoverRadiusM?: number | null;
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

export function DiscoverMap({
  userLat,
  userLng,
  areaLabel,
  city,
  discoverRadiusM,
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
  const radiusCircleRef = useRef<L.Circle | null>(null);
  const centerKeyRef = useRef<string | null>(null);
  const focusedEventRef = useRef<string | null>(null);
  const placingRef = useRef(false);
  const ignoreMoveEndRef = useRef(false);
  const placeOnMapRef = useRef<(lat: number, lng: number) => Promise<void>>(
    async () => {},
  );
  const [fitToken, setFitToken] = useState(0);
  const [mapPanning, setMapPanning] = useState(false);

  type FocusTarget = {
    kind: "person" | "place" | "event";
    id: string;
    lat: number;
    lng: number;
  };

  const [category, setCategory] =
    useState<DiscoverCategoryKey>(initialCategory);
  const [showPeople, setShowPeople] = useState(true);
  const [query, setQuery] = useState("");
  const [focusTarget, setFocusTarget] = useState<FocusTarget | null>(null);
  const [remotePlaces, setRemotePlaces] = useState<Place[] | null>(null);
  const [locationOpen, setLocationOpen] = useState(false);
  const [savingLocation, setSavingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [draft, setDraft] = useState<DraftLocation>(() =>
    defaultDraftLocation({
      lat: userLat ?? DEFAULT_MAP_CENTER.lat,
      lng: userLng ?? DEFAULT_MAP_CENTER.lng,
      areaLabel,
      city,
      radiusM: discoverRadiusM,
    }),
  );

  const radiusM = clampDiscoverRadiusM(
    discoverRadiusM ?? DEFAULT_DISCOVER_RADIUS_M,
  );

  useEffect(() => {
    if (locationOpen) return;
    setDraft(
      defaultDraftLocation({
        lat: userLat ?? DEFAULT_MAP_CENTER.lat,
        lng: userLng ?? DEFAULT_MAP_CENTER.lng,
        areaLabel,
        city,
        radiusM: discoverRadiusM,
      }),
    );
  }, [userLat, userLng, areaLabel, city, discoverRadiusM, locationOpen]);

  useEffect(() => {
    placingRef.current = locationOpen;
  }, [locationOpen]);

  const showingEvents = category === "events";
  const placeCategory: PlaceCategoryKey =
    category === "events" ? "top" : category;
  const needle = query.trim().toLowerCase();

  const center = useMemo(() => {
    if (locationOpen) {
      return { lat: draft.lat, lng: draft.lng };
    }
    if (userLat != null && userLng != null) {
      return { lat: userLat, lng: userLng };
    }
    return DEFAULT_MAP_CENTER;
  }, [userLat, userLng, locationOpen, draft.lat, draft.lng]);

  const activeRadiusM = locationOpen ? draft.radiusM : radiusM;

  async function openLocationPicker() {
    setLocationError(null);
    setFocusTarget(null);
    setDraft(
      defaultDraftLocation({
        lat: userLat ?? DEFAULT_MAP_CENTER.lat,
        lng: userLng ?? DEFAULT_MAP_CENTER.lng,
        areaLabel,
        city,
        radiusM: discoverRadiusM,
      }),
    );
    setFitToken((n) => n + 1);
    setLocationOpen(true);
  }

  function updateDraftLocation(next: DraftLocation, opts?: { fit?: boolean }) {
    if (opts?.fit) {
      const moved =
        distanceMeters(draft.lat, draft.lng, next.lat, next.lng) > 25;
      if (moved) setFitToken((n) => n + 1);
    }
    setDraft(next);
  }

  async function placeOnMap(lat: number, lng: number) {
    setDraft((prev) => ({
      ...prev,
      lat,
      lng,
    }));
    try {
      const res = await fetch(
        `/api/places/geocode?lat=${lat}&lng=${lng}`,
      );
      if (!res.ok) throw new Error("Could not read that spot");
      const data = (await res.json()) as {
        location: {
          lat: number;
          lng: number;
          areaLabel: string;
          currentCity: string;
        };
      };
      setDraft((prev) => ({
        ...prev,
        lat,
        lng,
        areaLabel: data.location.areaLabel,
        currentCity: data.location.currentCity,
      }));
    } catch {
      setDraft((prev) => ({
        ...prev,
        lat,
        lng,
        areaLabel: "Pinned location",
      }));
    }
  }

  placeOnMapRef.current = placeOnMap;

  async function saveLocation() {
    setSavingLocation(true);
    setLocationError(null);
    setRemotePlaces(null);
    try {
      await upsertCurrentProfile({
        current_city: draft.currentCity,
        approx_lat: draft.lat,
        approx_lng: draft.lng,
        area_label: draft.areaLabel,
        discover_radius_m: clampDiscoverRadiusM(draft.radiusM),
      });
      setLocationOpen(false);
      router.refresh();
    } catch (err: unknown) {
      setLocationError(
        err instanceof Error ? err.message : "Could not save location",
      );
    } finally {
      setSavingLocation(false);
    }
  }

  const placesPool = useMemo(() => {
    const around = remotePlaces ?? placesAround(center.lat, center.lng);
    return [...around]
      .filter(
        (p) =>
          distanceMeters(center.lat, center.lng, p.lat, p.lng) <=
          activeRadiusM,
      )
      .sort(
        (a, b) =>
          distanceMeters(center.lat, center.lng, a.lat, a.lng) -
          distanceMeters(center.lat, center.lng, b.lat, b.lng),
      );
  }, [remotePlaces, center.lat, center.lng, activeRadiusM]);

  const places = useMemo(() => {
    if (showingEvents) return [];
    const byCategory =
      placeCategory === "top"
        ? placesPool
        : placesPool.filter((p) => p.categoryKey === placeCategory);
    const ranked = needle
      ? byCategory.filter((p) => {
          const hay = [p.name, p.tagline, p.neighborhood, placeCategoryLabel(p)]
            .join(" ")
            .toLowerCase();
          return hay.includes(needle);
        })
      : byCategory;
    let list = ranked.slice(0, placeCategory === "top" ? 8 : 10);

    // Keep a search-selected place pinned on the map.
    if (focusTarget?.kind === "place") {
      const pinned = placesPool.find((p) => p.id === focusTarget.id);
      if (pinned && !list.some((p) => p.id === pinned.id)) {
        list = [pinned, ...list].slice(0, 12);
      }
    }
    return list;
  }, [placesPool, placeCategory, showingEvents, needle, focusTarget]);

  const mapEvents = useMemo(() => {
    const week = filterEvents(eventsAround(center.lat, center.lng), "week").filter(
      (e) =>
        distanceMeters(center.lat, center.lng, e.lat, e.lng) <= activeRadiusM,
    );
    const filtered = needle
      ? week.filter((e) => {
          const hay = [e.title, e.venue, e.neighborhood, e.label]
            .join(" ")
            .toLowerCase();
          return hay.includes(needle);
        })
      : week;
    let list = filtered.slice(0, 6);
    if (focusTarget?.kind === "event") {
      const pinned = week.find((e) => e.id === focusTarget.id);
      if (pinned && !list.some((e) => e.id === pinned.id)) {
        list = [pinned, ...list].slice(0, 8);
      }
    }
    return list;
  }, [center.lat, center.lng, needle, focusTarget, activeRadiusM]);

  const nearbyPeople = useMemo(() => {
    if (!showPeople || showingEvents) return [];
    const inRadius = travelers.filter((t) => {
      const d = distanceMeters(center.lat, center.lng, t.lat, t.lng);
      if (d > activeRadiusM) return false;
      // Respect their visibility radius when set (mutual area).
      const theirRadius = t.discoverRadiusM;
      if (
        theirRadius != null &&
        Number.isFinite(theirRadius) &&
        d > theirRadius
      ) {
        return false;
      }
      return true;
    });
    const ranked = [...inRadius].sort(
      (a, b) =>
        distanceMeters(center.lat, center.lng, a.lat, a.lng) -
        distanceMeters(center.lat, center.lng, b.lat, b.lng),
    );
    const filtered = needle
      ? ranked.filter((t) => {
          const hay = [
            t.firstName,
            t.nationality,
            t.area,
            t.city,
            ...(t.interests ?? []),
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
          return hay.includes(needle);
        })
      : ranked;
    let list = filtered.slice(0, needle ? 12 : 8);

    // Keep a search-selected person pinned on the map.
    if (focusTarget?.kind === "person") {
      const pinned = travelers.find((t) => t.id === focusTarget.id);
      if (pinned && !list.some((t) => t.id === pinned.id)) {
        list = [pinned, ...list].slice(0, 12);
      }
    }
    return list;
  }, [
    travelers,
    showPeople,
    showingEvents,
    center.lat,
    center.lng,
    needle,
    focusTarget,
    activeRadiusM,
  ]);

  const searchHits = useMemo(() => {
    if (!needle) return [] as Array<
      | { kind: "person"; id: string; label: string; meta: string; lat: number; lng: number; href: string }
      | { kind: "place"; id: string; label: string; meta: string; lat: number; lng: number; href: string }
      | { kind: "event"; id: string; label: string; meta: string; lat: number; lng: number; href: string }
    >;

    const peopleHits = travelers
      .filter((t) => {
        const hay = [
          t.firstName,
          t.nationality,
          t.area,
          t.city,
          ...(t.interests ?? []),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return hay.includes(needle);
      })
      .slice(0, 5)
      .map((t) => ({
        kind: "person" as const,
        id: t.id,
        label: t.firstName,
        meta: presenceLabel(t) || t.area,
        lat: t.lat,
        lng: t.lng,
        href: `/discover/${t.id}`,
      }));

    const placeHits = placesPool
      .filter((p) => {
        const hay = [p.name, p.tagline, p.neighborhood, placeCategoryLabel(p)]
          .join(" ")
          .toLowerCase();
        return hay.includes(needle);
      })
      .slice(0, 5)
      .map((p) => ({
        kind: "place" as const,
        id: p.id,
        label: p.name,
        meta: placeCategoryLabel(p),
        lat: p.lat,
        lng: p.lng,
        href: `/discover/places/${p.id}?from=explore`,
      }));

    const eventHits = filterEvents(eventsAround(center.lat, center.lng), "week")
      .filter((e) => {
        const hay = [e.title, e.venue, e.neighborhood, e.label]
          .join(" ")
          .toLowerCase();
        return hay.includes(needle);
      })
      .slice(0, 3)
      .map((e) => ({
        kind: "event" as const,
        id: e.id,
        label: e.title,
        meta: e.label,
        lat: e.lat,
        lng: e.lng,
        href: `/events/${e.id}?from=explore`,
      }));

    return [...peopleHits, ...placeHits, ...eventHits];
  }, [needle, travelers, placesPool, center.lat, center.lng]);

  // Fetch Google Places when key is configured (API falls back to mock).
  useEffect(() => {
    if (showingEvents) return;
    let cancelled = false;
    const controller = new AbortController();

    async function load() {
      try {
        const res = await fetch(
          `/api/places/nearby?lat=${center.lat}&lng=${center.lng}&category=${placeCategory}&radius=${activeRadiusM}`,
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
  }, [center.lat, center.lng, placeCategory, showingEvents, activeRadiusM]);

  // Create / destroy the map imperatively — avoids react-leaflet remount bugs.
  useEffect(() => {
    const el = containerRef.current;
    if (!el || mapRef.current) return;

    const map = L.map(el, {
      zoomControl: false,
      attributionControl: false,
    }).setView([center.lat, center.lng], zoomForRadiusMeters(radiusM));

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
      try {
        map.stop();
        map.off();
        map.remove();
      } catch {
        /* map already torn down */
      }
      mapRef.current = null;
      overlaysRef.current = null;
      radiusCircleRef.current = null;
      centerKeyRef.current = null;
    };
    // Intentionally mount once; center updates handled below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Uber-style: fixed center pin + pan the map underneath.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!locationOpen) {
      if (radiusCircleRef.current) {
        try {
          map.removeLayer(radiusCircleRef.current);
        } catch {
          /* ignore */
        }
        radiusCircleRef.current = null;
      }
      setMapPanning(false);
      return;
    }

    const centerLatLng = L.latLng(draft.lat, draft.lng);
    if (!radiusCircleRef.current) {
      radiusCircleRef.current = L.circle(centerLatLng, {
        radius: draft.radiusM,
        color: "#7c3aed",
        fillColor: "#8b5cf6",
        fillOpacity: 0.14,
        weight: 2,
        opacity: 0.8,
        interactive: false,
      }).addTo(map);
    } else {
      radiusCircleRef.current.setRadius(draft.radiusM);
    }

    const onMove = () => {
      if (!placingRef.current) return;
      setMapPanning(true);
      radiusCircleRef.current?.setLatLng(map.getCenter());
    };

    const onMoveEnd = () => {
      if (!placingRef.current) return;
      setMapPanning(false);
      if (ignoreMoveEndRef.current) {
        ignoreMoveEndRef.current = false;
        return;
      }
      const c = map.getCenter();
      void placeOnMapRef.current(c.lat, c.lng);
    };

    map.on("movestart", onMove);
    map.on("move", onMove);
    map.on("moveend", onMoveEnd);

    return () => {
      map.off("movestart", onMove);
      map.off("move", onMove);
      map.off("moveend", onMoveEnd);
    };
    // draft.radiusM updates circle size; lat/lng driven by map pan / fitToken
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationOpen, draft.radiusM]);

  // Fly map when opening or after a search pick.
  useEffect(() => {
    if (!locationOpen || fitToken === 0) return;
    const map = mapRef.current;
    if (!map) return;
    try {
      ignoreMoveEndRef.current = true;
      map.stop();
      map.setView(
        [draft.lat, draft.lng],
        zoomForRadiusMeters(draft.radiusM),
        { animate: true },
      );
      radiusCircleRef.current?.setLatLng([draft.lat, draft.lng]);
      // Geocode after programmatic move (moveend ignored once).
      void placeOnMapRef.current(draft.lat, draft.lng);
    } catch {
      ignoreMoveEndRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fitToken gates intentional camera moves
  }, [fitToken, locationOpen]);

  // Focus an event deep link from an event profile.
  useEffect(() => {
    if (!focusEventId || focusedEventRef.current === focusEventId) return;
    const event = mapEvents.find((e) => e.id === focusEventId);
    if (!event) return;
    focusedEventRef.current = focusEventId;
    setCategory("events");
    setFocusTarget({
      kind: "event",
      id: event.id,
      lat: event.lat,
      lng: event.lng,
    });
  }, [focusEventId, mapEvents]);

  // Fly to a search / deep-link target without navigating away.
  useEffect(() => {
    if (!focusTarget) return;
    const map = mapRef.current;
    if (!map) return;
    try {
      map.stop();
      map.setView([focusTarget.lat, focusTarget.lng], 16, { animate: true });
    } catch {
      /* ignore mid-teardown */
    }
  }, [focusTarget]);

  // Sync center + overlays when data changes.
  useEffect(() => {
    const map = mapRef.current;
    const overlays = overlaysRef.current;
    if (!map || !overlays) return;

    try {
      // Never call map.stop() while the user is panning to place a pin.
      if (!locationOpen) {
        map.stop();
      }

      const key = `${center.lat.toFixed(5)},${center.lng.toFixed(5)}`;
      if (
        !locationOpen &&
        centerKeyRef.current !== key &&
        !focusEventId &&
        !focusTarget
      ) {
        centerKeyRef.current = key;
        map.setView([center.lat, center.lng], map.getZoom(), { animate: false });
      }

      overlays.clearLayers();

      if (!locationOpen) {
        L.circle([center.lat, center.lng], {
          radius: activeRadiusM,
          color: "#7c3aed",
          fillColor: "#8b5cf6",
          fillOpacity: 0.08,
          weight: 1.25,
          opacity: 0.75,
          interactive: false,
        }).addTo(overlays);

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
      }

      // Keep the map clear while adjusting the pin (Uber-style).
      if (!locationOpen) {
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
                routerRef.current.push(
                  `/discover/places/${place.id}?from=explore`,
                );
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
      }

      map.invalidateSize({ animate: false });
    } catch {
      /* Leaflet can throw _leaflet_pos if mid-unmount */
    }
  }, [
    center.lat,
    center.lng,
    places,
    nearbyPeople,
    showingEvents,
    mapEvents,
    focusEventId,
    focusTarget,
    activeRadiusM,
    locationOpen,
  ]);

  /** Recenter on the user’s chosen area — not live GPS. */
  function recenterOnCity() {
    setFocusTarget(null);
    const map = mapRef.current;
    if (!map) return;
    try {
      map.stop();
      map.setView(
        [center.lat, center.lng],
        zoomForRadiusMeters(activeRadiusM),
        { animate: true },
      );
    } catch {
      /* ignore */
    }
  }

  /** Search picks pin on the map first — bubble click opens the profile. */
  function focusHit(hit: (typeof searchHits)[number]) {
    if (hit.kind === "event") {
      setCategory("events");
    } else {
      if (showingEvents) setCategory("top");
      if (hit.kind === "person") setShowPeople(true);
    }
    setFocusTarget({
      kind: hit.kind,
      id: hit.id,
      lat: hit.lat,
      lng: hit.lng,
    });
    setQuery("");
  }

  return (
    <div className="relative h-full min-h-0 w-full overflow-hidden bg-[#e8eef3]">
      <div ref={containerRef} className="h-full w-full" />

      {/* Fixed center pin — drag/pan the map underneath (Uber-style). */}
      {locationOpen ? (
        <div
          className="pointer-events-none absolute inset-0 z-[900] flex items-center justify-center"
          aria-hidden
        >
          <div
            className={cn(
              "avessa-uber-pin avessa-uber-pin--fixed",
              mapPanning && "is-dragging",
            )}
          >
            <div className="avessa-uber-pin__head">
              <span className="avessa-uber-pin__dot" />
            </div>
            <div className="avessa-uber-pin__shadow" />
          </div>
        </div>
      ) : null}

      {/* Search + select-location chip + recenter */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[1000] px-3 pt-[max(0.85rem,env(safe-area-inset-top))]">
        <div className="pointer-events-auto flex items-start gap-2">
          <div className="relative min-w-0 flex-1">
            <label className="relative block">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
                aria-hidden
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search people or places…"
                className="h-11 w-full rounded-xl border border-zinc-200/90 bg-white/95 pl-9 pr-3 text-sm text-zinc-900 shadow-md shadow-black/10 outline-none backdrop-blur-sm placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-1 focus:ring-zinc-300"
              />
            </label>

            {needle && !locationOpen ? (
              <div className="absolute inset-x-0 top-[calc(100%+0.4rem)] max-h-64 overflow-y-auto rounded-xl bg-white/98 shadow-lg ring-1 ring-zinc-200/90 backdrop-blur-sm">
                {searchHits.length === 0 ? (
                  <p className="px-3.5 py-3 text-sm text-zinc-500">
                    No people or places match “{query.trim()}”
                  </p>
                ) : (
                  <ul className="divide-y divide-zinc-100 py-1">
                    {searchHits.map((hit) => (
                      <li key={`${hit.kind}-${hit.id}`}>
                        <button
                          type="button"
                          onClick={() => focusHit(hit)}
                          className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left transition hover:bg-zinc-50"
                        >
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-600">
                            {hit.kind === "person" ? (
                              <UserRound className="h-4 w-4" aria-hidden />
                            ) : (
                              <MapPin className="h-4 w-4" aria-hidden />
                            )}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold text-zinc-900">
                              {hit.label}
                            </span>
                            <span className="block truncate text-xs text-zinc-500">
                              {hit.kind === "person"
                                ? `Person · ${hit.meta}`
                                : hit.kind === "event"
                                  ? `Event · ${hit.meta}`
                                  : `Place · ${hit.meta}`}
                            </span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => void openLocationPicker()}
            className={cn(
              "flex h-11 max-w-[10.5rem] shrink-0 items-center gap-1.5 rounded-xl border border-zinc-200/90 bg-white/95 px-2.5 text-left shadow-md shadow-black/10 backdrop-blur-sm transition hover:bg-white",
              locationOpen && "ring-2 ring-violet-400/60",
            )}
            aria-label="Select location on map"
            title="Select location on map"
          >
            <MapPinned className="h-4 w-4 shrink-0 text-violet-600" />
            <span className="min-w-0">
              <span className="block truncate text-[11px] font-semibold leading-tight text-zinc-900">
                {(locationOpen ? draft.areaLabel : areaLabel) ||
                  city ||
                  "Location"}
              </span>
              <span className="block truncate text-[10px] leading-tight text-zinc-500">
                {formatRadiusLabel(activeRadiusM)}
              </span>
            </span>
          </button>

          <button
            type="button"
            onClick={recenterOnCity}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/95 text-zinc-800 shadow-md shadow-black/10 ring-1 ring-black/5 backdrop-blur-sm transition hover:bg-white"
            aria-label="Center map on my area"
            title="Center on my area"
          >
            <LocateFixed className="h-[18px] w-[18px]" />
          </button>
        </div>
      </div>

      <ExploreLocationPanel
        open={locationOpen}
        onClose={() => {
          setLocationOpen(false);
          setLocationError(null);
        }}
        draft={draft}
        onDraftChange={(next) => updateDraftLocation(next, { fit: true })}
        biasLat={center.lat}
        biasLng={center.lng}
        saving={savingLocation}
        error={locationError}
        onSave={() => void saveLocation()}
      />

      {locationOpen ? (
        <div className="pointer-events-none absolute inset-x-0 top-[42%] z-[901] flex justify-center">
          <span className="rounded-full bg-zinc-900/80 px-3 py-1 text-[11px] font-medium text-white shadow-md backdrop-blur-sm">
            Drag the map to move the pin
          </span>
        </div>
      ) : null}

      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 bottom-0 z-[1000] bg-gradient-to-t from-white via-white/80 to-transparent px-3 pb-3 pt-16",
          locationOpen && "hidden",
        )}
      >
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
                {areaLabel} · {formatRadiusLabel(radiusM)}
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
