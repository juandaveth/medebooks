import { createClient } from "@supabase/supabase-js";

// Cliente con service-role: ignora RLS. SOLO se importa desde código de servidor
// (Server Actions del admin), nunca desde el cliente. Requiere sesión de admin
// verificada antes de usarlo (ver lib/auth.ts → requireAdmin).
export function createSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
