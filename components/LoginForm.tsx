"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase/client";

export function LoginForm() {
  const params = useSearchParams();
  const next = params.get("next") ?? "/admin";
  const hadError = params.get("error") === "auth";

  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const redirectTo = () =>
    `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;

  async function signInGoogle() {
    setBusy(true);
    setMsg(null);
    const supabase = createSupabaseBrowser();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: redirectTo() },
    });
    if (error) {
      setMsg(error.message);
      setBusy(false);
    }
  }

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setBusy(true);
    setMsg(null);
    const supabase = createSupabaseBrowser();
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: redirectTo() },
    });
    setBusy(false);
    if (error) setMsg(error.message);
    else setSent(true);
  }

  return (
    <div className="mx-auto mt-24 max-w-sm px-5">
      <h1 className="font-display text-3xl text-ink">Ingresar</h1>
      <p className="mt-2 text-sm text-ink-soft">
        Acceso para administración de medebooks.
      </p>

      {hadError && (
        <p className="mt-4 rounded bg-paper-2 px-3 py-2 text-sm text-accent">
          No se pudo completar el ingreso. Intenta de nuevo.
        </p>
      )}

      <button
        onClick={signInGoogle}
        disabled={busy}
        className="mt-6 w-full rounded-lg bg-ink px-4 py-2.5 text-sm text-paper transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        Continuar con Google
      </button>

      <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-wide text-ink-soft">
        <span className="h-px flex-1 bg-line" /> o <span className="h-px flex-1 bg-line" />
      </div>

      {sent ? (
        <p className="rounded bg-paper-2 px-3 py-2 text-sm text-ink">
          Te enviamos un enlace de acceso a <strong>{email}</strong>. Revisa tu
          correo.
        </p>
      ) : (
        <form onSubmit={sendMagicLink} className="space-y-2">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@correo.com"
            className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink placeholder:text-ink-soft/70 focus:border-ink focus:outline-none"
          />
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg border border-line px-4 py-2.5 text-sm text-ink transition-colors hover:border-ink disabled:opacity-50"
          >
            Enviar enlace de acceso
          </button>
        </form>
      )}

      {msg && <p className="mt-3 text-sm text-accent">{msg}</p>}
    </div>
  );
}
