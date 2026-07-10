---
title: "Cómo construí medebooks con Claude Code"
date: 2026-07-10
description: "Un directorio en mapa de las librerías y bibliotecas de Medellín, hecho con un agente de código. Estas son las decisiones, los tropiezos y el bug que lo resume todo."
tag: "Construyendo en público"
section: construyendo
---

En Medellín hay decenas de librerías y bibliotecas, pero no hay un solo lugar donde verlas todas. Uno se entera de la librería de usados del barrio por casualidad, o descubre un Parque Biblioteca años después de que lo inauguraran. Esa fue la idea de **medebooks**: reunirlas todas en un mapa, por barrio.

Lo construí con **Claude Code**, un agente que escribe, ejecuta y depura código. No fue "dictarle a una IA y copiar-pegar": fue un proceso con decisiones reales, callejones sin salida y un par de bugs que enseñan más que cualquier tutorial. Este es el registro honesto.

## Empecé por una entrevista, no por el código

El error clásico es abrir el editor y empezar a teclear. Hice lo contrario: le pedí a Claude que me hiciera **la entrevista de alcance más completa posible** antes de escribir una sola línea.

De ahí salieron las decisiones que sostienen todo el proyecto:

- Un **directorio público**, sin login para explorar.
- **Librerías y bibliotecas juntas**, unificadas con un filtro por tipo.
- Un modelo de datos pensado para crecer (favoritos, reseñas, aportes de comunidad) **sin migraciones dolorosas** después.

Esa media hora de preguntas definió una tabla de base de datos que meses después sigue intacta. La lección: **el código barato es el que escribes después de pensar; el caro es el que reescribes por no haberlo hecho.**

## Gratis-primero, de verdad

Quería un producto real sin una factura mensual. Se pudo:

- **Mapa** con MapLibre + un basemap gratuito de CARTO (sin API key para el mapa).
- **Datos** en Supabase (Postgres con capacidades geográficas), en su capa gratis.
- **172 lugares reales** sembrados una sola vez desde Google Places, con la capa gratuita.
- **Deploy** automático en Vercel desde GitHub.

Todo el stack, cero costo recurrente. El único gasto potencial —el sembrado de datos— cupo en la capa gratis de Google.

## El agente también maneja el navegador

Esto fue lo que más me sorprendió. Claude no solo escribió el código: me **guió clic a clic** por las consolas que dan miedo. Crear el proyecto de Supabase, correr el esquema SQL, configurar los permisos de Google Cloud, pegar las variables en Vercel. Cada paso, explicado y verificado.

Pero con una división clara de tareas, que resultó ser también la regla de seguridad del proyecto:

> **Yo** pongo la tarjeta, hago los logins y pego los secretos. **El agente** escribe, ejecuta y depura. Los secretos nunca van al chat; viven en un archivo local que git ignora.

Cuando una vez se coló una llave secreta en la conversación, la rotamos de inmediato. Trabajar con un agente no significa darle las llaves de todo: significa saber qué queda de tu lado.

## El bug que lo resume todo: "en mi máquina sí funciona"

Aquí está la mejor historia del proyecto.

Construí un panel de administración para editar y borrar lugares a mano. En mi computador funcionaba perfecto. Lo subí a producción, abrí la página… y esto:

```
Error: supabaseKey is required.
```

Pantalla negra, error 500. En local: impecable. En producción: caído. El clásico **"pero en mi máquina sí corre"**.

En vez de adivinar, el método fue quirúrgico:

1. **Reproducir producción localmente.** Compilé y arranqué el sitio en modo producción en mi propia máquina. Funcionó. Eso descartó el código: si el mismo build corre bien aquí, el problema es del **entorno**, no del programa.
2. **Leer el error real.** En los logs de Vercel, buscando por el identificador del error, apareció el stack exacto: fallaba al crear el cliente de la base de datos con permisos de administrador.

La causa: ese panel usa una **llave secreta con permisos totales** que vive únicamente en mi archivo local. Como git ignora ese archivo —correctamente, es un secreto—, el `git push` nunca la subió. El sitio público viejo nunca la había necesitado, así que el error apareció recién con el panel nuevo.

El arreglo fue de un minuto: agregar la variable en Vercel y volver a desplegar. Pero la lección vale oro:

> **"Funciona en local" no implica "funciona en producción".** Cada variable de servidor nueva hay que replicarla en el hosting. Y cuando algo falla solo en producción, reproduce producción localmente antes de tocar una línea de código.

## Dónde está hoy y qué sigue

medebooks ya está en vivo en [medebooks.vercel.app](https://medebooks.vercel.app): un mapa de las librerías y bibliotecas de Medellín, organizado por barrio, **instalable como app** en el celular.

Lo que viene:

- **Modo offline**, para que el mapa cargue sin conexión.
- **Más cobertura** por comuna (hoy está concentrado en Laureles y el Centro).
- **Aportes de comunidad**: que la gente sugiera lugares, deje reseñas y guarde favoritos.

Si algo me llevo de construir esto con un agente, es que la parte difícil sigue siendo humana: decidir qué construir, entrevistarse a uno mismo antes de empezar, y saber leer un error cuando la pantalla se pone negra. El agente hace el resto rápido —pero el rumbo lo pones tú.
