-- Discover / Explore visibility + view radius around approx location.
alter table public.profiles
  add column if not exists discover_radius_m integer not null default 1500;

alter table public.profiles
  drop constraint if exists profiles_discover_radius_m_check;

alter table public.profiles
  add constraint profiles_discover_radius_m_check
  check (discover_radius_m >= 500 and discover_radius_m <= 10000);
