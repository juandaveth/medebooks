export type PlaceType = "libreria" | "biblioteca";

export type Place = {
  id: string;
  type: PlaceType;
  name: string;
  slug: string;
  description?: string | null;
  address?: string | null;
  neighborhood?: string | null; // barrio
  comuna?: string | null; // comuna/corregimiento de Medellín
  municipality?: string | null; // Medellín, Envigado, Sabaneta...
  lat: number;
  lng: number;
  phone?: string | null;
  whatsapp?: string | null;
  website?: string | null;
  instagram?: string | null;
  hours?: string | null; // texto legible de horarios (v1)
  specialties?: string[]; // tags de librería
  isFree?: boolean | null; // biblioteca: acceso gratuito
  services?: string[]; // biblioteca: wifi, salas, préstamo...
  entity?: string | null; // biblioteca: entidad
  googlePlaceId?: string | null; // ID del lugar en Google Maps (para enlazar por lugar)
  subjects?: string[]; // materias/temas (taxonomía BISAC, ver MATERIAS)
  photoUrl?: string | null; // foto destacada (mejor foto de Google Maps, resuelta en el sembrado)
};

/**
 * Materias/temas — taxonomía basada en las categorías de nivel superior de
 * BISAC (Book Industry Standards and Communications), el estándar temático
 * que usan librerías y editoriales, traducidas al español. Aplica tanto a
 * librerías como a bibliotecas. Se usa para clasificar y filtrar por contenido.
 */
export const MATERIAS: string[] = [
  "Literatura y ficción",
  "Poesía",
  "Cómics y novela gráfica",
  "Manga y cultura japonesa",
  "Infantil",
  "Juvenil (Young Adult)",
  "Arte",
  "Arquitectura",
  "Fotografía",
  "Música",
  "Cine y teatro",
  "Historia",
  "Biografías y memorias",
  "Filosofía",
  "Religión y espiritualidad",
  "Ciencias sociales",
  "Política",
  "Economía y negocios",
  "Derecho",
  "Psicología y autoayuda",
  "Ciencia",
  "Matemáticas",
  "Tecnología e ingeniería",
  "Computación e informática",
  "Medicina y salud",
  "Naturaleza y medio ambiente",
  "Cocina y gastronomía",
  "Viajes",
  "Deportes y recreación",
  "Idiomas y lingüística",
  "Educación y pedagogía",
];

export type PlaceFilters = {
  type?: PlaceType | "all";
  comuna?: string | "all"; // comuna de Medellín
  neighborhood?: string | "all"; // barrio (dentro de la comuna)
  specialties?: string[]; // tipo de librería (OR): muestra lugares con cualquiera
  subjects?: string[]; // materias/temas (OR)
  query?: string;
};

export const TYPE_LABEL: Record<PlaceType, string> = {
  libreria: "Librería",
  biblioteca: "Biblioteca",
};

export type Event = {
  id: string;
  placeId: string | null;       // null = evento multi-lugar
  placeName: string | null;
  placeSlug: string | null;
  placeType: PlaceType | null;
  placeCount?: number;          // cuántos lugares si es multi-lugar
  title: string;
  description?: string | null;
  date: string; // YYYY-MM-DD
  startTime?: string | null;
  endTime?: string | null;
  url?: string | null;
  status: "draft" | "published";
  createdAt: string;
};

/** Formatea fecha + hora opcional en español para mostrar en UI. */
export function formatEventDate(date: string, startTime?: string | null): string {
  // Forzar interpretación local (sin desfase UTC) añadiendo hora fija.
  const d = new Date(`${date}T12:00:00`);
  const datePart = d.toLocaleDateString("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  if (!startTime) return datePart;
  const [h, m] = startTime.split(":");
  const t = new Date();
  t.setHours(Number(h), Number(m));
  const timePart = t.toLocaleTimeString("es-CO", { hour: "numeric", minute: "2-digit" });
  return `${datePart} · ${timePart}`;
}
