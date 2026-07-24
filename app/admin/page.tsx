import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { signOut } from "./actions";

export const metadata: Metadata = { title: "Admin", robots: { index: false } };

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ m?: string; q?: string }>;
}) {
  const user = await requireAdmin();
  const { m, q } = await searchParams;

  const supabase = createSupabaseAdmin();
  let query = supabase
    .from("places")
    .select("id, name, type, status, comuna, neighborhood, municipality")
    .order("municipality")
    .order("name");
  if (m) query = query.eq("municipality", m);
  if (q) query = query.ilike("name", `%${q}%`);
  const { data: places, error } = await query;

  // Conteo de usuarios registrados.
  const { data: usersData } = await supabase.auth.admin.listUsers({ perPage: 1 });
  const userCount = (usersData as { total?: number } | null)?.total ?? 0;

  // Municipios presentes (para el filtro rápido de limpieza).
  const { data: allMunis } = await supabase.from("places").select("municipality");
  const municipios = [
    ...new Set((allMunis ?? []).map((r) => r.municipality).filter(Boolean) as string[]),
  ].sort((a, b) => a.localeCompare(b, "es"));

  return (
    <div className="mx-auto max-w-4xl px-5 py-8">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
        <div>
          <h1 className="font-display text-3xl text-ink">Administración</h1>
          <p className="text-sm text-ink-soft">{user.email}</p>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Link href="/admin/eventos" className="text-ink-soft hover:text-ink">
            Eventos
          </Link>
          <Link href="/" className="text-ink-soft hover:text-ink">
            Ver sitio
          </Link>
          <form action={signOut}>
            <button className="rounded-full border border-line px-3 py-1.5 text-ink hover:border-ink">
              Salir
            </button>
          </form>
        </div>
      </header>

      {/* Stats rápidas */}
      <div className="mt-6 flex gap-4">
        <div className="rounded-xl border border-line bg-paper px-5 py-4">
          <p className="text-xs uppercase tracking-wide text-ink-soft">Usuarios</p>
          <p className="font-display text-3xl text-ink">{userCount}</p>
        </div>
        <div className="rounded-xl border border-line bg-paper px-5 py-4">
          <p className="text-xs uppercase tracking-wide text-ink-soft">Lugares</p>
          <p className="font-display text-3xl text-ink">{places?.length ?? 0}</p>
        </div>
      </div>

      {/* Filtro rápido por municipio (útil para depurar lo que no es de Medellín) */}
      <form className="mt-4 flex flex-wrap items-center gap-2 text-sm">
        <input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Buscar por nombre…"
          className="rounded-lg border border-line bg-paper px-3 py-1.5 text-ink"
        />
        <select
          name="m"
          defaultValue={m ?? ""}
          className="rounded-lg border border-line bg-paper px-3 py-1.5 text-ink"
        >
          <option value="">Todos los municipios</option>
          {municipios.map((mu) => (
            <option key={mu} value={mu}>
              {mu}
            </option>
          ))}
        </select>
        <button className="rounded-lg bg-ink px-3 py-1.5 text-paper">Filtrar</button>
      </form>

      {error && <p className="mt-4 text-sm text-accent">Error: {error.message}</p>}

      <p className="mt-4 text-xs uppercase tracking-wide text-ink-soft">
        {places?.length ?? 0} lugares
      </p>

      <ul className="mt-2 divide-y divide-line">
        {(places ?? []).map((p) => {
          const where = [p.neighborhood, p.comuna ?? p.municipality]
            .filter(Boolean)
            .join(", ");
          return (
            <li key={p.id} className="flex items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <Link
                  href={`/admin/${p.id}`}
                  className="font-medium text-ink hover:underline"
                >
                  {p.name}
                </Link>
                <p className="text-xs text-ink-soft">
                  <span className="uppercase">{p.type}</span>
                  {where ? ` · ${where}` : ""}
                  {p.status !== "published" ? ` · ${p.status}` : ""}
                </p>
              </div>
              <Link
                href={`/admin/${p.id}`}
                className="shrink-0 rounded-full border border-line px-3 py-1 text-sm text-ink hover:border-ink"
              >
                Editar
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
