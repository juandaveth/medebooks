"use client";

import { useState } from "react";

type PlaceOption = { id: string; name: string; type: string };

const SELECT_CLS =
  "mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink focus:border-ink focus:outline-none";
const LABEL_CLS = "text-xs uppercase tracking-wide text-ink-soft";

export function PlaceSelector({
  byComuna,
  defaultPlaceId,
  defaultComuna,
}: {
  byComuna: Record<string, PlaceOption[]>;
  defaultPlaceId?: string;
  defaultComuna?: string;
}) {
  const comunas = Object.keys(byComuna).sort((a, b) => a.localeCompare(b, "es"));
  const [comuna, setComuna] = useState(defaultComuna ?? "");
  const places = byComuna[comuna] ?? [];

  return (
    <div className="space-y-3">
      <label className="block">
        <span className={LABEL_CLS}>Comuna *</span>
        <select
          value={comuna}
          onChange={(e) => setComuna(e.target.value)}
          className={SELECT_CLS}
        >
          <option value="">Seleccionar comuna…</option>
          {comunas.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </label>

      {comuna && (
        <label className="block">
          <span className={LABEL_CLS}>Lugar *</span>
          <select
            name="place_id"
            required
            defaultValue={defaultPlaceId ?? ""}
            className={SELECT_CLS}
          >
            <option value="">Seleccionar lugar…</option>
            {places.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.type === "libreria" ? "Librería" : "Biblioteca"})
              </option>
            ))}
          </select>
        </label>
      )}
    </div>
  );
}
