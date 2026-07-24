import type { Metadata } from "next";
import Link from "next/link";
import { getUpcomingEvents } from "@/lib/queries";
import { formatEventDate } from "@/lib/types";
import { TYPE_LABEL } from "@/lib/types";
import { typeColor } from "@/components/PlaceCard";

export const metadata: Metadata = {
  title: "Eventos — medebooks",
  description: "Próximos eventos en librerías y bibliotecas de Medellín.",
};

export const revalidate = 3600;

export default async function EventosPage() {
  const events = await getUpcomingEvents();

  return (
    <div className="mx-auto max-w-2xl px-5 py-8">
      <Link href="/" className="text-sm text-ink-soft underline-offset-2 hover:text-ink hover:underline">
        ← Volver al mapa
      </Link>

      <h1 className="font-display mt-6 text-4xl text-ink">Eventos</h1>
      <p className="mt-1 text-ink-soft">
        Próximos eventos en librerías y bibliotecas de Medellín.
      </p>

      {events.length === 0 ? (
        <div className="mt-16 text-center text-ink-soft">
          <p className="font-display text-xl">Sin eventos próximos</p>
          <p className="mt-1 text-sm">Vuelve pronto — actualizamos la agenda regularmente.</p>
        </div>
      ) : (
        <div className="mt-8 space-y-px">
          {events.map((event) => (
            <article
              key={event.id}
              className="border-b border-line py-6 first:border-t"
            >
              <p className="text-xs uppercase tracking-wide text-ink-soft">
                {formatEventDate(event.date, event.startTime)}
                {event.endTime && ` – ${event.endTime.slice(0, 5)}`}
              </p>

              <h2 className="font-display mt-1 text-2xl leading-snug text-ink">
                {event.title}
              </h2>

              <Link
                href={`/lugar/${event.placeSlug}`}
                className="mt-1 inline-flex items-center gap-1.5 text-sm text-ink-soft underline-offset-2 hover:text-ink hover:underline"
              >
                <span
                  className="inline-block h-2 w-2 shrink-0 rounded-full"
                  style={{ background: typeColor(event.placeType) }}
                />
                {event.placeName}
                <span className="text-ink-soft/50">·</span>
                <span>{TYPE_LABEL[event.placeType]}</span>
              </Link>

              {event.description && (
                <p className="mt-3 text-ink leading-relaxed">{event.description}</p>
              )}

              {event.url && (
                <a
                  href={event.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block text-sm text-accent underline-offset-2 hover:underline"
                >
                  Más información ↗
                </a>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
