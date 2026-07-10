import { redirect } from "next/navigation";
import { createSupabaseServer } from "./supabase/server";

// Correos con permiso de administrador (coma-separados en ADMIN_EMAILS).
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

export function isAdminEmail(email?: string | null): boolean {
  return !!email && ADMIN_EMAILS.includes(email.toLowerCase());
}

/** Usuario autenticado actual (o null). */
export async function getCurrentUser() {
  const supabase = await createSupabaseServer();
  const { data } = await supabase.auth.getUser();
  return data.user;
}

/**
 * Exige sesión de administrador. Redirige a /login si no hay sesión y a
 * /admin/no-autorizado si el correo no está en la allowlist. Devuelve el usuario.
 * DEBE llamarse al inicio de cada página/acción del admin (las Server Actions son
 * accesibles por POST directo).
 */
export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");
  if (!isAdminEmail(user.email)) redirect("/admin/no-autorizado");
  return user;
}
