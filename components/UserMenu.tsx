"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSession } from "./SessionProvider";

export function UserMenu() {
  const { user, loading, signOut } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (loading) return <div className="h-7 w-16 animate-pulse rounded bg-line" />;

  if (!user) {
    return (
      <Link
        href="/login?next=/"
        className="rounded-lg border border-line px-3 py-1.5 text-xs uppercase tracking-wide text-ink-soft transition-colors hover:border-ink hover:text-ink"
      >
        Ingresar
      </Link>
    );
  }

  const avatar = user.user_metadata?.avatar_url as string | undefined;
  const name = (user.user_metadata?.full_name as string | undefined) ?? user.email ?? "Cuenta";
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-line bg-paper-2 text-xs font-medium text-ink transition-colors hover:border-ink"
        aria-label="Menú de cuenta"
      >
        {avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatar} alt={name} className="h-full w-full object-cover" />
        ) : (
          initials
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-50 min-w-[160px] rounded-lg border border-line bg-paper shadow-md">
          <div className="border-b border-line px-3 py-2">
            <p className="text-xs font-medium text-ink leading-tight truncate max-w-[140px]">{name}</p>
            <p className="text-[11px] text-ink-soft truncate max-w-[140px]">{user.email}</p>
          </div>
          <Link
            href="/perfil"
            onClick={() => setOpen(false)}
            className="block px-3 py-2 text-xs text-ink hover:bg-paper-2"
          >
            👤 Mi perfil
          </Link>
          <Link
            href="/?mymapa=1"
            onClick={() => setOpen(false)}
            className="block px-3 py-2 text-xs text-ink hover:bg-paper-2"
          >
            🗺 Mi mapa
          </Link>
          <button
            onClick={() => { setOpen(false); signOut(); }}
            className="w-full px-3 py-2 text-left text-xs text-accent hover:bg-paper-2"
          >
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}
