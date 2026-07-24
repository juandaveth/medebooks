import { Suspense } from "react";
import Link from "next/link";
import type { Place, PlaceType } from "@/lib/types";
import type { Facets } from "@/lib/queries";
import { hasSupabase } from "@/lib/supabase";
import { createSupabaseServer } from "@/lib/supabase/server";
import { getUserPlaceStatuses } from "@/lib/userPlaces";
import { Directory } from "./Directory";
import { UserMenu } from "./UserMenu";

// Subtítulo del masthead según el tipo que se está viendo.
const SUBTITLE: Record<PlaceType | "all", string> = {
  all: "Librerías y bibliotecas de Medellín, por barrio",
  libreria: "Librerías de Medellín, por barrio",
  biblioteca: "Bibliotecas de Medellín, por barrio",
};

function subtitleFor(
  type: PlaceType | "all",
  comuna?: string,
  neighborhood?: string,
): string {
  if (!comuna) return SUBTITLE[type];
  const kind =
    type === "libreria"
      ? "Librerías"
      : type === "biblioteca"
        ? "Bibliotecas"
        : "Librerías y bibliotecas";
  // "… en La Mota, Belén" o "… en Belén"
  const where = neighborhood ? `${neighborhood}, ${comuna}` : comuna;
  return `${kind} en ${where}`;
}

export async function DirectoryShell({
  places,
  facets,
  initialType = "all",
  initialComuna,
  initialNeighborhood,
  featuredPlaceIds = [],
}: {
  places: Place[];
  facets: Facets;
  initialType?: PlaceType | "all";
  initialComuna?: string;
  initialNeighborhood?: string;
  featuredPlaceIds?: string[];
}) {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  const userPlaces = user ? await getUserPlaceStatuses(user.id) : {};

  return (
    <div className="flex h-[100dvh] flex-col">
      {/* Masthead editorial */}
      <header className="shrink-0 border-b border-line">

        {/* Mobile: marca izquierda · agenda + usuario derecha */}
        <div className="flex items-center justify-between px-5 py-3 md:hidden">
          <Link
            href="/"
            className="flex items-center gap-2 font-display text-xl leading-none tracking-tight text-ink"
          >
            <img src="/icon.svg" alt="" width={28} height={28} className="shrink-0" />
            <span className="text-[#FF6719]">medebooks</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/agenda"
              className="flex flex-col items-center gap-0.5 text-ink-soft transition-colors hover:text-ink"
            >
              <span className="text-lg leading-none">🗓</span>
              <span className="font-display text-[10px] uppercase tracking-wide">Agenda</span>
            </Link>
            <UserMenu />
          </div>
        </div>

        {/* Desktop: logo + subtítulo + nav + usuario */}
        <div className="hidden items-center justify-between gap-4 px-5 py-3 md:flex">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 font-display text-2xl leading-none tracking-tight text-ink"
            >
              <img src="/icon.svg" alt="" width={28} height={28} className="shrink-0" />
              <span className="text-[#FF6719]">medebooks</span>
            </Link>
            <p className="hidden text-sm text-ink-soft sm:block">
              {subtitleFor(initialType, initialComuna, initialNeighborhood)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-4 text-xs uppercase tracking-wide text-ink-soft">
              <Link href="/agenda" className="transition-colors hover:text-ink">
                Agenda
              </Link>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-accent" /> Librería
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-accent-2" /> Biblioteca
              </span>
            </div>
            <UserMenu />
          </div>
        </div>

        {!hasSupabase && (
          <p className="mx-5 mb-2 rounded bg-paper-2 px-2 py-1 text-[11px] text-ink-soft">
            Modo demo: mostrando datos de muestra. Conecta Supabase para ver los
            datos reales sembrados desde Google Places.
          </p>
        )}
      </header>

      <main className="min-h-0 flex-1">
        <Suspense>
          <Directory
            places={places}
            facets={facets}
            initialType={initialType}
            initialComuna={initialComuna}
            initialNeighborhood={initialNeighborhood}
            userPlaces={userPlaces}
            isAuthenticated={!!user}
            featuredPlaceIds={featuredPlaceIds}
          />
        </Suspense>
      </main>
    </div>
  );
}
