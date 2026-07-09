import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** True cuando el proyecto está conectado a Supabase (si no, se usa data de muestra). */
export const hasSupabase = Boolean(url && anonKey);

/** Cliente de lectura pública. Devuelve null si no hay credenciales configuradas. */
export function getSupabase(): SupabaseClient | null {
  if (!hasSupabase) return null;
  return createClient(url!, anonKey!, {
    auth: { persistSession: false },
  });
}
