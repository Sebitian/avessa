"use client";

import { MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { upsertCurrentProfile } from "@/lib/profile-client";
import { CITIES, coordsForCity } from "@/lib/profile-options";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type LocationPermissionProps = {
  /** Prefill when editing from Profile */
  initialCity?: string | null;
  /** Where to go after save */
  afterSaveHref?: string;
};

export function LocationPermission({
  initialCity = null,
  afterSaveHref = "/discover",
}: LocationPermissionProps) {
  const router = useRouter();
  const selectable = CITIES.filter((c) => c !== "Other");
  const [city, setCity] = useState(
    initialCity &&
      selectable.includes(initialCity as (typeof selectable)[number])
      ? initialCity
      : "Barcelona, Spain",
  );
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const saveCity = async (selected: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in");

      const placed = coordsForCity(selected, user.id);
      if (!placed) throw new Error("Pick a city from the list");

      await upsertCurrentProfile({
        current_city: placed.city,
        approx_lat: placed.lat,
        approx_lng: placed.lng,
        area_label: placed.area,
        onboarding_complete: true,
      });
      router.push(afterSaveHref);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not save location");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-full flex-1 flex-col bg-background px-6 pb-10 pt-16">
      <div className="flex flex-1 flex-col">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
            <MapPin className="h-8 w-8" aria-hidden />
          </div>
          <h1 className="text-[1.75rem] font-bold tracking-tight">
            Where are you?
          </h1>
          <p className="mt-3 max-w-sm text-base leading-relaxed text-muted-foreground">
            Pick a city to meet travelers nearby — same idea as changing your
            location on Hinge. You can update this anytime.
          </p>
        </div>

        <div className="scrollbar-hide -mx-1 flex max-h-[50vh] flex-col gap-2 overflow-y-auto px-1 pb-4">
          {selectable.map((option) => {
            const selected = city === option;
            return (
              <button
                key={option}
                type="button"
                disabled={isLoading}
                onClick={() => setCity(option)}
                className={cn(
                  "flex w-full items-center justify-between rounded-2xl px-4 py-3.5 text-left text-[15px] font-medium transition",
                  selected
                    ? "bg-zinc-900 text-white"
                    : "bg-zinc-50 text-zinc-800 ring-1 ring-zinc-200 hover:bg-zinc-100",
                )}
              >
                <span>{option}</span>
                {selected ? (
                  <span className="text-xs font-semibold tracking-wide text-white/80">
                    Selected
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        {error && (
          <p className="mt-2 text-center text-sm text-destructive">{error}</p>
        )}
      </div>

      <div className="flex flex-col gap-3 pt-2">
        <Button
          type="button"
          className="h-12 w-full rounded-xl text-base font-semibold"
          disabled={isLoading || !city}
          onClick={() => void saveCity(city)}
        >
          {isLoading ? "Saving..." : "Continue"}
        </Button>
        <p className="text-center text-xs leading-relaxed text-muted-foreground">
          We place you near the city center (not your exact GPS) so nearby
          people stay consistent.
        </p>
      </div>
    </div>
  );
}
