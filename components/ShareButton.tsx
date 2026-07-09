"use client";

import { useState } from "react";

export function ShareButton({
  title,
  text,
}: {
  title: string;
  text?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    // Web Share API en móvil; fallback a copiar el enlace.
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch {
        /* usuario canceló — sin acción */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard no disponible */
    }
  }

  return (
    <button
      onClick={share}
      className="inline-flex items-center gap-2 rounded-full border border-ink px-4 py-2 text-sm text-ink transition-colors hover:bg-ink hover:text-paper"
    >
      {copied ? "Enlace copiado ✓" : "Compartir"}
    </button>
  );
}
