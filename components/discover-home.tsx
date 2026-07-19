import { NEARBY_TRAVELERS, PLACES, SAFETY_TIP } from "@/lib/mock-data";

type DiscoverHomeProps = {
  areaLabel?: string | null;
  city?: string | null;
};

export function DiscoverHome({ areaLabel, city }: DiscoverHomeProps) {
  const location = areaLabel || city || "Near you";

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-background">
      <header className="safe-top px-5 pb-3 pt-6">
        <h1 className="text-2xl font-bold tracking-tight">Discover</h1>
        <p className="mt-1 text-sm text-muted-foreground">{location}</p>
      </header>

      <section className="px-5 pb-6">
        <h2 className="mb-3 text-base font-semibold">Nearby Travelers</h2>
        <div className="scrollbar-hide -mx-5 flex gap-3 overflow-x-auto px-5">
          {NEARBY_TRAVELERS.map((traveler) => (
            <article
              key={traveler.id}
              className="w-36 shrink-0 overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-border/60"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={traveler.photo}
                alt=""
                className="h-40 w-full object-cover"
              />
              <div className="p-3">
                <p className="truncate text-sm font-semibold">
                  {traveler.firstName}{" "}
                  <span className="font-normal">{traveler.flag}</span>
                </p>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {traveler.nationality}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="px-5 pb-6">
        <h2 className="mb-3 text-base font-semibold">Explore Places</h2>
        <div className="scrollbar-hide -mx-5 flex gap-3 overflow-x-auto px-5">
          {PLACES.slice(0, 3).map((place) => (
            <article
              key={place.id}
              className="w-52 shrink-0 overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-border/60"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={place.photo}
                alt=""
                className="h-28 w-full object-cover"
              />
              <div className="p-3">
                <p className="truncate text-sm font-semibold">{place.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {place.category}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="px-5 pb-8">
        <div className="rounded-2xl bg-emerald-50 px-4 py-3 ring-1 ring-emerald-100">
          <p className="text-sm font-semibold text-emerald-900">
            {SAFETY_TIP.title}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-emerald-800/90">
            {SAFETY_TIP.body}
          </p>
        </div>
      </section>
    </div>
  );
}
