import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import { SessionProvider } from "@/components/SessionProvider";
import "./globals.css";

// Display expresiva de alto contraste para titulares (carácter editorial).
const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
});

// Cuerpo legible.
const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const SITE_NAME = "medebooks";
const SITE_DESC =
  "Todas las librerías y bibliotecas del Área Metropolitana de Medellín, en un mapa.";

export const metadata: Metadata = {
  metadataBase: new URL("https://medebooks.vercel.app"),
  title: {
    default: `${SITE_NAME} — Librerías y bibliotecas de Medellín`,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESC,
  applicationName: SITE_NAME,
  openGraph: {
    type: "website",
    locale: "es_CO",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Librerías y bibliotecas de Medellín`,
    description: SITE_DESC,
  },
};

export const viewport: Viewport = {
  themeColor: "#f6f1e7",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es"
      className={`${fraunces.variable} ${inter.variable} h-full`}
      data-scroll-behavior="smooth"
    >
      <body className="min-h-full">
          <SessionProvider>{children}</SessionProvider>
        </body>
    </html>
  );
}
