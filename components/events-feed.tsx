"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import {
  EVENT_CATEGORIES,
  filterEvents,
  formatEventWhen,
  isTonight,
  type CityEvent,
  type EventCategory,
} from "@/lib/events";
import { cn } from "@/lib/utils";

type EventsFeedProps = {
  events: CityEvent[];
  areaLabel?: string | null;
};

type FilterKey = EventCategory | "all" | "tonight" | "week";

export function EventsFeed({ events, areaLabel }: EventsFeedProps) {
  const [filter, setFilter] = useState<FilterKey>("week");

  const visible = useMemo(
    () => filterEvents(events, filter),
    [events, filter],
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-background">
      <header className="safe-top px-5 pb-3">
        <h1 className="text-2xl font-bold tracking-tight">Events</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {areaLabel || "Near you"}
        </p>
      </header>

      <div className="scrollbar-hide flex gap-2 overflow-x-auto px-5 pb-4">
        {EVENT_CATEGORIES.map((cat) => {
          const active = filter === cat.key;
          return (
            <button
              key={cat.key}
              type="button"
              onClick={() => setFilter(cat.key)}
              className={cn(
                "shrink-0 rounded-full px-3.5 py-2 text-xs font-semibold transition",
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-card text-muted-foreground ring-1 ring-border",
              )}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      <section className="flex flex-col gap-3 px-5 pb-8">
        {visible.length === 0 ? (
          <p className="rounded-2xl bg-secondary/50 px-4 py-6 text-center text-sm text-muted-foreground">
            No events match this filter. Try This week.
          </p>
        ) : (
          visible.map((event) => (
            <Link
              key={event.id}
              href={`/events/${event.id}`}
              className="overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-border/60 transition hover:ring-primary/40"
            >
              <div className="flex gap-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={event.photo}
                  alt=""
                  className="h-28 w-24 shrink-0 object-cover sm:w-28"
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
                  <h2 className="truncate text-base font-semibold leading-snug">
                    {event.title}
                  </h2>
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {formatEventWhen(event.startsAt, event.endsAt)}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {event.venue} · {event.neighborhood}
                  </p>
                </div>
              </div>
            </Link>
          ))
        )}
      </section>
    </div>
  );
}
