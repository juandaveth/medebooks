import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";
import { getOrCreateProfile, addCompanionLink, getInviterByCode } from "@/lib/companions";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = searchParams.get("next") ?? "/";
  const inviteCode = searchParams.get("invite");

  const supabase = await createSupabaseServer();

  let authed = false;

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) authed = true;
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type: type as "magiclink" | "email",
      token_hash: tokenHash,
    });
    if (!error) authed = true;
  }

  if (!authed) {
    return NextResponse.redirect(`${origin}/login?error=auth`);
  }

  // Crear/asegurar perfil del nuevo usuario y procesar código de invitación
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const displayName = (user.user_metadata?.full_name as string | undefined) ?? user.email;
    const avatarUrl = user.user_metadata?.avatar_url as string | undefined;
    await getOrCreateProfile(user.id, displayName, avatarUrl);

    if (inviteCode) {
      const inviter = await getInviterByCode(inviteCode);
      if (inviter && inviter.userId !== user.id) {
        await addCompanionLink(user.id, inviter.userId, inviter.userId);
      }
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}
