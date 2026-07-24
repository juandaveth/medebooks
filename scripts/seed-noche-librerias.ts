/**
 * Verifica cuáles librerías de la Noche de Librerías existen en la BD
 * e inserta las que faltan.
 *
 * Uso: npx tsx scripts/seed-noche-librerias.ts
 */
import { config } from "dotenv";
config({ path: ".env.local" });
config();
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE) {
  console.error("Faltan NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { persistSession: false },
});

function slug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

const NOCHE_PLACES = [
  { name: "Librería Ojo de Agua",                    search: "ojo de agua" },
  { name: "Ítaca Librería-Bar",                      search: "itaca" },
  { name: "Librería Delfos",                         search: "delfos" },
  { name: "Librería Grámmata y Palinuro, Libros Leídos", search: "grammata" },
  { name: "Librería El Remanso de las Letras",       search: "remanso" },
  { name: "Antimateria Libros y Café",               search: "antimateria" },
  { name: "Las Letras del Jaguar",                   search: "jaguar" },
  { name: "Librería de la Pascasia",                 search: "pascasia" },
];

// Datos completos de los lugares que hay que insertar si no existen
const TO_INSERT = [
  {
    type: "libreria" as const,
    status: "published" as const,
    name: "Librería Ojo de Agua",
    slug: "libreria-ojo-de-agua",
    description: "Librería dentro de Beminimal Hotel con una curaduría de literatura contemporánea, cuentos y poesía.",
    address: "Calle 40 # 73-94, Beminimal Hotel",
    neighborhood: "Laureles",
    comuna: "Laureles-Estadio",
    municipality: "Medellín",
    lat: 6.2450,
    lng: -75.5930,
    source: "manual",
  },
  {
    type: "libreria" as const,
    status: "published" as const,
    name: "Ítaca Librería-Bar",
    slug: "itaca-libreria-bar",
    description: "Librería y bar en Laureles con música, cócteles y libros. Espacio de encuentro para lectores y bohemios.",
    address: "Circular 5 # 70-127",
    neighborhood: "Laureles",
    comuna: "Laureles-Estadio",
    municipality: "Medellín",
    lat: 6.2488,
    lng: -75.5880,
    source: "manual",
  },
  {
    type: "libreria" as const,
    status: "published" as const,
    name: "Librería Delfos",
    slug: "libreria-delfos",
    description: "Librería de filosofía, humanidades y ciencias sociales. Espacio para el pensamiento crítico y el debate de ideas.",
    address: "Carrera 79 # 52A-34",
    neighborhood: "Laureles",
    comuna: "Laureles-Estadio",
    municipality: "Medellín",
    lat: 6.2556,
    lng: -75.6010,
    source: "manual",
  },
  {
    type: "libreria" as const,
    status: "published" as const,
    name: "Librería El Remanso de las Letras",
    slug: "libreria-el-remanso-de-las-letras",
    description: "Librería cultural en Entrerríos, Antioquia. Espacio de literatura y música en el norte del departamento.",
    address: "Calle 10 # 13-167",
    neighborhood: "Centro",
    comuna: "Centro",
    municipality: "Entrerríos",
    lat: 6.5530,
    lng: -75.5067,
    source: "manual",
  },
  {
    type: "libreria" as const,
    status: "published" as const,
    name: "Las Letras del Jaguar",
    slug: "las-letras-del-jaguar",
    description: "Librería literaria en el centro de Medellín con conversaciones, lecturas en voz alta y una selección cuidada de narrativa y poesía.",
    address: "Calle 53 # 47-43",
    neighborhood: "Villanueva",
    comuna: "La Candelaria",
    municipality: "Medellín",
    lat: 6.2588,
    lng: -75.5638,
    source: "manual",
  },
  {
    type: "libreria" as const,
    status: "published" as const,
    name: "Librería de la Pascasia",
    slug: "libreria-de-la-pascasia",
    description: "Librería con sello editorial propio, espacio de encuentro cultural con exposiciones, música y conversaciones en el centro de Medellín.",
    address: "Calle 47 # 43-88",
    neighborhood: "La Candelaria",
    comuna: "La Candelaria",
    municipality: "Medellín",
    lat: 6.2513,
    lng: -75.5672,
    source: "manual",
  },
];

async function main() {
  console.log("Verificando librerías de la Noche de Librerías...\n");

  // Buscar por nombre (ilike para cada una)
  const { data: existing } = await supabase
    .from("places")
    .select("name, slug")
    .eq("type", "libreria");

  const existingNames = (existing ?? []).map((p) => p.name.toLowerCase());

  for (const place of NOCHE_PLACES) {
    const found = existingNames.some((n) => n.includes(place.search));
    console.log(`${found ? "✓" : "✗"} ${place.name}`);
  }

  // Insertar con upsert por slug (idempotente: si ya existe, lo ignora)
  console.log(`\nInsertando ${TO_INSERT.length} lugar(es) (upsert por slug)...`);
  for (const place of TO_INSERT) {
    const { error } = await supabase
      .from("places")
      .upsert(place, { onConflict: "slug", ignoreDuplicates: true });
    if (error) {
      console.error(`  ✗ ${place.name}: ${error.message}`);
    } else {
      console.log(`  ✓ ${place.name}`);
    }
  }

  console.log("\nListo.");
}

main().catch(console.error);
