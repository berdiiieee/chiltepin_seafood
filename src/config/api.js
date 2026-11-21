// Ajustes de lo que se manda al backend. Ver docs/BACKEND.md.

// Mandar el idioma en que se llenó el formulario ('es' | 'en') en reservas, contacto, catering y boletín.
// APAGADO: hoy el backend rechaza campos que no conoce ("property idioma should not exist").
// Cuando el backend acepte `idioma` (opcional), cambiar a true y listo.
export const ENVIAR_IDIOMA = false;

/** Agrega { idioma } al cuerpo solo si ENVIAR_IDIOMA está activo. */
export const conIdioma = (cuerpo, idioma) => (ENVIAR_IDIOMA ? { ...cuerpo, idioma } : cuerpo);

// Pedidos a domicilio propios (ver docs/BACKEND.md, sección 7).
// 'off'  = A domicilio se ve como siempre (solo Rappi/DiDi). Es el valor por defecto.
// 'demo' = todo el flujo con un backend simulado en el navegador, para revisarlo. No guarda nada real.
// 'on'   = backend real.
// Se cambia con VITE_PEDIDOS en .env (ver .env.example).
const MODOS_PEDIDOS = ['off', 'demo', 'on'];
const modo = String(import.meta.env.VITE_PEDIDOS || 'off').trim().toLowerCase();
export const PEDIDOS = MODOS_PEDIDOS.includes(modo) ? modo : 'off';
export const PEDIDOS_ACTIVOS = PEDIDOS !== 'off';

// Llaves públicas (se ven en el navegador; nunca pongas aquí un secreto).
// Google Maps: restringida al dominio del sitio y a Maps JavaScript + Places. Vacía = la dirección se escribe a mano.
export const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY || '';
// Cloudflare Turnstile (antibots). Vacía = no se muestra; el backend decide si lo exige.
export const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || '';
