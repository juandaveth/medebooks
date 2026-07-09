import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPlaces, getFacets } from "@/lib/queries";
import { resolveMunicipio } from "@/lib/municipios";
import { DirectoryShell } from "@/components/DirectoryShell";

// Ruta raíz por municipio: /copacabana → librerías Y bibliotecas de ese municipio.
// Las rutas fijas (/librerias, /bibliotecas) tienen prioridad sobre esta dinámica.
type Props = { params: Promise<{ municipio: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { municipio } = await params;
  const { municipalities } = await getFacets();
  const name = resolveMunicipio(municipio, municipalities);
  if (!name) return { title: "Municipio no encontrado" };
  const title = `Librerías y bibliotecas en ${name}`;
  const description = `Librerías y bibliotecas en ${name}, Área Metropolitana de Medellín, en mapa y lista.`;
  return { title, description, openGraph: { title, description, type: "website" } };
}

export default async function MunicipioPage({ params }: Props) {
  const { municipio } = await params;
  const [places, facets] = await Promise.all([getPlaces(), getFacets()]);
  const name = resolveMunicipio(municipio, facets.municipalities);
  if (!name) notFound();
  return (
    <DirectoryShell
      places={places}
      facets={facets}
      initialType="all"
      initialMunicipality={name}
    />
  );
}
