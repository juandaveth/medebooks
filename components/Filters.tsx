"use client";

import type { PlaceFilters, PlaceType } from "@/lib/types";

const TYPES: { value: PlaceType | "all"; label: string }[] = [
  { value: "all", label: "Todo" },
  { value: "libreria", label: "Librerías" },
  { value: "biblioteca", label: "Bibliotecas" },
];

export function Filters({
  filters,
  facets,
  count,
  onChange,
}: {
  filters: PlaceFilters;
  facets: { municipalities: string[]; specialties: string[] };
  count: number;
  onChange: (patch: Partial<PlaceFilters>) => void;
}) {
  return (
    <div className="space-y-3">
      {/* Segmentado por tipo */}
      <div className="inline-flex rounded-full border border-line p-0.5">
        {TYPES.map((t) => {
          const active = (filters.type ?? "all") === t.value;
          return (
            <button
              key={t.value}
              onClick={() => onChange({ type: t.value })}
              className={`rounded-full px-3.5 py-1.5 text-sm transition-colors ${
                active ? "bg-ink text-paper" : "text-ink-soft hover:text-ink"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Buscador */}
      <input
        type="search"
        value={filters.query ?? ""}
        onChange={(e) => onChange({ query: e.target.value })}
        placeholder="Buscar por nombre o barrio…"
        className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink placeholder:text-ink-soft/70 focus:border-ink focus:outline-none"
      />

      {/* Selects */}
      <div className="flex flex-wrap gap-2">
        <select
          value={filters.municipality ?? "all"}
          onChange={(e) => onChange({ municipality: e.target.value })}
          className="rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink focus:border-ink focus:outline-none"
        >
          <option value="all">Todos los municipios</option>
          {facets.municipalities.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>

        {(filters.type ?? "all") !== "biblioteca" && (
          <select
            value={filters.specialty ?? "all"}
            onChange={(e) => onChange({ specialty: e.target.value })}
            className="rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink focus:border-ink focus:outline-none"
          >
            <option value="all">Todas las especialidades</option>
            {facets.specialties.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        )}
      </div>

      <p className="text-xs uppercase tracking-wide text-ink-soft">
        {count} {count === 1 ? "lugar" : "lugares"}
      </p>
    </div>
  );
}
