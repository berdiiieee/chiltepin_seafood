# Chiltepin Seafood — Guía para Backend

Proyecto del sitio web de Chiltepin Seafood (restaurante de mariscos, 2 sucursales en Durango). Actualmente usa un servidor Express ligero como backend temporal. El objetivo es migrar a un backend definitivo.

---

## Arranque rápido

```bash
npm install
ADMIN_PASSWORD=tucontraseña node server.js
```

- Sitio público: `http://localhost:3000`
- Panel admin: `http://localhost:3000/panel` (acceso oculto, solo con contraseña)

---

## API contratada

La API actual (`server.js`) define los endpoints que el nuevo backend debe implementar:

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `POST` | `/api/auth` | No | Recibe `{ password }`, devuelve `{ ok: true }` y setea cookie `auth` |
| `POST` | `/api/logout` | No | Borra la cookie de sesión |
| `GET` | `/api/menu` | No | Devuelve `data/menu.json` |
| `PATCH` | `/api/menu` | Sí | Recibe `{ sections: [...], promos: [...] }`, actualiza solo precios |
| `GET` | `/api/images` | Sí | Devuelve array de imágenes en `img/` con path, name, size |
| `POST` | `/api/images/upload` | Sí | Recibe multipart `image` + `subPath` + `targetName` + `originalName`, sobreescribe archivo |
| `GET` | `/api/version` | No | Devuelve `{ version: N }` para cache-busting de imágenes |

---

## Modelo de datos

### `data/menu.json`

```json
{
  "sections": [
    {
      "name": "Entradas",
      "items": [
        { "name": "Callo de hacha", "price": 145 }
      ]
    }
  ],
  "promos": [
    { "location": "Plaza Real", "day": "Lun", "desc": "Ceviche + agua", "price": 65 }
  ]
}
```

93 precios en total (86 platillos + 7 promos). `price: null` significa sin precio fijo (ej. "Tacos 3x2").

---

## Estructura de archivos

```
Proyecto/
├── server.js              ← Express temporal (referencia de API)
├── package.json           ← express, multer, cookie-parser
├── css/styles.css         ← CSS compartido (103 reglas) — usa como base
├── js/main.js             ← JS compartido (12 funciones) — usa como base
├── data/menu.json         ← Datos del menú (migrar a BD)
├── data/version.json      ← Cache-busting (generado automático)
├── panel/index.html       ← Admin panel (autónomo, solo consume APIs)
├── index.html             ← Inicio
├── menu.html              ← Menú
├── acercade.html          ← Acerca de
├── eventos.html           ← Eventos / Catering
├── contacto.html          ← Contacto
├── horarioyubicacion.html ← Horarios y ubicación
├── boletin.html           ← Boletín / Newsletter
└── img/                   ← Imágenes (22 únicas, ~4.3 MB total)
```

---

## CSS y JS compartido vs específico

### `css/styles.css` (compartido por las 7 páginas)

103 reglas: `:root`, reset, `header`, `nav`, dropdowns, footer, `.res-*` (sidebar reservas), `.modal-*`, `.scroll-top`, `.reveal`, `.divider`, `.btn-*`, `.input-group`, `@media` base.

### `js/main.js` (compartido por las 7 páginas)

12 funciones + listener `DOMContentLoaded`: `openReservations`, `closeReservations`, `mostrarModal`, `cerrarModal`, `showError`, `clearError`, `validateResDate`, `confirmStep1`, `goBackToStep1`, `submitReservation`, wiring de pills, scroll reveal, scroll-top.

### CSS/JS específico por página

Cada `.html` tiene un `<style>` mínimo y un `<script>` mínimo con solo lo propio de esa página:
- `index.html`: carrusel hero, splash screen, contadores, parallax, galería
- `menu.html`: estilos del menú, scroll spy
- `acercade.html`: página hero, story grid, services carousel
- `eventos.html`: página hero, event view, formulario cotización, eventData
- `contacto.html`: página hero, contact grid, validación
- `horarioyubicacion.html`: página hero, location view, mapa, loadLocation
- `boletin.html`: página hero, newsletter section, validación boletín

### Duplicados que eliminar al crear templates

- **Header + nav** (incluyendo dropdowns de delivery) — ~60 líneas HTML idénticas en las 7 páginas
- **Footer** — ~40 líneas HTML idénticas
- **Reservation sidebar** — ~90 líneas HTML (`.res-overlay` + `.res-sidebar` con Step 1/2/3)
- **Modal overlay** — ~5 líneas HTML
- **Scroll-top button** — 1 línea

Con un motor de templates (EJS, Handlebars, Pug), se reduce a:
```
layout.html → header + footer + sidebar + modal
index.html  → solo contenido específico
menu.html   → solo contenido específico
...
```

---

## Panel admin

`panel/index.html` es completamente autónomo. Mismo estilo visual (tema oscuro, mismas fuentes). Dos pestañas:

- **Precios:** tabla agrupada por sección con input para cambiar precio → llama `PATCH /api/menu`
- **Imágenes:** grid con preview de las 22 imágenes → llama `POST /api/images/upload`

Se accede escribiendo `tudominio.com/panel` directo en el navegador. No hay link desde el sitio público. Protegido por contraseña vía cookie.

---

## Scripts agregados al final de cada página

- **Cache-busting:** `<script>` al final de cada HTML que hace `fetch('/api/version')` y appendea `?v=N` a todas las URLs de imágenes para invalidar cache.
- **Menú dinámico:** solo en `menu.html` — `fetch('/api/menu')` para cargar precios desde el JSON y actualizar los `.dish-price` en el DOM.

---

## URLs base configurable

Las URLs en los meta tags SEO usan `https://chiltepin.com` como base. Cambiar por el dominio real en producción.

---

## Próximos pasos para el backend

1. **Motor de templates:** Extraer header/footer/sidebar/modal a un layout base (EJS o Handlebars)
2. **Base de datos:** Migrar `data/menu.json` a PostgreSQL/SQLite/MongoDB — misma estructura
3. **Formularios reales:** Agregar endpoints POST para contacto, cotización, boletín, reservas
4. **Auth robusta:** Reemplazar cookie simple por JWT o sesiones con bcrypt
5. **Optimización de imágenes:** Agregar `sharp` para redimensionar/comprimir al subir
6. **CDN:** Servir imágenes desde S3/Cloudinary en vez del filesystem local
