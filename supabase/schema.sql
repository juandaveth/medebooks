-- Directorio Lector — esquema v1
-- Ejecutar en el SQL Editor de Supabase (o vía CLI).

create extension if not exists postgis;

do $$ begin
  create type place_type as enum ('libreria', 'biblioteca');
exception when duplicate_object then null; end $$;

do $$ begin
  create type place_status as enum ('published', 'pending', 'rejected');
exception when duplicate_object then null; end $$;

create table if not exists places (
  id              uuid primary key default gen_random_uuid(),
  type            place_type   not null,
  status          place_status not null default 'published',
  name            text not null,
  slug            text unique not null,
  description     text,
  address         text,
  neighborhood    text,
  municipality    text,
  lat             double precision not null,
  lng             double precision not null,
  -- Columna geográfica generada para consultas de proximidad (PostGIS).
  location        geography(Point, 4326)
                    generated always as
                    (ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography) stored,
  phone           text,
  whatsapp        text,
  website         text,
  instagram       text,
  hours           text,
  specialties     text[]  default '{}',  -- tipo de librería (usados, café-librería...)
  subjects        text[]  default '{}',  -- materias/temas (taxonomía BISAC)
  is_free         boolean,
  services        text[]  default '{}',
  entity          text,
  google_place_id text unique,
  source          text default 'seed',
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create index if not exists places_location_idx     on places using gist (location);
create index if not exists places_type_idx         on places (type);
create index if not exists places_municipality_idx on places (municipality);
create index if not exists places_status_idx       on places (status);
create index if not exists places_specialties_idx  on places using gin (specialties);
create index if not exists places_subjects_idx     on places using gin (subjects);

-- RLS: lectura pública de lo publicado; escritura sólo con service_role (scripts/admin).
alter table places enable row level security;

drop policy if exists "public read published" on places;
create policy "public read published"
  on places for select
  using (status = 'published');

-- Ejemplo de consulta de proximidad (bibliotecas/librerías a < 2 km de un punto):
--   select name, ST_Distance(location, ST_MakePoint(-75.5665, 6.2088)::geography) as m
--   from places
--   where ST_DWithin(location, ST_MakePoint(-75.5665, 6.2088)::geography, 2000)
--   order by m;
