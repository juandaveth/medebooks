"use client";

import { useEffect, useMemo, useState } from "react";
import type { Place, PlaceFilters, PlaceType } from "@/lib/types";
import type { Facets } from "@/lib/queries";
import { filterPlaces } from "@/lib/filter";
import { geoSlug } from "@/lib/medellin";
import { Filters } from "./Filters";
import { PlaceList } from "./PlaceList";
import { MapView } from "./MapView";

// Ruta canónica compartible, con la geografía explícita bajo Medellín:
//   /                                 → todo Medellín
//   /librerias                        → librerías de Medellín
//   /medellin/castilla                → comuna Castilla (ambos tipos)
//   /librerias/medellin/belen/la-mota → librerías en el barrio La Mota (Belén)
function canonicalPath(
  type: PlaceType | "all",
  comuna?: string,
  barrio?: string,
): string {
  const typeSeg =
    type === "libreria" ? "/librerias" : type === "biblioteca" ? "/bibliotecas" : "";
  if (comuna && comuna !== "all") {
    const parts = ["medellin", geoSlug(comuna)];
    if (barrio && barrio !== "all") parts.push(geoSlug(barrio));
    return `${typeSeg}/${parts.join("/")}`;
  }
  return typeSeg || "/";
}

export function Directory({
  places,
  facets,
  initialType = "all",
  initialComuna,
  initialNeighborhood,
}: {
  places: Place[];
  facets: Facets;
  initialType?: PlaceType | "all";
  initialComuna?: string;
  initialNeighborhood?: string;
}) {
  const [filters, setFilters] = useState<PlaceFilters>({
    type: initialType,
    comuna: initialComuna ?? "all",
    neighborhood: initialNeighborhood ?? "all",
  });
  const [activeId, setActiveId] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<"list" | "map">("list");
  const [sort, setSort] = useState<"alpha" | "random">("alpha");
  const [shuffleSeed, setShuffleSeed] = useState(0);

  const filtered = useMemo(() => filterPlaces(places, filters), [places, filters]);

  // Ranking aleatorio estable durante la sesión; se rebaraja al pulsar "Aleatorio".
  // Hash determinista de (id + semilla) → [0,1): puro y reproducible, sin Math.random en render.
  const randomRank = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of places) {
      let h = (2166136261 ^ shuffleSeed) >>> 0;
      for (let i = 0; i < p.id.length; i++) {
        h = Math.imul(h ^ p.id.charCodeAt(i), 16777619);
      }
      m.set(p.id, (h >>> 0) / 4294967296);
    }
    return m;
  }, [places, shuffleSeed]);

  const ordered = useMemo(() => {
    if (sort === "random")
      return [...filtered].sort(
        (a, b) => (randomRank.get(a.id) ?? 0) - (randomRank.get(b.id) ?? 0),
      );
    return filtered; // ya viene alfabético desde la consulta
  }, [filtered, sort, randomRank]);

  // Refleja el filtro tipo+municipio en la URL (sin recargar) para que sea compartible
  // y el usuario descubra la ruta específica del municipio.
  useEffect(() => {
    const path = canonicalPath(
      filters.type ?? "all",
      filters.comuna,
      filters.neighborhood,
    );
    if (window.location.pathname !== path)
      window.history.replaceState(null, "", path);
  }, [filters.type, filters.comuna, filters.neighborhood]);

  function patch(p: Partial<PlaceFilters>) {
    setFilters((f) => {
      const next = { ...f, ...p };
      // Las especialidades no aplican a bibliotecas: al cambiar a ese tipo, se limpian.
      if (p.type === "biblioteca") next.specialties = [];
      // Cambiar de comuna invalida el barrio seleccionado.
      if (p.comuna !== undefined && p.neighborhood === undefined)
        next.neighborhood = "all";
      return next;
    });
    setActiveId(null);
  }

  function select(p: Place) {
    setActiveId(p.id);
    if (typeof window !== "undefined" && window.innerWidth < 768)
      setMobileView("map");
  }

  // Orden de la lista: A–Z o aleatorio (rebaraja cada vez que se elige aleatorio).
  function changeSort(next: "alpha" | "random") {
    setSort(next);
    if (next === "random") setShuffleSeed((s) => s + 1);
  }

  // "Muéstrame un lugar al azar": elige uno de los filtrados y lo abre en el mapa.
  function pickRandom() {
    if (filtered.length === 0) return;
    const p = filtered[Math.floor(Math.random() * filtered.length)];
    select(p);
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
            sort={sort}
            onSort={changeSort}
            onRandomPick={pickRandom}
          />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <PlaceList places={ordered} activeId={activeId} onSelect={select} />
        </div>
      </aside>

      {/* Mapa */}
      <div
        className={`relative min-h-0 flex-1 ${
          mobileView === "list" ? "hidden md:block" : "block"
        }`}
      >
        <MapView
          places={ordered}
          activeId={activeId}
          onSelect={(p) => setActiveId(p.id)}
          activeComuna={
            filters.comuna && filters.comuna !== "all" ? filters.comuna : undefined
          }
          activeNeighborhood={
            filters.neighborhood && filters.neighborhood !== "all"
              ? filters.neighborhood
              : undefined
          }
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
