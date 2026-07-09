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
};

export type PlaceFilters = {
  type?: PlaceType | "all";
  municipality?: string | "all";
  specialties?: string[]; // selección múltiple (OR): muestra lugares con cualquiera
  query?: string;
};

export const TYPE_LABEL: Record<PlaceType, string> = {
  libreria: "Librería",
  biblioteca: "Biblioteca",
};
