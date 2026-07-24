import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createSupabaseServer } from "@/lib/supabase/server";
import { getUserRole, getManagedPlaces } from "@/lib/roles";
import { getUserPlaceLists } from "@/lib/userPlaces";
import { PerfilClient } from "./PerfilClient";

export const metadata: Metadata = {
  title: "Mi perfil",
  robots: { index: false },
};

export default async function PerfilPage() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/perfil");

  const [role, lists, managedPlaces] = await Promise.all([
    getUserRole(user.id, user.email ?? ""),
    getUserPlaceLists(user.id),
    getManagedPlaces(user.id),
  ]);

  return <PerfilClient user={user} role={role} lists={lists} managedPlaces={managedPlaces} />;
}
