import Link from "next/link";

import { LogoutButton } from "@/components/logout-button";
import type { Profile } from "@/lib/profile";
import {
  LOOKING_FOR_OPTIONS,
  TRAVELER_STATUSES,
} from "@/lib/profile-options";

type ProfileViewProps = {
  profile: Profile;
  email?: string | null;
};

export function ProfileView({ profile, email }: ProfileViewProps) {
  const name = profile.first_name?.trim() || "Traveler";
  const initial = name.charAt(0).toUpperCase();
  const locationBits = [profile.nationality, profile.current_city].filter(
    Boolean,
  );
  const languages = profile.languages ?? [];
  const interests = profile.interests ?? [];
  const lookingFor = profile.looking_for ?? [];
  const statusLabel = TRAVELER_STATUSES.find(
    (s) => s.value === profile.traveler_status,
  )?.label;
  const lookingLabels = LOOKING_FOR_OPTIONS.filter((o) =>
    lookingFor.includes(o.value),
  ).map((o) => o.label);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-background">
      <header className="safe-top flex items-center justify-between px-5 pb-2">
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
        <div className="flex items-center gap-1">
          <Link
            href="/onboarding/profile"
            className="px-2 py-1 text-sm font-medium text-primary"
          >
            Edit
          </Link>
          <LogoutButton />
        </div>
      </header>

      <div className="flex flex-col items-center px-5 pt-4 pb-6 text-center">
        <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-3xl font-semibold text-primary">
          {profile.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatar_url}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            initial
          )}
        </div>
        <p className="mt-4 text-xl font-bold">
          {name}
          {profile.age != null ? (
            <span className="font-normal text-muted-foreground">
              , {profile.age}
            </span>
          ) : null}
        </p>
        {locationBits.length > 0 && (
          <p className="mt-1 text-sm text-muted-foreground">
            {locationBits.join(" · ")}
          </p>
        )}
        {statusLabel && (
          <p className="mt-1 text-sm font-medium text-primary">{statusLabel}</p>
        )}
        {profile.gender && (
          <p className="mt-1 text-xs text-muted-foreground">{profile.gender}</p>
        )}
        {email && (
          <p className="mt-1 text-xs text-muted-foreground">{email}</p>
        )}
        {profile.bio && (
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-foreground/90">
            {profile.bio}
          </p>
        )}
      </div>

      {profile.home_city && (
        <section className="px-5 pb-5">
          <h2 className="mb-2 text-sm font-semibold text-muted-foreground">
            Home city
          </h2>
          <p className="text-sm">{profile.home_city}</p>
        </section>
      )}

      {lookingLabels.length > 0 && (
        <section className="px-5 pb-5">
          <h2 className="mb-2 text-sm font-semibold text-muted-foreground">
            Looking to meet
          </h2>
          <div className="flex flex-wrap gap-2">
            {lookingLabels.map((label) => (
              <span
                key={label}
                className="rounded-full border border-border bg-background px-3 py-1.5 text-sm"
              >
                {label}
              </span>
            ))}
          </div>
        </section>
      )}

      {languages.length > 0 && (
        <section className="px-5 pb-5">
          <h2 className="mb-2 text-sm font-semibold text-muted-foreground">
            Languages
          </h2>
          <div className="flex flex-wrap gap-2">
            {languages.map((lang) => (
              <span
                key={lang}
                className="rounded-full border border-border bg-background px-3 py-1.5 text-sm"
              >
                {lang}
              </span>
            ))}
          </div>
        </section>
      )}

      {interests.length > 0 && (
        <section className="px-5 pb-5">
          <h2 className="mb-2 text-sm font-semibold text-muted-foreground">
            Interests
          </h2>
          <div className="flex flex-wrap gap-2">
            {interests.map((interest) => (
              <span
                key={interest}
                className="rounded-full bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground"
              >
                {interest}
              </span>
            ))}
          </div>
        </section>
      )}

      <section className="px-5 pb-8">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted-foreground">
            Location
          </h2>
          <Link
            href="/onboarding/location"
            className="text-sm font-medium text-primary"
          >
            Change city
          </Link>
        </div>
        <p className="text-sm">
          {profile.current_city || "No city set"}
          {profile.area_label ? ` · ${profile.area_label}` : null}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          City pick sets your Discover area — not live GPS.
        </p>
      </section>
    </div>
  );
}
