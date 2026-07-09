import Link from "next/link";
import type { Place } from "@/lib/types";
import { TYPE_LABEL } from "@/lib/types";

export function typeColor(type: Place["type"]): string {
  return type === "libreria" ? "var(--accent)" : "var(--accent-2)";
}

export function PlaceCard({
  place,
  active,
  onSelect,
}: {
  place: Place;
  active?: boolean;
  onSelect?: (p: Place) => void;
}) {
  const tags = place.type === "libreria" ? place.specialties : place.services;
  return (
    <div
      onClick={() => onSelect?.(place)}
      className={`group cursor-pointer border-b border-line px-5 py-4 transition-colors ${
        active ? "bg-paper-2" : "hover:bg-paper-2/60"
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ background: typeColor(place.type) }}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="font-display truncate text-lg leading-tight text-ink">
              {place.name}
            </h3>
          </div>
          <p className="mt-0.5 text-xs uppercase tracking-wide text-ink-soft">
            {TYPE_LABEL[place.type]}
            {place.neighborhood ? ` · ${place.neighborhood}` : ""}
            {place.municipality ? `, ${place.municipality}` : ""}
          </p>
          {tags && tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {tags.slice(0, 4).map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-line px-2 py-0.5 text-[11px] text-ink-soft"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
          <Link
            href={`/lugar/${place.slug}`}
            onClick={(e) => e.stopPropagation()}
            className="mt-2 inline-block text-sm text-accent underline-offset-2 hover:underline"
          >
            Ver →
          </Link>
        </div>
        {place.photoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={place.photoUrl}
            alt=""
            className="h-16 w-16 shrink-0 rounded-md object-cover"
            loading="lazy"
          />
        )}
      </div>
    </div>
  );
}
