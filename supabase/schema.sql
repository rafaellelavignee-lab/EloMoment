-- elomoment: schema Postgres + RLS + realtime, substituindo Firestore/Storage rules.
-- Rode isto inteiro no SQL Editor do seu projeto Supabase. Idempotente: pode rodar de novo sem erro.

create extension if not exists pgcrypto;

-- ============================================================
-- TABELAS
-- ============================================================

create table if not exists public.users (
  uid uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  photo_url text,
  birthdate text,
  phrase text,
  favorite_emoji text,
  favorite_color text,
  role text not null check (role in ('guest', 'host', 'debutante')),
  created_at bigint not null
);

create table if not exists public.invites (
  code text primary key,
  role text not null check (role in ('guest', 'host', 'debutante')),
  single_use boolean not null default true,
  used boolean not null default false,
  -- referencia auth.users (não public.users): o convite é consumido no login
  -- anônimo, antes de o perfil existir em public.users. on delete set null pra
  -- não travar a exclusão do usuário no dashboard do Supabase.
  used_by uuid references auth.users (id) on delete set null,
  created_at bigint not null
);

-- migra instalações antigas (used_by apontando pra public.users, ou sem "on delete set null")
do $$
begin
  if exists (select 1 from pg_constraint where conname = 'invites_used_by_fkey') then
    alter table public.invites drop constraint invites_used_by_fkey;
  end if;
  alter table public.invites add constraint invites_used_by_fkey
    foreign key (used_by) references auth.users (id) on delete set null;
end $$;

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.users (uid),
  text text not null default '',
  media_url text,
  media_type text,
  location text default '',
  hashtags text[] not null default '{}',
  pinned boolean not null default false,
  created_at bigint not null,
  reactions jsonb not null default '{}'::jsonb
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  author_id uuid not null references public.users (uid),
  text text not null,
  created_at bigint not null,
  likes uuid[] not null default '{}',
  reply_to uuid,
  reactions jsonb not null default '{}'::jsonb
);
alter table public.comments add column if not exists reactions jsonb not null default '{}'::jsonb;

create table if not exists public.stories (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.users (uid),
  media_url text,
  media_type text,
  text text default '',
  text_color text default '#FFFFFF',
  created_at bigint not null,
  expires_at bigint not null
);

create table if not exists public.mural_messages (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.users (uid),
  text text not null,
  created_at bigint not null,
  x real not null,
  y real not null
);

create table if not exists public.guestbook_entries (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.users (uid),
  message text not null,
  emoji text,
  signature_data_url text,
  photo_url text,
  created_at bigint not null
);

create table if not exists public.timeline_moments (
  id uuid primary key default gen_random_uuid(),
  time text not null,
  title text not null,
  description text,
  "order" int not null default 0
);

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.users (uid),
  text text not null,
  created_at bigint not null
);

create table if not exists public.chats (
  id uuid primary key default gen_random_uuid(),
  members uuid[] not null default '{}',
  is_group boolean not null default false,
  name text default '',
  photo_url text,
  last_message jsonb,
  created_at bigint not null
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references public.chats (id) on delete cascade,
  sender_id uuid not null references public.users (uid),
  text text default '',
  media_url text,
  media_type text,
  reply_to uuid,
  created_at bigint not null,
  read_by uuid[] not null default '{}',
  reactions jsonb not null default '{}'::jsonb
);
alter table public.messages add column if not exists reactions jsonb not null default '{}'::jsonb;

-- ============================================================
-- HELPERS
-- ============================================================

create or replace function public.my_role()
returns text
language sql
security definer
stable
as $$
  select role from public.users where uid = auth.uid();
$$;

create or replace function public.is_host()
returns boolean language sql security definer stable as $$
  select public.my_role() = 'host';
$$;

create or replace function public.is_debutante()
returns boolean language sql security definer stable as $$
  select public.my_role() = 'debutante';
$$;

create or replace function public.is_staff()
returns boolean language sql security definer stable as $$
  select public.is_host() or public.is_debutante();
$$;

-- ============================================================
-- RLS
-- ============================================================

alter table public.users enable row level security;
alter table public.invites enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.stories enable row level security;
alter table public.mural_messages enable row level security;
alter table public.guestbook_entries enable row level security;
alter table public.timeline_moments enable row level security;
alter table public.announcements enable row level security;
alter table public.chats enable row level security;
alter table public.messages enable row level security;

-- users
drop policy if exists "users_select_authenticated" on public.users;
create policy "users_select_authenticated" on public.users
  for select using (auth.uid() is not null);
drop policy if exists "users_insert_self" on public.users;
create policy "users_insert_self" on public.users
  for insert with check (auth.uid() = uid);
drop policy if exists "users_update_self_or_host" on public.users;
create policy "users_update_self_or_host" on public.users
  for update using (auth.uid() = uid or public.is_host());
drop policy if exists "users_delete_host" on public.users;
create policy "users_delete_host" on public.users
  for delete using (public.is_host());

-- invites: leitura pública por código (validação de link); listagem só host
drop policy if exists "invites_select_public" on public.invites;
create policy "invites_select_public" on public.invites
  for select using (true);
drop policy if exists "invites_insert_host" on public.invites;
create policy "invites_insert_host" on public.invites
  for insert with check (public.is_host());
drop policy if exists "invites_delete_host" on public.invites;
create policy "invites_delete_host" on public.invites
  for delete using (public.is_host());
-- consumo: qualquer usuário autenticado marca como usado, uma vez, para si mesmo
drop policy if exists "invites_update_consume" on public.invites;
create policy "invites_update_consume" on public.invites
  for update using (used = false)
  with check (used = true and used_by = auth.uid());

-- posts
drop policy if exists "posts_select_authenticated" on public.posts;
create policy "posts_select_authenticated" on public.posts
  for select using (auth.uid() is not null);
drop policy if exists "posts_insert_own" on public.posts;
create policy "posts_insert_own" on public.posts
  for insert with check (author_id = auth.uid());
drop policy if exists "posts_update_own_or_host" on public.posts;
create policy "posts_update_own_or_host" on public.posts
  for update using (author_id = auth.uid() or public.is_host());
drop policy if exists "posts_delete_own_or_host" on public.posts;
create policy "posts_delete_own_or_host" on public.posts
  for delete using (author_id = auth.uid() or public.is_host());

-- comments
drop policy if exists "comments_select_authenticated" on public.comments;
create policy "comments_select_authenticated" on public.comments
  for select using (auth.uid() is not null);
drop policy if exists "comments_insert_own" on public.comments;
create policy "comments_insert_own" on public.comments
  for insert with check (author_id = auth.uid());
drop policy if exists "comments_update_authenticated" on public.comments;
create policy "comments_update_authenticated" on public.comments
  for update using (auth.uid() is not null);
drop policy if exists "comments_delete_own_or_host" on public.comments;
create policy "comments_delete_own_or_host" on public.comments
  for delete using (author_id = auth.uid() or public.is_host());

-- stories
drop policy if exists "stories_select_authenticated" on public.stories;
create policy "stories_select_authenticated" on public.stories
  for select using (auth.uid() is not null);
drop policy if exists "stories_insert_own" on public.stories;
create policy "stories_insert_own" on public.stories
  for insert with check (author_id = auth.uid());
drop policy if exists "stories_delete_own_or_host" on public.stories;
create policy "stories_delete_own_or_host" on public.stories
  for delete using (author_id = auth.uid() or public.is_host());

-- mural
drop policy if exists "mural_select_authenticated" on public.mural_messages;
create policy "mural_select_authenticated" on public.mural_messages
  for select using (auth.uid() is not null);
drop policy if exists "mural_insert_own" on public.mural_messages;
create policy "mural_insert_own" on public.mural_messages
  for insert with check (author_id = auth.uid());
drop policy if exists "mural_delete_own_or_host" on public.mural_messages;
create policy "mural_delete_own_or_host" on public.mural_messages
  for delete using (author_id = auth.uid() or public.is_host());

-- guestbook
drop policy if exists "guestbook_select_authenticated" on public.guestbook_entries;
create policy "guestbook_select_authenticated" on public.guestbook_entries
  for select using (auth.uid() is not null);
drop policy if exists "guestbook_insert_own" on public.guestbook_entries;
create policy "guestbook_insert_own" on public.guestbook_entries
  for insert with check (author_id = auth.uid());
drop policy if exists "guestbook_delete_host" on public.guestbook_entries;
create policy "guestbook_delete_host" on public.guestbook_entries
  for delete using (public.is_host());

-- timeline
drop policy if exists "timeline_select_authenticated" on public.timeline_moments;
create policy "timeline_select_authenticated" on public.timeline_moments
  for select using (auth.uid() is not null);
drop policy if exists "timeline_write_staff" on public.timeline_moments;
create policy "timeline_write_staff" on public.timeline_moments
  for all using (public.is_staff()) with check (public.is_staff());

-- announcements
drop policy if exists "announcements_select_authenticated" on public.announcements;
create policy "announcements_select_authenticated" on public.announcements
  for select using (auth.uid() is not null);
drop policy if exists "announcements_write_staff" on public.announcements;
create policy "announcements_write_staff" on public.announcements
  for all using (public.is_staff()) with check (public.is_staff());

-- chats
drop policy if exists "chats_select_member" on public.chats;
create policy "chats_select_member" on public.chats
  for select using (auth.uid() = any(members));
drop policy if exists "chats_insert_member" on public.chats;
create policy "chats_insert_member" on public.chats
  for insert with check (auth.uid() = any(members));
drop policy if exists "chats_update_member" on public.chats;
create policy "chats_update_member" on public.chats
  for update using (auth.uid() = any(members));

-- messages
drop policy if exists "messages_select_member" on public.messages;
create policy "messages_select_member" on public.messages
  for select using (
    exists (select 1 from public.chats c where c.id = chat_id and auth.uid() = any(c.members))
  );
drop policy if exists "messages_insert_member" on public.messages;
create policy "messages_insert_member" on public.messages
  for insert with check (
    sender_id = auth.uid()
    and exists (select 1 from public.chats c where c.id = chat_id and auth.uid() = any(c.members))
  );
drop policy if exists "messages_delete_own" on public.messages;
create policy "messages_delete_own" on public.messages
  for delete using (sender_id = auth.uid());
-- necessário pra "Visto" (read_by) e reações: qualquer membro do chat pode atualizar a mensagem
drop policy if exists "messages_update_member" on public.messages;
create policy "messages_update_member" on public.messages
  for update using (
    exists (select 1 from public.chats c where c.id = chat_id and auth.uid() = any(c.members))
  );

-- ============================================================
-- REALTIME
-- ============================================================

do $$
declare
  t text;
begin
  foreach t in array array[
    'users', 'posts', 'comments', 'stories', 'mural_messages',
    'guestbook_entries', 'timeline_moments', 'announcements', 'chats', 'messages'
  ] loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t
    ) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end $$;

-- ============================================================
-- STORAGE (buckets + policies)
-- ============================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 52428800, array['image/*', 'video/*', 'audio/*'])
on conflict (id) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 8388608, array['image/*'])
on conflict (id) do nothing;

drop policy if exists "media_read_authenticated" on storage.objects;
create policy "media_read_authenticated" on storage.objects
  for select using (bucket_id = 'media' and auth.uid() is not null);
drop policy if exists "media_write_own_folder" on storage.objects;
create policy "media_write_own_folder" on storage.objects
  for insert with check (
    bucket_id = 'media' and auth.uid() is not null
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "avatars_read_authenticated" on storage.objects;
create policy "avatars_read_authenticated" on storage.objects
  for select using (bucket_id = 'avatars' and auth.uid() is not null);
drop policy if exists "avatars_write_own_file" on storage.objects;
create policy "avatars_write_own_file" on storage.objects
  for insert with check (
    bucket_id = 'avatars' and auth.uid() is not null
    and name = auth.uid()::text
  );
drop policy if exists "avatars_update_own_file" on storage.objects;
create policy "avatars_update_own_file" on storage.objects
  for update using (
    bucket_id = 'avatars' and auth.uid() is not null
    and name = auth.uid()::text
  );
