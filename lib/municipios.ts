// Utilidades para las rutas por municipio (/librerias/envigado, etc.).
// Los nombres en la base tienen tildes ("Itagüí"); las URLs van sin tilde.

export function slugifyMunicipio(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // quita tildes/diacríticos
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Resuelve el slug de la URL al nombre canónico del municipio (o null si no existe). */
export function resolveMunicipio(
  slug: string,
  municipalities: string[],
): string | null {
  const target = slugifyMunicipio(decodeURIComponent(slug));
  return municipalities.find((m) => slugifyMunicipio(m) === target) ?? null;
}
