import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts, formatDate, type PostMeta } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Reseñas de las librerías y bibliotecas de Medellín, y la bitácora de cómo se construye medebooks en público.",
  openGraph: {
    title: "Blog · medebooks",
    description:
      "Reseñas de las librerías y bibliotecas de Medellín, y la bitácora de cómo se construye medebooks en público.",
  },
};

function PostRow({ post }: { post: PostMeta }) {
  return (
    <li className="border-t border-line">
      <Link href={`/blog/${post.slug}`} className="group block py-7">
        <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-ink-soft">
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          <span aria-hidden="true">·</span>
          <span>{post.readingMinutes} min de lectura</span>
        </div>
        <h3 className="font-display mt-2 text-2xl leading-tight tracking-tight text-ink group-hover:text-accent sm:text-[1.7rem]">
          {post.title}
        </h3>
        <p className="mt-2 max-w-prose text-ink-soft">{post.description}</p>
        <span className="mt-3 inline-block text-sm font-medium text-accent">
          Leer{" "}
          <span className="inline-block transition-transform group-hover:translate-x-0.5">
            →
          </span>
        </span>
      </Link>
    </li>
  );
}

export default function BlogIndexPage() {
  const posts = getAllPosts();
  const resenas = posts.filter((p) => p.section === "resenas");
  const construyendo = posts.filter((p) => p.section === "construyendo");

  return (
    <div className="mx-auto max-w-2xl px-5 pb-24">
      <header className="flex items-center justify-between gap-4 border-b border-line py-4">
        <Link
          href="/"
          className="font-display text-2xl leading-none tracking-tight text-ink"
        >
          medebooks
        </Link>
        <Link
          href="/"
          className="text-sm font-medium text-accent hover:underline"
        >
          🗺️ Ir al mapa
        </Link>
      </header>

      {/* Intro: las dos corrientes del blog */}
      <div className="pt-14">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-ink-soft">
          El blog de medebooks
        </p>
        <h1 className="font-display mt-3 text-4xl leading-[1.05] tracking-tight text-ink sm:text-5xl">
          Dos maneras de leer la ciudad
        </h1>
        <p className="mt-5 max-w-prose text-lg leading-relaxed text-ink-soft">
          Aquí pasan dos cosas. Vamos a <strong className="text-ink">reseñar,
          una por una, las librerías y bibliotecas</strong> de Medellín — quién
          las atiende, qué se consigue, por qué vale la pena ir. Y en paralelo
          contamos, sin maquillar, <strong className="text-ink">cómo se
          construye medebooks</strong> por dentro.
        </p>
      </div>

      {/* Corriente 1 — Reseñas (anunciada) */}
      <section className="pt-16">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="font-display text-2xl tracking-tight text-ink">
            Reseñas
          </h2>
          <span className="text-xs uppercase tracking-wide text-accent-2">
            Librerías 📕 y bibliotecas 🏛️
          </span>
        </div>

        {resenas.length === 0 ? (
          <div className="mt-5 rounded-xl border border-line bg-paper-2 p-6 sm:p-8">
            <span className="inline-block rounded-full border border-accent-2 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-accent-2">
              Pronto
            </span>
            <p className="font-display mt-4 text-xl leading-snug text-ink sm:text-2xl">
              Vamos a recorrer la ciudad, estante por estante.
            </p>
            <p className="mt-3 max-w-prose text-ink-soft">
              Cada semana tomaremos una librería o una biblioteca y le
              dedicaremos una reseña: su historia, lo que la hace distinta, qué
              encontrar y cómo llegar. Empezando por las de barrio, esas que casi
              nadie tiene en el radar.
            </p>
            <Link
              href="/"
              className="mt-5 inline-block text-sm font-medium text-accent hover:underline"
            >
              Explora el mapa mientras tanto{" "}
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        ) : (
          <ul className="mt-6 flex flex-col">
            {resenas.map((post) => (
              <PostRow key={post.slug} post={post} />
            ))}
          </ul>
        )}
      </section>

      {/* Corriente 2 — Construyendo en público */}
      <section className="pt-16">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="font-display text-2xl tracking-tight text-ink">
            Construyendo en público
          </h2>
          <span className="text-xs uppercase tracking-wide text-accent">
            Detrás de cámaras
          </span>
        </div>
        <p className="mt-3 max-w-prose text-ink-soft">
          El diario de cómo se hace medebooks: decisiones, tropiezos y
          aprendizajes reales, construido con Claude Code.
        </p>

        {construyendo.length === 0 ? (
          <p className="mt-8 text-ink-soft">Pronto el primer capítulo.</p>
        ) : (
          <ul className="mt-6 flex flex-col">
            {construyendo.map((post) => (
              <PostRow key={post.slug} post={post} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
