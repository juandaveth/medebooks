import type { Metadata } from "next";
import { DirectoryPage, directoryMetadata } from "@/components/DirectoryPage";

// /medellin, /medellin/[comuna], /medellin/[comuna]/[barrio] — ambos tipos.
type Props = { params: Promise<{ path?: string[] }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { path } = await params;
  return directoryMetadata("all", path);
}

export default async function MedellinGeoPage({ params }: Props) {
  const { path } = await params;
  return <DirectoryPage type="all" path={path} />;
}
