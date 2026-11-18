# Chiltepin Seafood: sitio web

Sitio del restaurante **Chiltepin Seafood**, mariscos del Pacífico en Durango, con dos sucursales: Plaza Real y Plaza 450.
Es una SPA en React. El menú, las imágenes administrables y todos los formularios están conectados al backend del
proyecto (`https://backend-chiltepin.onrender.com`).

- **Idiomas:** español (predeterminado) e inglés.
- **Temas:** oscuro (predeterminado) y claro "crema".
- **Versión:** escritorio terminada. La versión móvil funciona, pero su diseño fino es la siguiente fase.

---

## Stack

| Capa | Tecnología |
|---|---|
| Framework | React 19, JavaScript (sin TypeScript) |
| Bundler | Vite |
| Rutas | `react-router-dom` v6 (`BrowserRouter`) |
| Estilos | CSS plano con variables (`src/css/styles.css` + `src/css/components.css`) |
| Tipografías | Google Fonts: Anton (títulos), Oswald (navegación), Lora (texto) |
| Animaciones | CSS + View Transitions API (cambio de página, tema e idioma) |
| Backend | API externa en Render (ver [`docs/BACKEND.md`](docs/BACKEND.md)) |
| Hosting | Vercel (`vercel.json`) |

## Arranque rápido

```bash
npm install
npm run dev        # http://localhost:5173 (en desarrollo /api se reenvía al backend, sin CORS)
npm run build      # compila a dist/
npm run preview    # sirve dist/ para probar la versión de producción
```

**Variables de entorno** (copiar `.env.example` a `.env`):

| Variable | Para qué |
|---|---|
| `VITE_API_URL` | URL del backend, sin `/` al final. Por defecto `https://backend-chiltepin.onrender.com` |
| `VITE_HERO_DESDE_PANEL` | `true` para que el carrusel del Inicio use las fotos del panel (sección `carrusel`). Por defecto usa las fotos locales |

`npm start` levanta `server.js`, la API Express antigua de referencia. El sitio actual no la usa.

## Despliegue (Vercel)

- **Build:** `npm run build`. **Salida:** `dist/`.
- `vercel.json` manda todas las rutas a `index.html` (SPA) y define caché larga para `/assets` e imágenes.
- **Variable en Vercel:** `VITE_API_URL`.
- **CORS:** el backend debe permitir el dominio del sitio, porque en producción el navegador lo llama directo.

---

## Páginas

| Ruta | Página |
|---|---|
| `/` | Inicio: hero con carrusel, sucursales, banda de foto, "Del mar a tu mesa", Instagram |
| `/menu` | Carta completa (viene del panel) con categorías fijas y promociones de la semana |
| `/horarios` | Sucursales (resumen) |
| `/horarios/plaza-real`, `/horarios/plaza-450` | Detalle: datos, fotos, mapa y promociones de la sucursal |
| `/delivery` | A domicilio (Rappi / DiDi Food por sucursal) |
| `/eventos?tipo=privados` · `/eventos?tipo=catering` | Eventos privados y catering, con formulario de cotización |
| `/acerca` | Nuestra historia |
| `/contacto` | Contacto, con formulario |
| `/boletin` | Suscripción al boletín |
| `/aviso-de-privacidad` | Aviso de privacidad (LFPDPPP) |
| `*` | 404 |

La reservación de mesa es un panel lateral que se abre desde cualquier página.

## Estructura

```
├── index.html               Punto de entrada (aplica el tema guardado antes de pintar)
├── vercel.json · vite.config.js · .env.example
├── docs/BACKEND.md          Contrato con el backend: endpoints, validaciones, campos opcionales
├── public/img/              Fotos (rutas absolutas /img/...)
├── src/
│   ├── main.jsx · App.jsx   Montaje, rutas, transición entre páginas, panel de reservas
│   ├── routes.js            Claves antiguas de página → URLs reales
│   ├── api/                 client.js (get/post, 60 s, errores tipados) · errores.js (mensajes)
│   ├── config/              negocio.js (datos del negocio) · api.js (qué se manda al backend)
│   ├── context/             Preferencias.jsx (tema e idioma + traducción t())
│   ├── i18n/                es.js · en.js (textos del sitio) · menu-en.js · menu.js (contenido del panel en inglés)
│   ├── data/                menuRespaldo.js · menuNormalizar.js · bebidasSubgrupos.js · promos.js · instagram.js
│   ├── hooks/               useMenu · useImagenes · useIntersectionObserver · usePreloadImages
│   ├── utils/               horario.js (abierto/cerrado, horas) · transicion.js (View Transitions)
│   ├── components/          Header, Footer, ReservationSidebar, Carousel, Galeria, CabeceraPagina, Campo, …
│   ├── pages/               Una por ruta
│   └── css/                 styles.css (base) · components.css (todo lo nuevo, al final)
├── legacy/                  Sitio HTML anterior (solo referencia; no se edita)
└── server.js · panel/ · data/   API Express y panel antiguos (solo referencia)
```

---

## Cómo funciona

### Datos del negocio
Todo lo que se repite en varias páginas vive en **`src/config/negocio.js`**: horario, sucursales (dirección,
teléfono, mapa, apps de delivery, fotos), reglas de reservación, correo, redes y datos del aviso de privacidad.
`WHATSAPP` está vacío: el botón de WhatsApp aparece solo cuando tiene un número.

### Menú (desde el panel)
`src/hooks/useMenu.js` pide `GET /api/menu` una vez por visita. La primera vez se pide al abrir el sitio, lo que
además "despierta" al backend de Render. Con esa respuesta se pintan secciones, platillos, precios y
promociones; no hay platillos fijos en la página.

- Si el backend no responde, se muestra la copia guardada (`src/data/menuRespaldo.js`) con el aviso
  *"Precios y platillos sujetos a cambios; confírmalos en tu sucursal."*
- Si responde, el aviso dice *"Precios actualizados al …"*.
- Las secciones nuevas del panel aparecen solas, con un icono genérico.
- Los subgrupos de Bebidas salen de `src/data/bebidasSubgrupos.js` o del campo `subcategoria`, si el panel lo manda.

### Formularios
Reservaciones, contacto, eventos/catering y boletín envían a `POST /api/reservas | contacto | catering | boletin`.

- Cada campo tiene los mismos límites que el backend.
- Los errores se muestran según su tipo: datos, duplicado, límite de intentos, servidor o red.
- Si un envío tarda más de 5 s, aparece un aviso de que el servidor está despertando.
- Formatos exactos y reglas: [`docs/BACKEND.md`](docs/BACKEND.md).

### Idioma y tema
Los controles están en la línea legal del pie: **ES · EN** y el sol/luna. Se guardan en el navegador
(`localStorage`).

- **Textos:** todo el texto visible sale de `src/i18n/es.js` y `src/i18n/en.js`, con las mismas claves.
  En los componentes se usan con `const { t } = useT(); t('menu.titulo')`.
  **Para agregar o cambiar un texto, edítalo en los dos archivos.** Las partes entre `**` salen en negritas.
- **Contenido del panel en inglés:** se toma el campo `*_en` del panel si existe; si no, `src/i18n/menu-en.js`; si no, se queda en español.
  Los nombres de los platillos no se traducen.
- **Valores fijos en español:** los que valida el backend se envían siempre en español
  (`tipoMensaje`, `tipoEvento`, nombre de la sucursal).
- **Aviso de privacidad:** el texto legal se queda en español. En inglés solo se muestra una nota.
- **Modo claro:** los grises son variables con nombre de su valor oscuro (`--g-333`, `--g-cfcfcf`…), definidas en
  `styles.css` y redefinidas en `:root[data-tema="claro"]` al final de `components.css`. En estilos nuevos usa esas
  variables en lugar de colores fijos. El blanco fijo (`#fff`) solo va sobre rojo o sobre fotos.

### Imágenes administrables
`useImagenes(seccion, respaldo)` combina las fotos subidas al panel (`GET /api/imagenes?seccion=`) con las fotos
locales. Lo usan las fotos de cada sucursal.

### Movimiento
Hay una sola curva de animación para todo el sitio (`--curva`). Animaciones que existen hoy:

- **Cambio de página:** View Transition, en `App.jsx#irA`.
- **Cambio de tema:** un círculo que crece desde el botón del pie.
- **Cambio de idioma:** fundido cruzado.
- **Barra de arriba:** se esconde al bajar y vuelve al subir.
- **Menú:** la línea de las categorías se desliza de una a otra.
- **Carruseles:** responden a teclado, swipe, trackpad horizontal y arrastre con mouse.

Todo respeta *"reducir movimiento"* del sistema.

---

## Pendientes conocidos

- **Datos del dueño:** número de WhatsApp, responsable legal y fecha final del aviso de privacidad, logos de
  Rappi/DiDi, fotos en alta resolución (las actuales son de baja resolución) y confirmar cifras ("200+ clientes por día").
- **Versión móvil:** diseño fino (fase aparte).
- **Backend:** CORS para el dominio final, validar en el servidor las reglas de reservación (lunes a viernes,
  horario) y aceptar `idioma` en los formularios (ver `docs/BACKEND.md`).

## Historial

| Versión | Cambios |
|---|---|
| **v5.0** | Rediseño completo de escritorio. Rutas reales (`react-router-dom`). Menú 100 % desde el panel, con respaldo y aviso de precios. Formularios conectados al backend con validaciones iguales a las del servidor. Inglés y modo claro. Transiciones entre páginas, tema e idioma. Barra que se esconde al bajar. Carruseles con trackpad y arrastre. |
| **v4.0** | Migración a React SPA (Vite). Componentes y hooks; sin manipulación directa del DOM. |
| **v3.1** | Menú hamburguesa, responsive móvil, swipe en carruseles, `prefers-reduced-motion`. |
| **v3.0** | Panel admin (`/panel`), API REST Express, `data/menu.json` editable, SEO. |
| **v2.0** | Sitio completo: 7 páginas estáticas. |
| **v1.0** | Commit inicial: Chiltepin Plaza Real. |
