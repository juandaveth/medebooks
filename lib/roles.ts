import { createSupabaseServer } from "./supabase/server";
import type { UserRole } from "./roleTypes";
export type { UserRole } from "./roleTypes";
export { ROLE_LABEL } from "./roleTypes";

export type ManagedPlace = { name: string; type: "libreria" | "biblioteca" };

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

export async function getManagedPlaces(userId: string): Promise<ManagedPlace[]> {
  const supabase = await createSupabaseServer();
  const { data } = await supabase
    .from("place_roles")
    .select("places!inner(name, type)")
    .eq("user_id", userId)
    .eq("status", "approved");

  return (data ?? []).map((row) => {
    const p = row.places as unknown as { name: string; type: string };
    return { name: p.name, type: p.type as "libreria" | "biblioteca" };
  });
}
