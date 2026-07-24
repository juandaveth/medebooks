-- ============================================================
-- v5: eventos multi-lugar (Noche de las Librerías y similares)
-- ============================================================

-- Hacer place_id nullable para eventos que no pertenecen a un solo lugar
ALTER TABLE public.events ALTER COLUMN place_id DROP NOT NULL;

-- Tabla puente evento ↔ lugares (muchos a muchos)
CREATE TABLE IF NOT EXISTS public.event_places (
  event_id   uuid NOT NULL REFERENCES public.events(id)  ON DELETE CASCADE,
  place_id   uuid NOT NULL REFERENCES public.places(id)  ON DELETE CASCADE,
  PRIMARY KEY (event_id, place_id)
);

ALTER TABLE public.event_places ENABLE ROW LEVEL SECURITY;

CREATE POLICY "event_places: leer publicados" ON public.event_places
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE id = event_id AND status = 'published'
    )
  );

CREATE INDEX IF NOT EXISTS event_places_event_idx ON public.event_places (event_id);
CREATE INDEX IF NOT EXISTS event_places_place_idx ON public.event_places (place_id);
