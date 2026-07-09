import { getPlaces, getFacets } from "@/lib/queries";
import { DirectoryShell } from "@/components/DirectoryShell";

export default async function Home() {
  const [places, facets] = await Promise.all([getPlaces(), getFacets()]);
  return <DirectoryShell places={places} facets={facets} initialType="all" />;
}
