-- Allow signed-in users to see completed profiles for Discover
create policy "Users can view discoverable profiles"
  on public.profiles for select
  to authenticated
  using (
    onboarding_complete is true
    or (select auth.uid()) = id
  );
