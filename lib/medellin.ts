// Modelo geográfico de Medellín: comunas y barrios.
// v1 se enfoca SOLO en Medellín (ver memoria del proyecto). La unidad con la que
// la gente se identifica es el barrio; la comuna agrupa barrios para navegar.
//
// El geojson oficial (GeoMedellín) trae la comuna en MAYÚSCULAS y sin tildes
// ("BELEN", "LA AMERICA"). Aquí está el mapa a su nombre canónico para mostrar,
// para rutas y para resaltar en el mapa. El geojson se normaliza a estos nombres.

export const MEDELLIN = "Medellín";

/** Nombre canónico (con tildes) de cada una de las 21 comunas/corregimientos. */
export const COMUNA_DISPLAY: Record<string, string> = {
  ALTAVISTA: "Altavista",
  ARANJUEZ: "Aranjuez",
  BELEN: "Belén",
  "BUENOS AIRES": "Buenos Aires",
  CASTILLA: "Castilla",
  "DOCE DE OCTUBRE": "Doce de Octubre",
  "EL POBLADO": "El Poblado",
  GUAYABAL: "Guayabal",
  "LA AMERICA": "La América",
  "LA CANDELARIA": "La Candelaria",
  LAURELES: "Laureles",
  MANRIQUE: "Manrique",
  PALMITAS: "Palmitas",
  POPULAR: "Popular",
  ROBLEDO: "Robledo",
  "SAN ANTONIO DE PRADO": "San Antonio de Prado",
  "SAN CRISTOBAL": "San Cristóbal",
  "SAN JAVIER": "San Javier",
  "SANTA CRUZ": "Santa Cruz",
  "SANTA ELENA": "Santa Elena",
  "VILLA HERMOSA": "Villa Hermosa",
};

/** Lista de comunas en orden alfabético (nombres canónicos). */
export const COMUNAS: string[] = Object.values(COMUNA_DISPLAY).sort((a, b) =>
  a.localeCompare(b, "es"),
);

/** Normaliza el valor de comuna del geojson (MAYÚSCULAS) a su nombre canónico. */
export function canonicalComuna(raw: string): string {
  const key = raw.trim().toUpperCase();
  return COMUNA_DISPLAY[key] ?? raw;
}

/** Slug para URLs: minúsculas, sin tildes, guiones. "La América" -> "la-america". */
export function geoSlug(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Resuelve un slug de URL al nombre canónico dentro de una lista (o null). */
export function resolveGeo(slug: string, names: string[]): string | null {
  const target = geoSlug(decodeURIComponent(slug));
  return names.find((n) => geoSlug(n) === target) ?? null;
}
