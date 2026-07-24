import type { Metadata } from "next";
import Link from "next/link";
import { getInviterByCode } from "@/lib/companions";

export const metadata: Metadata = {
  title: "Noche de Librerías · medebooks",
  description: "Descubre las librerías de Medellín que participan en la Noche de Librerías y úneteles.",
};

const NOCHE_PLACES = [
  "Librería Ojo de Agua",
  "Ítaca Librería-Bar",
  "Librería Delfos",
  "Librería Grámmata y Palinuro",
  "Librería El Remanso de las Letras",
  "Antimateria Libros y Café",
  "Las Letras del Jaguar",
  "Librería de la Pascasia",
];

export default async function LeamosPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const inviter = await getInviterByCode(code);

  return (
    <div className="min-h-screen bg-paper">
      {/* Header */}
      <header className="border-b border-line px-5 py-4">
        <Link
          href="/"
          className="flex items-center gap-2 font-display text-xl leading-none tracking-tight text-ink"
        >
          <img src="/icon.svg" alt="" width={28} height={28} className="shrink-0" />
          <span className="text-[#FF6719]">medebooks</span>
        </Link>
      </header>

      <main className="mx-auto max-w-lg px-5 pb-20 pt-12">
        {/* Pill de evento */}
        <span className="inline-block rounded-full border border-[#FF6719]/40 bg-[#FF6719]/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-[#FF6719]">
          🔥 Esta noche · 24 de julio
        </span>

        {/* Invitación personalizada */}
        {inviter ? (
          <div className="mt-5 flex items-center gap-3">
            {inviter.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={inviter.avatarUrl}
                alt={inviter.displayName}
                className="h-10 w-10 rounded-full border border-line object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-paper-2 font-display text-base text-ink">
                {inviter.displayName[0].toUpperCase()}
              </div>
            )}
            <p className="text-sm text-ink-soft">
              <span className="font-medium text-ink">{inviter.displayName}</span> te invita
              a recorrer la ciudad esta noche
            </p>
          </div>
        ) : (
          <p className="mt-5 text-sm text-ink-soft">
            Alguien te invita a descubrir la ciudad esta noche
          </p>
        )}

        {/* Título */}
        <h1 className="font-display mt-6 text-4xl leading-[1.08] tracking-tight text-ink sm:text-5xl">
          Noche de Librerías
        </h1>
        <p className="mt-4 max-w-prose text-base leading-relaxed text-ink-soft">
          Esta noche las librerías de Antioquia abren sus puertas hasta tarde.
          Guarda las que quieres visitar, marca las que ya recorriste y conecta
          con otros lectores.
        </p>

        {/* Librerías participantes */}
        <div className="mt-8">
          <p className="text-xs font-medium uppercase tracking-[0.15em] text-ink-soft">
            Participan esta noche
          </p>
          <ul className="mt-3 space-y-2">
            {NOCHE_PLACES.map((name) => (
              <li
                key={name}
                className="flex items-center gap-2 rounded-lg border border-line bg-paper px-4 py-3 text-sm text-ink"
              >
                <span className="text-base">📕</span>
                {name}
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <div className="mt-10 space-y-3">
          <Link
            href={`/login?invite=${code}&next=/`}
            className="block w-full rounded-xl bg-ink px-6 py-3.5 text-center font-display text-base text-paper transition-opacity hover:opacity-90"
          >
            Crear mi cuenta y unirme
          </Link>
          <Link
            href="/"
            className="block w-full rounded-xl border border-line px-6 py-3.5 text-center text-sm text-ink-soft transition-colors hover:border-ink hover:text-ink"
          >
            Explorar el mapa sin cuenta
          </Link>
        </div>

        {/* Nota sobre compañeros */}
        {inviter && (
          <p className="mt-6 text-center text-xs text-ink-soft">
            Al registrarte quedarás conectado con {inviter.displayName} como compa de lectura.
          </p>
        )}
      </main>
    </div>
  );
}
