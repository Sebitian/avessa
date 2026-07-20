"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Bookmark,
  Globe2,
  Heart,
  MapPin,
  MessageCircle,
  Star,
  ThumbsUp,
} from "lucide-react";

import { StartChatButton } from "@/components/start-chat-button";
import {
  recentPlacesForTraveler,
  travelerProfileStats,
  type NearbyTraveler,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type TravelerProfileProps = {
  traveler: NearbyTraveler;
};

function isUuid(id: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    id,
  );
}

export function TravelerProfile({ traveler }: TravelerProfileProps) {
  const photos =
    traveler.photos?.length > 0 ? traveler.photos : [traveler.photo];
  const [photoIndex, setPhotoIndex] = useState(0);
  const [cityFilter, setCityFilter] = useState<"all" | "city">("all");

  const handle = useMemo(
    () =>
      `@${traveler.firstName.toLowerCase().replace(/[^a-z0-9]/g, "") || "traveler"}`,
    [traveler.firstName],
  );

  const cityLabel = useMemo(() => {
    const fromArea = traveler.area.replace(/^Near\s+/i, "").trim();
    return fromArea || traveler.nationality || "nearby";
  }, [traveler.area, traveler.nationality]);

  const stats = useMemo(
    () => travelerProfileStats(traveler.id),
    [traveler.id],
  );

  const recentPlaces = useMemo(() => {
    const places = recentPlacesForTraveler(traveler.id, 4);
    if (cityFilter === "all") return places;
    const needle = cityLabel.toLowerCase();
    const filtered = places.filter(
      (p) =>
        p.neighborhood.toLowerCase().includes(needle) ||
        needle.includes(p.neighborhood.toLowerCase()),
    );
    return filtered.length > 0 ? filtered : places.slice(0, 2);
  }, [traveler.id, cityFilter, cityLabel]);

  function showPrevPhoto() {
    setPhotoIndex((i) => Math.max(0, i - 1));
  }

  function showNextPhoto() {
    setPhotoIndex((i) => Math.min(photos.length - 1, i + 1));
  }

  const canMessage = isUuid(traveler.id);

  return (
    <div className="relative flex min-h-0 flex-1 flex-col bg-white">
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        {/* Tinder-style photo stack */}
        <div className="relative aspect-[3/4] w-full shrink-0 bg-zinc-900 sm:aspect-[4/5]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photos[photoIndex]}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/50" />

          {photos.length > 1 && (
            <div className="absolute inset-0 z-10 flex pt-16">
              <button
                type="button"
                className="h-full w-1/3"
                onClick={showPrevPhoto}
                aria-label="Previous photo"
              />
              <button
                type="button"
                className="h-full w-2/3"
                onClick={showNextPhoto}
                aria-label="Next photo"
              />
            </div>
          )}

          {photos.length > 1 && (
            <div className="pointer-events-none absolute inset-x-3 top-[max(0.75rem,env(safe-area-inset-top))] z-30 flex gap-1">
              {photos.map((_, i) => (
                <div
                  key={i}
                  className="h-1 flex-1 overflow-hidden rounded-full bg-white/35"
                >
                  <div
                    className={cn(
                      "h-full rounded-full bg-white transition-all duration-300",
                      i <= photoIndex ? "w-full" : "w-0",
                    )}
                  />
                </div>
              ))}
            </div>
          )}

          <div className="absolute inset-x-0 top-[max(0.75rem,env(safe-area-inset-top))] z-30 flex items-center justify-between px-3 pt-5">
            <Link
              href="/discover"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm transition hover:bg-black/50"
              aria-label="Back to Discover"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            {canMessage ? (
              <Link
                href={`/messages/with/${traveler.id}`}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm transition hover:bg-black/50"
                aria-label="Message"
              >
                <MessageCircle className="h-5 w-5" />
              </Link>
            ) : (
              <span className="h-10 w-10" />
            )}
          </div>

          <div className="absolute inset-x-0 bottom-0 z-20 p-5">
            <div className="flex items-end gap-2">
              <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-sm">
                {traveler.firstName}
                {traveler.age != null ? (
                  <span className="font-semibold">, {traveler.age}</span>
                ) : null}
              </h1>
              {traveler.online ? (
                <span className="mb-1.5 flex items-center gap-1.5 rounded-full bg-black/35 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Online
                </span>
              ) : traveler.lastSeen ? (
                <span className="mb-1.5 rounded-full bg-black/35 px-2 py-0.5 text-xs font-medium text-white/90 backdrop-blur-sm">
                  Last seen {traveler.lastSeen}
                </span>
              ) : null}
            </div>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-white/90">
              {traveler.flag ? <span aria-hidden>{traveler.flag}</span> : null}
              {traveler.nationality || "Traveler"}
              <span className="text-white/50">·</span>
              <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
              {traveler.area}
            </p>
          </div>
        </div>

        {/* Social-style profile body (name already on photo) */}
        <div className="flex flex-col gap-5 px-4 pb-28 pt-5">
          <div>
            <p className="text-sm text-zinc-500">{handle}</p>
            <p className="mt-1 text-[13px] text-zinc-600">
              <span className="font-semibold text-zinc-900">
                {stats.following}
              </span>{" "}
              following
              <span className="mx-1.5 text-zinc-300">·</span>
              <span className="font-semibold text-zinc-900">
                {stats.followers}
              </span>{" "}
              followers
            </p>
          </div>

          <div className="flex gap-2 overflow-x-auto">
            <button
              type="button"
              onClick={() => setCityFilter("all")}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition",
                cityFilter === "all"
                  ? "bg-zinc-900 text-white"
                  : "bg-white text-zinc-700 ring-1 ring-zinc-200",
              )}
            >
              <Globe2 className="h-3.5 w-3.5" />
              all
            </button>
            <button
              type="button"
              onClick={() => setCityFilter("city")}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium capitalize transition",
                cityFilter === "city"
                  ? "bg-zinc-900 text-white"
                  : "bg-white text-zinc-700 ring-1 ring-zinc-200",
              )}
            >
              {cityLabel}
            </button>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {(
              [
                {
                  icon: MapPin,
                  value: stats.allPlaces,
                  label: "all places",
                },
                {
                  icon: Bookmark,
                  value: stats.wantToTry,
                  label: "want to try",
                },
                {
                  icon: Heart,
                  value: stats.favorites,
                  label: "favorites",
                },
                {
                  icon: ThumbsUp,
                  value: stats.recommend,
                  label: "recommend",
                },
              ] as const
            ).map((item) => (
              <div
                key={item.label}
                className="flex flex-col items-center rounded-2xl bg-zinc-50 px-1 py-3 ring-1 ring-zinc-100"
              >
                <item.icon className="h-4 w-4 text-zinc-500" aria-hidden />
                <p className="mt-1.5 text-lg font-bold tabular-nums text-zinc-900">
                  {item.value}
                </p>
                <p className="mt-0.5 text-center text-[10px] font-medium leading-tight text-zinc-500">
                  {item.label}
                </p>
              </div>
            ))}
          </div>

          {traveler.bio ? (
            <p className="text-[15px] leading-relaxed text-zinc-700">
              {traveler.bio}
            </p>
          ) : null}

          {traveler.sharedInterests.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {traveler.sharedInterests.slice(0, 8).map((interest) => (
                <span
                  key={interest}
                  className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700"
                >
                  {interest}
                </span>
              ))}
            </div>
          ) : null}

          <section>
            <h3 className="mb-3 text-lg font-bold tracking-tight text-zinc-900">
              recent places
            </h3>
            <div className="flex flex-col gap-3">
              {recentPlaces.map((place) => (
                <Link
                  key={place.id}
                  href={`/discover/places/${place.id}?from=discover`}
                  className="flex gap-3 rounded-2xl bg-white p-2.5 shadow-sm ring-1 ring-zinc-200/80 transition hover:bg-zinc-50"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={place.photo}
                    alt=""
                    className="h-[4.5rem] w-[4.5rem] shrink-0 rounded-xl object-cover"
                  />
                  <div className="min-w-0 flex-1 py-0.5">
                    <p className="truncate text-base font-bold text-zinc-900">
                      {place.name}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-zinc-500">
                      {place.tagline} · {place.neighborhood}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <Star className="h-3.5 w-3.5 text-zinc-400" aria-hidden />
                      <div className="h-5 w-5 overflow-hidden rounded-full ring-1 ring-zinc-200">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={traveler.photo}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {traveler.lookingFor.length > 0 ? (
            <section>
              <h3 className="mb-2 text-sm font-semibold text-zinc-500">
                Looking to meet for
              </h3>
              <div className="flex flex-wrap gap-2">
                {traveler.lookingFor.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </section>
          ) : null}

          {(traveler.prompts ?? []).slice(0, 2).map((prompt) => (
            <section
              key={prompt.question}
              className="rounded-2xl bg-zinc-50 px-4 py-4 ring-1 ring-zinc-100"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                {prompt.question}
              </p>
              <p className="mt-2 text-[15px] leading-relaxed text-zinc-800">
                {prompt.answer}
              </p>
            </section>
          ))}
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-30 border-t border-zinc-200/80 bg-white/95 px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md">
        {canMessage ? (
          <StartChatButton otherUserId={traveler.id} />
        ) : (
          <p className="py-2 text-center text-sm text-zinc-500">
            Messaging is available for real traveler profiles.
          </p>
        )}
      </div>
    </div>
  );
}
