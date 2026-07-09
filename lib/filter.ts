import type { Place, PlaceFilters } from "./types";

/** Filtrado puro en memoria — seguro para usar en el cliente (sin Supabase). */
export function filterPlaces(places: Place[], f: PlaceFilters = {}): Place[] {
  let out = places;
  if (f.type && f.type !== "all") out = out.filter((p) => p.type === f.type);
  if (f.municipality && f.municipality !== "all")
    out = out.filter((p) => p.municipality === f.municipality);
  if (f.specialty && f.specialty !== "all")
    out = out.filter((p) => (p.specialties ?? []).includes(f.specialty!));
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
