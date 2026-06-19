# Chiltepin Seafood — Web App

Sitio web del restaurante **Chiltepin Seafood** (2 sucursales en Durango, México).  
Migrado exitosamente de Vanilla HTML mult-page a una **Single Page Application (SPA)** con React, manteniendo cero cambios visuales respecto al diseño original.

---

## Stack Tecnológico

### Frontend

| Capa | Tecnología |
|---|---|
| Framework | React 18+ |
| Bundler | Vite |
| Estilos | CSS Vanilla puro — variables, flexbox, grid, animaciones, media queries, sin frameworks |
| Enrutamiento | Nativo por estado (`currentPage` + `switch`) — sin react-router-dom |
| Estado | Hooks (`useState`, `useEffect`, `useRef`, `useCallback`) |
| Fuentes | Google Fonts — Anton (logo), Oswald (headings/nav), Lora (body) |
| SEO | Open Graph, Twitter Cards, meta tags por página |

### Backend (referencia)

| Capa | Tecnología |
|---|---|
| Entorno | Node.js ≥ 18 |
| Servidor | Express.js 4.x |
| Autenticación | Cookie simple con contraseña compartida (provisional) |
| Datos | JSON en filesystem (`data/menu.json`, `data/version.json`) |

---

## Arranque rápido

```bash
npm install
npm run dev
```

- Dev server: `http://localhost:5173`
- Build producción: `npm run build` → `dist/`

---

## Hitos Arquitectónicos y UX

### Refactorización y Componentización

- **Header/Footer compartidos** — eliminadas ~100 líneas de HTML duplicado en las 7 páginas originales.
- **MenuItem, MenuSection, NavArrow** — componentes reutilizables que eliminan cientos de líneas de JSX repetitivo.
- **Menu data-driven** — los platillos y bebidas se definen como arreglos de datos y se renderizan con `.map()`.

### Eliminación de manipulación directa del DOM

- **Custom Hooks**: `useIntersectionObserver` (scroll reveal), `usePreloadImages` (precarga de imágenes).
- **Estado React** reemplaza `document.getElementById`, `document.querySelectorAll`, `classList.toggle/add/remove`.
- **Modal y page-loaded** gestionados mediante estado (`useState`) en lugar de manipular clases en `<body>`.

### Menú móvil premium

- Overlay fullscreen con `backdrop-filter: blur(12px)` y fondo `rgba(12,12,12,0.95)`.
- Scroll lock nativo del navegador al abrir el menú.
- Acordeón con transiciones `max-height` para submenús y sub-submenús.
- Touch targets uniformes (`min-height: 52px`) siguiendo la Ley de Fitts.

### Carruseles de imágenes interactivos

- Carrusel hero, tarjetas de sucursales y galería de ubicaciones con **auto-play inteligente** (5000ms).
- El temporizador se reinicia al hacer clic manual (flechas, dots, cambio de sucursal).
- Prev/post mediante `setInterval` + `clearInterval` con dependencias en `useEffect`.
- Sin fugas de memoria: todos los efectos retornan `clearInterval`/`clearTimeout`.

---

## Estructura de archivos

```
Proyecto/
├── index.html                 ← Entry point Vite (solo <div id="root">)
├── vite.config.js             ← Configuración de Vite + React plugin
├── package.json
├── src/
│   ├── main.jsx               ← Monta React en #root
│   ├── App.jsx                ← Shell SPA: 7 rutas por estado, modal, page-loaded
│   ├── css/styles.css         ← CSS global (~1270 líneas, 3 @media max-width:1100px)
│   ├── components/
│   │   ├── Header.jsx         ← Navegación + dropdowns + hamburguesa
│   │   ├── Footer.jsx         ← Grid de footer + enlaces internos/externos
│   │   ├── NavArrow.jsx       ← Flecha de navegación entre páginas
│   │   ├── MenuItem.jsx       ← Item individual de menú (nombre, precio, desc)
│   │   ├── MenuSection.jsx    ← Sección de menú (id, título, grid de items)
│   │   └── ReservationSidebar.jsx  ← Sidebar de reservas (3 pasos)
│   ├── hooks/
│   │   ├── useIntersectionObserver.js  ← Scroll reveal con IntersectionObserver
│   │   └── usePreloadImages.js         ← Precarga de imágenes vía new Image()
│   └── pages/
│       ├── HomePage.jsx       ← Inicio: splash, carrusel hero, contadores, galería
│       ├── MenuPage.jsx       ← Menú: scroll spy, 9 secciones, precios dinámicos
│       ├── LocationPage.jsx   ← Horarios/Ubicación: selector sucursal, mapa
│       ├── AboutPage.jsx      ← Acerca de: historia, servicios, ingrediente estrella
│       ├── ContactPage.jsx    ← Contacto: formulario, info sucursales
│       ├── EventsPage.jsx     ← Eventos: tabs (privados/catering), formulario
│       └── NewsletterPage.jsx ← Boletín: formulario de suscripción
├── public/
│   └── img/                   ← Imágenes estáticas (~4.3 MB, rutas absolutas /img/...)
├── server.js                  ← Express temporal (referencia de API)
├── data/menu.json             ← Datos del menú (93 precios para migrar a BD)
├── data/version.json          ← Cache-busting (generado automático)
└── panel/index.html           ← Admin panel (autónomo, no integrado en SPA)
```

---

## API de Referencia

La API (`server.js`) define los endpoints que el backend definitivo debe implementar:

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `POST` | `/api/auth` | No | Recibe `{ password }`, devuelve `{ ok: true }` y setea cookie `auth` |
| `POST` | `/api/logout` | No | Borra la cookie de sesión |
| `GET` | `/api/menu` | No | Devuelve `data/menu.json` (consumido por MenuPage para precios dinámicos) |
| `PATCH` | `/api/menu` | Sí | Recibe `{ sections: [...], promos: [...] }`, actualiza solo precios |
| `GET` | `/api/images` | Sí | Devuelve array de imágenes en `img/` |
| `POST` | `/api/images/upload` | Sí | Multipart — sobreescribe archivo de imagen |
| `GET` | `/api/version` | No | Devuelve `{ version: N }` para cache-busting |

---

## Modelo de datos (`data/menu.json`)

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

93 precios en total (86 platillos + 7 promos). `price: null` = sin precio fijo.

---

## Próximos pasos para el Backend

1. **API REST Pura:** El backend debe actuar únicamente como proveedor de datos JSON (sin motores de templates — React ya renderiza).
2. **Base de Datos:** Migrar `data/menu.json` a PostgreSQL, MongoDB o SQLite para alimentar los componentes de React de forma dinámica.
3. **Endpoints de Formularios:** Crear endpoints POST reales para procesar solicitudes de Contacto, Eventos, Boletín y Reservaciones (actualmente simulados en el frontend).
4. **Autenticación:** Implementar JWT (JSON Web Tokens) para proteger el panel de administración, reemplazando las cookies simples.
5. **CDN:** Servir assets estáticos e imágenes subidas a través de S3 o Cloudinary.

---

## Notas técnicas

- **display: contents** en `#root` — evita que el wrapper de React altere la jerarquía visual del CSS original.
- **Precios dinámicos** — `MenuPage.jsx` hace `fetch('/api/menu')` y sobreescribe los precios hardcodeados con los de la API.
- **Cache-busting** — los componentes de React usan rutas absolutas `/img/...`; el servidor provee `GET /api/version` para forzar refresco de imágenes.
- **3 breakpoints responsive** — `@media (max-width: 1100px)` para móvil, manteniendo la estructura original intacta.

---

## Changelog

| Versión | Cambios |
|---|---|
| **v4.0** | Migración a React SPA (Vite + React 18). Componentización (Header, Footer, MenuItem, MenuSection, NavArrow). Custom Hooks (useIntersectionObserver, usePreloadImages). Menú móvil premium con backdrop-filter y scroll lock. Carruseles con auto-play inteligente. Eliminación completa de manipulación directa del DOM. |
| **v3.1** | Menú hamburguesa, responsive móvil (breakpoints 900px/480px), swipe táctil en carruseles, dropdowns touch, `prefers-reduced-motion` |
| **v3.0** | Panel admin oculto (`/panel`), API REST (Express), `data/menu.json` con 93 precios editables, SEO (Open Graph + Twitter Cards), optimización imágenes |
| **v2.0** | Sitio web completo — 7 páginas estáticas |
| **v1.0** | Commit inicial — Chiltepin Plaza Real |
