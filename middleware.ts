import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Renueva la sesión de Supabase en cada request del admin/login para que los
// tokens no expiren en los Server Components (que no pueden escribir cookies).
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  // Importante: refresca el token si hace falta.
  await supabase.auth.getUser();

  return response;
}

// Solo corre en las rutas que dependen de la sesión.
export const config = {
  matcher: ["/admin/:path*", "/login", "/auth/:path*", "/perfil/:path*"],
};
