-- ============================================================
-- v4: perfiles de usuario + compañeros de lectura + sistema de invitación
-- ============================================================

-- Perfil público de cada lector (display info + código de invitación)
create table if not exists public.profiles (
  user_id      uuid primary key references auth.users(id) on delete cascade,
  invite_code  text unique not null default upper(left(replace(gen_random_uuid()::text, '-', ''), 6)),
  display_name text,
  avatar_url   text,
  created_at   timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Cualquiera puede leer perfiles (necesario para la landing de invitación)
create policy "profiles: lectura pública" on public.profiles
  for select using (true);

-- Cada usuario puede actualizar solo su propio perfil
create policy "profiles: actualizar propio" on public.profiles
  for update using (auth.uid() = user_id);

-- Trigger: crea automáticamente el perfil cuando se registra un usuario nuevo
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (user_id, display_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ────────────────────────────────────────────────────────────

-- Compañeros de lectura (relación simétrica)
-- user_a < user_b siempre (enforced via constraint) para evitar duplicados
create table if not exists public.reading_companions (
  user_a       uuid not null references auth.users(id) on delete cascade,
  user_b       uuid not null references auth.users(id) on delete cascade,
  invited_by   uuid not null references auth.users(id) on delete cascade,
  created_at   timestamptz not null default now(),
  primary key  (user_a, user_b),
  constraint   no_self_companion check (user_a != user_b),
  constraint   ordered_pair check (user_a < user_b)
);

alter table public.reading_companions enable row level security;

-- Cada usuario ve solo sus propios vínculos
create policy "companions: ver propios" on public.reading_companions
  for select using (auth.uid() = user_a or auth.uid() = user_b);
