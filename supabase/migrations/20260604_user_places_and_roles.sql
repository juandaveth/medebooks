-- ============================================================
-- v2: tablas para roles de negocio y lugares guardados
-- Correr en Supabase SQL Editor (proyecto medebooks)
-- ============================================================

-- Admin de negocio: vincula usuarios a lugares (dueños / gestores)
create table if not exists public.place_roles (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  place_id    uuid not null references public.places(id) on delete cascade,
  role        text not null check (role in ('owner', 'manager')),
  status      text not null default 'pending' check (status in ('pending', 'approved')),
  created_at  timestamptz not null default now(),
  unique (user_id, place_id)
);

alter table public.place_roles enable row level security;

-- Cada usuario solo ve sus propios roles; el super-admin los ve todos (vía service role)
create policy "place_roles: leer propios" on public.place_roles
  for select using (auth.uid() = user_id);

create policy "place_roles: solicitar" on public.place_roles
  for insert with check (auth.uid() = user_id and status = 'pending');

-- ────────────────────────────────────────────────────────────

-- Lector: lugares guardados (quiero visitar / ya visité)
create table if not exists public.user_places (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  place_id    uuid not null references public.places(id) on delete cascade,
  status      text not null check (status in ('want_to_visit', 'visited')),
  visited_at  timestamptz,   -- se rellena al marcar como visitado
  created_at  timestamptz not null default now(),
  unique (user_id, place_id)
);

alter table public.user_places enable row level security;

-- Usuarios gestionan solo sus propias filas
create policy "user_places: gestión propia" on public.user_places
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
