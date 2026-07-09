import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "medebooks — Librerías y bibliotecas de Medellín",
    short_name: "medebooks",
    description:
      "Todas las librerías y bibliotecas del Área Metropolitana de Medellín, en un mapa.",
    start_url: "/",
    display: "standalone",
    background_color: "#f6f1e7",
    theme_color: "#f6f1e7",
    lang: "es-CO",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
  };
}
