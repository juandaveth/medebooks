/**
 * Sembrado ÚNICO de librerías y bibliotecas del Área Metropolitana de Medellín.
 *
 * Uso:
 *   1) Configura en .env.local:
 *        NEXT_PUBLIC_SUPABASE_URL=...
 *        SUPABASE_SERVICE_ROLE_KEY=...      (Settings → API → service_role, NO la anon)
 *        GOOGLE_MAPS_API_KEY=...            (con "Places API (New)" habilitada)
 *   2) npx tsx scripts/seed-google-places.ts
 *
 * Idempotente: hace upsert por google_place_id, así que se puede correr de nuevo.
 */
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import type { PlaceType } from "../lib/types";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GOOGLE_KEY = process.env.GOOGLE_MAPS_API_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE) {
  console.error("Faltan NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}
if (!GOOGLE_KEY) {
  console.error("Falta GOOGLE_MAPS_API_KEY (Places API New)");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { persistSession: false },
});

const MUNICIPIOS = [
  "Medellín",
  "Envigado",
  "Sabaneta",
  "Itagüí",
  "Bello",
  "La Estrella",
  "Caldas",
  "Copacabana",
];

// (query, tipo) — para bibliotecas nos enfocamos en el sistema público.
const SEARCHES: { q: (m: string) => string; type: PlaceType }[] = [
  { q: (m) => `librerías en ${m}, Antioquia`, type: "libreria" },
  { q: (m) => `bibliotecas públicas en ${m}, Antioquia`, type: "biblioteca" },
  { q: (m) => `parque biblioteca en ${m}, Antioquia`, type: "biblioteca" },
];

type GPlace = {
  id: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  location?: { latitude: number; longitude: number };
  nationalPhoneNumber?: string;
  websiteUri?: string;
  regularOpeningHours?: { weekdayDescriptions?: string[] };
  photos?: { name: string; widthPx?: number; heightPx?: number }[];
};

// Resuelve la MEJOR foto (la primera que devuelve Google = más relevante) a una
// URL de imagen usable sin API key en el navegador (skipHttpRedirect → photoUri).
async function resolvePhoto(photos?: GPlace["photos"]): Promise<string | null> {
  const photo = photos?.[0];
  if (!photo?.name) return null;
  try {
    const res = await fetch(
      `https://places.googleapis.com/v1/${photo.name}/media` +
        `?maxWidthPx=1200&skipHttpRedirect=true&key=${GOOGLE_KEY}`,
    );
    if (!res.ok) return null;
    const json = (await res.json()) as { photoUri?: string };
    return json.photoUri ?? null;
  } catch {
    return null;
  }
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

async function textSearch(textQuery: string): Promise<GPlace[]> {
  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": GOOGLE_KEY!,
      "X-Goog-FieldMask":
        "places.id,places.displayName,places.formattedAddress,places.location,places.nationalPhoneNumber,places.websiteUri,places.regularOpeningHours,places.photos",
    },
    body: JSON.stringify({ textQuery, languageCode: "es", regionCode: "CO" }),
  });
  if (!res.ok) {
    console.warn(`  ⚠ ${textQuery}: ${res.status} ${await res.text()}`);
    return [];
  }
  const json = (await res.json()) as { places?: GPlace[] };
  return json.places ?? [];
}

async function main() {
  const byId = new Map<string, Record<string, unknown>>();
  const seenSlug = new Set<string>();

  for (const municipality of MUNICIPIOS) {
    for (const { q, type } of SEARCHES) {
      const query = q(municipality);
      const results = await textSearch(query);
      console.log(`• ${query} → ${results.length}`);
      for (const p of results) {
        if (!p.location || !p.displayName?.text || byId.has(p.id)) continue;
        const name = p.displayName.text;
        let slug = slugify(name);
        while (seenSlug.has(slug)) slug = `${slug}-${p.id.slice(-4)}`;
        seenSlug.add(slug);
        const photoUrl = await resolvePhoto(p.photos);
        byId.set(p.id, {
          type,
          status: "published",
          name,
          slug,
          address: p.formattedAddress ?? null,
          municipality,
          lat: p.location.latitude,
          lng: p.location.longitude,
          phone: p.nationalPhoneNumber ?? null,
          website: p.websiteUri ?? null,
          hours: p.regularOpeningHours?.weekdayDescriptions?.join(" · ") ?? null,
          photo_url: photoUrl,
          is_free: type === "biblioteca" ? true : null,
          google_place_id: p.id,
          source: "seed",
        });
      }
    }
  }

  const rows = [...byId.values()];
  console.log(`\nSembrando ${rows.length} lugares…`);
  const { error } = await supabase
    .from("places")
    .upsert(rows, { onConflict: "google_place_id" });
  if (error) {
    console.error("Error al insertar:", error.message);
    process.exit(1);
  }
  console.log("✓ Listo.");
}

main();
