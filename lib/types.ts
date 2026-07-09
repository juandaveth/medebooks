export type PlaceType = "libreria" | "biblioteca";

export type Place = {
  id: string;
  type: PlaceType;
  name: string;
  slug: string;
  description?: string | null;
  address?: string | null;
  neighborhood?: string | null; // barrio
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
  municipality?: string | "all";
  specialties?: string[]; // tipo de librería (OR): muestra lugares con cualquiera
  subjects?: string[]; // materias/temas (OR)
  query?: string;
};

export const TYPE_LABEL: Record<PlaceType, string> = {
  libreria: "Librería",
  biblioteca: "Biblioteca",
};
