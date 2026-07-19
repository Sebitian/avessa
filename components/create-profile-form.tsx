"use client";

import { Camera } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { upsertCurrentProfile } from "@/lib/profile-client";
import {
  CITIES,
  GENDER_OPTIONS,
  LANGUAGE_OPTIONS,
  LOOKING_FOR_OPTIONS,
  NATIONALITIES,
  TRAVELER_STATUSES,
  type LookingFor,
  type TravelerStatus,
} from "@/lib/profile-options";
import type { Profile } from "@/lib/profile";
import { cn } from "@/lib/utils";

type CreateProfileFormProps = {
  initialProfile?: Profile | null;
  afterSaveHref?: string;
};

export function CreateProfileForm({
  initialProfile,
  afterSaveHref = "/onboarding/interests",
}: CreateProfileFormProps) {
  const router = useRouter();
  const [firstName, setFirstName] = useState(initialProfile?.first_name ?? "");
  const [age, setAge] = useState(
    initialProfile?.age != null ? String(initialProfile.age) : "",
  );
  const [gender, setGender] = useState(initialProfile?.gender ?? "");
  const [nationality, setNationality] = useState(
    initialProfile?.nationality ?? "",
  );
  const [homeCity, setHomeCity] = useState(initialProfile?.home_city ?? "");
  const [currentCity, setCurrentCity] = useState(
    initialProfile?.current_city ?? "",
  );
  const [languages, setLanguages] = useState<string[]>(
    initialProfile?.languages ?? [],
  );
  const [travelerStatus, setTravelerStatus] = useState<TravelerStatus | "">(
    initialProfile?.traveler_status ?? "",
  );
  const [lookingFor, setLookingFor] = useState<LookingFor[]>(
    (initialProfile?.looking_for as LookingFor[] | null) ?? [],
  );
  const [bio, setBio] = useState(initialProfile?.bio ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const languageSummary = useMemo(() => {
    if (languages.length === 0) return "Select languages";
    return languages.join(", ");
  }, [languages]);

  const toggleLanguage = (lang: string) => {
    setLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang],
    );
  };

  const toggleLookingFor = (value: LookingFor) => {
    setLookingFor((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!firstName.trim()) {
      setError("First name is required");
      return;
    }

    setIsLoading(true);
    try {
      const parsedAge = age.trim() ? Number.parseInt(age, 10) : null;
      if (
        age.trim() &&
        (Number.isNaN(parsedAge) || parsedAge! < 13 || parsedAge! > 120)
      ) {
        throw new Error("Enter a valid age");
      }

      await upsertCurrentProfile({
        first_name: firstName.trim(),
        age: parsedAge,
        gender: gender || null,
        nationality: nationality || null,
        home_city: homeCity || null,
        current_city: currentCity || null,
        languages: languages.length ? languages : null,
        traveler_status: travelerStatus || null,
        looking_for: lookingFor.length ? lookingFor : null,
        bio: bio.trim() || null,
      });

      router.push(afterSaveHref);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not save profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex min-h-full flex-1 flex-col bg-background"
    >
      <header className="safe-top flex items-center gap-3 px-4 pb-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-full text-foreground hover:bg-muted"
          aria-label="Go back"
        >
          <span className="text-xl leading-none">←</span>
        </button>
        <h1 className="text-lg font-semibold">Create Profile</h1>
      </header>

      <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-6 pb-6 pt-2">
        <div className="flex justify-center py-2">
          <div className="relative">
            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-muted text-2xl font-semibold text-muted-foreground">
              {firstName.trim()
                ? firstName.trim().charAt(0).toUpperCase()
                : "?"}
            </div>
            <span className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow">
              <Camera className="h-4 w-4" aria-hidden />
            </span>
          </div>
        </div>

        <Field label="First Name" htmlFor="first-name">
          <Input
            id="first-name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Imran"
            className="h-11 rounded-xl"
            required
          />
        </Field>

        <Field label="Age (optional)" htmlFor="age">
          <Input
            id="age"
            type="number"
            inputMode="numeric"
            min={13}
            max={120}
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="27"
            className="h-11 rounded-xl"
          />
        </Field>

        <Field label="Gender (optional)" htmlFor="gender">
          <Select
            id="gender"
            value={gender}
            onChange={setGender}
            placeholder="Select gender"
            options={GENDER_OPTIONS}
          />
        </Field>

        <Field label="Nationality" htmlFor="nationality">
          <Select
            id="nationality"
            value={nationality}
            onChange={setNationality}
            placeholder="Select nationality"
            options={NATIONALITIES}
          />
        </Field>

        <Field label="Home City" htmlFor="home-city">
          <Select
            id="home-city"
            value={homeCity}
            onChange={setHomeCity}
            placeholder="Where are you from?"
            options={CITIES}
          />
        </Field>

        <Field label="Current City" htmlFor="current-city">
          <Select
            id="current-city"
            value={currentCity}
            onChange={setCurrentCity}
            placeholder="Where are you now?"
            options={CITIES}
          />
        </Field>

        <fieldset>
          <Legend>Languages</Legend>
          <p className="mb-2 text-sm text-muted-foreground">
            {languageSummary}
          </p>
          <div className="flex flex-wrap gap-2">
            {LANGUAGE_OPTIONS.map((lang) => {
              const selected = languages.includes(lang);
              return (
                <button
                  key={lang}
                  type="button"
                  onClick={() => toggleLanguage(lang)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-sm transition-colors",
                    selected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-foreground hover:bg-muted",
                  )}
                >
                  {lang}
                </button>
              );
            })}
          </div>
        </fieldset>

        <fieldset>
          <Legend>I&apos;m currently</Legend>
          <p className="mb-2 text-sm text-muted-foreground">
            Choose one that fits you right now.
          </p>
          <div className="flex flex-wrap gap-2">
            {TRAVELER_STATUSES.map((status) => {
              const selected = travelerStatus === status.value;
              return (
                <button
                  key={status.value}
                  type="button"
                  onClick={() => setTravelerStatus(status.value)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-sm transition-colors",
                    selected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-foreground hover:bg-muted",
                  )}
                >
                  {status.label}
                </button>
              );
            })}
          </div>
        </fieldset>

        <fieldset>
          <Legend>Looking to meet</Legend>
          <p className="mb-2 text-sm text-muted-foreground">
            Choose all that apply.
          </p>
          <div className="flex flex-wrap gap-2">
            {LOOKING_FOR_OPTIONS.map((option) => {
              const selected = lookingFor.includes(option.value);
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => toggleLookingFor(option.value)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-sm transition-colors",
                    selected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-foreground hover:bg-muted",
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </fieldset>

        <Field label="Bio" htmlFor="bio">
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Digital nomad and lover of good coffee & great people."
            rows={3}
            className="flex w-full rounded-xl border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:text-sm"
          />
        </Field>

        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

      <div className="safe-bottom-compact border-t border-border/60 px-6 py-4">
        <Button
          type="submit"
          className="h-12 w-full rounded-xl text-base font-semibold"
          disabled={isLoading}
        >
          {isLoading ? "Saving..." : "Next"}
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}

function Legend({ children }: { children: React.ReactNode }) {
  return (
    <legend className="mb-1 text-sm font-medium leading-none">{children}</legend>
  );
}

function Select({
  id,
  value,
  onChange,
  placeholder,
  options,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  options: readonly string[];
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="flex h-11 w-full rounded-xl border border-input bg-transparent px-3 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:text-sm"
    >
      <option value="" disabled>
        {placeholder}
      </option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}
