import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "medebooks — Librerías y bibliotecas de Medellín",
    short_name: "medebooks",
    description:
      "Todas las librerías y bibliotecas de Medellín, en un mapa por barrio.",
    start_url: "/",
    display: "standalone",
    background_color: "#f6f1e7",
    theme_color: "#f6f1e7",
    lang: "es-CO",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
