import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts, formatDate } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Bitácora de cómo se construye medebooks: decisiones, tropiezos y aprendizajes reales.",
  openGraph: {
    title: "Blog · medebooks",
    description:
      "Bitácora de cómo se construye medebooks: decisiones, tropiezos y aprendizajes reales.",
  },
};

export default function BlogIndexPage() {
  const posts = getAllPosts();

  return (
    <div className="mx-auto max-w-2xl px-5 pb-24">
      <header className="border-b border-line py-4">
        <Link
          href="/"
          className="font-display text-2xl leading-none tracking-tight text-ink"
        >
          medebooks
        </Link>
      </header>

      <div className="pt-14">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-ink-soft">
          Construyendo en público
        </p>
        <h1 className="font-display mt-3 text-4xl leading-[1.05] tracking-tight text-ink sm:text-5xl">
          Blog
        </h1>
        <p className="mt-4 max-w-prose text-lg text-ink-soft">
          La bitácora de cómo se construye medebooks con Claude Code — las
          decisiones, los tropiezos y los aprendizajes, sin maquillar.
        </p>
      </div>

      {posts.length === 0 ? (
        <p className="mt-16 text-ink-soft">Aún no hay publicaciones. Pronto.</p>
      ) : (
        <ul className="mt-14 flex flex-col">
          {posts.map((post) => (
            <li key={post.slug} className="border-t border-line">
              <Link
                href={`/blog/${post.slug}`}
                className="group block py-7 transition-colors"
              >
                <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-ink-soft">
                  <time dateTime={post.date}>{formatDate(post.date)}</time>
                  {post.tag && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="text-accent">{post.tag}</span>
                    </>
                  )}
                  <span aria-hidden="true">·</span>
                  <span>{post.readingMinutes} min de lectura</span>
                </div>
                <h2 className="font-display mt-2 text-2xl leading-tight tracking-tight text-ink group-hover:text-accent sm:text-[1.7rem]">
                  {post.title}
                </h2>
                <p className="mt-2 max-w-prose text-ink-soft">
                  {post.description}
                </p>
                <span className="mt-3 inline-block text-sm font-medium text-accent">
                  Leer{" "}
                  <span className="transition-transform group-hover:translate-x-0.5">
                    →
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
