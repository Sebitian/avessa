"use client";

import { Loader2, MapPin, Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import {
  DEFAULT_DISCOVER_RADIUS_M,
  MAX_DISCOVER_RADIUS_M,
  MIN_DISCOVER_RADIUS_M,
  clampDiscoverRadiusM,
  formatRadiusLabel,
} from "@/lib/geo";
import type { LocationSuggestion } from "@/lib/google-places";
import { cn } from "@/lib/utils";

export type DraftLocation = {
  lat: number;
  lng: number;
  areaLabel: string;
  currentCity: string;
  radiusM: number;
};

type ExploreLocationPanelProps = {
  open: boolean;
  onClose: () => void;
  draft: DraftLocation;
  onDraftChange: (next: DraftLocation) => void;
  biasLat: number;
  biasLng: number;
  saving: boolean;
  error: string | null;
  onSave: () => void;
};

export function ExploreLocationPanel({
  open,
  onClose,
  draft,
  onDraftChange,
  biasLat,
  biasLng,
  saving,
  error,
  onSave,
}: ExploreLocationPanelProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [resolving, setResolving] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setSuggestions([]);
      setLoadingSuggestions(false);
      setResolving(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const q = query.trim();
    if (q.length < 2) {
      setSuggestions([]);
      setLoadingSuggestions(false);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setLoadingSuggestions(true);
      void fetch(
        `/api/places/autocomplete?q=${encodeURIComponent(q)}&lat=${biasLat}&lng=${biasLng}`,
        { signal: controller.signal },
      )
        .then(async (res) => {
          if (!res.ok) throw new Error("search failed");
          const data = (await res.json()) as {
            suggestions: LocationSuggestion[];
          };
          setSuggestions(data.suggestions ?? []);
        })
        .catch((err: unknown) => {
          if (err instanceof DOMException && err.name === "AbortError") return;
          setSuggestions([]);
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoadingSuggestions(false);
        });
    }, 280);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, open, biasLat, biasLng]);

  async function pickSuggestion(suggestion: LocationSuggestion) {
    setResolving(true);
    try {
      if (
        suggestion.lat != null &&
        suggestion.lng != null &&
        Number.isFinite(suggestion.lat) &&
        Number.isFinite(suggestion.lng)
      ) {
        onDraftChange({
          lat: suggestion.lat,
          lng: suggestion.lng,
          areaLabel: suggestion.label,
          currentCity:
            suggestion.currentCity ||
            suggestion.secondary ||
            suggestion.label,
          radiusM: draft.radiusM,
        });
        setQuery(suggestion.label);
        setSuggestions([]);
        return;
      }

      const res = await fetch(
        `/api/places/geocode?placeId=${encodeURIComponent(suggestion.id)}`,
      );
      if (!res.ok) throw new Error("Could not resolve place");
      const data = (await res.json()) as {
        location: {
          lat: number;
          lng: number;
          areaLabel: string;
          currentCity: string;
        };
      };
      onDraftChange({
        lat: data.location.lat,
        lng: data.location.lng,
        areaLabel: data.location.areaLabel,
        currentCity: data.location.currentCity,
        radiusM: draft.radiusM,
      });
      setQuery(data.location.areaLabel);
      setSuggestions([]);
    } catch {
      /* keep panel open */
    } finally {
      setResolving(false);
    }
  }

  if (!open) return null;

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1001] px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-10">
      <div className="pointer-events-auto mx-auto max-w-md overflow-hidden rounded-2xl bg-white/98 shadow-xl ring-1 ring-zinc-200/90 backdrop-blur-sm">
        <div className="flex items-center justify-between border-b border-zinc-100 px-3.5 py-2.5">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-zinc-900">
              Select location
            </p>
            <p className="truncate text-[11px] text-zinc-500">
              Search, then drag the map to fine-tune
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-800"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3 px-3.5 py-3">
          <label className="relative block">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
              aria-hidden
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search neighborhoods, cities…"
              className="h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50/80 pl-9 pr-9 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-400 focus:bg-white focus:ring-1 focus:ring-zinc-300"
              autoComplete="off"
            />
            {(loadingSuggestions || resolving) && (
              <Loader2
                className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-zinc-400"
                aria-hidden
              />
            )}
          </label>

          {suggestions.length > 0 ? (
            <ul className="max-h-36 overflow-y-auto rounded-xl ring-1 ring-zinc-100">
              {suggestions.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => void pickSuggestion(s)}
                    className="flex w-full items-start gap-2.5 px-3 py-2.5 text-left transition hover:bg-zinc-50"
                  >
                    <MapPin
                      className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400"
                      aria-hidden
                    />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-zinc-900">
                        {s.label}
                      </span>
                      {s.secondary ? (
                        <span className="block truncate text-xs text-zinc-500">
                          {s.secondary}
                        </span>
                      ) : null}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}

          <div className="rounded-xl bg-zinc-50 px-3 py-2.5 ring-1 ring-zinc-100">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-medium text-zinc-600">Pin</p>
              <p className="truncate text-xs font-semibold text-zinc-900">
                {draft.areaLabel}
              </p>
            </div>
            <div className="mt-2.5">
              <div className="mb-1.5 flex items-center justify-between">
                <label
                  htmlFor="discover-radius"
                  className="text-xs font-medium text-zinc-600"
                >
                  Radius
                </label>
                <span className="text-xs font-semibold text-violet-700">
                  {formatRadiusLabel(draft.radiusM)}
                </span>
              </div>
              <input
                id="discover-radius"
                type="range"
                min={MIN_DISCOVER_RADIUS_M}
                max={MAX_DISCOVER_RADIUS_M}
                step={100}
                value={draft.radiusM}
                onChange={(e) =>
                  onDraftChange({
                    ...draft,
                    radiusM: clampDiscoverRadiusM(Number(e.target.value)),
                  })
                }
                className="h-2 w-full cursor-pointer appearance-none rounded-full bg-zinc-200 accent-violet-600"
              />
            </div>
          </div>

          {error ? (
            <p className="text-xs text-destructive">{error}</p>
          ) : null}

          <button
            type="button"
            disabled={saving || resolving}
            onClick={onSave}
            className={cn(
              "flex h-11 w-full items-center justify-center rounded-xl bg-violet-600 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 disabled:opacity-60",
            )}
          >
            {saving ? "Saving…" : "Use this location"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function defaultDraftLocation(opts: {
  lat: number;
  lng: number;
  areaLabel?: string | null;
  city?: string | null;
  radiusM?: number | null;
}): DraftLocation {
  return {
    lat: opts.lat,
    lng: opts.lng,
    areaLabel: opts.areaLabel || opts.city || "Near you",
    currentCity: opts.city || opts.areaLabel || "Nearby",
    radiusM: clampDiscoverRadiusM(
      opts.radiusM ?? DEFAULT_DISCOVER_RADIUS_M,
    ),
  };
}
