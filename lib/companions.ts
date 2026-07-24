"use server";

import { createSupabaseServer } from "./supabase/server";
import { createSupabaseAdmin } from "./supabase/admin";

export type CompanionProfile = {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  inviteCode: string;
};

/** Devuelve (o crea si no existe) el perfil del usuario con su invite_code. */
export async function getOrCreateProfile(userId: string, displayName?: string, avatarUrl?: string): Promise<string> {
  const admin = createSupabaseAdmin();
  const { data, error } = await admin
    .from("profiles")
    .upsert(
      {
        user_id: userId,
        display_name: displayName ?? null,
        avatar_url: avatarUrl ?? null,
      },
      { onConflict: "user_id", ignoreDuplicates: true }
    )
    .select("invite_code")
    .single();

  if (error || !data) {
    // Si el upsert ignoró el duplicado, leer directamente
    const { data: existing } = await admin
      .from("profiles")
      .select("invite_code")
      .eq("user_id", userId)
      .single();
    return existing?.invite_code ?? "";
  }

  return data.invite_code;
}

/** Obtiene el código de invitación del usuario autenticado actual. */
export async function getMyInviteCode(): Promise<string | null> {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const name = (user.user_metadata?.full_name as string | undefined) ?? user.email;
  const avatar = user.user_metadata?.avatar_url as string | undefined;

  return getOrCreateProfile(user.id, name, avatar);
}

/** Busca el perfil del invitante a partir del código. */
export async function getInviterByCode(code: string): Promise<CompanionProfile | null> {
  const admin = createSupabaseAdmin();
  const { data } = await admin
    .from("profiles")
    .select("user_id, invite_code, display_name, avatar_url")
    .eq("invite_code", code.toUpperCase())
    .maybeSingle();

  if (!data) return null;

  return {
    userId: data.user_id,
    displayName: data.display_name ?? "Un lector",
    avatarUrl: data.avatar_url ?? null,
    inviteCode: data.invite_code,
  };
}

/** Devuelve los compañeros de lectura del usuario. */
export async function getCompanions(userId: string): Promise<CompanionProfile[]> {
  const admin = createSupabaseAdmin();
  const { data } = await admin
    .from("reading_companions")
    .select("user_a, user_b, profiles!reading_companions_user_a_fkey(user_id, display_name, avatar_url, invite_code), profiles!reading_companions_user_b_fkey(user_id, display_name, avatar_url, invite_code)")
    .or(`user_a.eq.${userId},user_b.eq.${userId}`);

  if (!data) return [];

  return data.map((row) => {
    // El compañero es el que NO soy yo
    const isA = row.user_a === userId;
    const profile = isA
      ? (row as Record<string, unknown>)["profiles!reading_companions_user_b_fkey"] as Record<string, unknown>
      : (row as Record<string, unknown>)["profiles!reading_companions_user_a_fkey"] as Record<string, unknown>;

    return {
      userId: String(profile?.user_id ?? ""),
      displayName: String(profile?.display_name ?? "Lector"),
      avatarUrl: (profile?.avatar_url as string | null) ?? null,
      inviteCode: String(profile?.invite_code ?? ""),
    };
  });
}

/** Vincula dos usuarios como compañeros de lectura (idempotente). */
export async function addCompanionLink(userIdA: string, userIdB: string, invitedBy: string): Promise<void> {
  if (userIdA === userIdB) return;

  // Garantizar orden (user_a < user_b)
  const [a, b] = userIdA < userIdB ? [userIdA, userIdB] : [userIdB, userIdA];

  const admin = createSupabaseAdmin();
  await admin.from("reading_companions").upsert(
    { user_a: a, user_b: b, invited_by: invitedBy },
    { onConflict: "user_a,user_b", ignoreDuplicates: true }
  );
}
