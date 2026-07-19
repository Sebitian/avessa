"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import {
  CITY_EVENTS,
  formatEventWhen,
  isTonight,
} from "@/lib/events";
import {
  DISCOVER_CATEGORIES,
  PLACES,
  SAFETY_TIP,
  placeCategoryLabel,
  type DiscoverCategoryKey,
  type PlaceCategoryKey,
} from "@/lib/mock-data";
import { presenceLabel, type DiscoverTraveler } from "@/lib/presence";
import { cn } from "@/lib/utils";

type DiscoverFeedProps = {
  areaLabel?: string | null;
  city?: string | null;
  travelers: DiscoverTraveler[];
};

function avatarFor(traveler: DiscoverTraveler) {
  return (
    traveler.avatarUrl ||
    `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(traveler.id)}`
  );
}

function parseCategory(value: string | null): DiscoverCategoryKey {
  if (
    value &&
    DISCOVER_CATEGORIES.some((c) => c.key === value)
  ) {
    return value as DiscoverCategoryKey;
  }
  return "top";
}

export function DiscoverFeed({
  areaLabel,
  city,
  travelers,
}: DiscoverFeedProps) {
  const searchParams = useSearchParams();
  const [category, setCategory] = useState<DiscoverCategoryKey>(() =>
    parseCategory(searchParams.get("category")),
  );

  const location = areaLabel || city || "Near you";

  const places = useMemo(() => {
    if (category === "events") return [];
    if (category === "top") return PLACES;
    return PLACES.filter((p) => p.categoryKey === (category as PlaceCategoryKey));
  }, [category]);

  const events = useMemo(() => {
    if (category !== "events" && category !== "top") return [];
    return CITY_EVENTS;
  }, [category]);

  const showingEvents = category === "events";

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-background">
      <header className="safe-top px-5 pb-3">
        <h1 className="text-2xl font-bold tracking-tight">Discover</h1>
        <p className="mt-1 text-sm text-muted-foreground">{location}</p>
      </header>

      <div className="scrollbar-hide flex gap-2 overflow-x-auto px-5 pb-4">
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
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                  : "bg-card text-muted-foreground shadow-sm ring-1 ring-border",
              )}
            >
              <span className="text-[1.25rem] leading-none" aria-hidden>
                {cat.emoji}
              </span>
              {cat.label}
            </button>
          );
        })}
      </div>

      {!showingEvents ? (
        <section className="px-5 pb-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold">Nearby Travelers</h2>
            <span className="text-xs text-muted-foreground">
              {travelers.length > 0
                ? `${travelers.length} around you`
                : "Nobody nearby yet"}
            </span>
          </div>
          {travelers.length > 0 ? (
            <div className="scrollbar-hide -mx-5 flex gap-3 overflow-x-auto px-5">
              {travelers.map((traveler) => (
                <Link
                  key={traveler.id}
                  href={`/discover/${traveler.id}`}
                  className="w-36 shrink-0 overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-border/60 transition hover:ring-primary/40"
                >
                  <div className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={avatarFor(traveler)}
                      alt=""
                      className="h-40 w-full object-cover"
                    />
                    {traveler.online ? (
                      <span
                        className="absolute bottom-2 right-2 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-white"
                        aria-label="Online"
                        title="Online"
                      />
                    ) : null}
                  </div>
                  <div className="p-3">
                    <p className="truncate text-sm font-semibold">
                      {traveler.firstName}
                      {traveler.age != null ? (
                        <span className="font-normal text-muted-foreground">
                          , {traveler.age}
                        </span>
                      ) : null}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-muted-foreground">
                      {traveler.online ? (
                        <>
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                          <span className="font-medium text-emerald-700">
                            Online
                          </span>
                        </>
                      ) : (
                        <span className="truncate">
                          {presenceLabel(traveler)}
                        </span>
                      )}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="rounded-2xl bg-muted/60 px-4 py-3 text-sm text-muted-foreground">
              When other travelers share a location nearby, they show up here.
            </p>
          )}
        </section>
      ) : null}

      {showingEvents ? (
        <section className="flex flex-col gap-3 px-5 pb-8">
          <div className="mb-1 flex items-center justify-between">
            <h2 className="text-base font-semibold">Events near you</h2>
            <span className="text-xs text-muted-foreground">
              {events.length} coming up
            </span>
          </div>
          {events.map((event) => (
            <Link
              key={event.id}
              href={`/events/${event.id}?from=discover`}
              className="overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-border/60 transition hover:ring-primary/40"
            >
              <div className="flex">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={event.photo}
                  alt=""
                  className="h-28 w-24 shrink-0 object-cover"
                />
                <div className="flex min-w-0 flex-1 flex-col justify-center p-3.5">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-xs font-semibold capitalize text-primary">
                      {event.emoji} {event.label}
                    </span>
                    {isTonight(event.startsAt) ? (
                      <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-accent-foreground">
                        Tonight
                      </span>
                    ) : null}
                  </div>
                  <h3 className="truncate text-base font-semibold leading-snug">
                    {event.title}
                  </h3>
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {formatEventWhen(event.startsAt, event.endsAt)}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {event.venue} · {event.neighborhood}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </section>
      ) : (
        <section className="px-5 pb-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold">Explore Places</h2>
            <span className="text-xs text-muted-foreground">
              {places.length} nearby
            </span>
          </div>
          <div className="scrollbar-hide -mx-5 flex gap-3 overflow-x-auto px-5">
            {places.map((place) => (
              <Link
                key={place.id}
                href={`/discover/places/${place.id}`}
                className="w-52 shrink-0 overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-border/60 transition hover:ring-primary/40"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={place.photo}
                  alt=""
                  className="h-28 w-full object-cover"
                />
                <div className="p-3">
                  <p className="truncate text-sm font-semibold">{place.name}</p>
                  <p className="mt-0.5 truncate text-xs font-medium text-muted-foreground">
                    <span aria-hidden className="mr-1">
                      {place.emoji}
                    </span>
                    {placeCategoryLabel(place)}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {category === "top" && events.length > 0 ? (
            <div className="mt-6">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-base font-semibold">Events</h2>
                <button
                  type="button"
                  onClick={() => setCategory("events")}
                  className="text-xs font-semibold text-primary"
                >
                  See all
                </button>
              </div>
              <div className="scrollbar-hide -mx-5 flex gap-3 overflow-x-auto px-5">
                {events.slice(0, 4).map((event) => (
                  <Link
                    key={event.id}
                    href={`/events/${event.id}?from=discover`}
                    className="w-52 shrink-0 overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-border/60"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={event.photo}
                      alt=""
                      className="h-28 w-full object-cover"
                    />
                    <div className="p-3">
                      <p className="truncate text-sm font-semibold">
                        {event.emoji} {event.title}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {formatEventWhen(event.startsAt)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </section>
      )}

      <section className="px-5 pb-8">
        <div className="rounded-2xl bg-emerald-50 px-4 py-3 ring-1 ring-emerald-100">
          <p className="text-sm font-semibold text-emerald-900">
            {SAFETY_TIP.title}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-emerald-800/90">
            {SAFETY_TIP.body}
          </p>
        </div>
      </section>
    </div>
  );
}
