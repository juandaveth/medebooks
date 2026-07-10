-- Migración: agrega la comuna a places (reencuadre v1 a Medellín por barrio/comuna).
-- Ejecutar en el SQL Editor de Supabase.

alter table places add column if not exists comuna text;

create index if not exists places_comuna_idx       on places (comuna);
create index if not exists places_neighborhood_idx on places (neighborhood);
