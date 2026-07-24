import type { Metadata } from "next";
import Link from "next/link";
import { createSupabaseServer } from "@/lib/supabase/server";
import { getMyInviteCode } from "@/lib/companions";
import { ShareButton } from "./ShareButton";

export const metadata: Metadata = {
  title: "Noche de las Librerías · medebooks",
  description:
    "Esta noche las librerías de Antioquia abren sus puertas. Guarda tu ruta y compártela con tus compas de lectura.",
  openGraph: {
    title: "Noche de las Librerías · medebooks",
    description:
      "Esta noche las librerías de Antioquia abren sus puertas. Guarda tu ruta y compártela con tus compas de lectura.",
  },
};

// Librerías participantes — actualizar con los datos del screenshot
const NOCHE_PLACES = [
  {
    name: "Librería Taller de Edición",
    neighborhood: "El Poblado",
    description: "Libros de arte, diseño y arquitectura.",
    slug: "libreria-taller-de-edicion",
    hours: "6 pm – 10 pm",
  },
  {
    name: "Librería Wilborada",
    neighborhood: "Laureles",
    description: "Literatura y humanidades. Cafetería.",
    slug: "libreria-wilborada",
    hours: "6 pm – 10 pm",
  },
  {
    name: "Antimateria",
    neighborhood: "Laureles",
    description: "Libros de autor, revistas independientes.",
    slug: "antimateria",
    hours: "6 pm – 11 pm",
  },
  {
    name: "El Ático",
    neighborhood: "El Centro",
    description: "Libros usados, raros y de colección.",
    slug: "el-atico",
    hours: "5 pm – 10 pm",
  },
  {
    name: "Librería Aquelarre",
    neighborhood: "El Centro",
    description: "Feminismo, identidades y pensamiento crítico.",
    slug: "libreria-aquelarre",
    hours: "6 pm – 10 pm",
  },
];

export default async function NocheLibreriasPage() {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  const inviteCode = user ? await getMyInviteCode() : null;

  return (
    <div className="min-h-screen bg-paper">
      {/* Header */}
      <header className="border-b border-line px-5 py-4">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 font-display text-xl leading-none tracking-tight text-ink"
          >
            <img src="/icon.svg" alt="" width={28} height={28} className="shrink-0" />
            medebooks
          </Link>
          {user ? (
            <Link href="/perfil" className="text-sm text-ink-soft transition-colors hover:text-ink">
              Mi perfil
            </Link>
          ) : (
            <Link
              href="/login?next=/noche-librerias"
              className="text-sm text-ink-soft transition-colors hover:text-ink"
            >
              Ingresar
            </Link>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-5 pb-24 pt-12">
        {/* Pill de evento */}
        <span className="inline-block rounded-full border border-[#FF6719]/40 bg-[#FF6719]/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-[#FF6719]">
          🔥 Esta noche · 24 de julio de 2026
        </span>

        <h1 className="font-display mt-4 text-4xl leading-[1.08] tracking-tight text-ink sm:text-5xl">
          Noche de las Librerías
        </h1>
        <p className="mt-4 max-w-prose text-base leading-relaxed text-ink-soft">
          Una noche para recorrer la ciudad estante por estante. Las librerías
          de Antioquia abren sus puertas, con actividades, lecturas y sorpresas.
          Guarda los lugares que quieres visitar y comparte la ruta con tus
          compas de lectura.
        </p>

        {/* Botón de compartir (dinámico, client) */}
        {inviteCode && (
          <div className="mt-6">
            <ShareButton inviteCode={inviteCode} />
          </div>
        )}

        {!user && (
          <Link
            href="/login?next=/noche-librerias"
            className="mt-6 inline-flex items-center gap-2 rounded-xl border border-[#FF6719]/40 bg-[#FF6719]/10 px-5 py-3 text-sm font-medium text-[#FF6719] transition-colors hover:bg-[#FF6719]/20"
          >
            Ingresar para guardar tu ruta →
          </Link>
        )}

        {/* Librerías de la Noche */}
        <section className="mt-12">
          <h2 className="font-display text-2xl tracking-tight text-ink">
            Librerías participantes
          </h2>
          <p className="mt-2 text-sm text-ink-soft">
            {NOCHE_PLACES.length} espacios abren esta noche
          </p>

          <div className="mt-6 space-y-3">
            {NOCHE_PLACES.map((place) => (
              <Link
                key={place.slug}
                href={`/lugar/${place.slug}`}
                className="group flex items-start gap-4 rounded-xl border border-line bg-paper p-4 transition-colors hover:border-[#FF6719]/40"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#FF6719]/10 text-lg">
                  📕
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-display text-base leading-tight text-ink group-hover:text-[#FF6719]">
                    {place.name}
                  </p>
                  <p className="mt-0.5 text-xs text-ink-soft">
                    {place.neighborhood} · {place.hours}
                  </p>
                  <p className="mt-1 text-sm text-ink-soft">{place.description}</p>
                </div>
                <span className="shrink-0 text-xs text-ink-soft/60 transition-transform group-hover:translate-x-0.5">
                  →
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* CTA final para no autenticados */}
        {!user && (
          <div className="mt-12 rounded-xl border border-line bg-paper-2 p-6">
            <p className="font-display text-lg text-ink">
              Guarda tu ruta de esta noche
            </p>
            <p className="mt-2 text-sm text-ink-soft">
              Créate una cuenta gratuita para guardar las librerías que quieres
              visitar y conectar con tus compas de lectura.
            </p>
            <Link
              href="/login?next=/noche-librerias"
              className="mt-4 inline-block rounded-xl bg-ink px-6 py-3 text-sm text-paper transition-opacity hover:opacity-90"
            >
              Crear cuenta con Google
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
