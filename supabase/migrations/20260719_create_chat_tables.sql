-- 1:1 chat: conversations, members, messages + get_or_create RPC
-- Applied remotely as fix_chat_tables after correcting a partial migration.

drop table if exists public.conversation_members cascade;
drop table if exists public.messages cascade;
drop table if exists public.conversations cascade;

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_message_at timestamptz,
  last_message_preview text
);

create table public.conversation_members (
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  joined_at timestamptz not null default now(),
  last_read_at timestamptz,
  primary key (conversation_id, user_id)
);

create index conversation_members_user_id_idx
  on public.conversation_members (user_id);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  constraint messages_body_length check (
    char_length(body) > 0 and char_length(body) <= 4000
  )
);

create index messages_conversation_id_created_at_idx
  on public.messages (conversation_id, created_at);

alter table public.conversations enable row level security;
alter table public.conversation_members enable row level security;
alter table public.messages enable row level security;

grant select on table public.conversations to authenticated;
grant select on table public.conversation_members to authenticated;
grant select, insert on table public.messages to authenticated;

create or replace function public.is_conversation_member(conv_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.conversation_members m
    where m.conversation_id = conv_id
      and m.user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_conversation_member(uuid) from public;
grant execute on function public.is_conversation_member(uuid) to authenticated;

create policy "Members can view conversations"
  on public.conversations for select
  to authenticated
  using ( public.is_conversation_member(id) );

create policy "Members can view conversation members"
  on public.conversation_members for select
  to authenticated
  using ( public.is_conversation_member(conversation_id) );

create policy "Members can view messages"
  on public.messages for select
  to authenticated
  using ( public.is_conversation_member(conversation_id) );

create policy "Members can send messages"
  on public.messages for insert
  to authenticated
  with check (
    sender_id = (select auth.uid())
    and public.is_conversation_member(conversation_id)
  );

create or replace function public.touch_conversation_on_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.conversations
  set
    updated_at = now(),
    last_message_at = new.created_at,
    last_message_preview = left(new.body, 140)
  where id = new.conversation_id;
  return new;
end;
$$;

create trigger on_message_inserted
  after insert on public.messages
  for each row execute function public.touch_conversation_on_message();

create or replace function public.get_or_create_conversation(other_user_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  me uuid := (select auth.uid());
  existing_id uuid;
  new_id uuid;
begin
  if me is null then
    raise exception 'Not authenticated';
  end if;

  if other_user_id is null or other_user_id = me then
    raise exception 'Invalid other user';
  end if;

  if not exists (
    select 1
    from public.profiles p
    where p.id = other_user_id
      and p.onboarding_complete is true
  ) then
    raise exception 'User not available';
  end if;

  select cm1.conversation_id
  into existing_id
  from public.conversation_members cm1
  inner join public.conversation_members cm2
    on cm1.conversation_id = cm2.conversation_id
  where cm1.user_id = me
    and cm2.user_id = other_user_id
  limit 1;

  if existing_id is not null then
    return existing_id;
  end if;

  insert into public.conversations default values
  returning id into new_id;

  insert into public.conversation_members (conversation_id, user_id)
  values
    (new_id, me),
    (new_id, other_user_id);

  return new_id;
end;
$$;

revoke all on function public.get_or_create_conversation(uuid) from public, anon;
grant execute on function public.get_or_create_conversation(uuid) to authenticated;

revoke all on function public.is_conversation_member(uuid) from public, anon;
grant execute on function public.is_conversation_member(uuid) to authenticated;

revoke all on function public.touch_conversation_on_message() from public, anon, authenticated;

do $$
begin
  alter publication supabase_realtime add table public.messages;
exception
  when duplicate_object then null;
end $$;
