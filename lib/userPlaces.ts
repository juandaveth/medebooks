"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServer } from "./supabase/server";
import type { Place } from "./types";

export type UserPlaceStatus = "want_to_visit" | "visited" | null;

type Row = Record<string, unknown>;

function rowToPlace(r: Row): Place {
  return {
    id: String(r.id),
    type: r.type as Place["type"],
    name: String(r.name),
    slug: String(r.slug),
    description: (r.description as string) ?? null,
    address: (r.address as string) ?? null,
    neighborhood: (r.neighborhood as string) ?? null,
    comuna: (r.comuna as string) ?? null,
    municipality: (r.municipality as string) ?? null,
    lat: Number(r.lat),
    lng: Number(r.lng),
    phone: (r.phone as string) ?? null,
    whatsapp: (r.whatsapp as string) ?? null,
    website: (r.website as string) ?? null,
    instagram: (r.instagram as string) ?? null,
    hours: (r.hours as string) ?? null,
    specialties: (r.specialties as string[]) ?? [],
    isFree: (r.is_free as boolean) ?? null,
    services: (r.services as string[]) ?? [],
    entity: (r.entity as string) ?? null,
    googlePlaceId: (r.google_place_id as string) ?? null,
    subjects: (r.subjects as string[]) ?? [],
    photoUrl: (r.photo_url as string) ?? null,
  };
}

const PLACE_SELECT = `
  id, type, name, slug, description, address, neighborhood, comuna, municipality,
  lat, lng, phone, whatsapp, website, instagram, hours, specialties,
  is_free, services, entity, google_place_id, subjects, photo_url
`;

export async function getUserPlaceStatus(
  placeId: string,
): Promise<UserPlaceStatus> {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("user_places")
    .select("status")
    .eq("user_id", user.id)
    .eq("place_id", placeId)
    .maybeSingle();

  return (data?.status as UserPlaceStatus) ?? null;
}

export async function setUserPlaceStatus(
  placeId: string,
  newStatus: "want_to_visit" | "visited",
  slug: string,
): Promise<void> {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: existing } = await supabase
    .from("user_places")
    .select("status")
    .eq("user_id", user.id)
    .eq("place_id", placeId)
    .maybeSingle();

  if (existing?.status === newStatus) {
    // Toggle off: ya tenía este estado → borrar
    await supabase
      .from("user_places")
      .delete()
      .eq("user_id", user.id)
      .eq("place_id", placeId);
  } else {
    await supabase.from("user_places").upsert(
      {
        user_id: user.id,
        place_id: placeId,
        status: newStatus,
        visited_at: newStatus === "visited" ? new Date().toISOString() : null,
      },
      { onConflict: "user_id,place_id" },
    );
  }

  revalidatePath(`/lugar/${slug}`);
  revalidatePath("/perfil");
}

export async function getUserPlaceLists(userId: string): Promise<{
  wantToVisit: Place[];
  visited: Place[];
}> {
  const supabase = await createSupabaseServer();

  const { data } = await supabase
    .from("user_places")
    .select(`status, places!inner(${PLACE_SELECT})`)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  const wantToVisit: Place[] = [];
  const visited: Place[] = [];

  for (const row of data ?? []) {
    const place = rowToPlace(row.places as unknown as Row);
    if (row.status === "want_to_visit") wantToVisit.push(place);
    else if (row.status === "visited") visited.push(place);
  }

  return { wantToVisit, visited };
}
