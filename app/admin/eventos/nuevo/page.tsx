import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { createEvent } from "../actions";

export const metadata: Metadata = { title: "Nuevo evento — Admin", robots: { index: false } };

export default async function NuevoEventoPage() {
  await requireAdmin();
  const supabase = createSupabaseAdmin();
  const { data: places } = await supabase
    .from("places")
    .select("id, name, type")
    .eq("status", "published")
    .order("name");

  return (
    <div className="mx-auto max-w-xl px-5 py-8">
      <Link href="/admin/eventos" className="text-sm text-ink-soft hover:text-ink hover:underline">
        ← Eventos
      </Link>
      <h1 className="font-display mt-4 text-3xl text-ink">Nuevo evento</h1>

      <form action={createEvent} className="mt-6 space-y-4">
        <label className="block">
          <span className="text-xs uppercase tracking-wide text-ink-soft">Lugar *</span>
          <select
            name="place_id"
            required
            className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink focus:border-ink focus:outline-none"
          >
            <option value="">Seleccionar lugar…</option>
            {(places ?? []).map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.type === "libreria" ? "Librería" : "Biblioteca"})
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-xs uppercase tracking-wide text-ink-soft">Título *</span>
          <input
            name="title"
            required
            placeholder="La Noche de las Librerías 2026"
            className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink focus:border-ink focus:outline-none"
          />
        </label>

        <label className="block">
          <span className="text-xs uppercase tracking-wide text-ink-soft">Descripción</span>
          <textarea
            name="description"
            rows={3}
            className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink focus:border-ink focus:outline-none"
          />
        </label>

        <div className="grid grid-cols-3 gap-3">
          <label className="col-span-3 block sm:col-span-1">
            <span className="text-xs uppercase tracking-wide text-ink-soft">Fecha *</span>
            <input
              name="date"
              type="date"
              required
              className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink focus:border-ink focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-wide text-ink-soft">Inicio</span>
            <input
              name="start_time"
              type="time"
              className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink focus:border-ink focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-wide text-ink-soft">Fin</span>
            <input
              name="end_time"
              type="time"
              className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink focus:border-ink focus:outline-none"
            />
          </label>
        </div>

        <label className="block">
          <span className="text-xs uppercase tracking-wide text-ink-soft">URL (más info / registro)</span>
          <input
            name="url"
            type="url"
            placeholder="https://…"
            className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink focus:border-ink focus:outline-none"
          />
        </label>

        <label className="block">
          <span className="text-xs uppercase tracking-wide text-ink-soft">Estado</span>
          <select
            name="status"
            defaultValue="published"
            className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink focus:border-ink focus:outline-none"
          >
            <option value="published">Publicado</option>
            <option value="draft">Borrador</option>
          </select>
        </label>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="rounded-full bg-ink px-5 py-2 text-sm text-paper hover:opacity-80"
          >
            Crear evento
          </button>
          <Link
            href="/admin/eventos"
            className="rounded-full border border-line px-5 py-2 text-sm text-ink-soft hover:border-ink hover:text-ink"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
