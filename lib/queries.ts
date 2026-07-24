import { getSupabase } from "./supabase";
import { SAMPLE_PLACES } from "./sampleData";
import { filterPlaces } from "./filter";
import { MATERIAS } from "./types";
import type { Place, PlaceFilters, Event, PlaceType } from "./types";

// Columnas que expone la vista/tabla y su mapeo al tipo Place.
const SELECT = `
  id, type, name, slug, description, address, neighborhood, comuna, municipality,
  lat, lng, phone, whatsapp, website, instagram, hours, specialties,
  is_free, services, entity, google_place_id, subjects, photo_url
`;

// v1 se enfoca SOLO en Medellín (los demás municipios quedan en la base para v3).
const SCOPE_MUNICIPALITY = "Medellín";

type Row = Record<string, unknown>;

function rowToPlace(r: Row): Place {
  return {
    id: String(r.id),
    type: r.type as Place["type"],
    name: String(r.name),
    slug: String(r.slug),
    description: (r.description as string) ?? null,
    address: (r.address as string) ?? null,
    neighborhood: (r.neighborhood as string) ?? null,
    comuna: (r.comuna as string) ?? null,
    municipality: (r.municipality as string) ?? null,
    lat: Number(r.lat),
    lng: Number(r.lng),
    phone: (r.phone as string) ?? null,
    whatsapp: (r.whatsapp as string) ?? null,
    website: (r.website as string) ?? null,
    instagram: (r.instagram as string) ?? null,
    hours: (r.hours as string) ?? null,
    specialties: (r.specialties as string[]) ?? [],
    isFree: (r.is_free as boolean) ?? null,
    services: (r.services as string[]) ?? [],
    entity: (r.entity as string) ?? null,
    googlePlaceId: (r.google_place_id as string) ?? null,
    subjects: (r.subjects as string[]) ?? [],
    photoUrl: (r.photo_url as string) ?? null,
  };
}

export async function getPlaces(filters: PlaceFilters = {}): Promise<Place[]> {
  const supabase = getSupabase();
  if (!supabase) {
    return filterPlaces(SAMPLE_PLACES, filters).sort((a, b) =>
      a.name.localeCompare(b.name, "es"),
    );
  }

  let query = supabase
    .from("places")
    .select(SELECT)
    .eq("status", "published")
    .eq("municipality", SCOPE_MUNICIPALITY);
  if (filters.type && filters.type !== "all") query = query.eq("type", filters.type);
  if (filters.comuna && filters.comuna !== "all")
    query = query.eq("comuna", filters.comuna);
  if (filters.neighborhood && filters.neighborhood !== "all")
    query = query.eq("neighborhood", filters.neighborhood);
  if (filters.specialties && filters.specialties.length > 0)
    query = query.overlaps("specialties", filters.specialties);
  if (filters.subjects && filters.subjects.length > 0)
    query = query.overlaps("subjects", filters.subjects);
  if (filters.query && filters.query.trim())
    query = query.ilike("name", `%${filters.query.trim()}%`);

  const { data, error } = await query.order("name");
  if (error) {
    console.error("[getPlaces] Supabase error:", error.message);
    return filterPlaces(SAMPLE_PLACES, filters);
  }
  return (data ?? []).map(rowToPlace);
}

export async function getPlaceBySlug(slug: string): Promise<Place | null> {
  const supabase = getSupabase();
  if (!supabase) {
    return SAMPLE_PLACES.find((p) => p.slug === slug) ?? null;
  }
  const { data, error } = await supabase
    .from("places")
    .select(SELECT)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (error || !data) return SAMPLE_PLACES.find((p) => p.slug === slug) ?? null;
  return rowToPlace(data as Row);
}

export type Facets = {
  comunas: string[];
  barriosByComuna: Record<string, string[]>;
  specialties: string[];
  subjects: string[];
};

/** Facetas para poblar los filtros: comunas y barrios (por comuna) presentes en Medellín. */
export async function getFacets(): Promise<Facets> {
  const all = await getPlaces();
  const comunas = [
    ...new Set(all.map((p) => p.comuna).filter(Boolean) as string[]),
  ].sort((a, b) => a.localeCompare(b, "es"));

  const barriosByComuna: Record<string, string[]> = {};
  for (const p of all) {
    if (!p.comuna || !p.neighborhood) continue;
    (barriosByComuna[p.comuna] ??= []).push(p.neighborhood);
  }
  for (const c of Object.keys(barriosByComuna)) {
    barriosByComuna[c] = [...new Set(barriosByComuna[c])].sort((a, b) =>
      a.localeCompare(b, "es"),
    );
  }

  const specialties = [
    ...new Set(all.flatMap((p) => p.specialties ?? [])),
  ].sort((a, b) => a.localeCompare(b, "es"));
  // Materias ordenadas según el orden canónico de la taxonomía (MATERIAS).
  const present = new Set(all.flatMap((p) => p.subjects ?? []));
  const subjects = MATERIAS.filter((m) => present.has(m));
  return { comunas, barriosByComuna, specialties, subjects };
}

// ─── Eventos ────────────────────────────────────────────────────────────────

// Nota: places!place_id(...) desambigua el join — con event_places en el schema,
// PostgREST encuentra dos rutas a places y necesita el hint explícito.
const EVENT_SELECT = `
  id, title, description, date, start_time, end_time, url, status, created_at, place_id,
  places!place_id(id, name, slug, type)
`;

type EventRow = Record<string, unknown>;

function rowToEvent(r: EventRow): Event {
  const place = r.places as Record<string, unknown> | null;
  const isMultiPlace = !r.place_id;
  return {
    id: String(r.id),
    placeId: place ? String(place.id) : null,
    placeName: place ? String(place.name) : null,
    placeSlug: place ? String(place.slug) : null,
    placeType: place ? (place.type as PlaceType) : null,
    placeCount: isMultiPlace ? 8 : undefined,
    title: String(r.title),
    description: (r.description as string) ?? null,
    date: String(r.date),
    startTime: (r.start_time as string) ?? null,
    endTime: (r.end_time as string) ?? null,
    url: (r.url as string) ?? null,
    status: r.status as Event["status"],
    createdAt: String(r.created_at),
  };
}

/** Próximos eventos (hoy en adelante), ordenados por fecha. */
export async function getUpcomingEvents(): Promise<Event[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const today = new Date().toISOString().split("T")[0];
  const { data } = await supabase
    .from("events")
    .select(EVENT_SELECT)
    .eq("status", "published")
    .gte("date", today)
    .order("date", { ascending: true })
    .order("start_time", { ascending: true, nullsFirst: true });
  return (data ?? []).map(rowToEvent);
}

/**
 * IDs de lugares que participan en algún evento publicado hoy.
 * Se usa para mostrar el PIN de campaña en el mapa.
 */
export async function getFeaturedPlaceIds(): Promise<string[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const today = new Date().toISOString().split("T")[0];
  // Eventos publicados para hoy
  const { data: events } = await supabase
    .from("events")
    .select("id")
    .eq("status", "published")
    .eq("date", today);
  if (!events || events.length === 0) return [];
  const eventIds = events.map((e) => e.id as string);
  // Lugares vinculados a esos eventos
  const { data: links } = await supabase
    .from("event_places")
    .select("place_id")
    .in("event_id", eventIds);
  return (links ?? []).map((l) => l.place_id as string);
}

/** Próximos eventos de un lugar concreto. */
export async function getEventsByPlace(placeId: string): Promise<Event[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const today = new Date().toISOString().split("T")[0];
  const { data } = await supabase
    .from("events")
    .select(`id, title, description, date, start_time, end_time, url, status, created_at,
             places!place_id(id, name, slug, type)`)
    .eq("place_id", placeId)
    .eq("status", "published")
    .gte("date", today)
    .order("date", { ascending: true });
  return (data ?? []).map(rowToEvent);
}
