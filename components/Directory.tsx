"use client";

import { useMemo, useState } from "react";
import type { Place, PlaceFilters } from "@/lib/types";
import { filterPlaces } from "@/lib/filter";
import { Filters } from "./Filters";
import { PlaceList } from "./PlaceList";
import { MapView } from "./MapView";

export function Directory({
  places,
  facets,
}: {
  places: Place[];
  facets: { municipalities: string[]; specialties: string[] };
}) {
  const [filters, setFilters] = useState<PlaceFilters>({ type: "all" });
  const [activeId, setActiveId] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<"list" | "map">("list");

  const filtered = useMemo(() => filterPlaces(places, filters), [places, filters]);

  function patch(p: Partial<PlaceFilters>) {
    setFilters((f) => {
      const next = { ...f, ...p };
      // Las especialidades no aplican a bibliotecas: al cambiar a ese tipo, se limpian.
      if (p.type === "biblioteca") next.specialties = [];
      return next;
    });
    setActiveId(null);
  }

  function select(p: Place) {
    setActiveId(p.id);
    if (typeof window !== "undefined" && window.innerWidth < 768)
      setMobileView("map");
  }

  return (
    <div className="flex h-full flex-col md:flex-row">
      {/* Panel izquierdo: filtros + lista */}
      <aside
        className={`flex min-h-0 flex-col border-line md:w-[420px] md:border-r ${
          mobileView === "map" ? "hidden md:flex" : "flex"
        }`}
      >
        <div className="border-b border-line px-5 py-4">
          <Filters
            filters={filters}
            facets={facets}
            count={filtered.length}
            onChange={patch}
          />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <PlaceList places={filtered} activeId={activeId} onSelect={select} />
        </div>
      </aside>

      {/* Mapa */}
      <div
        className={`relative min-h-0 flex-1 ${
          mobileView === "list" ? "hidden md:block" : "block"
        }`}
      >
        <MapView
          places={filtered}
          activeId={activeId}
          onSelect={(p) => setActiveId(p.id)}
        />
      </div>

      {/* Toggle móvil */}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-20 flex justify-center md:hidden">
        <div className="pointer-events-auto inline-flex rounded-full border border-line bg-paper p-0.5 shadow-lg">
          <button
            onClick={() => setMobileView("list")}
            className={`rounded-full px-5 py-2 text-sm ${
              mobileView === "list" ? "bg-ink text-paper" : "text-ink-soft"
            }`}
          >
            Lista
          </button>
          <button
            onClick={() => setMobileView("map")}
            className={`rounded-full px-5 py-2 text-sm ${
              mobileView === "map" ? "bg-ink text-paper" : "text-ink-soft"
            }`}
          >
            Mapa
          </button>
        </div>
      </div>
    </div>
  );
}
