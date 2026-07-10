import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { signOut } from "../actions";

export const metadata: Metadata = { title: "No autorizado", robots: { index: false } };

export default async function NoAutorizadoPage() {
  const user = await getCurrentUser();
  return (
    <div className="mx-auto mt-24 max-w-sm px-5 text-center">
      <h1 className="font-display text-3xl text-ink">Sin acceso</h1>
      <p className="mt-3 text-sm text-ink-soft">
        La cuenta {user?.email ? <strong>{user.email}</strong> : "actual"} no tiene
        permisos de administración.
      </p>
      <div className="mt-6 flex items-center justify-center gap-3 text-sm">
        <Link href="/" className="text-ink-soft hover:text-ink">
          Ir al sitio
        </Link>
        <form action={signOut}>
          <button className="rounded-full border border-line px-3 py-1.5 text-ink hover:border-ink">
            Salir
          </button>
        </form>
      </div>
    </div>
  );
}
