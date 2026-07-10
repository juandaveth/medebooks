import type { Metadata } from "next";
import { DirectoryPage, directoryMetadata } from "@/components/DirectoryPage";

export function generateMetadata(): Promise<Metadata> {
  return directoryMetadata("biblioteca");
}

export default function BibliotecasPage() {
  return <DirectoryPage type="biblioteca" />;
}
