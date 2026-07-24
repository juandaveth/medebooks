import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPlaceBySlug } from "@/lib/queries";
import { TYPE_LABEL } from "@/lib/types";
import { typeColor } from "@/components/PlaceCard";
import { ShareButton } from "@/components/ShareButton";
import { MapView } from "@/components/MapView";
import { UserPlaceButtons } from "@/components/UserPlaceButtons";
import { createSupabaseServer } from "@/lib/supabase/server";
import { getUserPlaceStatus } from "@/lib/userPlaces";

type Props = { params: Promise<{ slug: string }> };

// Enlace a la UBICACIÓN del lugar en Google Maps (no ruta, no coordenadas):
// busca por nombre + dirección y, si existe, ancla al Place ID de Google.
function googleMapsUrl(place: {
  name: string;
  address?: string | null;
  neighborhood?: string | null;
  municipality?: string | null;
  googlePlaceId?: string | null;
}): string {
  const query = encodeURIComponent(
    [place.name, place.address, place.neighborhood, place.municipality]
      .filter(Boolean)
      .join(", "),
  );
  const base = `https://www.google.com/maps/search/?api=1&query=${query}`;
  return place.googlePlaceId
    ? `${base}&query_place_id=${encodeURIComponent(place.googlePlaceId)}`
    : base;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const place = await getPlaceBySlug(slug);
  if (!place) return { title: "Lugar no encontrado" };
  const where = [place.neighborhood, place.comuna, place.municipality]
    .filter(Boolean)
    .join(", ");
  const desc =
    place.description ??
    `${TYPE_LABEL[place.type]} en ${where || "Medellín"}.`;
  return {
    title: place.name,
    description: desc,
    openGraph: { title: place.name, description: desc, type: "article" },
  };
}

function ContactRow({ label, value, href }: { label: string; value: string; href: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-line py-3">
      <span className="text-xs uppercase tracking-wide text-ink-soft">{label}</span>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-right text-accent underline-offset-2 hover:underline"
      >
        {value}
      </a>
    </div>
  );
}

export default async function PlacePage({ params }: Props) {
  const { slug } = await params;
  const [place, supabase] = await Promise.all([
    getPlaceBySlug(slug),
    createSupabaseServer(),
  ]);
  if (!place) notFound();

  const { data: { user } } = await supabase.auth.getUser();
  const initialStatus = user ? await getUserPlaceStatus(place.id) : null;

  const where = [place.neighborhood, place.comuna, place.municipality]
    .filter(Boolean)
    .join(", ");
  const tags = place.type === "libreria" ? place.specialties : place.services;

  return (
    <div className="mx-auto max-w-2xl px-5 py-8">
      <Link
        href="/"
        className="text-sm text-ink-soft underline-offset-2 hover:text-ink hover:underline"
      >
        ← Volver
      </Link>

      {/* Foto destacada (mejor foto de Google Maps) */}
      <div className="mt-6 aspect-[16/9] overflow-hidden rounded-2xl border border-line">
        {place.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={place.photoUrl}
            alt={`Foto de ${place.name}`}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-paper-2">
            <span className="text-5xl opacity-25">
              {place.type === "libreria" ? "📕" : "🏛️"}
            </span>
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center gap-2">
        <span
          className="h-3 w-3 rounded-full"
          style={{ background: typeColor(place.type) }}
        />
        <span className="text-xs uppercase tracking-widest text-ink-soft">
          {TYPE_LABEL[place.type]}
          {place.type === "biblioteca" && place.isFree ? " · Acceso gratuito" : ""}
        </span>
      </div>

      <h1 className="font-display mt-2 text-4xl leading-tight text-ink">
        {place.name}
      </h1>
      {where && <p className="mt-1 text-ink-soft">{where}</p>}
      {place.description && (
        <p className="mt-4 text-lg leading-relaxed text-ink">{place.description}</p>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        <ShareButton title={place.name} text={`${TYPE_LABEL[place.type]} en ${where}`} />
        <a
          href={googleMapsUrl(place)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm text-paper transition-opacity hover:opacity-90"
        >
          Ver en Google Maps ↗
        </a>
      </div>

      <div className="mt-4">
        <UserPlaceButtons
          placeId={place.id}
          slug={place.slug}
          initialStatus={initialStatus}
          loggedIn={!!user}
        />
      </div>

      {/* Mini-mapa */}
      <div className="mt-8 h-64 overflow-hidden rounded-xl border border-line">
        <MapView places={[place]} activeId={place.id} />
      </div>

      {/* Tags: tipo de librería / servicios de biblioteca */}
      {tags && tags.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {tags.map((t) => (
            <span
              key={t}
              className="rounded-full border border-line px-3 py-1 text-sm text-ink-soft"
            >
              {t}
            </span>
          ))}
        </div>
      )}

      {/* Materias / temas */}
      {place.subjects && place.subjects.length > 0 && (
        <div className="mt-6">
          <p className="mb-2 text-xs uppercase tracking-wide text-ink-soft">Materias</p>
          <div className="flex flex-wrap gap-2">
            {place.subjects.map((s) => (
              <span
                key={s}
                className="rounded-full bg-paper-2 px-3 py-1 text-sm text-ink"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Datos */}
      <div className="mt-6">
        {place.address && (
          <div className="flex items-baseline justify-between gap-4 border-b border-line py-3">
            <span className="text-xs uppercase tracking-wide text-ink-soft">Dirección</span>
            <span className="text-right text-ink">{place.address}</span>
          </div>
        )}
        {place.hours && (
          <div className="flex items-baseline justify-between gap-4 border-b border-line py-3">
            <span className="text-xs uppercase tracking-wide text-ink-soft">Horarios</span>
            <span className="text-right text-ink">{place.hours}</span>
          </div>
        )}
        {place.entity && (
          <div className="flex items-baseline justify-between gap-4 border-b border-line py-3">
            <span className="text-xs uppercase tracking-wide text-ink-soft">Entidad</span>
            <span className="text-right text-ink">{place.entity}</span>
          </div>
        )}
        {place.phone && (
          <ContactRow label="Teléfono" value={place.phone} href={`tel:${place.phone}`} />
        )}
        {place.whatsapp && (
          <ContactRow
            label="WhatsApp"
            value={place.whatsapp}
            href={`https://wa.me/${place.whatsapp.replace(/\D/g, "")}`}
          />
        )}
        {place.website && (
          <ContactRow
            label="Sitio web"
            value={place.website.replace(/^https?:\/\//, "")}
            href={place.website}
          />
        )}
        {place.instagram && (
          <ContactRow
            label="Instagram"
            value={`@${place.instagram.replace(/^@/, "")}`}
            href={`https://instagram.com/${place.instagram.replace(/^@/, "")}`}
          />
        )}
      </div>
    </div>
  );
}
