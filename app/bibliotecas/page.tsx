import type { Metadata } from "next";
import { getPlaces, getFacets } from "@/lib/queries";
import { DirectoryShell } from "@/components/DirectoryShell";

const title = "Bibliotecas de Medellín";
const description =
  "Descubre las bibliotecas públicas del Área Metropolitana de Medellín en mapa y lista.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: { title, description, type: "website" },
};

export default async function BibliotecasPage() {
  const [places, facets] = await Promise.all([getPlaces(), getFacets()]);
  return <DirectoryShell places={places} facets={facets} initialType="biblioteca" />;
}
