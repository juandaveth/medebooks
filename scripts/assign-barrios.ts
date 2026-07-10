// Asigna barrio (neighborhood) y comuna a cada lugar de Medellín por
// point-in-polygon usando public/medellin-barrios.geojson (GeoMedellín, 349
// barrios/veredas, 21 comunas). Idempotente: se puede correr varias veces.
//
//   npm run assign-barrios         # aplica los cambios
//   npm run assign-barrios -- --dry # solo reporta, no escribe
//
// Requiere SUPABASE_SERVICE_ROLE_KEY (escritura). Solo toca municipality='Medellín'.

import { config } from "dotenv";
config({ path: ".env.local" });
config();

import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";
import { MEDELLIN } from "../lib/medellin";

const DRY = process.argv.includes("--dry");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local");
  process.exit(1);
}

type Props = { barrio: string; comuna: string };
type Feature = { properties: Props; geometry: { type: string; coordinates: unknown } };

const gj = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), "public/medellin-barrios.geojson"), "utf8"),
) as { features: Feature[] };

function pointInRing(x: number, y: number, ring: number[][]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1];
    const xj = ring[j][0], yj = ring[j][1];
    const hit = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (hit) inside = !inside;
  }
  return inside;
}

// poly = [outerRing, ...holes]
function pointInPolygon(x: number, y: number, poly: number[][][]): boolean {
  if (!pointInRing(x, y, poly[0])) return false;
  for (let k = 1; k < poly.length; k++) if (pointInRing(x, y, poly[k])) return false;
  return true;
}

function locate(lng: number, lat: number): Props | null {
  for (const f of gj.features) {
    const g = f.geometry;
    if (g.type === "Polygon") {
      if (pointInPolygon(lng, lat, g.coordinates as number[][][])) return f.properties;
    } else if (g.type === "MultiPolygon") {
      for (const poly of g.coordinates as number[][][][]) {
        if (pointInPolygon(lng, lat, poly)) return f.properties;
      }
    }
  }
  return null;
}

const sb = createClient(url, serviceKey, { auth: { persistSession: false } });

async function main() {
  const { data, error } = await sb
    .from("places")
    .select("id,name,lat,lng,neighborhood,comuna")
    .eq("municipality", MEDELLIN);

  if (error) {
    console.error("Error leyendo places:", error.message);
    process.exit(1);
  }

  console.log(`Lugares de Medellín: ${data!.length}${DRY ? "  (dry-run)" : ""}`);

  let assigned = 0;
  let missed = 0;
  let updated = 0;
  const byComuna: Record<string, number> = {};

  for (const p of data!) {
    const props = locate(Number(p.lng), Number(p.lat));
    if (!props) {
      missed++;
      console.warn(`  ⚠ sin barrio: ${p.name} (${p.lat}, ${p.lng})`);
      continue;
    }
    assigned++;
    byComuna[props.comuna] = (byComuna[props.comuna] ?? 0) + 1;

    const needsUpdate = p.neighborhood !== props.barrio || p.comuna !== props.comuna;
    if (needsUpdate && !DRY) {
      const { error: upErr } = await sb
        .from("places")
        .update({ neighborhood: props.barrio, comuna: props.comuna })
        .eq("id", p.id);
      if (upErr) console.error(`  ✗ ${p.name}: ${upErr.message}`);
      else updated++;
    }
  }

  console.log(`\nAsignados: ${assigned}  |  sin barrio: ${missed}  |  actualizados: ${DRY ? 0 : updated}`);
  console.log("Por comuna:", JSON.stringify(byComuna, null, 1));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
