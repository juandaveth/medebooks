"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

function str(v: FormDataEntryValue | null): string | null {
  const s = (v ?? "").toString().trim();
  return s === "" ? null : s;
}

export async function createEvent(formData: FormData) {
  await requireAdmin();
  const supabase = createSupabaseAdmin();

  const { error } = await supabase.from("events").insert({
    place_id:    str(formData.get("place_id")),
    title:       str(formData.get("title")),
    description: str(formData.get("description")),
    date:        str(formData.get("date")),
    start_time:  str(formData.get("start_time")),
    end_time:    str(formData.get("end_time")),
    url:         str(formData.get("url")),
    status:      str(formData.get("status")) ?? "published",
  });

  if (error) throw new Error(error.message);
  revalidatePath("/eventos");
  revalidatePath("/admin/eventos");
  redirect("/admin/eventos");
}

export async function updateEvent(formData: FormData) {
  await requireAdmin();
  const id = str(formData.get("id"));
  if (!id) throw new Error("Falta el id");
  const supabase = createSupabaseAdmin();

  const { error } = await supabase.from("events").update({
    place_id:    str(formData.get("place_id")),
    title:       str(formData.get("title")),
    description: str(formData.get("description")),
    date:        str(formData.get("date")),
    start_time:  str(formData.get("start_time")),
    end_time:    str(formData.get("end_time")),
    url:         str(formData.get("url")),
    status:      str(formData.get("status")) ?? "published",
  }).eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/eventos");
  revalidatePath("/admin/eventos");
  redirect("/admin/eventos");
}

export async function deleteEvent(formData: FormData) {
  await requireAdmin();
  const id = str(formData.get("id"));
  if (!id) throw new Error("Falta el id");
  const supabase = createSupabaseAdmin();

  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/eventos");
  revalidatePath("/admin/eventos");
  redirect("/admin/eventos");
}
