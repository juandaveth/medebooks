import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { updateEvent, deleteEvent } from "../actions";

export const metadata: Metadata = { title: "Editar evento — Admin", robots: { index: false } };

export default async function EditEventoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const supabase = createSupabaseAdmin();

  const [{ data: event }, { data: places }] = await Promise.all([
    supabase.from("events").select("*").eq("id", id).maybeSingle(),
    supabase.from("places").select("id, name, type, comuna").eq("status", "published").order("comuna", { nullsFirst: false }).order("name"),
  ]);

  if (!event) notFound();

  const byComuna: Record<string, typeof places> = {};
  for (const p of places ?? []) {
    const key = p.comuna ?? "Sin comuna";
    (byComuna[key] ??= []).push(p);
  }

  return (
    <div className="mx-auto max-w-xl px-5 py-8">
      <Link href="/admin/eventos" className="text-sm text-ink-soft hover:text-ink hover:underline">
        ← Eventos
      </Link>
      <h1 className="font-display mt-4 text-3xl text-ink">Editar evento</h1>

      <form action={updateEvent} className="mt-6 space-y-4">
        <input type="hidden" name="id" value={event.id} />

        <label className="block">
          <span className="text-xs uppercase tracking-wide text-ink-soft">Lugar *</span>
          <select
            name="place_id"
            required
            defaultValue={event.place_id}
            className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink focus:border-ink focus:outline-none"
          >
            <option value="">Seleccionar lugar…</option>
            {Object.entries(byComuna).map(([comuna, items]) => (
              <optgroup key={comuna} label={comuna}>
                {(items ?? []).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.type === "libreria" ? "Librería" : "Biblioteca"})
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-xs uppercase tracking-wide text-ink-soft">Título *</span>
          <input
            name="title"
            required
            defaultValue={event.title}
            className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink focus:border-ink focus:outline-none"
          />
        </label>

        <label className="block">
          <span className="text-xs uppercase tracking-wide text-ink-soft">Descripción</span>
          <textarea
            name="description"
            rows={3}
            defaultValue={event.description ?? ""}
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
              defaultValue={event.date}
              className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink focus:border-ink focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-wide text-ink-soft">Inicio</span>
            <input
              name="start_time"
              type="time"
              defaultValue={event.start_time ?? ""}
              className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink focus:border-ink focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-wide text-ink-soft">Fin</span>
            <input
              name="end_time"
              type="time"
              defaultValue={event.end_time ?? ""}
              className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink focus:border-ink focus:outline-none"
            />
          </label>
        </div>

        <label className="block">
          <span className="text-xs uppercase tracking-wide text-ink-soft">URL (más info / registro)</span>
          <input
            name="url"
            type="url"
            defaultValue={event.url ?? ""}
            className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink focus:border-ink focus:outline-none"
          />
        </label>

        <label className="block">
          <span className="text-xs uppercase tracking-wide text-ink-soft">Estado</span>
          <select
            name="status"
            defaultValue={event.status}
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
            Guardar cambios
          </button>
          <Link
            href="/admin/eventos"
            className="rounded-full border border-line px-5 py-2 text-sm text-ink-soft hover:border-ink hover:text-ink"
          >
            Cancelar
          </Link>
        </div>
      </form>

      <div className="mt-10 border-t border-line pt-6">
        <p className="text-sm text-ink-soft">Zona de peligro</p>
        <form action={deleteEvent} className="mt-3">
          <input type="hidden" name="id" value={event.id} />
          <button
            type="submit"
            className="rounded-full border border-red-200 px-4 py-2 text-sm text-red-500 hover:border-red-400"
            onClick={(e) => { if (!confirm("¿Eliminar este evento permanentemente?")) e.preventDefault(); }}
          >
            Eliminar evento
          </button>
        </form>
      </div>
    </div>
  );
}
