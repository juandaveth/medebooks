import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllSlugs, getPost, formatDate } from "@/lib/blog";

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: "Publicación no encontrada" };

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      type: "article",
      title: `${post.title} · medebooks`,
      description: post.description,
      publishedTime: post.date || undefined,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  return (
    <div className="mx-auto max-w-2xl px-5 pb-28">
      <header className="flex items-center justify-between border-b border-line py-4">
        <Link
          href="/"
          className="font-display text-xl leading-none tracking-tight text-ink"
        >
          medebooks
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/blog" className="text-ink-soft hover:text-ink hover:underline">
            ← Blog
          </Link>
          <Link href="/" className="font-medium text-accent hover:underline">
            🗺️ Mapa
          </Link>
        </div>
      </header>

      <article className="pt-14">
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

        <h1 className="font-display mt-3 text-4xl leading-[1.05] tracking-tight text-ink sm:text-[3rem]">
          {post.title}
        </h1>
        <p className="mt-5 text-xl leading-relaxed text-ink-soft">
          {post.description}
        </p>

        <hr className="my-10 border-line" />

        <div
          className="prose"
          dangerouslySetInnerHTML={{ __html: post.html }}
        />
      </article>

      <footer className="mt-16 flex items-center justify-between gap-4 border-t border-line pt-8">
        <Link
          href="/blog"
          className="text-sm font-medium text-accent hover:underline"
        >
          ← Volver al blog
        </Link>
        <Link href="/" className="text-sm font-medium text-accent hover:underline">
          🗺️ Ir al mapa
        </Link>
      </footer>
    </div>
  );
}
