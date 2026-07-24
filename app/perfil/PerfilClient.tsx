"use client";

import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { useSession } from "@/components/SessionProvider";
import type { UserRole } from "@/lib/roleTypes";
import type { ManagedPlace } from "@/lib/roles";
import type { Place } from "@/lib/types";
import { TYPE_LABEL } from "@/lib/types";

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

export function PerfilClient({
  user,
  role,
  lists,
  managedPlaces,
}: {
  user: User;
  role: UserRole;
  lists: { wantToVisit: Place[]; visited: Place[] };
  managedPlaces: ManagedPlace[];
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
          medebooks
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
          title="Quiero visitar"
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

      <button
        onClick={signOut}
        className="mt-10 rounded-lg border border-line px-4 py-2 text-sm text-accent transition-colors hover:border-accent"
      >
        Cerrar sesión
      </button>
    </div>
  );
}
