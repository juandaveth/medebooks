"use client";

import { useEffect, useRef } from "react";
import type { Place } from "@/lib/types";
import type { UserPlaceStatus } from "@/lib/userPlaces";
import { PlaceCard } from "./PlaceCard";

export function PlaceList({
  places,
  activeId,
  onSelect,
  userPlaces = {},
}: {
  places: Place[];
  activeId?: string | null;
  onSelect?: (p: Place) => void;
  userPlaces?: Record<string, NonNullable<UserPlaceStatus>>;
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
            userStatus={userPlaces[p.id]}
          />
        </div>
      ))}
    </div>
  );
}
