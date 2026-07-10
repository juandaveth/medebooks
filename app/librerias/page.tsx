import type { Metadata } from "next";
import { DirectoryPage, directoryMetadata } from "@/components/DirectoryPage";

export function generateMetadata(): Promise<Metadata> {
  return directoryMetadata("libreria");
}

export default function LibreriasPage() {
  return <DirectoryPage type="libreria" />;
}
