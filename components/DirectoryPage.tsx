import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPlaces, getFacets, getFeaturedPlaceIds, type Facets } from "@/lib/queries";
import { resolveGeo } from "@/lib/medellin";
import { DirectoryShell } from "@/components/DirectoryShell";
import type { PlaceType } from "@/lib/types";

// Helper compartido por todas las rutas del directorio (home, por tipo y por
// comuna/barrio). Centraliza la resolución de slugs y la metadata para que cada
// archivo de ruta sea mínimo.

export type GeoResolved = { comuna?: string; neighborhood?: string };

/** Resuelve los segmentos de URL [comuna, barrio?] a nombres canónicos; 404 si no existen. */
export function resolveGeoSegments(
  facets: Facets,
  path: string[] = [],
): GeoResolved {
  const [comunaSlug, barrioSlug] = path;
  if (!comunaSlug) return {};
  const comuna = resolveGeo(comunaSlug, facets.comunas);
  if (!comuna) notFound();
  if (!barrioSlug) return { comuna };
  const neighborhood = resolveGeo(barrioSlug, facets.barriosByComuna[comuna] ?? []);
  if (!neighborhood) notFound();
  return { comuna, neighborhood };
}

const KIND: Record<PlaceType | "all", string> = {
  all: "Librerías y bibliotecas",
  libreria: "Librerías",
  biblioteca: "Bibliotecas",
};

/** Metadata (title + Open Graph) para una vista del directorio. */
export async function directoryMetadata(
  type: PlaceType | "all",
  path: string[] = [],
): Promise<Metadata> {
  const facets = await getFacets();
  const { comuna, neighborhood } = resolveGeoSegments(facets, path);
  const kind = KIND[type];
  const where = neighborhood
    ? `${neighborhood}, ${comuna} (Medellín)`
    : comuna
      ? `${comuna}, Medellín`
      : "Medellín";
  const title = `${kind} en ${where}`;
  const description = `${kind} en ${where}, en mapa y lista.`;
  return { title, description, openGraph: { title, description, type: "website" } };
}

/** Renderiza el directorio para un tipo + geografía dados. */
export async function DirectoryPage({
  type = "all",
  path = [],
}: {
  type?: PlaceType | "all";
  path?: string[];
}) {
  const [places, facets, featuredPlaceIds] = await Promise.all([
    getPlaces(),
    getFacets(),
    getFeaturedPlaceIds(),
  ]);
  const { comuna, neighborhood } = resolveGeoSegments(facets, path);
  return (
    <DirectoryShell
      places={places}
      facets={facets}
      initialType={type}
      initialComuna={comuna}
      initialNeighborhood={neighborhood}
      featuredPlaceIds={featuredPlaceIds}
    />
  );
}
