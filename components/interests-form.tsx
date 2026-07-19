"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { INTERESTS } from "@/lib/interests";
import { upsertCurrentProfile } from "@/lib/profile-client";
import { cn } from "@/lib/utils";

type InterestsFormProps = {
  initialInterests?: string[] | null;
};

export function InterestsForm({ initialInterests }: InterestsFormProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>(initialInterests ?? []);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const toggle = (interest: string) => {
    setSelected((prev) =>
      prev.includes(interest)
        ? prev.filter((item) => item !== interest)
        : [...prev, interest],
    );
  };

  const saveAndContinue = async (interests: string[]) => {
    setIsLoading(true);
    setError(null);
    try {
      await upsertCurrentProfile({
        interests: interests.length ? interests : null,
      });
      router.push("/onboarding/location");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not save interests");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
      <header className="safe-top px-6 pb-2">
        <h1 className="text-[1.75rem] font-bold leading-tight tracking-tight">
          What are you interested in?
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Choose all that apply.
        </p>
      </header>

      <div className="flex flex-1 flex-col overflow-y-auto px-6 py-6">
        <div className="flex flex-wrap gap-2.5">
          {INTERESTS.map((interest) => {
            const isSelected = selected.includes(interest);
            return (
              <button
                key={interest}
                type="button"
                onClick={() => toggle(interest)}
                className={cn(
                  "rounded-full border px-4 py-2.5 text-sm font-medium transition-colors",
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-foreground hover:bg-muted",
                )}
              >
                {interest}
              </button>
            );
          })}
        </div>
        {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
      </div>

      <div className="safe-bottom-compact flex flex-col gap-3 px-6 py-4">
        <Button
          type="button"
          className="h-12 w-full rounded-xl text-base font-semibold"
          disabled={isLoading}
          onClick={() => saveAndContinue(selected)}
        >
          {isLoading ? "Saving..." : "Next"}
        </Button>
        <button
          type="button"
          className="py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
          disabled={isLoading}
          onClick={() => saveAndContinue([])}
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
