-- Editorial / cached city events for Avessa Events tab + Explore map layer.
create table if not exists public.events (
  id text primary key,
  title text not null,
  category text not null check (
    category in ('music', 'nightlife', 'festival', 'outdoor', 'market')
  ),
  label text not null,
  emoji text not null default '🎟️',
  description text not null default '',
  venue text not null,
  neighborhood text not null default '',
  photo text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  lat double precision not null,
  lng double precision not null,
  source_url text,
  tip text,
  created_at timestamptz not null default now()
);

create index if not exists events_starts_at_idx on public.events (starts_at);
create index if not exists events_category_idx on public.events (category);

alter table public.events enable row level security;

drop policy if exists "Authenticated users can read events" on public.events;
create policy "Authenticated users can read events"
  on public.events
  for select
  to authenticated
  using (true);

-- Seed data is managed in lib/events.ts for the MVP demo.
-- Insert rows here when switching the Events feed to Supabase.