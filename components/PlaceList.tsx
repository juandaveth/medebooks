"use client";

import { useEffect, useRef } from "react";
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
  const activeRef = useRef<HTMLDivElement | null>(null);

  // Al cambiar el lugar activo (clic en pin o "al azar"), trae su tarjeta a la vista.
  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest" });
  }, [activeId]);

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
        <div key={p.id} ref={p.id === activeId ? activeRef : null}>
          <PlaceCard
            place={p}
            active={p.id === activeId}
            onSelect={onSelect}
          />
        </div>
      ))}
    </div>
  );
}
