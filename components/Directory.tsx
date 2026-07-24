"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Place, PlaceFilters, PlaceType } from "@/lib/types";
import type { Facets } from "@/lib/queries";
import type { UserPlaceStatus } from "@/lib/userPlaces";
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
  userPlaces = {},
}: {
  places: Place[];
  facets: Facets;
  initialType?: PlaceType | "all";
  initialComuna?: string;
  initialNeighborhood?: string;
  userPlaces?: Record<string, NonNullable<UserPlaceStatus>>;
}) {
  const [myMap, setMyMap] = useState(false);
  const hasUserPlaces = Object.keys(userPlaces).length > 0;
  const searchParams = useSearchParams();

  // Activa Mi mapa cuando llega ?mymapa=1 (desde el menú de usuario).
  // useSearchParams reacciona también a navegaciones client-side desde la misma página.
  useEffect(() => {
    if (searchParams.get("mymapa") === "1" && hasUserPlaces) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMyMap(true);
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, [searchParams, hasUserPlaces]);

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
    const base =
      sort === "random"
        ? [...filtered].sort(
            (a, b) => (randomRank.get(a.id) ?? 0) - (randomRank.get(b.id) ?? 0),
          )
        : filtered;
    if (myMap) return base.filter((p) => userPlaces[p.id]);
    return base;
  }, [filtered, sort, randomRank, myMap, userPlaces]);

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
            count={myMap ? ordered.length : filtered.length}
            onChange={patch}
            sort={sort}
            onSort={changeSort}
            onRandomPick={pickRandom}
          />
          {hasUserPlaces && (
            <div className="mt-3">
              <button
                onClick={() => setMyMap((v) => !v)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors ${
                  myMap
                    ? "border-ink bg-ink text-paper"
                    : "border-line text-ink-soft hover:border-ink hover:text-ink"
                }`}
              >
                <span>{myMap ? "✕" : "🗺"}</span>
                Mi mapa
              </button>
            </div>
          )}
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
          userPlaces={userPlaces}
          myMapMode={myMap}
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
