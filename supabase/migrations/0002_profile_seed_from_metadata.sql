-- Seed profile.name + phone straight from the signup metadata so the
-- /book prefill works without a race between auth-state-setup and the
-- post-signup UPDATE.
--
-- Safe to re-run: replaces the existing trigger.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, phone)
  values (
    new.id,
    new.email,
    coalesce(nullif(new.raw_user_meta_data->>'name', ''), ''),
    coalesce(nullif(new.raw_user_meta_data->>'phone', ''), '')
  )
  on conflict (id) do update set
    email = excluded.email,
    name  = case when public.profiles.name  = '' then excluded.name  else public.profiles.name  end,
    phone = case when public.profiles.phone = '' then excluded.phone else public.profiles.phone end;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Also ensure the UPDATE policy has a `with check` clause so client-side
-- profile updates don't fail silently under RLS.
drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Backfill: for any existing profile rows with blank name/phone, copy from
-- the user metadata where present. One-time, idempotent.
update public.profiles p
set
  name  = coalesce(nullif(u.raw_user_meta_data->>'name', ''), p.name),
  phone = coalesce(nullif(u.raw_user_meta_data->>'phone', ''), p.phone)
from auth.users u
where u.id = p.id
  and (p.name = '' or p.phone = '');
