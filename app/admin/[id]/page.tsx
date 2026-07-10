import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { updatePlace, deletePlace } from "../actions";

export const metadata: Metadata = { title: "Editar lugar", robots: { index: false } };

function Field({
  label,
  name,
  defaultValue,
  type = "text",
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue?: string | number | null;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-wide text-ink-soft">{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        step={type === "number" ? "any" : undefined}
        className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink focus:border-ink focus:outline-none"
      />
    </label>
  );
}

export default async function EditPlacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const supabase = createSupabaseAdmin();
  const { data: p } = await supabase.from("places").select("*").eq("id", id).maybeSingle();
  if (!p) notFound();

  const arr = (v: unknown) => (Array.isArray(v) ? v.join(", ") : "");

  return (
    <div className="mx-auto max-w-2xl px-5 py-8">
      <Link href="/admin" className="text-sm text-ink-soft hover:text-ink hover:underline">
        ← Volver al panel
      </Link>
      <h1 className="font-display mt-4 text-3xl text-ink">Editar lugar</h1>

      <form action={updatePlace} className="mt-6 space-y-4">
        <input type="hidden" name="id" value={p.id} />

        <Field label="Nombre" name="name" defaultValue={p.name} />

        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-xs uppercase tracking-wide text-ink-soft">Tipo</span>
            <select
              name="type"
              defaultValue={p.type}
              className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink focus:border-ink focus:outline-none"
            >
              <option value="libreria">Librería</option>
              <option value="biblioteca">Biblioteca</option>
            </select>
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-wide text-ink-soft">Estado</span>
            <select
              name="status"
              defaultValue={p.status}
              className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink focus:border-ink focus:outline-none"
            >
              <option value="published">Publicado</option>
              <option value="pending">Pendiente</option>
              <option value="rejected">Rechazado</option>
            </select>
          </label>
        </div>

        <label className="block">
          <span className="text-xs uppercase tracking-wide text-ink-soft">Descripción</span>
          <textarea
            name="description"
            defaultValue={p.description ?? ""}
            rows={3}
            className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink focus:border-ink focus:outline-none"
          />
        </label>

        <Field label="Dirección" name="address" defaultValue={p.address} />

        <div className="grid grid-cols-3 gap-4">
          <Field label="Barrio" name="neighborhood" defaultValue={p.neighborhood} />
          <Field label="Comuna" name="comuna" defaultValue={p.comuna} />
          <Field label="Municipio" name="municipality" defaultValue={p.municipality} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Lat" name="lat" defaultValue={p.lat} type="number" />
          <Field label="Lng" name="lng" defaultValue={p.lng} type="number" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Teléfono" name="phone" defaultValue={p.phone} />
          <Field label="WhatsApp" name="whatsapp" defaultValue={p.whatsapp} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Sitio web" name="website" defaultValue={p.website} />
          <Field label="Instagram" name="instagram" defaultValue={p.instagram} />
        </div>

        <Field label="Horarios" name="hours" defaultValue={p.hours} />
        <Field
          label="Tipo de librería (coma-separado)"
          name="specialties"
          defaultValue={arr(p.specialties)}
          placeholder="usados, café-librería"
        />
        <Field
          label="Materias (coma-separado)"
          name="subjects"
          defaultValue={arr(p.subjects)}
        />
        <Field
          label="Servicios biblioteca (coma-separado)"
          name="services"
          defaultValue={arr(p.services)}
        />
        <Field label="Entidad" name="entity" defaultValue={p.entity} />
        <Field label="Foto (URL)" name="photo_url" defaultValue={p.photo_url} />

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="is_free"
            defaultChecked={!!p.is_free}
            className="h-4 w-4"
          />
          <span className="text-sm text-ink">Biblioteca de acceso gratuito</span>
        </label>

        <div className="flex items-center gap-3 pt-2">
          <button className="rounded-full bg-ink px-5 py-2 text-sm text-paper hover:opacity-90">
            Guardar
          </button>
          <Link href="/admin" className="text-sm text-ink-soft hover:text-ink">
            Cancelar
          </Link>
        </div>
      </form>

      {/* Eliminar (por ejemplo, papelerías mal clasificadas) */}
      <form action={deletePlace} className="mt-8 border-t border-line pt-6">
        <input type="hidden" name="id" value={p.id} />
        <p className="text-sm text-ink-soft">
          Eliminar este lugar de forma permanente.
        </p>
        <button className="mt-2 rounded-full border border-accent px-4 py-2 text-sm text-accent hover:bg-accent hover:text-paper">
          Eliminar lugar
        </button>
      </form>
    </div>
  );
}
