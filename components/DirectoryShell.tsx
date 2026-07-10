import Link from "next/link";
import type { Place, PlaceType } from "@/lib/types";
import type { Facets } from "@/lib/queries";
import { hasSupabase } from "@/lib/supabase";
import { Directory } from "./Directory";

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

export function DirectoryShell({
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
  return (
    <div className="flex h-[100dvh] flex-col">
      {/* Masthead editorial */}
      <header className="shrink-0 border-b border-line px-5 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-baseline gap-3">
            <Link
              href="/"
              className="font-display text-2xl leading-none tracking-tight text-ink"
            >
              medebooks
            </Link>
            <p className="hidden text-sm text-ink-soft sm:block">
              {subtitleFor(initialType, initialComuna, initialNeighborhood)}
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-ink-soft">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-accent" /> Librería
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-accent-2" /> Biblioteca
            </span>
          </div>
        </div>
        {!hasSupabase && (
          <p className="mt-2 rounded bg-paper-2 px-2 py-1 text-[11px] text-ink-soft">
            Modo demo: mostrando datos de muestra. Conecta Supabase para ver los
            datos reales sembrados desde Google Places.
          </p>
        )}
      </header>

      <main className="min-h-0 flex-1">
        <Directory
          places={places}
          facets={facets}
          initialType={initialType}
          initialComuna={initialComuna}
          initialNeighborhood={initialNeighborhood}
        />
      </main>
    </div>
  );
}
