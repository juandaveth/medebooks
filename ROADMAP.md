# Roadmap — medebooks

Directorio de **librerías 📕 y bibliotecas 🏛️** del Área Metropolitana de Medellín.
Este archivo recoge lo que sigue; no es compromiso de fechas, es orden de intención.

## v1 — Descubrir (en producción ✅)
- Mapa + lista, filtros por tipo/municipio/búsqueda, ficha de detalle.
- Datos reales precargados desde Google Places (172 lugares).
- Rutas compartibles por tipo: `/librerias` y `/bibliotecas`.

## Próximo (pulido de v1)
- **Afinar clasificación de `type`**: varias "Biblioteca…" quedaron como librería por venir
  en la búsqueda de librerías de Google. Reclasificar (heurística por nombre/entidad + revisión).
- **Fotos faltantes**: 24 de 172 sin foto destacada.

## v2 — Login y comunidad (en producción ✅)
- **Login con Google + magic link** (Supabase Auth) — abierto a todos los lectores.
- **3 roles**:
  - `lector` — rol por defecto de cualquier usuario autenticado.
  - `admin de librería / admin de biblioteca` — asignado por el super-admin vía `place_roles`; badge dinámico en el perfil según el tipo del lugar que administra.
  - `super-admin` — controlado por `ADMIN_EMAILS` (env var).
- **Quiero visitar / Ya visité** — botones en cada ficha con optimistic UI; tabla `user_places` con RLS.
- **`/perfil`** — muestra avatar, rol, nombre del lugar administrado (si aplica) y las dos listas de lugares guardados.
- **`medebooks.app`** — dominio propio conectado a Vercel; SSL activo; redirect de apex a www.

### Pendiente de v2 (próximos sprints)
- **Videos/Reels de la comunidad en cada ficha** ⭐
  - Sección con videos cortos de creadores (Instagram Reels, TikTok, YouTube Shorts) sobre cada lugar.
  - Modelo: tabla `place_videos` (`place_id`, `url`, `platform`, `author_handle`, `thumbnail_url`, `status`).
  - Curación: aporte de comunidad + moderación por el admin del lugar o el super-admin.
- Reseñas y calificación (texto).
- Fotos propias (Supabase Storage).

## v3 — Aportes y moderación
- Formulario de aporte de la comunidad (nuevos lugares, videos, correcciones).
- Estado `pending` + panel de moderación para aprobar/rechazar.
- Endurecer RLS.
- Poblar `specialties` (tipo de librería) y `subjects` (materias BISAC) con aportes de comunidad
  — decidido dejarlos para esta etapa; hoy la UI los oculta cuando están vacíos.
- **Dashboard de curaduría con roles y permisos por lugar** ⭐ (pedido explícito).
  - Qué: además del **admin/curador** global (rol actual del proyecto), permitir roles
    delegados y **acotados a un lugar concreto**:
    - **`owner` (dueño de librería)** — administra su(s) librería(s).
    - **`manager` (gestor cultural)** — administra su(s) biblioteca(s) / espacio(s).
    Estos roles pueden **editar y aprobar los cambios asociados solo a sus lugares**.
  - Modelo de datos (borrador): tabla `place_roles` (`user_id`, `place_id`, `role`
    ['owner'|'manager'], `status` ['pending'|'approved'], `created_at`). Roles globales
    (admin/curador) en `user_roles` o vía claim de metadatos.
  - Flujo de reclamación (**seguridad clave**): un dueño/gestor **solicita** el lugar
    ("reclamar esta librería"); el **admin verifica y aprueba** antes de otorgar permisos
    (evita secuestro de fichas). Verificación posible: correo del dominio, contacto, etc.
  - Permisos vía **RLS de Supabase**: un usuario puede editar/aprobar un `place` solo si
    tiene un `place_role` aprobado sobre ese lugar; el admin puede todo. Los cambios siguen
    pasando por `status='pending'` y los aprueba el owner/manager del lugar o el admin.

## v4 — Clubes de lectura y eventos
- **Clubes de lectura y eventos** ⭐ (pedido explícito, para más adelante).
  - Qué: poder registrar y descubrir **clubes de lectura** y **eventos** (lecturas, lanzamientos,
    talleres, ferias) asociados a las librerías/bibliotecas — y quizá también independientes.
  - **Integrar con el ecosistema de eventos de lectura de Medellín** ⭐ (necesidad explícita):
    la ciudad tiene una agenda literaria muy viva —la **Fiesta del Libro y la Cultura**, ferias,
    lanzamientos, tertulias, clubes de lectura en bibliotecas y librerías— hoy dispersa en muchos
    lados. medebooks puede ser el lugar que la reúna: una agenda única de "qué pasa alrededor de
    los libros en Medellín". A futuro, ver si esos eventos se pueden traer de fuentes públicas
    (agenda cultural de la Alcaldía / Fiesta del Libro) además del aporte de comunidad.
  - Por qué: pasar de "dónde conseguir libros" a "dónde pasan cosas alrededor de los libros";
    fideliza, da vida al directorio y lo conecta con la vida cultural real de la ciudad.
  - Modelo de datos (borrador):
    - `events` (`id`, `place_id?` [opcional si es en otro lugar], `title`, `description`,
      `starts_at`, `ends_at?`, `recurrence?` [para clubes periódicos], `url?`, `organizer?`,
      `added_by`, `status` ['published'|'pending'], `created_at`).
    - Un club de lectura = evento recurrente (o un tipo propio `book_clubs` si crece).
  - UX (a decidir): sección "Agenda/Eventos" en la ficha del lugar + posible vista de agenda
    global filtrable por fecha/municipio/tipo. Estados vencidos vs próximos.
  - Encaja con la infra de aportes + moderación de v2/v3 (`status='pending'` → aprobar).

## v4 — Búsqueda en lenguaje natural (IA)
- **Búsqueda tipo IA / semántica** ⭐ (pedido explícito, para más adelante).
  - Qué: que el usuario escriba en lenguaje natural (ej. *"busco libros usados en Floresta"*)
    y el sistema entienda la intención → filtra por especialidad (`usados`) + barrio (`Floresta`)
    y muestra resultados, en vez de sólo coincidencia de texto por nombre.
  - Enfoque (a decidir): (a) parseo de intención con un LLM que mapea la frase a filtros
    estructurados (tipo/barrio/materias/especialidad) — barato y explicable; o (b) búsqueda
    semántica con embeddings (pgvector en Supabase) sobre nombre/descripción/reseñas/videos.
  - Depende de tener pobladas las `specialties`/`subjects` (v3) para que el filtro sea útil.

## Futuro / ideas
- i18n inglés (estructura preparada).
- Cajas de compensación (Comfama/Comfenalco), bibliotecas universitarias y comunitarias.
