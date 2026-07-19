import Link from "next/link";

import { PLACES, SAFETY_TIP, placeCategoryLabel } from "@/lib/mock-data";
import type { DiscoverTraveler } from "@/lib/profile";

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

export function DiscoverFeed({
  areaLabel,
  city,
  travelers,
}: DiscoverFeedProps) {
  const location = areaLabel || city || "Near you";

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-background">
      <header className="safe-top px-5 pb-3">
        <h1 className="text-2xl font-bold tracking-tight">Discover</h1>
        <p className="mt-1 text-sm text-muted-foreground">{location}</p>
      </header>

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
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={avatarFor(traveler)}
                  alt=""
                  className="h-40 w-full object-cover"
                />
                <div className="p-3">
                  <p className="truncate text-sm font-semibold">
                    {traveler.firstName}
                    {traveler.age != null ? (
                      <span className="font-normal text-muted-foreground">
                        , {traveler.age}
                      </span>
                    ) : null}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {traveler.nationality || traveler.area}
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

      <section className="px-5 pb-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold">Explore Places</h2>
          <span className="text-xs text-muted-foreground">
            {PLACES.length} nearby
          </span>
        </div>
        <div className="scrollbar-hide -mx-5 flex gap-3 overflow-x-auto px-5">
          {PLACES.map((place) => (
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
      </section>

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
