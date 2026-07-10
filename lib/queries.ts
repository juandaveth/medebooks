import { getSupabase } from "./supabase";
import { SAMPLE_PLACES } from "./sampleData";
import { filterPlaces } from "./filter";
import { MATERIAS } from "./types";
import type { Place, PlaceFilters } from "./types";

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
