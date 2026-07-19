"use client";

import { MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { upsertCurrentProfile } from "@/lib/profile-client";

export function LocationPermission() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const finish = async (coords?: { lat: number; lng: number }) => {
    setIsLoading(true);
    setError(null);
    try {
      await upsertCurrentProfile({
        approx_lat: coords?.lat ?? null,
        approx_lng: coords?.lng ?? null,
        area_label: coords ? "Near you" : null,
        onboarding_complete: true,
      });
      router.push("/discover");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not finish setup");
      setIsLoading(false);
    }
  };

  const allowLocation = () => {
    if (!navigator.geolocation) {
      setError("Location is not supported in this browser");
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        void finish({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => {
        // Still complete onboarding if the user denies OS permission mid-flow
        void finish();
      },
      { enableHighAccuracy: false, timeout: 10000 },
    );
  };

  return (
    <div className="flex min-h-full flex-1 flex-col bg-background px-6 pb-10 pt-16">
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <div className="mb-8 flex h-40 w-40 items-center justify-center rounded-full bg-accent">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
            <MapPin className="h-8 w-8" aria-hidden />
          </div>
        </div>
        <h1 className="text-[1.75rem] font-bold tracking-tight">
          Allow location access
        </h1>
        <p className="mt-3 max-w-xs text-base leading-relaxed text-muted-foreground">
          Help us show you nearby travelers, locals, and places around you.
        </p>
        {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
      </div>

      <div className="flex flex-col gap-3">
        <Button
          type="button"
          className="h-12 w-full rounded-xl text-base font-semibold"
          disabled={isLoading}
          onClick={allowLocation}
        >
          {isLoading ? "Continuing..." : "Allow Location"}
        </Button>
        <button
          type="button"
          className="py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
          disabled={isLoading}
          onClick={() => finish()}
        >
          Not Now
        </button>
      </div>
    </div>
  );
}
