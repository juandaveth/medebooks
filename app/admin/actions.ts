"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { createSupabaseServer } from "@/lib/supabase/server";

function str(v: FormDataEntryValue | null): string | null {
  const s = (v ?? "").toString().trim();
  return s === "" ? null : s;
}

function csv(v: FormDataEntryValue | null): string[] {
  return (v ?? "")
    .toString()
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

// Actualiza un lugar. Verifica admin (las Server Actions son accesibles por POST).
export async function updatePlace(formData: FormData) {
  await requireAdmin();
  const id = str(formData.get("id"));
  if (!id) throw new Error("Falta el id");

  const lat = Number(formData.get("lat"));
  const lng = Number(formData.get("lng"));
  const isFreeRaw = formData.get("is_free"); // checkbox: "on" | null

  const patch: Record<string, unknown> = {
    name: str(formData.get("name")),
    type: str(formData.get("type")),
    status: str(formData.get("status")),
    description: str(formData.get("description")),
    address: str(formData.get("address")),
    neighborhood: str(formData.get("neighborhood")),
    comuna: str(formData.get("comuna")),
    municipality: str(formData.get("municipality")),
    phone: str(formData.get("phone")),
    whatsapp: str(formData.get("whatsapp")),
    website: str(formData.get("website")),
    instagram: str(formData.get("instagram")),
    hours: str(formData.get("hours")),
    entity: str(formData.get("entity")),
    photo_url: str(formData.get("photo_url")),
    specialties: csv(formData.get("specialties")),
    subjects: csv(formData.get("subjects")),
    services: csv(formData.get("services")),
    is_free: isFreeRaw ? true : false,
    updated_at: new Date().toISOString(),
  };
  if (Number.isFinite(lat)) patch.lat = lat;
  if (Number.isFinite(lng)) patch.lng = lng;

  const supabase = createSupabaseAdmin();
  const { error } = await supabase.from("places").update(patch).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin");
  revalidatePath("/");
  redirect("/admin");
}

// Elimina un lugar (por ejemplo, papelerías mal clasificadas).
export async function deletePlace(formData: FormData) {
  await requireAdmin();
  const id = str(formData.get("id"));
  if (!id) throw new Error("Falta el id");

  const supabase = createSupabaseAdmin();
  const { error } = await supabase.from("places").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin");
  revalidatePath("/");
  redirect("/admin");
}

export async function signOut() {
  const supabase = await createSupabaseServer();
  await supabase.auth.signOut();
  redirect("/login");
}
