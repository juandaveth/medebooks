---
title: "Cómo construí medebooks con Claude Code"
date: 2026-07-10
description: "Un directorio en mapa de las librerías y bibliotecas de Medellín, hecho con Claude Code y el modelo Fable 5. Pero el objetivo real es destilar un método de trabajo replicable con cualquier LLM. Estas son las decisiones, los tropiezos y el bug que lo resume todo."
tag: "Construyendo en público"
section: construyendo
---

En Medellín hay decenas de librerías y bibliotecas, pero no hay un solo lugar donde verlas todas. Uno se entera de la librería de usados del barrio por casualidad, o descubre un Parque Biblioteca años después de que lo inauguraran. Esa fue la idea de **medebooks**: reunirlas todas en un mapa, por barrio.

Lo construí con **Claude Code**, usando el modelo **Fable 5**. No fue "dictarle a una IA y copiar-pegar": fue un proceso con decisiones reales, retos técnicos que se fueron resolviendo y un par de bugs que enseñan más que cualquier tutorial. Si estás aprendiendo a construir con estas herramientas, esto es lo que he venido haciendo y quiero compartírtelo tal como fue, por dentro.

Pero, más allá de este directorio, lo que de verdad busco es destilar un **método de trabajo replicable con cualquier LLM** — que no dependa de una herramienta o un modelo en particular. medebooks es el primer ejercicio; el siguiente ya está en la mira: un directorio parecido pero para **ciclistas en Medellín**, que pienso construir con otra inteligencia artificial. Por eso voy documentando este método paso a paso: para que sea replicable y fácil de repetir con otras herramientas.

## Empecé por una entrevista, no por el código

El error clásico es abrir el editor y empezar a teclear. Hice lo contrario: le pedí a Claude que me hiciera **la entrevista de alcance más completa posible** antes de escribir una sola línea.

De ahí salieron las decisiones que sostienen todo el proyecto:

- 🌐 Un **directorio público**, sin login para explorar.
- 📚 **Librerías y bibliotecas juntas**, unificadas con un filtro por tipo.
- 🗄️ Un modelo de datos pensado para crecer (favoritos, reseñas, aportes de comunidad) **sin migraciones dolorosas** después.

Esa media hora de preguntas definió una tabla de base de datos que meses después sigue intacta. La lección: **el código barato es el que escribes después de pensar; el caro es el que reescribes por no haberlo hecho.**

## Achicar el alcance para poder terminar

La primera versión que tenía en la cabeza abarcaba **toda el Área Metropolitana del Valle de Aburrá** — los diez municipios. Sonaba completo, pero antes de ampliar tanto me hice la pregunta que de verdad importa: **¿a quién quiero ayudar con este primer prototipo?** Y la persona que tengo en mente está en Medellín, no en Caldas ni en Barbosa. Estirar el alcance a toda el área diluía justo a ese usuario.

Así que me concentré en Medellín: sus comunas y sus **349 barrios y veredas**. El mapa dibuja cada uno de esos polígonos y ubica cada librería y biblioteca en el barrio que le corresponde, con un cálculo geométrico que hace la asignación sola.

Reducir el alcance no fue rendirse: fue lo que me permitió tener **algo funcional que yo mismo pudiera usar desde mi celular, como PWA** — no una idea perfecta que se queda en la cabeza. Y los otros municipios no se borraron: siguen guardados en la base de datos, esperando su turno.

## Los mapas salieron de datos abiertos

Un detalle que me importa: los polígonos de los barrios no los inventé ni los pagué. Salieron de **datos abiertos de la Alcaldía de Medellín**. La ciudad publica su capa oficial de límites —barrios y veredas— en su portal **GeoMedellín**, lista para descargar en GeoJSON:

- 🗺️ Polígonos de barrios y veredas: [Límite Barrio Vereda Catastral — GeoMedellín](https://geomedellin-m-medellin.opendata.arcgis.com/datasets/limite-barrio-vereda-catastral)
- 🔓 Portal completo de datos abiertos: [OpenData · Alcaldía de Medellín](https://geomedellin-m-medellin.opendata.arcgis.com/)

Y el mapa base corre sobre [OpenStreetMap](https://www.openstreetmap.org/) a través de los estilos gratuitos de CARTO. Es decir: todo el mapa de medebooks se sostiene sobre **información pública**. Un ejemplo pequeño pero concreto de lo que se puede construir cuando una ciudad libera sus datos.

## Herramientas gratis

Quería un producto real sin una factura mensual. Se pudo:

- 🗺️ **Mapa** con MapLibre + un basemap gratuito de CARTO (sin API key para el mapa).
- 🗄️ **Datos** en Supabase (Postgres con capacidades geográficas), en su capa gratis.
- 📍 **172 lugares reales** sembrados una sola vez desde Google Places, con la capa gratuita.
- 🚀 **Deploy** automático en Vercel desde GitHub.

Todo el stack, cero costo recurrente. El único gasto potencial —el sembrado de datos— cupo en la capa gratis de Google.

Y una decisión a propósito: **usé Vercel también para no tener que comprar un dominio todavía**. El sitio vive en `medebooks.vercel.app`, una URL gratuita y con HTTPS que Vercel da por defecto. Mientras esto sea un prototipo, comprar un dominio propio puede esperar; el día que valga la pena, se conecta sin romper nada.

## Claude Code también maneja el navegador

Esto fue lo que más me sorprendió. Claude Code no solo escribió el código: me **guió clic a clic** por cada consola. Crear el proyecto de Supabase, correr el esquema SQL, configurar los permisos de Google Cloud, pegar las variables en Vercel. Cada paso, explicado y verificado. Más que ahorrarme una tarea, me **mejoró el flujo de trabajo**.

Pero con una división clara de tareas, que resultó ser también la regla de seguridad del proyecto:

> **Yo** pongo la tarjeta, hago los logins y pego los secretos. **Claude Code** hace el trabajo de programar. Los secretos nunca van al chat; viven en un archivo local que git ignora.

Cuando una vez se coló una llave secreta en la conversación, la rotamos de inmediato. Construir con estas herramientas no significa entregarles las llaves de todo: significa saber qué queda de tu lado.

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

medebooks ya está en vivo en [medebooks.vercel.app](https://medebooks.vercel.app): un mapa de las librerías y bibliotecas de Medellín, organizado por barrio, **instalable como app** en el celular. Ya tiene un primer panel de administración para curar los datos a mano.

El roadmap es largo, pero estos son los siguientes capítulos:

- 🔑 **Un administrador de verdad, con roles.** Hoy hay un solo curador: yo. Lo que viene es un panel con **roles acotados por lugar** — que el *dueño* de una librería o el *gestor* de una biblioteca pueda **reclamar su ficha** y editar solo lo suyo, previa verificación del admin. Nadie puede secuestrar la ficha de otro: los permisos se controlan a nivel de base de datos.
- 🤝 **Aportes de la comunidad + moderación.** Que cualquiera sugiera lugares, correcciones o contenido, y que todo entre a una cola de aprobación antes de publicarse.
- 🎥 **Videos y reels en cada ficha.** Más que reseñas de texto: el contenido que ya existe en redes sobre cada lugar —su ambiente, qué se consigue, cómo llegar.
- 📅 **Clubes de lectura y eventos.** Pasar de "dónde conseguir libros" a "dónde pasan cosas alrededor de los libros".
- 🔍 **Búsqueda en lenguaje natural.** Escribir *"libros usados en La Floresta"* y que el sistema entienda la intención, no solo el texto — con ayuda de un LLM.
- 📴 Y lo más inmediato: **modo offline** y **más cobertura** por comuna (hoy está concentrado en Laureles y el Centro).

Si algo me llevo de construir esto con Claude Code, es que la parte difícil sigue siendo humana: decidir qué construir, entrevistarse a uno mismo antes de empezar, y saber leer un error cuando la pantalla se pone negra. El modelo hace el resto rápido —pero el rumbo lo pones tú.

## Una nota para el semillero

Si este texto existe es por una convicción que en el **[semillero de VibeCoding de la Universidad de Antioquia](https://github.com/cold-briu/vibe-coding-udea)** compartimos: **documentar lo que hacemos y abrirlo a la comunidad**. Escribir el proceso —no solo el resultado— es lo que lo vuelve replicable: le permite a otra persona tomar este método y llevarlo a otro escenario, con otros retos, sin empezar de cero.

Es justo lo que promueve el profe **Edison Montoya**: construir, documentar y compartir en abierto, para que el conocimiento circule y cada ejercicio deje una huella que otros puedan seguir. medebooks es mi manera de practicarlo. Ojalá te anime a documentar el tuyo.

Gracias a **Andrés** por crear este espacio e invitarme a construir en comunidad, y al **[semillero de VibeCoding de la Universidad de Antioquia](https://github.com/cold-briu/vibe-coding-udea)** por la comunidad y el empujón para escribir esto. 🙏
