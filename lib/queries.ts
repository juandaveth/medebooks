import { getSupabase } from "./supabase";
import { SAMPLE_PLACES } from "./sampleData";
import { filterPlaces } from "./filter";
import { MATERIAS } from "./types";
import type { Place, PlaceFilters } from "./types";

// Columnas que expone la vista/tabla y su mapeo al tipo Place.
const SELECT = `
  id, type, name, slug, description, address, neighborhood, municipality,
  lat, lng, phone, whatsapp, website, instagram, hours, specialties,
  is_free, services, entity, google_place_id, subjects
`;

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
  };
}

export async function getPlaces(filters: PlaceFilters = {}): Promise<Place[]> {
  const supabase = getSupabase();
  if (!supabase) {
    return filterPlaces(SAMPLE_PLACES, filters).sort((a, b) =>
      a.name.localeCompare(b.name, "es"),
    );
  }

  let query = supabase.from("places").select(SELECT).eq("status", "published");
  if (filters.type && filters.type !== "all") query = query.eq("type", filters.type);
  if (filters.municipality && filters.municipality !== "all")
    query = query.eq("municipality", filters.municipality);
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

/** Todas las librerías/bibliotecas (para poblar filtros de forma consistente). */
export async function getFacets(): Promise<{
  municipalities: string[];
  specialties: string[];
  subjects: string[];
}> {
  const all = await getPlaces();
  const municipalities = [
    ...new Set(all.map((p) => p.municipality).filter(Boolean) as string[]),
  ].sort((a, b) => a.localeCompare(b, "es"));
  const specialties = [
    ...new Set(all.flatMap((p) => p.specialties ?? [])),
  ].sort((a, b) => a.localeCompare(b, "es"));
  // Materias ordenadas según el orden canónico de la taxonomía (MATERIAS).
  const present = new Set(all.flatMap((p) => p.subjects ?? []));
  const subjects = MATERIAS.filter((m) => present.has(m));
  return { municipalities, specialties, subjects };
}
