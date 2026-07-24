-- ============================================================
-- v3: tabla de eventos en librerías y bibliotecas
-- Correr en Supabase SQL Editor (proyecto medebooks)
-- ============================================================

create table if not exists public.events (
  id          uuid primary key default gen_random_uuid(),
  place_id    uuid not null references public.places(id) on delete cascade,
  title       text not null,
  description text,
  date        date not null,
  start_time  time,
  end_time    time,
  url         text,
  status      text not null default 'published' check (status in ('draft', 'published')),
  created_at  timestamptz not null default now()
);

alter table public.events enable row level security;

-- Cualquier visitante puede leer eventos publicados
create policy "events: leer publicados" on public.events
  for select using (status = 'published');

-- Solo el service role (admin) puede insertar / actualizar / eliminar
-- (las mutaciones se hacen desde Server Actions con createSupabaseAdmin)

create index if not exists events_date_idx   on public.events (date);
create index if not exists events_place_idx  on public.events (place_id);
