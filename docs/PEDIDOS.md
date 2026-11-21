# Pedidos a domicilio propios (en desarrollo)

Chiltepin va a tener **su propio servicio de reparto** para depender menos de Rappi y DiDi (que cobran comisión).
Este documento es para quien continúe el trabajo: qué hay hecho, cómo verlo, cómo está armado y qué falta.

> **Estado (20 nov 2026):** el flujo completo del sitio funciona **en modo demo** (backend simulado en el
> navegador). **No es parte de la página pública** hasta que el backend y el diseño estén listos.
> El contrato con el backend está en [`BACKEND.md`](BACKEND.md), sección 7.

---

## 1. Cómo verlo

```bash
npm install
npm run dev:pedidos     # = vite --mode pedidos (carga .env.pedidos -> VITE_PEDIDOS=demo)
```
Abre `http://localhost:5173/delivery`.

- En la demo **cualquier dirección cae dentro de la zona**; si el texto incluye "lejos", queda fuera (para probar ese caso).
- Para probar el pago con tarjeta (apagado al lanzar), en la consola del navegador:
  `localStorage.setItem('chiltepin-demo-tarjeta', '1')` y recarga.
- Los pedidos de prueba se guardan solo en tu navegador. Su estado avanza solo con el tiempo
  (Recibido → En cocina a 1 min → En camino a 3 min → Entregado a 5 min).
- Con `npm run dev` / `npm run build` normales, el sitio se ve **exactamente como antes** (solo Rappi/DiDi).

### El interruptor `VITE_PEDIDOS`

| Valor | Qué pasa |
|---|---|
| `off` (por defecto, producción) | A domicilio muestra solo las apps. Las rutas nuevas no existen (404) y el Menú no cambia |
| `demo` | Todo el flujo con `src/api/pedidosDemo.js`. No llama a ningún endpoint de pedidos |
| `on` | Usa el backend real (`BACKEND.md` §7) |

`npm run build` usa el modo `production` y **no lee** `.env.pedidos`. Para encender los pedidos en producción, se
pone `VITE_PEDIDOS=on` en las variables de Vercel **solo cuando** esté completa la lista de la sección 6.
Para que el dueño revise sin publicar, se puede usar una vista previa de Vercel (Preview) con `VITE_PEDIDOS=demo`.

---

## 2. Decisiones del negocio (20 nov 2026)

- **Pago al lanzar: solo al recibir** (efectivo o terminal). El pago en línea con **Mercado Pago (Checkout Pro)** ya
  está construido pero apagado: se enciende cuando el backend manda `"tarjeta"` en `config.metodos`.
- **Un solo menú:** se pide desde la carta de siempre en "modo pedido" (un + junto al precio). Sin fotos por ahora.
- Primero se elige **a domicilio** (dirección + pin en Google Maps; radio por sucursal con tarifa por distancia) o
  **paso a recoger**. La sucursal que atiende se asigna por cercanía.
- **Solo para hoy:** lo antes posible o a una hora de hoy. Fuera de horario no se pide (ni para mañana).
- Mismos precios de la carta + envío. Sin pedido mínimo. **Sin alcohol.** Casilla "disponible a domicilio" por platillo.
- Promos del día: solo las de hoy de la sucursal que atiende.
- Propina, notas por platillo y "Necesito factura" (los datos fiscales se piden después, fuera del sitio).
- Cancelación desde el enlace solo mientras el pedido está "Recibido".
- Seguimiento con enlace privado. Tope de monto en los primeros pedidos con pago al recibir; bloqueo de teléfonos.
- Rappi y DiDi siguen como **segunda opción discreta**.
- **En pausa:** verificación del teléfono por WhatsApp, avisos por WhatsApp y cuentas de cliente.
- Para esta función, escritorio y celular se diseñan **juntos**.

---

## 3. Flujo y archivos

```
/delivery (portada)            ¿Cómo lo quieres?  → SelectorEntrega (domicilio + mapa | recoger)
   └─ "Ver la carta y pedir" → /menu en modo pedido  (+ / − n + y nota por platillo; barra abajo)
         └─ barra → PanelPedido ("Tu pedido") → /delivery/pedido (checkout: 1 Entrega · 2 Tus datos · 3 Pago)
               └─ confirmar → /delivery/seguimiento/:token (estado en vivo, cancelar)
```

| Archivo | Qué hace |
|---|---|
| `src/config/api.js` | `PEDIDOS` (`off`/`demo`/`on`), `GOOGLE_MAPS_KEY`, `TURNSTILE_SITE_KEY` |
| `src/api/pedidos.js` | Llamadas reales (`config`, `cotizar`, `crear`, `consultar`, `cancelar`) o la demo, según el modo |
| `src/api/pedidosDemo.js` | Backend simulado. **Referencia ejecutable del contrato:** valida y calcula como debe hacerlo el backend |
| `src/context/Carrito.jsx` | Carrito global: platillos en localStorage (sin precios ni datos personales), entrega en sessionStorage; precios en vivo del menú del panel |
| `src/data/pedido.js` | Reglas compartidas: qué se puede pedir, alcohol, promos de hoy, zona y envío (solo vista previa) |
| `src/hooks/useDomicilio.js` | Config del servicio y si ahora se puede pedir (horario de hoy y pausa) |
| `src/utils/horario.js` | `ventanaDePedidos()`: horas disponibles hoy en hora de Durango |
| `src/utils/googleMaps.js` | Carga de Google Maps bajo demanda, sugerencias (Places API New) y ubicación simulada en la demo |
| `src/components/SelectorEntrega.jsx` | Domicilio/recoger, buscador, "Usar mi ubicación", mapa con el pin fijo al centro |
| `src/components/BarraModoPedido.jsx` | Franja bajo la cabecera del Menú: para quién es el pedido, Cambiar, Salir |
| `src/components/PedidoFlotante.jsx` | Barra "3 platillos · $495 Revisar" y panel "Tu pedido" (hoja desde abajo en celular) |
| `src/components/MenuItem.jsx` | Prop opcional `pedido`; sin ella, el platillo se ve como siempre |
| `src/components/Turnstile.jsx` | Antibots de Cloudflare (solo si hay llave) |
| `src/pages/DeliveryPage.jsx` | Portada: con pedidos (`ConPedidos`) o la de siempre (`SoloApps`) |
| `src/pages/CheckoutPage.jsx` | Checkout con resumen al lado; total del servidor; `Idempotency-Key` |
| `src/pages/SeguimientoPage.jsx` | Estado en vivo (cada 15 s), `noindex` y `no-referrer` |
| `src/pages/TerminosPage.jsx` | Términos de venta (**borrador**, revisar con el dueño y su contador o abogado) |
| `src/i18n/es.js`, `en.js` | Bloque `pedido` (mismas claves en ambos) |
| `src/css/components.css` | Bloque "PEDIDOS A DOMICILIO PROPIOS" al final |

Otros toques: `App.jsx` (rutas y barra/panel, solo con pedidos encendidos), `Header.jsx` (dropdown con "Pedir a
domicilio" / "Pasar a recoger" y las apps abajo), `MenuPage.jsx` (modo pedido), `PrivacyPage.jsx` (párrafos que
solo aparecen con pedidos encendidos), `menuNormalizar.js` (campos `domicilio`, `alcohol` e `id` de las promos).

---

## 4. Reglas de seguridad del front

- **El navegador nunca decide el precio:** solo manda `id` + cantidad + nota. El total que se muestra antes de
  confirmar es el de `POST /api/domicilio/cotizar`.
- **Sin datos de tarjeta en el sitio:** con tarjeta se redirige a Mercado Pago, solo si la URL es `https://…mercadopago.com(.mx)`.
- El estado del pago se le pregunta al backend; nunca se cree lo que diga la URL de regreso.
- `Idempotency-Key` nueva por intento; el botón se desactiva mientras se envía.
- Nada secreto en `VITE_*`: todo lo que empieza así se ve en el navegador.
- La llave de Google Maps va restringida al dominio y a "Maps JavaScript API" + "Places API (New)", con alerta de presupuesto.
- Si el menú no llegó del panel (respaldo local), **no se puede pedir**: se muestran los teléfonos.

---

## 5. Lo que falta

### Front: diseño
La estructura está, pero **falta una ronda de diseño fino** con el dueño (proponer 2–3 opciones con vista previa,
escritorio y celular juntos), sobre todo en:
- **Portada de A domicilio:** jerarquía del bloque "¿Cómo lo quieres?", los pasos de "¿Cómo funciona?", la línea de
  las apps, y qué se ve fuera de horario o con el servicio en pausa.
- **Checkout:** es largo; revisar densidad, el selector de hora (hoy usa los botones de Reservar), cómo se ven
  efectivo / terminal / propina y el resumen.
- **Seguimiento:** ilustración o animación por estado, cómo se ven "Rechazado", "Pago fallido" y "Cancelado", y un
  botón para guardar o compartir el enlace.
- **Menú en modo pedido:** animación al agregar, cómo se ve la nota y la franja de arriba; platillos agotados.
- **Modo claro** completo (no se revisó a ojo) y textos en inglés.
- Fotos de platillos (no hay todavía).

### Front: funciones
- Probar con una **llave real de Google Maps**: autocompletado, pin, costos y precisión en Durango.
- Conectar con el backend real (`VITE_PEDIDOS=on`) y revisar cada mensaje de error.
- Promos de $0 (p. ej. "Tacos 3x2"): hoy no se pueden pedir; definir cómo se cobran.
- "Repetir mi último pedido" y "Ver mi pedido en curso" más visibles.
- Revisión con lector de pantalla y teclado de todo el flujo.
- Encender la CSP de `vercel.json` (hoy *Report-Only*) tras revisarla en una vista previa de Vercel.
- Fase 2: pago en línea (solo encender cuando el backend esté listo). Fase 3: WhatsApp y cuentas (en pausa).

### Backend
Todo lo de [`BACKEND.md`](BACKEND.md) §7: config, cotizar, crear, seguimiento, cancelar, panel (alertas, aceptar o
rechazar, vista de repartidor, corte de caja, pausar pedidos, bloqueos), campos nuevos del menú y, después, Mercado Pago.

### Del negocio
Radio y tarifas por sucursal, tiempo estimado, monto del tope de efectivo, opciones de propina, quiénes reparten y
si llevan terminal, cuenta de Mercado Pago, cuenta de Google Cloud, revisión de los Términos de venta y del aviso de
privacidad, y la decisión sobre WhatsApp.

---

## 6. Lista para encender en producción

- [ ] Backend de la §7 en producción (fase 1), probado con pedidos reales del equipo.
- [ ] Render (o el servidor que se use) en plan de pago: sin "arranque en frío".
- [ ] Panel operando en cada sucursal y repartidores capacitados.
- [ ] Radio, tarifas, tiempos y topes reales en `GET /api/domicilio/config`.
- [ ] Llaves públicas de Google Maps y Turnstile en Vercel, restringidas al dominio.
- [ ] Términos de venta y aviso de privacidad aprobados por el dueño.
- [ ] Ronda de diseño fino aprobada (escritorio y celular).
- [ ] CSP activada sin errores en una vista previa.
- [ ] `VITE_PEDIDOS=on` en Vercel (Production) y nuevo despliegue.
