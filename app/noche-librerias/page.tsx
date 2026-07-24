import type { Metadata } from "next";
import Link from "next/link";
import { createSupabaseServer } from "@/lib/supabase/server";
import { getMyInviteCode } from "@/lib/companions";
import { ShareButton } from "./ShareButton";

export const metadata: Metadata = {
  title: "Noche de Librerías · medebooks",
  description:
    "8 librerías de Antioquia abren sus puertas esta noche con conversaciones, talleres, música y lecturas. Arma tu ruta.",
  openGraph: {
    title: "Noche de Librerías · medebooks",
    description:
      "8 librerías de Antioquia abren sus puertas esta noche con conversaciones, talleres, música y lecturas. Arma tu ruta.",
  },
};

const NOCHE_PLACES = [
  {
    nombre: "Librería Ojo de Agua",
    slug: "libreria-ojo-de-agua",
    direccion: "Calle 40 # 73-94, Beminimal Hotel",
    eventos: [
      { hora: "6:30 p.m.", titulo: 'La historia detrás de "Los muertos no eran tantos"', descripcion: "Conversación con la autora. Al final, espacio para firmas." },
      { hora: "7:45 p.m.", titulo: "Formas de narrar un vuelo", descripcion: "Teatro para descubrir cómo las historias también pueden habitar el cuerpo, la voz y la escena." },
      { hora: "9:00 p.m.", titulo: "Lo que también habita la noche", descripcion: "Una lectura compartida de cuentos de terror." },
      { hora: "7:00 p.m. – 12:00 a.m.", titulo: "Lanza el anzuelo", descripcion: "Lo que encuentres en el agua será tuyo. Pesca una frase, un libro o una sorpresa." },
    ],
  },
  {
    nombre: "Ítaca Librería-Bar",
    slug: "itaca-libreria-bar",
    direccion: "Circular 5 # 70-127",
    eventos: [
      { hora: "6:30 p.m. – 12:00 a.m.", titulo: "Polaroids en la ventana", descripcion: null },
      { hora: "7:00 p.m.", titulo: "¿El bosque cabe en un libro?", descripcion: null },
      { hora: "7:30 p.m.", titulo: "Aplasta flores, no corazones", descripcion: "Taller de separadores con flores prensadas." },
      { hora: "8:20 p.m.", titulo: "Los viernes también me pongo nostálgica", descripcion: "Poemas pa' aligerar la noche." },
      { hora: "9:20 p.m.", titulo: "Mis librerías preferidas", descripcion: "Imágenes de librerías que deslumbran, con dibujo en vivo." },
      { hora: "10:10 p.m.", titulo: "Dime, ¿cuál -primera página- me recomienda?", descripcion: null },
      { hora: "10:40 p.m.", titulo: "Sesiones desde el balcón", descripcion: null, destacado: true },
    ],
  },
  {
    nombre: "Librería Delfos",
    slug: "libreria-delfos",
    direccion: "Carrera 79 # 52A-34",
    eventos: [
      { hora: "6:00 – 8:00 p.m.", titulo: 'Café filosófico: "Lo propio en lo extraño"', descripcion: "¿Qué hay de malo con la meritocracia? Conversan Juan David Gómez Osorio y Yeison Lopera Varela." },
      { hora: "8:00 – 11:00 p.m.", titulo: "Palabra, imagen y estampa", descripcion: "Laboratorio de expresión gráfica.", destacado: true },
    ],
  },
  {
    nombre: "Librería Grámmata y Palinuro, Libros Leídos",
    slug: "libreria-grammata-textos",
    direccion: "Calle 49B # 75-33",
    eventos: [
      { hora: "3:00 p.m.", titulo: "Colorea con piglander", descripcion: "Para adultos y niños." },
      { hora: "5:30 p.m.", titulo: "Homenaje a Raúl Gómez Jatín", descripcion: "Conversan Luis Germán Sierra, escritor, y Bárbara Lins, poeta." },
      { hora: "7:00 p.m.", titulo: 'Presentación de "Una cosa salvaje que conoce la muerte"', descripcion: "De Lina María Parra. La autora conversa con Santiago Piedrahita, escritor." },
      { hora: "7:00 p.m. – 12:00 a.m.", titulo: "Mercado collagero", descripcion: "Con Juliana Arango.", destacado: true },
      { hora: "7:00 p.m. – 12:00 a.m.", titulo: "Serendipia", descripcion: "Exposición de fotografía experimental." },
      { hora: "9:00 p.m.", titulo: "Concierto Pala", descripcion: "Poemas y canciones." },
    ],
  },
  {
    nombre: "Librería El Remanso de las Letras",
    slug: "libreria-el-remanso-de-las-letras",
    direccion: "Calle 10 # 13-167, Entrerríos, Antioquia",
    eventos: [
      { hora: "7:00 p.m. – 12:00 a.m.", titulo: "Laboratorio de escucha literaria", descripcion: "Entre García Márquez y Rubén Blades. Una experiencia sensorial para descubrir cómo dialogan la literatura y la música.", destacado: true },
    ],
  },
  {
    nombre: "Antimateria Libros y Café",
    slug: "antimateria",
    direccion: "Calle 45E # 72-09",
    eventos: [
      { hora: "5:00 – 7:00 p.m.", titulo: "Club de lectura en voz alta", descripcion: '"Las estrellas son negras", de Arnoldo Palacios.' },
      { hora: "8:00 – 9:30 p.m.", titulo: "Performance ambient-noise-drone", descripcion: "Dueto de Mila Ortiz y analogue_ghost." },
      { hora: "9:30 p.m. – 12:00 a.m.", titulo: "Parchecito musical tranqui", descripcion: "En el jardín de la librería.", destacado: true },
    ],
  },
  {
    nombre: "Las Letras del Jaguar",
    slug: "las-letras-del-jaguar",
    direccion: "Calle 53 # 47-43",
    eventos: [
      { hora: "7:00 – 8:00 p.m.", titulo: "La vida se dañó, el libro salió bien", descripcion: "Literatura, anécdotas y confesiones de escritura." },
      { hora: "8:00 – 8:45 p.m.", titulo: "La voz de las Oropéndolas", descripcion: "El coro de mujeres Oropéndola le regala una serenata a las librerías en su noche." },
      { hora: "9:00 p.m. – 12:00 a.m.", titulo: "Lecturas borrachas", descripcion: "Textos leídos en voz alta, tragos y canciones elegidas por los lectores.", destacado: true },
    ],
  },
  {
    nombre: "Librería de la Pascasia",
    slug: "libreria-de-la-pascasia",
    direccion: "Calle 47 # 43-88",
    eventos: [
      { hora: "7:00 p.m.", titulo: "Hablando al garete: ¿vivirá el reggaetón para siempre?", descripcion: "Alejandro Cardona, dj, y Andrea Yepes, periodista, conversan con José Julián Villa." },
      { hora: "8:00 p.m. – 12:00 a.m.", titulo: "Tienda de calcas", descripcion: "Una papelería de barrio para que compres los útiles y las calcas para engallar tus libretas." },
      { hora: "8:00 p.m. – 12:00 a.m.", titulo: "Libreras invitadas", descripcion: "Elizabeth Builes y Sara Rodas te acompañan a encontrar tus próximos libros favoritos.", destacado: true },
    ],
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
          Esta noche · 24 de julio
        </span>

        <h1 className="font-display mt-4 text-4xl leading-[1.08] tracking-tight text-ink sm:text-5xl">
          Noche de Librerías
        </h1>
        <p className="mt-4 max-w-prose text-base leading-relaxed text-ink-soft">
          8 librerías de Antioquia abren sus puertas con conversaciones, talleres,
          música y lecturas en voz alta. Arma tu ruta y compártela con tus compas.
        </p>

        {/* Links externos */}
        <div className="mt-5 flex flex-wrap gap-3">
          <a
            href="https://www.instagram.com/p/DanzR1fEarf/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-line px-3.5 py-1.5 text-xs text-ink-soft transition-colors hover:border-ink hover:text-ink"
          >
            <span>📸</span> Instagram
          </a>
          <a
            href="https://www.elcolombiano.com/cultura/literatura/noche-librerias-2026-librerias-antioquia-abiertas-medianoche-ON39168431"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-line px-3.5 py-1.5 text-xs text-ink-soft transition-colors hover:border-ink hover:text-ink"
          >
            <span>📰</span> El Colombiano
          </a>
        </div>

        {/* Compartir / CTA */}
        {inviteCode ? (
          <div className="mt-6">
            <ShareButton inviteCode={inviteCode} />
          </div>
        ) : (
          <Link
            href="/login?next=/noche-librerias"
            className="mt-6 inline-flex items-center gap-2 rounded-xl border border-[#FF6719]/40 bg-[#FF6719]/10 px-5 py-3 text-sm font-medium text-[#FF6719] transition-colors hover:bg-[#FF6719]/20"
          >
            Ingresar para invitar compas →
          </Link>
        )}

        {/* Programación */}
        <section className="mt-12 space-y-6">
          <h2 className="font-display text-2xl tracking-tight text-ink">
            Programación
            <span className="ml-2 font-sans text-sm font-normal text-ink-soft">
              {NOCHE_PLACES.length} espacios
            </span>
          </h2>

          {NOCHE_PLACES.map((place) => (
            <div
              key={place.nombre}
              className="rounded-xl border border-line bg-paper"
            >
              {/* Cabecera de la librería */}
              <Link
                href={`/lugar/${place.slug}`}
                className="group flex items-start gap-3 border-b border-line px-4 py-4 transition-colors hover:bg-paper-2"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#FF6719]/10 text-base">
                  📕
                </div>
                <div className="flex-1">
                  <p className="font-display text-base leading-tight text-ink group-hover:text-[#FF6719]">
                    {place.nombre}
                  </p>
                  <p className="mt-0.5 text-xs text-ink-soft">{place.direccion}</p>
                </div>
                <span className="shrink-0 text-xs text-ink-soft/40 transition-transform group-hover:translate-x-0.5">→</span>
              </Link>

              {/* Eventos */}
              <ul className="divide-y divide-line">
                {place.eventos.map((ev, i) => (
                  <li key={i} className="flex items-start gap-3 px-4 py-3">
                    <span className="mt-0.5 w-28 shrink-0 text-xs tabular-nums text-ink-soft">
                      {ev.hora}
                    </span>
                    <div className="min-w-0">
                      <p className={`text-sm leading-snug ${ev.destacado ? "font-medium text-ink" : "text-ink"}`}>
                        {ev.titulo}
                        {ev.destacado && (
                          <span className="ml-1.5 inline-block rounded-full bg-[#FF6719]/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[#FF6719]">
                            destacado
                          </span>
                        )}
                      </p>
                      {ev.descripcion && (
                        <p className="mt-0.5 text-xs leading-relaxed text-ink-soft">
                          {ev.descripcion}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        {/* CTA final para no autenticados */}
        {!user && (
          <div className="mt-10 rounded-xl border border-line bg-paper-2 p-6">
            <p className="font-display text-lg text-ink">Invita a tus compas</p>
            <p className="mt-2 text-sm text-ink-soft">
              Créate una cuenta gratuita para compartir la ruta de esta noche con
              tus amigos lectores.
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
