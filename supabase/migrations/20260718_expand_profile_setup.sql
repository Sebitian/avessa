alter table public.profiles
  add column if not exists home_city text,
  add column if not exists traveler_status text,
  add column if not exists looking_for text[],
  add column if not exists gender text;

alter table public.profiles
  drop constraint if exists profiles_traveler_status_check;

alter table public.profiles
  add constraint profiles_traveler_status_check
  check (traveler_status is null or traveler_status in ('traveling', 'local', 'both'));
