"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, MapPin, MoreHorizontal } from "lucide-react";

import { StartChatButton } from "@/components/start-chat-button";
import type { NearbyTraveler } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type TravelerProfileProps = {
  traveler: NearbyTraveler;
};

export function TravelerProfile({ traveler }: TravelerProfileProps) {
  const photos =
    traveler.photos?.length > 0 ? traveler.photos : [traveler.photo];
  const [photoIndex, setPhotoIndex] = useState(0);

  function showPrevPhoto() {
    setPhotoIndex((i) => Math.max(0, i - 1));
  }

  function showNextPhoto() {
    setPhotoIndex((i) => Math.min(photos.length - 1, i + 1));
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col bg-background">
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        {/* Hero photo + Tinder-style segments */}
        <div className="relative aspect-[3/4] w-full shrink-0 bg-zinc-900 sm:aspect-[4/5]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photos[photoIndex]}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-black/55" />

          {/* Tap zones sit under the header chrome */}
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
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm transition hover:bg-black/50"
              aria-label="More options"
            >
              <MoreHorizontal className="h-5 w-5" />
            </button>
          </div>

          <div className="absolute inset-x-0 bottom-0 z-20 p-5">
            <div className="flex items-end gap-2">
              <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-sm">
                {traveler.firstName}
                {traveler.age != null ? (
                  <span className="font-semibold">, {traveler.age}</span>
                ) : null}
              </h1>
              {traveler.online && (
                <span className="mb-1.5 flex items-center gap-1.5 rounded-full bg-black/35 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Online
                </span>
              )}
            </div>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-white/90">
              <span aria-hidden>{traveler.flag}</span>
              {traveler.nationality}
              <span className="text-white/50">·</span>
              <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
              {traveler.area}
            </p>
          </div>
        </div>

        {/* Scrollable details */}
        <div className="flex flex-col gap-6 px-5 pb-28 pt-6">
          {traveler.travelerStatus && (
            <p className="text-sm font-medium text-primary">
              {traveler.travelerStatus}
            </p>
          )}

          {traveler.sharedInterests.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
                Interests
              </h2>
              <div className="flex flex-wrap gap-2">
                {traveler.sharedInterests.map((interest) => (
                  <span
                    key={interest}
                    className="rounded-full border border-primary/30 bg-accent px-3 py-1.5 text-sm font-medium text-accent-foreground"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </section>
          )}

          {traveler.bio && (
            <section>
              <h2 className="mb-2 text-sm font-semibold text-muted-foreground">
                About
              </h2>
              <p className="text-[15px] leading-relaxed text-foreground/90">
                {traveler.bio}
              </p>
            </section>
          )}

          {traveler.lookingFor.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
                Looking to meet for
              </h2>
              <div className="flex flex-wrap gap-2">
                {traveler.lookingFor.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-border bg-card px-3 py-1.5 text-sm"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </section>
          )}

          {traveler.languages.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
                Languages
              </h2>
              <div className="flex flex-wrap gap-2">
                {traveler.languages.map((lang) => (
                  <span
                    key={lang}
                    className="rounded-full border border-border bg-card px-3 py-1.5 text-sm"
                  >
                    {lang}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Extra photos + prompts interleaved for scroll depth */}
          {photos.slice(1).map((src, i) => {
            const prompt = traveler.prompts?.[i];
            return (
              <div key={src} className="flex flex-col gap-6">
                <div className="overflow-hidden rounded-2xl bg-muted shadow-sm ring-1 ring-border/50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt=""
                    className="aspect-[4/5] w-full object-cover"
                  />
                </div>
                {prompt && (
                  <section className="rounded-2xl bg-secondary/60 px-4 py-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {prompt.question}
                    </p>
                    <p className="mt-2 text-[15px] leading-relaxed">
                      {prompt.answer}
                    </p>
                  </section>
                )}
              </div>
            );
          })}

          {/* Any leftover prompts if fewer extra photos */}
          {(traveler.prompts ?? [])
            .slice(Math.max(0, photos.length - 1))
            .map((prompt) => (
              <section
                key={prompt.question}
                className="rounded-2xl bg-secondary/60 px-4 py-4"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {prompt.question}
                </p>
                <p className="mt-2 text-[15px] leading-relaxed">
                  {prompt.answer}
                </p>
              </section>
            ))}
        </div>
      </div>

      {/* Sticky Message CTA — real Supabase profiles only */}
      <div className="absolute inset-x-0 bottom-0 z-30 border-t border-border/60 bg-background/90 px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md">
        {/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
          traveler.id,
        ) ? (
          <StartChatButton otherUserId={traveler.id} />
        ) : (
          <p className="py-2 text-center text-sm text-muted-foreground">
            Messaging is available for real traveler profiles.
          </p>
        )}
      </div>
    </div>
  );
}
