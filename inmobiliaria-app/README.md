# Sosa y Asociados — Buscador de Propiedades (MVP)

Aplicación completa: backend real con base de datos, API de búsqueda/filtros, panel de administración para cargar propiedades, y frontend web responsive que funciona como app (PWA) en el celular. Con la identidad visual de Estudio Jurídico Inmobiliario Contable Sosa y Asociados.

## Qué incluye

- **Backend**: Node.js + Express + SQLite (`better-sqlite3`). No necesita instalar ningún motor de base de datos aparte: SQLite guarda todo en un archivo (`data.db`).
- **Frontend**: HTML/CSS/JS sin frameworks, servido por el mismo backend. Responsive (se adapta a celular) e instalable como PWA (ícono en el celular, funciona en pantalla completa).
- **Buscador** (`/`): filtros por operación (venta/alquiler), tipo, precio, texto libre; orden por precio/superficie/fecha; paginación.
- **Ficha de propiedad** (`/property.html?id=...`): galería, ficha técnica tipo "planilla" y botón de contacto por WhatsApp.
- **Panel de administración** (`/admin.html`): login con contraseña, alta, edición y baja de propiedades, con subida de fotos directo desde la computadora (no hace falta pegar links).

## Identidad de marca

- **Logo**: `public/images/logo.png` — para cambiarlo, reemplazá ese archivo por otro con el mismo nombre.
- **Colores**: verde principal `#055055`, verde secundario `#C9D7CB`. Están definidos como variables al principio de `public/css/styles.css` (`--ink` y `--secondary`), así que para ajustar el tono alcanza con cambiar esos dos valores.
- **Tipografía**: Fedra Sans Std (Light y Medium). Como es una fuente paga, no viene incluida en el proyecto — mirá `public/fonts/LEEME.txt` para los pasos exactos. Mientras no se suban esos archivos, el sitio usa Inter como reemplazo visual muy cercano, así que nunca se rompe.

## Fotos de las propiedades

Desde el panel de administración podés subir fotos directo desde tu computadora o celular (botón "+ Subir fotos"), sin necesidad de buscar links externos. **Importante**: en el plan gratuito de Render, los archivos subidos se pueden borrar si el servidor se reinicia (por ejemplo, al actualizar código). Para que las fotos queden guardadas de forma permanente y segura, en algún momento conviene migrar el almacenamiento a un servicio como Cloudinary o un bucket de almacenamiento (puedo ayudarte con eso cuando lo necesites).

## Cómo correrlo en tu máquina

Necesitás tener [Node.js](https://nodejs.org) instalado (versión 18 o superior).

```bash
cd backend
npm install
npm run seed     # carga 8 propiedades de ejemplo (solo la primera vez, no duplica si ya hay datos)
npm start
```

Abrí el navegador en **http://localhost:3000**

## Panel de administración

Entrá a **http://localhost:3000/admin.html**

La contraseña por defecto es la que está en `backend/.env` (`ADMIN_PASSWORD`). **Cambiala antes de usar la app en serio** — abrí `backend/.env` y poné una contraseña propia, además de un `ADMIN_TOKEN_SECRET` distinto (cualquier texto largo y random sirve).

## Instalarla como app (PWA)

Desde el celular, abrí la web en Chrome/Safari y usá la opción "Agregar a pantalla de inicio" (Android) o "Agregar a inicio" (iPhone, desde el botón de compartir). Va a quedar como un ícono más, y abre en pantalla completa sin la barra del navegador.

## Cómo publicarla en internet (para que no sea solo local)

Este proyecto es un backend Node.js estándar, así que se puede subir a cualquier servicio de hosting que corra Node, por ejemplo:

- **Render.com** o **Railway.app**: conectás el repositorio de GitHub y en un par de clics queda online con una URL pública (planes gratuitos disponibles para empezar).
- Como alternativa a SQLite en producción, estos servicios suelen ofrecer PostgreSQL gestionado; si el proyecto crece y necesitás varios usuarios administradores editando al mismo tiempo, te recomiendo migrar a Postgres (puedo ayudarte con eso llegado el momento).

## Estructura del proyecto

```
inmobiliaria-app/
├── backend/
│   ├── server.js       # API REST + servidor
│   ├── db.js           # esquema de la base SQLite
│   ├── seed.js         # datos de ejemplo
│   ├── .env             # contraseña de admin y configuración
│   └── package.json
└── public/
    ├── index.html        # buscador
    ├── property.html      # ficha de propiedad
    ├── admin.html          # panel de administración
    ├── manifest.json + service-worker.js  # PWA
    ├── css/styles.css
    └── js/ (app.js, property.js, admin.js)
```

## Próximos pasos posibles (no incluidos en este MVP)

- Login de administrador con múltiples usuarios y roles.
- Carga de imágenes propias (hoy se pegan URLs de imágenes; se puede agregar upload de archivos).
- Mapa interactivo con ubicación de cada propiedad.
- Favoritos y alertas de búsqueda para usuarios registrados.
- Multi-agente/inmobiliaria (varias marcas dentro de la misma base).
