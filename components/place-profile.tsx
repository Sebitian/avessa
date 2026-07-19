"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Clock, MapPin, MoreHorizontal, Navigation } from "lucide-react";

import { Button } from "@/components/ui/button";
import { placeCategoryLabel, type Place } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type PlaceProfileProps = {
  place: Place;
  backHref?: string;
};

export function PlaceProfile({
  place,
  backHref = "/discover",
}: PlaceProfileProps) {
  const photos =
    place.photos && place.photos.length > 0 ? place.photos : [place.photo];
  const [photoIndex, setPhotoIndex] = useState(0);

  function showPrevPhoto() {
    setPhotoIndex((i) => Math.max(0, i - 1));
  }

  function showNextPhoto() {
    setPhotoIndex((i) => Math.min(photos.length - 1, i + 1));
  }

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}`;

  return (
    <div className="relative flex min-h-0 flex-1 flex-col bg-background">
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        <div className="relative aspect-[3/4] w-full shrink-0 bg-zinc-900 sm:aspect-[4/5]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photos[photoIndex]}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-black/55" />

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
              href={backHref}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm transition hover:bg-black/50"
              aria-label="Back"
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
            <p className="mb-1 text-sm font-medium capitalize text-white/85">
              <span aria-hidden className="mr-1.5">
                {place.emoji}
              </span>
              {placeCategoryLabel(place)}
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-sm">
              {place.name}
            </h1>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-white/90">
              <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
              {place.neighborhood}
              <span className="text-white/50">·</span>
              {place.tagline}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-6 px-5 pb-28 pt-6">
          {place.hours && (
            <p className="flex items-center gap-2 text-sm font-medium text-primary">
              <Clock className="h-4 w-4 shrink-0" aria-hidden />
              {place.hours}
            </p>
          )}

          {place.vibes.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
                Vibe
              </h2>
              <div className="flex flex-wrap gap-2">
                {place.vibes.map((vibe) => (
                  <span
                    key={vibe}
                    className="rounded-full border border-primary/30 bg-accent px-3 py-1.5 text-sm font-medium text-accent-foreground"
                  >
                    {vibe}
                  </span>
                ))}
              </div>
            </section>
          )}

          <section>
            <h2 className="mb-2 text-sm font-semibold text-muted-foreground">
              About
            </h2>
            <p className="text-[15px] leading-relaxed text-foreground/90">
              {place.description}
            </p>
          </section>

          {place.goodFor.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
                Good for
              </h2>
              <div className="flex flex-wrap gap-2">
                {place.goodFor.map((item) => (
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

          {place.tip && (
            <section className="rounded-2xl bg-secondary/60 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Local tip
              </p>
              <p className="mt-2 text-[15px] leading-relaxed">{place.tip}</p>
            </section>
          )}

          {photos.slice(1).map((src) => (
            <div
              key={src}
              className="overflow-hidden rounded-2xl bg-muted shadow-sm ring-1 ring-border/50"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt=""
                className="aspect-[4/5] w-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-30 border-t border-border/60 bg-background/90 px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md">
        <Button asChild size="lg" className="h-12 w-full rounded-xl text-base font-semibold shadow-md shadow-primary/20">
          <a href={mapsUrl} target="_blank" rel="noreferrer">
            <Navigation className="h-5 w-5" />
            Get directions
          </a>
        </Button>
      </div>
    </div>
  );
}
