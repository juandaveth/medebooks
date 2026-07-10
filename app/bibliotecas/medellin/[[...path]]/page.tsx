import type { Metadata } from "next";
import { DirectoryPage, directoryMetadata } from "@/components/DirectoryPage";

// /bibliotecas/medellin/[comuna]/[barrio] — solo bibliotecas.
type Props = { params: Promise<{ path?: string[] }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { path } = await params;
  return directoryMetadata("biblioteca", path);
}

export default async function BibliotecasGeoPage({ params }: Props) {
  const { path } = await params;
  return <DirectoryPage type="biblioteca" path={path} />;
}
