// Blog de medebooks: posts en Markdown dentro de content/blog/*.md.
// Cada post lleva un frontmatter simple (title, date, description) y el cuerpo
// se convierte a HTML con `marked`. Todo se lee en el servidor en build/SSR.
import fs from "node:fs";
import path from "node:path";
import { marked } from "marked";

const DIR = path.join(process.cwd(), "content/blog");

// Las dos corrientes del blog. "construyendo" es la bitácora de cómo se hace
// medebooks; "resenas" son las reseñas de librerías y bibliotecas de la ciudad.
export type Section = "resenas" | "construyendo";

export type PostMeta = {
  slug: string;
  title: string;
  date: string; // ISO (YYYY-MM-DD)
  description: string;
  tag?: string;
  section: Section;
  readingMinutes: number;
};

export type Post = PostMeta & { html: string };

// Separa el frontmatter (bloque --- ... --- al inicio) del cuerpo Markdown.
function parseFrontmatter(raw: string): {
  data: Record<string, string>;
  body: string;
} {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(raw);
  const data: Record<string, string> = {};
  if (!match) return { data, body: raw };

  for (const line of match[1].split(/\r?\n/)) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    data[key] = value;
  }
  return { data, body: raw.slice(match[0].length) };
}

export function getAllSlugs(): string[] {
  if (!fs.existsSync(DIR)) return [];
  return fs
    .readdirSync(DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""));
}

export function getPost(slug: string): Post | null {
  const file = path.join(DIR, `${slug}.md`);
  if (!fs.existsSync(file)) return null;

  const raw = fs.readFileSync(file, "utf8");
  const { data, body } = parseFrontmatter(raw);
  const words = body.trim().split(/\s+/).filter(Boolean).length;

  return {
    slug,
    title: data.title ?? slug,
    date: data.date ?? "",
    description: data.description ?? "",
    tag: data.tag,
    section: data.section === "resenas" ? "resenas" : "construyendo",
    readingMinutes: Math.max(1, Math.round(words / 200)),
    html: stylizeMedebooks(marked.parse(body, { async: false }) as string),
  };
}

// Lista de posts (sin el HTML), del más nuevo al más viejo.
export function getAllPosts(): PostMeta[] {
  return getAllSlugs()
    .map((slug) => getPost(slug))
    .filter((p): p is Post => p !== null)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .map(({ html: _html, ...meta }) => meta);
}

// Reemplaza "medebooks" en texto (no en URLs como medebooks.app) con el
// estilo de marca: Fraunces + naranja #FF6719.
const MEDEBOOKS_SPAN =
  '<span style="font-family:\'Fraunces\',serif;color:#FF6719;font-weight:600;">medebooks</span>';

function stylizeMedebooks(html: string): string {
  // Solo reemplaza "medebooks" no seguido de "." para no tocar "medebooks.app"
  return html.replace(/medebooks(?!\.)/g, MEDEBOOKS_SPAN);
}

// Fecha legible en español: "10 de julio de 2026".
export function formatDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}
