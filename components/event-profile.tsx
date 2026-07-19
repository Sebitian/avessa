"use client";

import Link from "next/link";
import { ArrowLeft, Calendar, ExternalLink, MapPin, Navigation } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatEventWhen, type CityEvent } from "@/lib/events";

type EventProfileProps = {
  event: CityEvent;
  backHref?: string;
};

export function EventProfile({
  event,
  backHref = "/events",
}: EventProfileProps) {
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${event.lat},${event.lng}`;
  const exploreHref = `/explore?layer=events&event=${event.id}`;

  return (
    <div className="relative flex min-h-0 flex-1 flex-col bg-background">
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        <div className="relative aspect-[3/4] w-full shrink-0 bg-zinc-900 sm:aspect-[4/5]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={event.photo}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-black/55" />

          <div className="absolute inset-x-0 top-[max(0.75rem,env(safe-area-inset-top))] z-30 flex items-center justify-between px-3 pt-5">
            <Link
              href={backHref}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm transition hover:bg-black/50"
              aria-label="Back"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </div>

          <div className="absolute inset-x-0 bottom-0 z-20 p-5">
            <p className="mb-1 text-sm font-medium capitalize text-white/85">
              <span aria-hidden className="mr-1.5">
                {event.emoji}
              </span>
              {event.label}
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-sm">
              {event.title}
            </h1>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-white/90">
              <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
              {event.venue}
              <span className="text-white/50">·</span>
              {event.neighborhood}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-6 px-5 pb-36 pt-6">
          <p className="flex items-center gap-2 text-sm font-medium text-primary">
            <Calendar className="h-4 w-4 shrink-0" aria-hidden />
            {formatEventWhen(event.startsAt, event.endsAt)}
          </p>

          <section>
            <h2 className="mb-2 text-sm font-semibold text-muted-foreground">
              About
            </h2>
            <p className="text-[15px] leading-relaxed text-foreground/90">
              {event.description}
            </p>
          </section>

          {event.tip ? (
            <section className="rounded-2xl bg-secondary/60 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Local tip
              </p>
              <p className="mt-2 text-[15px] leading-relaxed">{event.tip}</p>
            </section>
          ) : null}

          {event.sourceUrl ? (
            <a
              href={event.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary"
            >
              Event page
              <ExternalLink className="h-4 w-4" />
            </a>
          ) : null}
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-30 flex flex-col gap-2 border-t border-border/60 bg-background/90 px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md">
        <Button asChild size="lg" className="h-12 w-full rounded-xl text-base font-semibold shadow-md shadow-primary/20">
          <Link href={exploreHref}>
            <MapPin className="h-5 w-5" />
            Show on map
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="h-12 w-full rounded-xl text-base font-semibold">
          <a href={mapsUrl} target="_blank" rel="noreferrer">
            <Navigation className="h-5 w-5" />
            Get directions
          </a>
        </Button>
      </div>
    </div>
  );
}
