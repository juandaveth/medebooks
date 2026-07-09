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

## v2 — Comunidad y contexto
- **Videos/Reels de la comunidad en cada ficha** ⭐ (nuevo, pedido explícito).
  - Qué: sección en la ficha de cada lugar (librería y biblioteca) con **videos cortos**
    de creadores que ya visitaron el sitio y explican qué ofrece, cómo llegar, ambiente, etc.
    Más que reseñas de texto: contenido en video de redes (Instagram Reels, TikTok, YouTube Shorts).
  - Por qué: da contexto real y confianza; aprovecha contenido que ya existe en redes.
  - Modelo de datos (borrador): tabla `place_videos` (`place_id`, `url`, `platform`
    ['instagram'|'tiktok'|'youtube'], `author_handle`, `title`, `thumbnail_url`, `added_by`,
    `status` ['published'|'pending'], `created_at`). Un lugar puede tener varios videos.
  - Cómo (opciones técnicas a decidir):
    - Enlazar con miniatura + "ver en Instagram/TikTok" (ligero, evita scripts pesados y
      problemas de rendimiento/consentimiento). Miniatura vía oEmbed cuando exista.
    - o Embeber con el script oficial de cada plataforma (más rico, más peso y cookies).
  - Curación: aporte de comunidad + moderación (`status='pending'` → aprobar). Respetar
    derechos/atribución del creador (mostrar autor y enlazar al original).
- Login con Google (Supabase Auth).
- Favoritos / "quiero visitar".
- Reseñas y calificación (texto), complementarias a los videos.
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
  - Por qué: pasar de "dónde conseguir libros" a "dónde pasan cosas alrededor de los libros";
    fideliza y da vida al directorio.
  - Modelo de datos (borrador):
    - `events` (`id`, `place_id?` [opcional si es en otro lugar], `title`, `description`,
      `starts_at`, `ends_at?`, `recurrence?` [para clubes periódicos], `url?`, `organizer?`,
      `added_by`, `status` ['published'|'pending'], `created_at`).
    - Un club de lectura = evento recurrente (o un tipo propio `book_clubs` si crece).
  - UX (a decidir): sección "Agenda/Eventos" en la ficha del lugar + posible vista de agenda
    global filtrable por fecha/municipio/tipo. Estados vencidos vs próximos.
  - Encaja con la infra de aportes + moderación de v2/v3 (`status='pending'` → aprobar).

## Futuro / ideas
- i18n inglés (estructura preparada).
- Cajas de compensación (Comfama/Comfenalco), bibliotecas universitarias y comunitarias.
