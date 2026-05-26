-- PlayFactory — initial Supabase schema.
-- Run this once in Supabase → SQL Editor (paste & Run).
-- Idempotent: safe to re-run; it uses IF NOT EXISTS / DROP ... IF EXISTS.

-- ─── Extensions ──────────────────────────────────────────────────────────────
create extension if not exists "pgcrypto";

-- ─── sports (replaces Config tab) ────────────────────────────────────────────
create table if not exists public.sports (
  id            text primary key,                  -- e.g. 'badminton-court'
  name          text not null,                     -- "Badminton Court Booking — 1 Hour"
  short_name    text not null,                     -- "Badminton Court"
  description   text default '',
  icon          text default '',                   -- emoji
  price_inr     integer not null check (price_inr >= 0),
  duration_min  integer not null default 60 check (duration_min > 0),
  courts        integer not null default 1 check (courts >= 1),
  open_time     time   not null default '06:00',
  close_time    time   not null default '23:00',
  is_active     boolean not null default true,
  sort_order    integer not null default 0
);
alter table public.sports enable row level security;
drop policy if exists "Anyone can read active sports" on public.sports;
create policy "Anyone can read active sports"
  on public.sports for select
  to anon, authenticated
  using (is_active = true);

-- ─── blocked_slots (replaces Blocked tab) ────────────────────────────────────
create table if not exists public.blocked_slots (
  id          uuid primary key default gen_random_uuid(),
  date        date not null,
  sport_id    text references public.sports(id) on delete cascade,  -- nullable = block all sports
  slot_time   time not null,
  reason      text default '',
  created_at  timestamptz not null default now()
);
create index if not exists blocked_slots_date_idx on public.blocked_slots (date);
alter table public.blocked_slots enable row level security;
drop policy if exists "Anyone can read blocked slots" on public.blocked_slots;
create policy "Anyone can read blocked slots"
  on public.blocked_slots for select
  to anon, authenticated
  using (true);

-- ─── profiles (extends auth.users) ───────────────────────────────────────────
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  name        text not null default '',
  phone       text not null default '',            -- 10-digit, no country code
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
alter table public.profiles enable row level security;
drop policy if exists "Users read own profile" on public.profiles;
create policy "Users read own profile"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);
drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);
drop policy if exists "Users insert own profile" on public.profiles;
create policy "Users insert own profile"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

-- Auto-create a row in profiles whenever a new auth.users row appears.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─── bookings (replaces Bookings tab) ────────────────────────────────────────
create table if not exists public.bookings (
  id            uuid primary key default gen_random_uuid(),
  booking_id    text unique not null,                          -- human-readable PF20260527-...
  user_id       uuid references auth.users(id) on delete set null,
  sport_id      text not null references public.sports(id),
  sport_name    text not null,                                 -- denormalised display name
  date          date not null,
  slot_time     time not null,
  duration_min  integer not null default 60,
  price         integer not null check (price >= 0),
  name          text not null,
  phone         text not null,
  email         text default '',
  status        text not null default 'confirmed'
                check (status in ('confirmed','cancelled','no_show','completed')),
  source        text not null default 'website'
                check (source in ('website','whatsapp','manual')),
  notes         text default '',
  created_at    timestamptz not null default now()
);
create index if not exists bookings_user_idx on public.bookings (user_id);
create index if not exists bookings_date_sport_idx on public.bookings (date, sport_id, status);
create index if not exists bookings_created_idx on public.bookings (created_at desc);

alter table public.bookings enable row level security;
drop policy if exists "Customers read own bookings" on public.bookings;
create policy "Customers read own bookings"
  on public.bookings for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Customers create their bookings" on public.bookings;
create policy "Customers create their bookings"
  on public.bookings for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Customers can cancel their own bookings; admin-side actions go through
-- service_role which bypasses RLS.
drop policy if exists "Customers cancel own bookings" on public.bookings;
create policy "Customers cancel own bookings"
  on public.bookings for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id and status in ('confirmed','cancelled'));

-- ─── Seed sports (idempotent upsert) ─────────────────────────────────────────
insert into public.sports (id, name, short_name, description, icon, price_inr, duration_min, courts, open_time, close_time, sort_order)
values
  ('badminton-court',  'Badminton Court Booking — 1 Hour',  'Badminton Court',        'Reserve a full court for your group. Shuttle not included.', '🏸', 400,  60, 4, '06:00', '23:00', 1),
  ('badminton-guest',  'Badminton Guest Player — 1 Hour',   'Badminton Guest Player', 'Join an existing game as a guest player. Walk in, play, leave.', '🏸', 150,  60, 8, '06:00', '23:00', 2),
  ('cricket-turf',     'Cricket Turf — 1 Hour',             'Cricket Turf',           'Full turf for box cricket. Stumps & bowling machine on request.', '🏏', 1200, 60, 1, '06:00', '23:00', 3),
  ('tt-court',         'Table Tennis Court Booking — 1 Hour','Table Tennis Court',    'Reserve a full TT table. Bats and balls provided.', '🏓', 250,  60, 2, '06:00', '23:00', 4),
  ('tt-guest',         'Table Tennis Guest Player — 1 Hour','Table Tennis Guest Player','Join in as a guest. Great if you''re flying solo.', '🏓', 100,  60, 4, '06:00', '23:00', 5)
on conflict (id) do update set
  name        = excluded.name,
  short_name  = excluded.short_name,
  description = excluded.description,
  icon        = excluded.icon,
  price_inr   = excluded.price_inr,
  duration_min= excluded.duration_min,
  courts      = excluded.courts,
  open_time   = excluded.open_time,
  close_time  = excluded.close_time,
  sort_order  = excluded.sort_order;
