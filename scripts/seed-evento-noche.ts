/**
 * Borra el evento anterior de la Noche de Librerías y crea uno nuevo
 * vinculado a las 8 librerías participantes.
 *
 * Uso: npx tsx scripts/seed-evento-noche.ts
 * (Requiere que la migración 20260724_event_places.sql ya esté aplicada)
 */
import { config } from "dotenv";
config({ path: ".env.local" });
config();
import { createClient } from "@supabase/supabase-js";

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

const SLUGS = [
  "libreria-ojo-de-agua",
  "itaca-libreria-bar",
  "libreria-delfos",
  "libreria-grammata-textos",
  "libreria-el-remanso-de-las-letras",
  "antimateria",
  "las-letras-del-jaguar",
  "libreria-de-la-pascasia",
];

async function main() {
  // 1. Borrar evento existente de la Noche
  console.log("Borrando evento existente...");
  const { error: delErr } = await sb
    .from("events")
    .delete()
    .ilike("title", "%noche de las librer%");
  if (delErr) { console.error("Error borrando:", delErr.message); process.exit(1); }
  console.log("  ✓ Borrado");

  // 2. Insertar nuevo evento sin place_id (multi-lugar)
  console.log("Creando nuevo evento multi-lugar...");
  const { data: event, error: insErr } = await sb
    .from("events")
    .insert({
      place_id:    null,
      title:       "Noche de Librerías",
      description: "Una noche para recorrer la ciudad estante por estante. 8 librerías de Antioquia abren sus puertas con conversaciones, talleres, música y lecturas en voz alta.",
      date:        "2026-07-24",
      start_time:  "18:00",
      end_time:    "23:59",
      url:         "/noche-librerias",
      status:      "published",
    })
    .select("id")
    .single();

  if (insErr || !event) { console.error("Error creando:", insErr?.message); process.exit(1); }
  console.log(`  ✓ Evento creado: ${event.id}`);

  // 3. Obtener IDs de las 8 librerías
  console.log("Buscando IDs de librerías...");
  const { data: places } = await sb
    .from("places")
    .select("id, slug")
    .in("slug", SLUGS);

  if (!places || places.length === 0) { console.error("No se encontraron lugares"); process.exit(1); }
  console.log(`  ✓ ${places.length} librerías encontradas`);

  // 4. Insertar en event_places
  console.log("Vinculando librerías al evento...");
  const links = places.map((p) => ({ event_id: event.id, place_id: p.id }));
  const { error: linkErr } = await sb.from("event_places").insert(links);
  if (linkErr) { console.error("Error vinculando:", linkErr.message); process.exit(1); }

  for (const p of places) console.log(`  ✓ ${p.slug}`);
  console.log("\nListo. Evento multi-lugar creado con", places.length, "librerías.");
}

main().catch(console.error);
