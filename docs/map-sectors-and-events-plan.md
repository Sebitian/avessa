# Plan: Map sectors, popular places & events

Product ideas for Explore / Discover beyond single place pins.

**Status (2026-07-19): MVP shipped in app** — see § Implemented below.

---

## Goals

- Show **where to go** by intent (go out, shopping, eat), not only individual venues.
- Ground popular areas in **real map data** (Google), not only mock POIs.
- Add an **events** layer (festivals, concerts, nightlife) with locations on the map.
- Surface events in a dedicated **bottom tab**.

---

## Implemented (MVP)

### Explore map
- **Places / Events** layer toggle on Explore.
- **Popular sectors** as soft colored polygons + labels (eat, go out, shopping, coffee, outdoors).
- Tap a sector → zoom + sheet listing venues inside it.
- Category chips filter both sectors and place pins.
- Place pins open existing place profiles.

### Google Places (optional)
- Server routes: `GET /api/places/nearby`, `GET /api/places/[id]`
- Lib: `lib/google-places.ts` (type → Avessa labels, popularity ranking).
- Set `GOOGLE_MAPS_API_KEY` in `.env.local` to enable live Nearby Search.
- Without a key, curated mock places/sectors still work.

### Events
- Editorial seed: `lib/events.ts` (relative “tonight / this week” dates).
- **Events** bottom tab: feed + filters (tonight / week / music / nightlife / festival / outdoor).
- Event detail profile with **Show on map** → `/explore?layer=events&event=…`
- Explore Events layer shows event pins for the week.

### Nav
- Tabs: Discover · Chats · Explore · **Events** · Profile

### Schema ready
- `supabase/migrations/20260719_create_events_table.sql` — RLS read for authenticated; seed still in code for MVP.

---

## Decisions locked for MVP

- [x] Five-tab nav (Events separate)
- [x] Generally popular sectors first (curated + Google rating×reviews when keyed)
- [x] Barcelona-centered demo data, remapped around user coords
- [x] Leaflet + Places data (not Google Maps JS yet)
- [x] Editorial events until an events API is wired

---

## Next (when ready)

1. Drop `GOOGLE_MAPS_API_KEY` and verify live Places on Explore.
2. Move `CITY_EVENTS` into Supabase `events` and read from there.
3. Optional: Ticketmaster / Eventbrite for real listings.
4. “Popular now” via Place Details popular times.

---

## Related code

- Explore map: `components/discover-map.tsx`, `app/(app)/explore/page.tsx`
- Sectors: `lib/sectors.ts`
- Events: `lib/events.ts`, `components/events-feed.tsx`, `components/event-profile.tsx`, `app/(app)/events/`
- Google Places: `lib/google-places.ts`, `app/api/places/`
- Bottom nav: `components/bottom-nav.tsx`
