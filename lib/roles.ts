import { createSupabaseServer } from "./supabase/server";
import type { UserRole } from "./roleTypes";
export type { UserRole } from "./roleTypes";
export { ROLE_LABEL } from "./roleTypes";

export async function getUserRole(
  userId: string,
  email: string,
): Promise<UserRole> {
  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);

  if (adminEmails.includes(email)) return "super-admin";

  const supabase = await createSupabaseServer();
  const { data } = await supabase
    .from("place_roles")
    .select("id")
    .eq("user_id", userId)
    .eq("status", "approved")
    .limit(1);

  if (data && data.length > 0) return "business-admin";
  return "lector";
}
