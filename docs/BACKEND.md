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

---

## 7. Pedidos a domicilio y para recoger

El sitio ya tiene todo el flujo hecho: el cliente elige **a domicilio** (dirección + pin en el mapa) o **paso a
recoger**, arma su pedido en el Menú (con un + junto a cada precio), confirma en `/delivery/pedido` y sigue su
pedido en `/delivery/seguimiento/:token`. Falta el backend que se describe aquí.

**Interruptor del sitio:** `VITE_PEDIDOS` en `.env` (ver `.env.example`).
- `off` (por defecto): A domicilio se ve como siempre, con Rappi y DiDi. El sitio no llama a nada de esta sección.
- `demo`: el flujo completo con un backend simulado en el navegador (`src/api/pedidosDemo.js`). **Ese archivo es
  la referencia ejecutable de este contrato:** valida y calcula como debe hacerlo el backend real.
- `on`: usa los endpoints de abajo.

### 7.1 Reglas de seguridad (no negociables)

1. **El backend es la única fuente de verdad.** El sitio solo manda `id` + `cantidad` + `nota`. Precios, nombres,
   disponibilidad, alcohol, zona, costo de envío, horario, propina, topes y total se **recalculan** en el servidor
   con los datos del panel. Si alguien cambia la petición a mano, no debe poder cambiar ningún precio.
2. **Dinero en centavos enteros** en la base de datos y en los cálculos (en la API puede ir en pesos).
3. **El token de seguimiento** es aleatorio, de al menos 128 bits (p. ej. 32 caracteres hex de `crypto.randomBytes(16)`),
   y **nunca** es el id ni el folio. Quien tiene el enlace ve el pedido: muestra solo lo mínimo (nombre de pila,
   calle y colonia, nada de teléfono).
4. **Idempotencia:** `POST /api/pedidos` trae la cabecera `Idempotency-Key` (un UUID por intento). Si llega otra vez la
   misma llave, responde **el mismo pedido** sin crear otro (doble clic, red lenta, reintentos).
5. **Antibots:** si el sitio tiene `VITE_TURNSTILE_SITE_KEY`, manda la cabecera `CF-Turnstile-Token`. Valídala con la
   llave secreta en `https://challenges.cloudflare.com/turnstile/v0/siteverify` antes de crear el pedido.
6. **Límites:** por IP y por teléfono (p. ej. 5 pedidos por hora por teléfono). Responde `429` al pasarse.
7. **Tope de primeros pedidos:** con pago al recibir (efectivo o terminal), en los primeros `topeNuevos.pedidos`
   pedidos entregados de un teléfono, el total no puede pasar de `topeNuevos.monto`. Lista de teléfonos bloqueados
   en el panel (no recibieron, pedidos falsos).
8. **CORS** solo para el dominio del sitio. **Logs sin datos personales.** Respaldos de la base de datos.
9. **Render de pago** antes de lanzar: con el plan gratis, el servidor tarda ~50 s en despertar y el cliente piensa
   que no funcionó (y lo manda dos veces) o se va.

### 7.2 `GET /api/domicilio/config`

Reglas del servicio. El sitio la pide una vez por visita.

```json
{
  "activo": true,
  "metodos": ["efectivo", "terminal"],
  "propinas": [0, 10, 15],
  "topeNuevos": { "pedidos": 2, "monto": 800 },
  "ultimoAntesDeCerrarMin": 30,
  "sucursales": [
    {
      "id": "plaza-real",
      "ubicacion": { "lat": 24.00465, "lng": -104.65695 },
      "radioKm": 6,
      "tarifas": [{ "hastaKm": 3, "costo": 30 }, { "hastaKm": 6, "costo": 45 }],
      "tiempoEstimadoMin": 45,
      "pausada": false,
      "recoger": true
    }
  ]
}
```

| Campo | Para qué |
|---|---|
| `activo` | `false` = el sitio dice "por ahora no podemos tomar pedidos" y muestra los teléfonos |
| `metodos` | Formas de pago que se ofrecen. Al lanzar: `["efectivo", "terminal"]`. Con `"tarjeta"` aparece el pago en línea (7.6) |
| `propinas` | Porcentajes que se ofrecen (además de "Otra" con monto libre) |
| `topeNuevos` | Ver 7.1, punto 7 |
| `ultimoAntesDeCerrarMin` | Último pedido X minutos antes de cerrar (el horario está en el sitio: 11:30 a 19:30) |
| `sucursales[].id` | `plaza-real` o `plaza-450` |
| `ubicacion`, `radioKm`, `tarifas` | Zona de entrega y costo por distancia. **Valores de ejemplo: el negocio aún no los define** |
| `tiempoEstimadoMin` | Tiempo estimado de entrega; lo más pronto que se puede programar es ahora + este tiempo |
| `pausada` | Interruptor del panel "pausar pedidos" (sucursal saturada). Si todas están en pausa, no se puede pedir |
| `recoger` | Si acepta pedidos para recoger |

### 7.3 `POST /api/domicilio/cotizar`

El total oficial que el cliente ve antes de confirmar. Se pide cada vez que cambia algo.

```json
{
  "tipo": "domicilio",
  "sucursal": "plaza-real",
  "ubicacion": { "lat": 24.02, "lng": -104.66 },
  "items": [{ "id": 2, "cantidad": 2, "nota": "Sin cebolla" }, { "promoId": 1, "cantidad": 1 }],
  "propina": { "tipo": "porcentaje", "valor": 10 }
}
```
Respuesta:
```json
{
  "disponible": true,
  "sucursal": "plaza-real",
  "distanciaKm": 2.4,
  "lineas": [{ "nombre": "Guacamole", "cantidad": 2, "precio": 65, "importe": 130 }],
  "subtotal": 195, "envio": 30, "propina": 20, "total": 245,
  "motivos": []
}
```
- Con `tipo: "domicilio"`, la **sucursal la asigna el backend**: la más cercana que cubre la ubicación y no está en
  pausa (la que manda el sitio es solo una sugerencia).
- Con `tipo: "recoger"`, `sucursal` es obligatoria y no hay envío ni propina.
- `motivos`: textos en español para el cliente cuando `disponible` es `false` (fuera de zona, platillo agotado…).
- La propina con `"tipo": "porcentaje"` solo acepta los valores de `propinas`. Con `"tipo": "monto"` va en pesos y
  no puede pasar del subtotal.

### 7.4 `POST /api/pedidos`

Cabeceras: `Idempotency-Key` (siempre) y `CF-Turnstile-Token` (si hay Turnstile).

```json
{
  "tipo": "domicilio",
  "sucursal": "plaza-real",
  "cuando": { "tipo": "programado", "hora": "15:30" },
  "cliente": { "nombre": "Ana López", "telefono": "6181234567", "email": "ana@correo.com" },
  "direccion": {
    "calle": "Negrete 100", "interior": "B", "colonia": "Centro", "referencias": "Portón negro",
    "ubicacion": { "lat": 24.02, "lng": -104.66 }
  },
  "items": [{ "id": 2, "cantidad": 2, "nota": "Sin cebolla" }, { "promoId": 1, "cantidad": 1 }],
  "propina": { "tipo": "porcentaje", "valor": 10 },
  "metodoPago": "efectivo",
  "pagaCon": 500,
  "factura": false,
  "aceptaTerminos": true
}
```
Respuesta (`201`): `{ "token": "…", "folio": "1042", "estado": "recibido", "total": 245 }`. Con tarjeta, además
`"pagoUrl"` (7.6).

| Campo | Reglas (validar en el backend) |
|---|---|
| `tipo` | `domicilio` o `recoger` |
| `cuando` | `{ "tipo": "asap" }` o `{ "tipo": "programado", "hora": "HH:MM" }`. **Solo para hoy**, en hora de Durango (`America/Monterrey`), entre ahora + `tiempoEstimadoMin` y la hora de cierre. Fuera de horario no se aceptan pedidos (ni para mañana) |
| `cliente.nombre` | 3–100, letras, espacios y `. ' -` (igual que reservas) |
| `cliente.telefono` | Exactamente 10 dígitos |
| `cliente.email` | Opcional, válido, ≤ 255 |
| `direccion` | Solo con `domicilio`. `calle` 3–120, `colonia` 2–80, `interior` ≤ 30, `referencias` ≤ 160, `ubicacion` obligatoria y dentro de la zona |
| `items` | 1–30 líneas, `cantidad` 1–20, `nota` ≤ 120. `id` = platillo del menú; `promoId` = promo de **hoy** de **esa sucursal**. Rechazar alcohol y lo que tenga `domicilio: false` |
| `propina` | Ver 7.3. Solo en `domicilio` |
| `metodoPago` | Uno de `config.metodos`: `efectivo`, `terminal` o `tarjeta` |
| `pagaCon` | Opcional, solo con `efectivo`, ≥ total |
| `factura` | Si es `true`, el panel lo marca para pedir los datos fiscales después |
| `aceptaTerminos` | Debe ser `true` |

Errores: como los demás formularios (sección 2). `400` con `message` en español para el cliente, `429` por límites.

### 7.5 Seguimiento

- `GET /api/pedidos/:token` →
  ```json
  {
    "token": "…", "folio": "1042", "estado": "en_cocina", "tipo": "domicilio", "sucursal": "plaza-real",
    "cuando": { "tipo": "asap" }, "metodoPago": "efectivo", "cliente": { "nombre": "Ana" },
    "direccion": { "calle": "Negrete 100", "colonia": "Centro" },
    "lineas": [{ "nombre": "Guacamole", "cantidad": 2, "importe": 130 }],
    "subtotal": 195, "envio": 30, "propina": 20, "total": 245,
    "puedeCancelar": false, "etaMin": 30
  }
  ```
  `404` si no existe. El sitio lo consulta cada 15 s hasta un estado final.
- `POST /api/pedidos/:token/cancelar` → el pedido actualizado. Solo si `puedeCancelar` (estado `recibido` o
  `pendiente_pago`); si no, `409` con mensaje. Si estaba pagado en línea, reembolso automático (7.6).

**Estados:** `pendiente_pago` → `recibido` → `en_cocina` → `en_camino` (domicilio) o `listo_recoger` (recoger) →
`entregado`. Finales: `entregado`, `cancelado`, `rechazado` (la sucursal no pudo tomarlo), `pago_fallido`, `reembolsado`.

### 7.6 Pago en línea con Mercado Pago (fase 2, apagado al lanzar)

El sitio ya lo tiene listo; se enciende agregando `"tarjeta"` a `config.metodos`.
- Usar **Checkout Pro**: al crear un pedido con `metodoPago: "tarjeta"`, el backend crea una *preferencia* con los
  importes **calculados por el backend**, `external_reference` = id interno del pedido y `back_urls` a
  `https://<dominio>/delivery/seguimiento/<token>`. Devuelve su `init_point` como `pagoUrl`. El pedido queda en
  `pendiente_pago` y **no** se manda a cocina.
- El sitio solo redirige a `pagoUrl` si es `https://…mercadopago.com(.mx)`.
- **El pago se confirma solo por webhook** (`POST /api/pagos/webhook`): verificar la firma `x-signature` con la llave
  secreta del webhook, consultar el pago por su id en la API de Mercado Pago y comparar monto y `external_reference`.
  Aprobado → `recibido` (entra a cocina). Rechazado → `pago_fallido`. **Nunca** confiar en el `?status=approved` de
  la URL de regreso.
- Webhook idempotente (Mercado Pago lo reintenta). Reembolsos con la API de reembolsos al cancelar.
- La llave secreta (access token) vive solo en el backend. Al sitio no le hace falta ninguna llave de Mercado Pago.

### 7.7 Campos nuevos en `GET /api/menu`

| Dónde | Campo | Para qué |
|---|---|---|
| platillo y bebida | `domicilio` (bool, por defecto `true`) | `false` = no sale a domicilio (casilla del panel) |
| bebida | `alcohol` (bool) | Las que tienen alcohol no se venden a domicilio. Si no viene, el sitio usa los subgrupos de bebidas y trata como alcohol todo lo que no esté en "Bebidas sin Alcohol" |
| promo | `id` (ya viene) y `domicilio` (bool) | Las promos con `price: 0` (p. ej. "3x2") no se pueden pedir en línea hasta definir cómo se cobran |

### 7.8 Panel (lo que necesita la operación)

- **Pedidos nuevos con alerta sonora** por sucursal, botones *Aceptar* / *Rechazar* y marca **"Cliente nuevo"** (la
  sucursal puede llamar para confirmar antes de cocinar).
- Cambiar estado: en cocina → en camino / listo para recoger → entregado.
- **Vista de repartidor en celular:** sus pedidos, dirección con enlace a Google Maps, teléfono, cuánto cobrar y con
  cuánto paga el cliente; marca *En camino* y *Entregado* (con foto o confirmación de entrega, sirve ante contracargos).
- **Corte de caja** por repartidor: efectivo y terminal.
- **Interruptor "pausar pedidos"** por sucursal, tope de primeros pedidos y lista de teléfonos bloqueados.
- Casilla "disponible a domicilio" por platillo y "alcohol" por bebida.
- Roles por sucursal, contraseñas fuertes con 2FA y bitácora de cambios.

### 7.9 Fase 3 (en pausa): WhatsApp

Verificación del teléfono con código y avisos de estado por WhatsApp (API oficial de Meta). Está pendiente de
decidir; el sitio funciona sin esto.

### 7.10 Cabeceras de seguridad del sitio

`vercel.json` ya manda `nosniff`, `Referrer-Policy`, `Permissions-Policy`, HSTS y `X-Frame-Options`. La
**Content-Security-Policy** está en modo *Report-Only*: revisar la consola en una vista previa de Vercel y, si no
hay avisos, cambiar la clave a `Content-Security-Policy`. Si se cambia el script en línea de `index.html`, hay que
actualizar su hash `sha256-…` en la política.
