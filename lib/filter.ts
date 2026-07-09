import type { Place, PlaceFilters } from "./types";

/** Filtrado puro en memoria — seguro para usar en el cliente (sin Supabase). */
export function filterPlaces(places: Place[], f: PlaceFilters = {}): Place[] {
  let out = places;
  if (f.type && f.type !== "all") out = out.filter((p) => p.type === f.type);
  if (f.municipality && f.municipality !== "all")
    out = out.filter((p) => p.municipality === f.municipality);
  if (f.specialties && f.specialties.length > 0)
    out = out.filter((p) =>
      (p.specialties ?? []).some((s) => f.specialties!.includes(s)),
    );
  if (f.subjects && f.subjects.length > 0)
    out = out.filter((p) =>
      (p.subjects ?? []).some((s) => f.subjects!.includes(s)),
    );
  if (f.query && f.query.trim()) {
    const q = f.query.trim().toLowerCase();
    out = out.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.neighborhood ?? "").toLowerCase().includes(q) ||
        (p.municipality ?? "").toLowerCase().includes(q),
    );
  }
  return out;
}
