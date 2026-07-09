"use client";

import type { Place } from "@/lib/types";
import { PlaceCard } from "./PlaceCard";

export function PlaceList({
  places,
  activeId,
  onSelect,
}: {
  places: Place[];
  activeId?: string | null;
  onSelect?: (p: Place) => void;
}) {
  if (places.length === 0) {
    return (
      <div className="px-5 py-16 text-center text-ink-soft">
        <p className="font-display text-xl">Sin resultados</p>
        <p className="mt-1 text-sm">Prueba con otro filtro o búsqueda.</p>
      </div>
    );
  }
  return (
    <div>
      {places.map((p) => (
        <PlaceCard
          key={p.id}
          place={p}
          active={p.id === activeId}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
