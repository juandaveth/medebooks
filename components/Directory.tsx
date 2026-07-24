"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Place, PlaceFilters, PlaceType } from "@/lib/types";
import type { Facets } from "@/lib/queries";
import type { UserPlaceStatus } from "@/lib/userPlaces";
import { filterPlaces } from "@/lib/filter";
import { geoSlug } from "@/lib/medellin";
import { Filters } from "./Filters";
import { PlaceList } from "./PlaceList";
import { MapView } from "./MapView";

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
  isAuthenticated = false,
}: {
  places: Place[];
  facets: Facets;
  initialType?: PlaceType | "all";
  initialComuna?: string;
  initialNeighborhood?: string;
  userPlaces?: Record<string, NonNullable<UserPlaceStatus>>;
  isAuthenticated?: boolean;
}) {
  const router = useRouter();
  const [myMap, setMyMap] = useState(false);
  const [myMapFilter, setMyMapFilter] = useState<"all" | "want_to_visit" | "visited">("all");
  const hasUserPlaces = Object.keys(userPlaces).length > 0;
  const searchParams = useSearchParams();

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
    if (myMap) {
      const saved = base.filter((p) => userPlaces[p.id]);
      if (myMapFilter === "all") return saved;
      return saved.filter((p) => userPlaces[p.id] === myMapFilter);
    }
    return base;
  }, [filtered, sort, randomRank, myMap, myMapFilter, userPlaces]);

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
      if (p.type === "biblioteca") next.specialties = [];
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

  function changeSort(next: "alpha" | "random") {
    setSort(next);
    if (next === "random") setShuffleSeed((s) => s + 1);
  }

  function pickRandom() {
    if (filtered.length === 0) return;
    const p = filtered[Math.floor(Math.random() * filtered.length)];
    select(p);
  }

  function toggleMyMapMobile() {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    setMyMap((v) => !v);
    setMyMapFilter("all");
  }

  const activePill = "border-ink bg-ink text-paper";
  const inactivePill = "border-line text-ink-soft";
  const pillBase = "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-2 text-sm transition-colors";

  // Mi mapa: siempre naranja medebooks, Fraunces
  const myMapActive = "border-[#FF6719] bg-[#FF6719] text-white font-display";
  const myMapInactive = "border-[#FF6719]/40 bg-[#FF6719]/10 text-[#FF6719] font-display";

  return (
    <div className="flex h-full flex-col">

      {/* ── Sub-header mobile: siempre visible ── */}
      <div className="shrink-0 border-b border-line px-4 py-2 md:hidden">
        <div className="flex items-center justify-between gap-2">

          {/* Izquierda: pills de tipo (solo en mapa) ↔ sub-filtros de Mi mapa */}
          {(mobileView === "map" || myMap) && (
            <div className="inline-flex rounded-full border border-line bg-paper p-0.5">
              {myMap ? (
                <>
                  <button
                    onClick={() => setMyMapFilter(myMapFilter === "want_to_visit" ? "all" : "want_to_visit")}
                    className={`font-display rounded-full px-3.5 py-1.5 text-sm transition-colors ${
                      myMapFilter === "want_to_visit" ? activePill : "text-ink-soft hover:opacity-80"
                    }`}
                  >
                    🔖 Quiero ir
                  </button>
                  <button
                    onClick={() => setMyMapFilter(myMapFilter === "visited" ? "all" : "visited")}
                    className={`font-display rounded-full px-3.5 py-1.5 text-sm transition-colors ${
                      myMapFilter === "visited" ? activePill : "text-ink-soft hover:opacity-80"
                    }`}
                  >
                    ✓ Visitadas
                  </button>
                </>
              ) : (
                ([
                  { value: "all",        label: "Todo",        on: "bg-[#FF6719] text-white",  off: "text-[#FF6719]"  },
                  { value: "libreria",   label: "Librerías",   on: "bg-accent text-paper",     off: "text-accent"     },
                  { value: "biblioteca", label: "Bibliotecas", on: "bg-accent-2 text-paper",   off: "text-accent-2"   },
                ] as const).map((t) => (
                  <button
                    key={t.value}
                    onClick={() => patch({ type: t.value })}
                    className={`font-display rounded-full px-4 py-1.5 text-sm transition-colors ${
                      (filters.type ?? "all") === t.value ? t.on : `${t.off} hover:opacity-80`
                    }`}
                  >
                    {t.label}
                  </button>
                ))
              )}
            </div>
          )}

          {/* Derecha: Mi mapa — "mi" + ícono */}
          <button
            onClick={toggleMyMapMobile}
            aria-label="Mi mapa"
            className={`font-display inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1.5 text-sm transition-colors ${
              myMap ? myMapActive : myMapInactive
            }`}
          >
            {myMap
              ? <span className="leading-none">✕</span>
              : <>
                  <span>mi</span>
                  <img src="/icon.svg" alt="" width={18} height={18} className="shrink-0" />
                </>
            }
          </button>
        </div>
      </div>

      {/* ── Layout principal: sidebar + mapa ── */}
      <div className="flex min-h-0 flex-1 flex-col md:flex-row">

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
              <div className="mt-3 hidden flex-wrap items-center gap-2 md:flex">
                <button
                  onClick={() => { setMyMap((v) => !v); setMyMapFilter("all"); }}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors ${
                    myMap ? myMapActive : myMapInactive
                  }`}
                >
                  <span>{myMap ? "✕" : "🗺"}</span>
                  Mi mapa
                </button>
                {myMap && (
                  <>
                    <button
                      onClick={() => setMyMapFilter(myMapFilter === "want_to_visit" ? "all" : "want_to_visit")}
                      className={`font-display inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs transition-colors ${
                        myMapFilter === "want_to_visit"
                          ? activePill
                          : `${inactivePill} hover:border-ink hover:text-ink`
                      }`}
                    >
                      🔖 Quiero ir
                    </button>
                    <button
                      onClick={() => setMyMapFilter(myMapFilter === "visited" ? "all" : "visited")}
                      className={`font-display inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs transition-colors ${
                        myMapFilter === "visited"
                          ? activePill
                          : `${inactivePill} hover:border-ink hover:text-ink`
                      }`}
                    >
                      ✓ Visitadas
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto pb-16 md:pb-0">
            <PlaceList places={ordered} activeId={activeId} onSelect={select} userPlaces={userPlaces} />
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
      </div>

      {/* ── Footer mobile: siempre Lista/Mapa ── */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-paper px-4 py-3 md:hidden">
        <div className="flex justify-center">
          <div className="inline-flex rounded-full border border-line bg-paper p-0.5">
            <button
              onClick={() => setMobileView("list")}
              className={`font-display rounded-full px-6 py-1.5 text-sm transition-colors ${
                mobileView === "list" ? "bg-ink text-paper" : "text-ink-soft"
              }`}
            >
              Lista
            </button>
            <button
              onClick={() => setMobileView("map")}
              className={`font-display rounded-full px-6 py-1.5 text-sm transition-colors ${
                mobileView === "map" ? "bg-ink text-paper" : "text-ink-soft"
              }`}
            >
              Mapa
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
