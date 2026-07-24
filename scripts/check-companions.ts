/**
 * Diagnóstico: usuarios sin compa de lectura
 * Uso: npx tsx scripts/check-companions.ts
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

async function main() {
  // Todos los perfiles
  const { data: profiles } = await sb
    .from("profiles")
    .select("user_id, display_name, invite_code");

  // Todos los vínculos
  const { data: companions } = await sb
    .from("reading_companions")
    .select("user_a, user_b, invited_by, created_at");

  console.log("\n=== PERFILES ===");
  for (const p of profiles ?? []) {
    console.log(`  ${p.display_name ?? "(sin nombre)"} · código: ${p.invite_code} · id: ${p.user_id}`);
  }

  console.log("\n=== VÍNCULOS COMPAS ===");
  if (!companions || companions.length === 0) {
    console.log("  (ninguno)");
  } else {
    for (const c of companions) {
      const a = profiles?.find((p) => p.user_id === c.user_a);
      const b = profiles?.find((p) => p.user_id === c.user_b);
      console.log(`  ${a?.display_name ?? c.user_a} ↔ ${b?.display_name ?? c.user_b}  (invited_by: ${c.invited_by?.slice(0,8)}...)`);
    }
  }

  const linkedIds = new Set([
    ...(companions ?? []).map((c) => c.user_a),
    ...(companions ?? []).map((c) => c.user_b),
  ]);

  const unlinked = (profiles ?? []).filter((p) => !linkedIds.has(p.user_id));
  console.log("\n=== SIN COMPA ===");
  if (unlinked.length === 0) {
    console.log("  Todos tienen compa ✓");
  } else {
    for (const p of unlinked) {
      console.log(`  ⚠  ${p.display_name ?? "(sin nombre)"} · ${p.user_id}`);
    }
  }
}

main().catch(console.error);
