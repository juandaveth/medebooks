import { getPlaces, getFacets } from "@/lib/queries";
import { hasSupabase } from "@/lib/supabase";
import { Directory } from "@/components/Directory";

export default async function Home() {
  const [places, facets] = await Promise.all([getPlaces(), getFacets()]);

  return (
    <div className="flex h-[100dvh] flex-col">
      {/* Masthead editorial */}
      <header className="shrink-0 border-b border-line px-5 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-baseline gap-3">
            <h1 className="font-display text-2xl leading-none tracking-tight text-ink">
              medebooks
            </h1>
            <p className="hidden text-sm text-ink-soft sm:block">
              Librerías y bibliotecas del Área Metropolitana de Medellín
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
        <Directory places={places} facets={facets} />
      </main>
    </div>
  );
}
