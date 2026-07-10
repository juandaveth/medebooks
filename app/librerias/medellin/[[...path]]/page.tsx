import type { Metadata } from "next";
import { DirectoryPage, directoryMetadata } from "@/components/DirectoryPage";

// /librerias/medellin/[comuna]/[barrio] — solo librerías.
type Props = { params: Promise<{ path?: string[] }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { path } = await params;
  return directoryMetadata("libreria", path);
}

export default async function LibreriasGeoPage({ params }: Props) {
  const { path } = await params;
  return <DirectoryPage type="libreria" path={path} />;
}
