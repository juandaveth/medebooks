export type UserRole = "super-admin" | "business-admin" | "lector";

export const ROLE_LABEL: Record<UserRole, string> = {
  "super-admin": "Super-admin",
  "business-admin": "Admin de negocio",
  lector: "Lector",
};
