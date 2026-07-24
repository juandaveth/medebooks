"use client";

import { useState } from "react";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { useSession } from "@/components/SessionProvider";
import type { UserRole } from "@/lib/roleTypes";
import type { ManagedPlace } from "@/lib/roles";
import type { Place } from "@/lib/types";
import { TYPE_LABEL } from "@/lib/types";
import type { CompanionProfile } from "@/lib/companions";

function PlaceMiniCard({ place }: { place: Place }) {
  return (
    <Link
      href={`/lugar/${place.slug}`}
      className="flex items-center gap-3 rounded-lg border border-line p-3 transition-colors hover:border-ink"
    >
      {place.photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={place.photoUrl}
          alt={place.name}
          className="h-12 w-12 shrink-0 rounded-md object-cover"
        />
      ) : (
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-paper-2 text-xl">
          {place.type === "libreria" ? "📕" : "🏛️"}
        </div>
      )}
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-ink">{place.name}</p>
        <p className="text-xs text-ink-soft">
          {TYPE_LABEL[place.type]}
          {place.neighborhood ? ` · ${place.neighborhood}` : ""}
        </p>
      </div>
    </Link>
  );
}

function PlaceList({
  title,
  emoji,
  places,
  empty,
}: {
  title: string;
  emoji: string;
  places: Place[];
  empty: string;
}) {
  return (
    <section>
      <h2 className="font-display text-xl text-ink">
        {emoji} {title}
        {places.length > 0 && (
          <span className="ml-2 font-sans text-sm font-normal text-ink-soft">
            ({places.length})
          </span>
        )}
      </h2>
      {places.length === 0 ? (
        <p className="mt-3 text-sm text-ink-soft">{empty}</p>
      ) : (
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {places.map((p) => (
            <PlaceMiniCard key={p.id} place={p} />
          ))}
        </div>
      )}
    </section>
  );
}

function roleBadgeLabel(role: UserRole, managedPlaces: ManagedPlace[]): string {
  if (role === "super-admin") return "Super-admin";
  if (role === "lector") return "Lector";

  const types = new Set(managedPlaces.map((p) => p.type));
  if (types.size === 1) {
    return types.has("libreria") ? "Admin de librería" : "Admin de biblioteca";
  }
  return "Admin de negocio";
}

function InviteSection({ inviteCode }: { inviteCode: string }) {
  const [copied, setCopied] = useState(false);

  const inviteUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/leamos/${inviteCode}`
      : `https://medebooks.app/leamos/${inviteCode}`;

  const whatsappText = encodeURIComponent(
    `Hola, quisiera que fuéramos a la Noche de Librerías a descubrirlas, parchamos? Seamos compas de lectura en: ${inviteUrl}`
  );

  function copyLink() {
    navigator.clipboard.writeText(inviteUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <section>
      <h2 className="font-display text-xl text-ink">📖 Invita compas de lectura</h2>
      <p className="mt-2 text-sm text-ink-soft">
        Comparte tu enlace. Cuando alguien se registre a través de él, quedarán
        conectados como compas de lectura.
      </p>
      <div className="mt-4 flex items-center gap-2 rounded-lg border border-line bg-paper-2 px-4 py-3">
        <span className="min-w-0 flex-1 truncate font-mono text-xs text-ink-soft">
          medebooks.app/invita/{inviteCode}
        </span>
        <button
          onClick={copyLink}
          className="shrink-0 rounded-md border border-line px-3 py-1.5 text-xs transition-colors hover:border-ink"
        >
          {copied ? "✓ Copiado" : "Copiar"}
        </button>
      </div>
      <a
        href={`https://wa.me/?text=${whatsappText}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
      >
        <span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        </span>
        Compartir por WhatsApp
      </a>
    </section>
  );
}

function CompanionsSection({ companions }: { companions: CompanionProfile[] }) {
  return (
    <section>
      <h2 className="font-display text-xl text-ink">
        👥 Compas de lectura
        {companions.length > 0 && (
          <span className="ml-2 font-sans text-sm font-normal text-ink-soft">
            ({companions.length})
          </span>
        )}
      </h2>
      {companions.length === 0 ? (
        <p className="mt-3 text-sm text-ink-soft">
          Aún no tienes compas de lectura. Comparte tu enlace para conectar
          con otros lectores.
        </p>
      ) : (
        <div className="mt-3 space-y-2">
          {companions.map((c) => (
            <div
              key={c.userId}
              className="flex items-center gap-3 rounded-lg border border-line px-4 py-3"
            >
              {c.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={c.avatarUrl}
                  alt={c.displayName}
                  className="h-9 w-9 rounded-full border border-line object-cover"
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-paper-2 font-display text-sm text-ink">
                  {c.displayName[0].toUpperCase()}
                </div>
              )}
              <p className="text-sm font-medium text-ink">{c.displayName}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export function PerfilClient({
  user,
  role,
  lists,
  managedPlaces,
  inviteCode,
  companions,
}: {
  user: User;
  role: UserRole;
  lists: { wantToVisit: Place[]; visited: Place[] };
  managedPlaces: ManagedPlace[];
  inviteCode: string;
  companions: CompanionProfile[];
}) {
  const { signOut } = useSession();

  const avatar = user.user_metadata?.avatar_url as string | undefined;
  const name =
    (user.user_metadata?.full_name as string | undefined) ??
    user.email ??
    "Lector";

  return (
    <div className="mx-auto max-w-lg px-5 py-12">
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 font-display text-2xl leading-none tracking-tight text-ink"
        >
          <img src="/icon.svg" alt="" width={28} height={28} className="shrink-0" />
          <span className="text-[#FF6719]">medebooks</span>
        </Link>
        <Link
          href="/"
          className="text-sm text-ink-soft transition-colors hover:text-ink"
        >
          ← Volver al mapa
        </Link>
      </div>

      {/* Header de perfil */}
      <div className="mt-8 flex items-center gap-4">
        {avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatar}
            alt={name}
            className="h-16 w-16 rounded-full border border-line object-cover"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-line bg-paper-2 font-display text-2xl text-ink">
            {name[0].toUpperCase()}
          </div>
        )}
        <div>
          <h1 className="font-display text-2xl text-ink">{name}</h1>
          <p className="text-sm text-ink-soft">{user.email}</p>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <span className="inline-block rounded-full border border-line px-2 py-0.5 text-xs text-ink-soft">
              {roleBadgeLabel(role, managedPlaces)}
            </span>
            {managedPlaces.map((p) => (
              <span
                key={p.name}
                className="inline-block rounded-full border border-line bg-paper-2 px-2 py-0.5 text-xs text-ink-soft"
              >
                {p.type === "libreria" ? "📕" : "🏛️"} {p.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Listas */}
      <div className="mt-10 space-y-8 border-t border-line pt-8">
        <PlaceList
          title="Quiero ir"
          emoji="🔖"
          places={lists.wantToVisit}
          empty="Aún no has guardado ningún lugar. Explora el directorio y guarda los que te interesen."
        />
        <PlaceList
          title="Ya visité"
          emoji="✓"
          places={lists.visited}
          empty="Cuando visites un lugar, márcalo aquí para llevar tu propio registro."
        />
      </div>

      {/* Compas de lectura + invitación */}
      {inviteCode && (
        <div className="mt-10 space-y-8 border-t border-line pt-8">
          <CompanionsSection companions={companions} />
          <InviteSection inviteCode={inviteCode} />
        </div>
      )}

      <button
        onClick={signOut}
        className="mt-10 rounded-lg border border-line px-4 py-2 text-sm text-accent transition-colors hover:border-accent"
      >
        Cerrar sesión
      </button>
    </div>
  );
}
