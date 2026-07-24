import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { formatEventDate } from "@/lib/types";
import { DeleteEventButton } from "./DeleteEventButton";

export const metadata: Metadata = { title: "Eventos — Admin", robots: { index: false } };

export default async function AdminEventosPage() {
  await requireAdmin();
  const supabase = createSupabaseAdmin();

  const { data: events } = await supabase
    .from("events")
    .select("id, title, date, start_time, status, places(name)")
    .order("date", { ascending: false });

  return (
    <div className="mx-auto max-w-3xl px-5 py-8">
      <header className="flex items-center justify-between gap-4 border-b border-line pb-4">
        <div>
          <Link href="/admin" className="text-sm text-ink-soft hover:text-ink hover:underline">
            ← Panel
          </Link>
          <h1 className="font-display mt-1 text-3xl text-ink">Eventos</h1>
        </div>
        <Link
          href="/admin/eventos/nuevo"
          className="rounded-full bg-ink px-4 py-2 text-sm text-paper hover:opacity-80"
        >
          + Nuevo evento
        </Link>
      </header>

      {(!events || events.length === 0) ? (
        <p className="mt-12 text-center text-ink-soft">No hay eventos aún.</p>
      ) : (
        <table className="mt-6 w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink-soft">
              <th className="pb-2 pr-4">Fecha</th>
              <th className="pb-2 pr-4">Título</th>
              <th className="pb-2 pr-4">Lugar</th>
              <th className="pb-2 pr-4">Estado</th>
              <th className="pb-2" />
            </tr>
          </thead>
          <tbody>
            {events.map((e) => {
              const place = (e.places as unknown) as { name: string } | null;
              return (
                <tr key={e.id} className="border-b border-line">
                  <td className="py-3 pr-4 text-ink-soft whitespace-nowrap">
                    {formatEventDate(e.date, e.start_time)}
                  </td>
                  <td className="py-3 pr-4 font-medium text-ink">{e.title}</td>
                  <td className="py-3 pr-4 text-ink-soft">{place?.name ?? "—"}</td>
                  <td className="py-3 pr-4">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${
                      e.status === "published"
                        ? "bg-accent/10 text-accent"
                        : "bg-paper-2 text-ink-soft"
                    }`}>
                      {e.status === "published" ? "Publicado" : "Borrador"}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/admin/eventos/${e.id}`}
                        className="text-ink-soft hover:text-ink hover:underline"
                      >
                        Editar
                      </Link>
                      <DeleteEventButton
                        id={e.id}
                        className="text-red-500 hover:underline"
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
