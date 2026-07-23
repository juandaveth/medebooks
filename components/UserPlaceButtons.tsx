"use client";

import { useTransition, useOptimistic } from "react";
import Link from "next/link";
import { setUserPlaceStatus } from "@/lib/userPlaces";
import type { UserPlaceStatus } from "@/lib/userPlaces";

export function UserPlaceButtons({
  placeId,
  slug,
  initialStatus,
  loggedIn,
}: {
  placeId: string;
  slug: string;
  initialStatus: UserPlaceStatus;
  loggedIn: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [status, setOptimistic] = useOptimistic(initialStatus);

  if (!loggedIn) {
    return (
      <Link
        href={`/login?next=/lugar/${slug}`}
        className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm text-ink-soft transition-colors hover:border-ink hover:text-ink"
      >
        <span>🔖</span> Ingresar para guardar
      </Link>
    );
  }

  function handleClick(newStatus: "want_to_visit" | "visited") {
    startTransition(async () => {
      const next = status === newStatus ? null : newStatus;
      setOptimistic(next);
      await setUserPlaceStatus(placeId, newStatus, slug);
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => handleClick("want_to_visit")}
        disabled={pending}
        className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors disabled:opacity-50 ${
          status === "want_to_visit"
            ? "border-ink bg-ink text-paper"
            : "border-line text-ink-soft hover:border-ink hover:text-ink"
        }`}
      >
        <span>🔖</span>
        {status === "want_to_visit" ? "Guardado" : "Quiero visitar"}
      </button>

      <button
        onClick={() => handleClick("visited")}
        disabled={pending}
        className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors disabled:opacity-50 ${
          status === "visited"
            ? "border-accent-2 bg-accent-2 text-paper"
            : "border-line text-ink-soft hover:border-ink hover:text-ink"
        }`}
      >
        <span>✓</span>
        {status === "visited" ? "Ya visité" : "Marcar como visitado"}
      </button>
    </div>
  );
}
