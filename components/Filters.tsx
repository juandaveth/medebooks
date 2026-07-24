"use client";

import { useState } from "react";
import type { PlaceFilters, PlaceType } from "@/lib/types";
import type { Facets } from "@/lib/queries";

const TYPES: { value: PlaceType | "all"; label: string; on: string; off: string }[] = [
  { value: "all",        label: "Todo",        on: "bg-[#FF6719] text-white",   off: "text-[#FF6719]"  },
  { value: "libreria",   label: "Librerías",   on: "bg-accent text-paper",      off: "text-accent"     },
  { value: "biblioteca", label: "Bibliotecas", on: "bg-accent-2 text-paper",    off: "text-accent-2"   },
];

/** Grupo de chips de selección múltiple (OR), plegable, con encabezado y "Limpiar". */
function ChipGroup({
  label,
  options,
  selected,
  onToggle,
  onClear,
  defaultOpen = false,
}: {
  label: string;
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
  onClear: () => void;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  if (options.length === 0) return null;
  return (
    <div>
      <div className="flex items-center justify-between">
        {/* Encabezado plegable con flecha */}
        <button
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-ink-soft hover:text-ink"
        >
          <span
            aria-hidden
            className={`inline-block text-ink-soft transition-transform ${
              open ? "rotate-90" : ""
            }`}
          >
            ›
          </span>
          {label}
          {selected.length > 0 && (
            <span className="text-accent">({selected.length})</span>
          )}
        </button>
        {open && selected.length > 0 && (
          <button onClick={onClear} className="text-xs text-accent hover:underline">
            Limpiar
          </button>
        )}
      </div>

      {open && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {options.map((o) => {
            const on = selected.includes(o);
            return (
              <button
                key={o}
                aria-pressed={on}
                onClick={() => onToggle(o)}
                className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                  on
                    ? "border-accent bg-accent text-paper"
                    : "border-line text-ink-soft hover:border-ink hover:text-ink"
                }`}
              >
                {o}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function Filters({
  filters,
  facets,
  count,
  onChange,
  sort,
  onSort,
  onRandomPick,
}: {
  filters: PlaceFilters;
  facets: Facets;
  count: number;
  onChange: (patch: Partial<PlaceFilters>) => void;
  sort: "alpha" | "random";
  onSort: (next: "alpha" | "random") => void;
  onRandomPick: () => void;
}) {
  const specialties = filters.specialties ?? [];
  const subjects = filters.subjects ?? [];

  const comuna = filters.comuna ?? "all";
  const barrios = comuna !== "all" ? facets.barriosByComuna[comuna] ?? [] : [];

  const toggle = (list: string[], value: string) =>
    list.includes(value) ? list.filter((x) => x !== value) : [...list, value];

  const isBiblioteca = (filters.type ?? "all") === "biblioteca";

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
              className={`font-display rounded-full px-3.5 py-1.5 text-sm transition-colors ${
                active ? t.on : `${t.off} hover:opacity-80`
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

      {/* Comuna → barrio */}
      <div className="flex flex-wrap gap-2">
        <select
          value={comuna}
          onChange={(e) => onChange({ comuna: e.target.value, neighborhood: "all" })}
          className="rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink focus:border-ink focus:outline-none"
        >
          <option value="all">Todas las comunas</option>
          {facets.comunas.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        {comuna !== "all" && barrios.length > 0 && (
          <select
            value={filters.neighborhood ?? "all"}
            onChange={(e) => onChange({ neighborhood: e.target.value })}
            className="rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink focus:border-ink focus:outline-none"
          >
            <option value="all">Todos los barrios</option>
            {barrios.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Al azar + orden de la lista */}
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={onRandomPick}
          className="font-display flex items-center gap-1.5 rounded-full border border-line px-3.5 py-1.5 text-sm text-ink transition-colors hover:border-ink hover:bg-paper-2"
        >
          <span aria-hidden>🎲</span> Al azar
        </button>
        <div className="inline-flex items-center gap-1.5">
          <span className="text-xs uppercase tracking-wide text-ink-soft">Orden</span>
          <div className="inline-flex rounded-full border border-line p-0.5">
            {(
              [
                { value: "alpha", label: "A–Z" },
                { value: "random", label: "Aleatorio" },
              ] as const
            ).map((o) => (
              <button
                key={o.value}
                onClick={() => onSort(o.value)}
                aria-pressed={sort === o.value}
                className={`font-display rounded-full px-3 py-1 text-sm transition-colors ${
                  sort === o.value
                    ? "bg-ink text-paper"
                    : "text-ink-soft hover:text-ink"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tipo de librería (solo aplica a librerías) */}
      {!isBiblioteca && (
        <ChipGroup
          label="Tipo de librería"
          options={facets.specialties}
          selected={specialties}
          onToggle={(v) => onChange({ specialties: toggle(specialties, v) })}
          onClear={() => onChange({ specialties: [] })}
        />
      )}

      {/* Materias / temas (aplica a librerías y bibliotecas) */}
      <ChipGroup
        label="Materias"
        options={facets.subjects}
        selected={subjects}
        onToggle={(v) => onChange({ subjects: toggle(subjects, v) })}
        onClear={() => onChange({ subjects: [] })}
      />

      <p className="text-xs uppercase tracking-wide text-ink-soft">
        {count} {count === 1 ? "lugar" : "lugares"}
      </p>
    </div>
  );
}
