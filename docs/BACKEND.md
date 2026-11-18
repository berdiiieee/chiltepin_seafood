# Backend: lo que espera el sitio

Guía para quien mantiene el backend y el panel de administración (`https://backend-chiltepin.onrender.com`).
El sitio (React + Vite) ya está conectado a todos los endpoints de abajo. Este documento dice qué manda,
qué espera recibir y qué conviene revisar del lado del backend.

Las reglas de validación de cada formulario se comprobaron el 18 de noviembre de 2026 con envíos
inválidos a propósito, que el backend rechaza sin guardar nada.

---

## 1. Conexión

| Entorno | Cómo llega el sitio al backend |
|---|---|
| Desarrollo (`npm run dev`) | Vite reenvía `/api/*` al backend (proxy en `vite.config.js`), así que no hace falta CORS para `localhost`. |
| Producción (Vercel) | El navegador llama **directo** a `VITE_API_URL` (por defecto `https://backend-chiltepin.onrender.com`). |

**CORS:** en producción el backend debe permitir el dominio del sitio, incluidos los dominios de vista
previa de Vercel si se usan, con métodos `GET, POST` y la cabecera `Content-Type`.

**Arranque en frío (Render, plan gratis):** la primera petición puede tardar hasta ~50 s. El sitio lo maneja así:
- Al abrir cualquier página pide `GET /api/menu` en segundo plano para "despertar" al servidor.
- Cada petición espera hasta 60 s antes de darse por fallida.
- Si un envío tarda más de 5 s, el formulario muestra "Estamos despertando el servidor; puede tardar hasta un minuto".

## 2. Formato de respuestas

- **Éxito:** cualquier `2xx`. El sitio no lee el cuerpo de la respuesta de los formularios; puede ser lo que convenga.
- **Error:** JSON con `message` (texto o lista de textos), como responde hoy NestJS:
  ```json
  { "statusCode": 400, "error": "Validation Error", "message": ["El nombre es obligatorio", "..."] }
  ```
  El sitio decide qué mostrar según el código:

  | Código | Qué ve el visitante (en español) | En inglés |
  |---|---|---|
  | `400` con `message` | El texto del backend tal cual, seguido de "Intenta de nuevo…" | Mensaje genérico traducido |
  | `409` | El texto del backend tal cual (pensado para duplicados, p. ej. correo ya suscrito) | Mensaje genérico traducido |
  | `429` | "Hiciste varios intentos seguidos; espera un minuto." | Traducido |
  | `5xx`, HTML o sin respuesta | "El servidor no está disponible…" / "No pudimos conectar…" | Traducido |

  Los mensajes de error del backend deben estar **en español y dirigidos al visitante**, porque se muestran tal cual.
- **Campos desconocidos:** hoy el backend los rechaza (`property X should not exist`). Por eso el sitio no manda
  nada fuera de lo listado aquí.

## 3. Formularios

Todos se envían con `POST`, `Content-Type: application/json`. Los textos van sin espacios al inicio ni al final.
Los campos opcionales vacíos **no se envían**: no llegan como `""`.

### 3.1 Reservaciones: `POST /api/reservas`
Panel lateral "Reservar mesa", que se abre desde el sitio y desde cada sucursal.

```json
{
  "nombre": "María D'Angelo",
  "telefono": "6181234567",
  "email": "maria@correo.com",
  "fecha": "2026-12-01",
  "hora": "14:30",
  "personas": 4,
  "sucursal": "Chiltepin Plaza Real"
}
```

| Campo | Lo que valida el sitio | Lo que valida el backend (comprobado) |
|---|---|---|
| `nombre` | 3–100 caracteres; solo letras (con acentos), espacios y `. ' -`. El apóstrofo tipográfico `’` del iPhone se cambia por `'` antes de enviar. | 3–100, "solo letras y espacios" (acepta acentos y `. ' -`; rechaza `’`, números y símbolos) |
| `telefono` | Exactamente 10 dígitos; se envían **solo los dígitos** | ≤ 20, números/espacios/`+ - ( )`, obligatorio |
| `email` | Opcional, formato válido, ≤ 255 | (opcional) |
| `fecha` | `YYYY-MM-DD`, de hoy en adelante, **solo lunes a viernes** | Formato `YYYY-MM-DD` |
| `hora` | `HH:MM` de 11:30 a 18:30 cada 30 min (hasta una hora antes de cerrar); si es hoy, solo horas futuras | Formato `HH:MM` |
| `personas` | 1–6. Para 7 o más, el sitio no envía nada y muestra los teléfonos | 1–6 |
| `sucursal` | `"Chiltepin Plaza Real"` o `"Chiltepin Plaza 450"` | Solo esos dos valores |

**Recomendado en el backend:** validar también lo que hoy solo valida el sitio (lunes a viernes, horario, que la
fecha y hora no hayan pasado). Así nadie puede saltárselo mandando la petición a mano.

### 3.2 Contacto: `POST /api/contacto`
```json
{ "nombre": "Ana López", "telefono": "618 123 4567", "email": "ana@correo.com", "tipoMensaje": "Pregunta", "mensaje": "¿Tienen estacionamiento?" }
```
| Campo | Sitio | Backend |
|---|---|---|
| `nombre` | 3–100 | 2–100, obligatorio |
| `telefono` | Opcional, 7–20 de `0-9 espacio + - ( )` | (opcional) |
| `email` | Obligatorio, válido, ≤ 255 | Obligatorio, válido, ≤ 255 |
| `tipoMensaje` | Siempre uno de: `Comentario`, `Pregunta`, `Sugerencia`, `Queja`, `Otro`. Se envía en español aunque el visitante use el sitio en inglés | ≤ 50. **Hoy acepta cualquier texto**; conviene limitarlo a esos 5 valores |
| `mensaje` | 10–1000 | 10–1000 |

### 3.3 Eventos y catering: `POST /api/catering`
Página `/eventos`, con dos tipos: eventos privados y catering.
```json
{ "nombre": "Ana López", "telefono": "6181234567", "email": "ana@correo.com", "fechaEvento": "2026-12-20", "personas": 40, "tipoEvento": "Evento Privado", "detalles": "Cumpleaños, sin mariscos crudos para 3 personas" }
```
| Campo | Sitio | Backend |
|---|---|---|
| `nombre` | 3–100 | 3–100 |
| `telefono` | Obligatorio, 7–20 de `0-9 espacio + - ( )` | Obligatorio, ≤ 20, mismo patrón |
| `email` | Obligatorio, válido, ≤ 255 | Obligatorio, válido |
| `fechaEvento` | `YYYY-MM-DD`, de hoy en adelante | Formato `YYYY-MM-DD` |
| `personas` | **10–100**. Para más de 100 se pide llamar; el dueño no quiere mostrar el tope | 10–500 |
| `tipoEvento` | `"Evento Privado"` o `"Catering y Banquetes"` (en español siempre) | 3–50 |
| `detalles` | Opcional, ≤ 1000 | ≤ 1000 |

### 3.4 Boletín: `POST /api/boletin`
```json
{ "email": "ana@correo.com", "nombre": "Ana", "telefono": "6181234567" }
```
| Campo | Sitio | Backend |
|---|---|---|
| `email` | Obligatorio, válido, ≤ 255 | Obligatorio, válido, ≤ 255 |
| `nombre` | Opcional, ≤ 100 | ≤ 100 |
| `telefono` | Opcional, 7–20 de `0-9 espacio + - ( )` | (hoy acepta cualquier texto) |

**Correo ya suscrito:** se recomienda responder `409` con un mensaje amable ("Este correo ya está suscrito") o `200`
sin duplicar. Las dos opciones se ven bien en el sitio.

### 3.5 Idioma del visitante (preparado, apagado)
El sitio está en español e inglés. Para saber en qué idioma contestarle a cada persona, el sitio puede mandar
`"idioma": "es" | "en"` en los cuatro formularios. Está **apagado** porque hoy el backend rechaza campos
desconocidos. Para activarlo:
1. En el backend, aceptar `idioma` opcional (`'es' | 'en'`) en los cuatro DTO y guardarlo.
2. En el sitio, cambiar `ENVIAR_IDIOMA` a `true` en `src/config/api.js`.

## 4. Menú: `GET /api/menu`

El sitio arma **todo** el menú con esta respuesta: secciones, platillos, precios y promociones. Si se agrega,
quita o cambia algo en el panel, se ve en el sitio sin tocar el código. Las promociones también se muestran
en la página de cada sucursal.

```json
{
  "sections": [
    { "id": 1, "name": "Entradas", "items": [
      { "id": 1, "name": "Callo de hacha", "price": 145, "descripcion": "Laminado bañado de nuestra salsa." }
    ]}
  ],
  "promos": [
    { "id": 1, "location": "Plaza Real", "day": "Lun", "desc": "Tostada de ceviche + agua", "price": 65 }
  ]
}
```

- **Orden:** las secciones se muestran en el orden en que llegan. Bebidas y Promociones van al final.
- **Secciones con icono propio:** Entradas, Aguachile, Cóctel, Kids, Tostadas, Lo Nuevo, "Tacos, Burros y Más" y
  Bebidas. Una sección nueva aparece sola, con su nombre y un icono genérico.
- **`price`:** número. Con `0` no se muestra precio (para promos tipo "3x2").
- **`location`** de las promos: exactamente `Plaza Real` o `Plaza 450`.
- **`day`** de las promos: `Lun`, `Mar`, `Mié`, `Jue`, `Vie`, `Sáb` o `Dom`. Con eso se marca el día de "Hoy".

**Aviso de precios en la página del menú:**

| Situación | Lo que ve el visitante |
|---|---|
| Mientras responde el backend | Se muestra la copia guardada con "Consultando los precios del día…" |
| El backend respondió | "Precios actualizados al 18 de noviembre de 2026." (fecha de `actualizado`, si viene; si no, la de la consulta) |
| El backend no respondió | Se queda la copia guardada (`src/data/menuRespaldo.js`) con "Precios y platillos sujetos a cambios; confírmalos en tu sucursal." |

### Campos opcionales que el sitio ya sabe leer
Ninguno es obligatorio; si no vienen, el sitio usa su respaldo.

| Dónde | Campo | Para qué |
|---|---|---|
| raíz | `actualizado` (o `updatedAt`), fecha ISO | Fecha que se muestra en "Precios actualizados al…" |
| platillo / sección / promo | `disponible: false` (o `activo: false`) | Ocultarlo sin borrarlo |
| sección | `name_en` | Título de la sección en inglés |
| platillo | `descripcion_en` | Descripción en inglés. **El nombre del platillo no se traduce** (es la identidad de la casa) |
| promo | `desc_en` | Texto de la promo en inglés |
| bebida | `subcategoria` | Subgrupo dentro de Bebidas ("Cervezas", "Coctelería", "Licores - Tequila"…) |
| bebida | `subcategoria_en` | Nombre del subgrupo en inglés |

- **Subgrupos de bebidas:** hoy Bebidas llega como lista plana y el sitio la ordena con un mapa propio
  (`src/data/bebidasSubgrupos.js`). Si una bebida trae `subcategoria`, esa manda; si no la trae y no está en el
  mapa, cae en "Otras".
- **Inglés:** mientras no existan los campos `_en`, el sitio usa sus traducciones de los platillos actuales
  (`src/i18n/menu-en.js`). Un platillo nuevo sin `descripcion_en` se muestra en inglés con su descripción en español.

## 5. Imágenes: `GET /api/imagenes?seccion=…`

Respuesta: `[{ "id": 1, "seccion": "sucursal-plaza-real", "orden": 1, "url": "https://…" }]`.
La imagen con `orden` N reemplaza a la foto N del sitio; las que falten se quedan con la foto original.

| `seccion` | Dónde se usa |
|---|---|
| `sucursal-plaza-real` | Fotos de Plaza Real (Inicio, Sucursales, detalle) |
| `sucursal-plaza-450` | Fotos de Plaza 450 |
| `carrusel` | Hero del Inicio, **solo** si el sitio se compila con `VITE_HERO_DESDE_PANEL=true` (por defecto usa sus fotos locales) |

## 6. Ideas para el panel

- **Reservaciones:** vista por día y sucursal, con estado (pendiente / confirmada / cancelada) y teléfono a un clic.
- **Contacto:** filtro por `tipoMensaje` (las quejas primero).
- **Eventos:** separar `Evento Privado` y `Catering y Banquetes`; ordenar por `fechaEvento`.
- **Boletín:** exportar a CSV y permitir dar de baja.
- Avisar por correo o WhatsApp a la sucursal cuando entra una reservación o una solicitud de evento.
