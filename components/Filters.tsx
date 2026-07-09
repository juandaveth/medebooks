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
  const selected = filters.specialties ?? [];
  const toggleSpecialty = (s: string) =>
    onChange({
      specialties: selected.includes(s)
        ? selected.filter((x) => x !== s)
        : [...selected, s],
    });

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

      {/* Municipio */}
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
      </div>

      {/* Especialidades: selección múltiple (chips) — solo aplica a librerías */}
      {(filters.type ?? "all") !== "biblioteca" && facets.specialties.length > 0 && (
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-xs uppercase tracking-wide text-ink-soft">
              Especialidades
            </span>
            {selected.length > 0 && (
              <button
                onClick={() => onChange({ specialties: [] })}
                className="text-xs text-accent hover:underline"
              >
                Limpiar
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {facets.specialties.map((s) => {
              const on = selected.includes(s);
              return (
                <button
                  key={s}
                  aria-pressed={on}
                  onClick={() => toggleSpecialty(s)}
                  className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                    on
                      ? "border-accent bg-accent text-paper"
                      : "border-line text-ink-soft hover:border-ink hover:text-ink"
                  }`}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <p className="text-xs uppercase tracking-wide text-ink-soft">
        {count} {count === 1 ? "lugar" : "lugares"}
      </p>
    </div>
  );
}
