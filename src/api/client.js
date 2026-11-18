/* === CHILTEPIN SEAFOOD — API CLIENT === */

// En desarrollo se usa el proxy de Vite (/api -> backend) porque el backend no autoriza CORS desde localhost.
const API_BASE = import.meta.env.DEV
  ? ''
  : (import.meta.env.VITE_API_URL || 'https://backend-chiltepin.onrender.com').replace(/\/$/, '');

// Render (plan gratis) puede tardar ~50 s en "despertar" en la primera petición.
const TIMEOUT_MS = 60_000;

/**
 * @param {string} endpoint
 * @param {RequestInit} [init]
 */
async function request(endpoint, init = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE}${endpoint}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...init.headers },
      signal: init.signal ?? AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') throw err;
    // TimeoutError (60 s) o sin conexión
    throw errorApi('red', 'No pudimos conectar con el servidor. Revisa tu conexión e intenta de nuevo.');
  }

  // El servidor puede responder HTML (p. ej. un 502 del proxy), así que no asumimos JSON.
  const text = await response.text();
  let body = null;
  try { body = text ? JSON.parse(text) : null; } catch { /* respuesta no JSON */ }

  if (!response.ok) {
    const raw = body && body.message;
    const lista = Array.isArray(raw) ? raw : typeof raw === 'string' ? [raw] : [];
    // Tipo de error para que la pantalla elija el mensaje (y lo traduzca): ver src/api/errores.js
    const codigo = response.status === 429 ? 'limite'
      : response.status === 409 ? 'duplicado'
      : response.status >= 400 && response.status < 500 && lista.length ? 'datos'
      : 'servidor';
    const msg = lista.length
      ? lista.join(', ')
      : codigo === 'limite'
        ? 'Demasiados intentos. Espera un minuto e intenta de nuevo.'
        : `El servidor no está disponible en este momento (error ${response.status}). Intenta más tarde.`;
    throw errorApi(codigo, msg, response.status, lista);
  }
  return body;
}

/** Error con `codigo` ('red' | 'limite' | 'duplicado' | 'datos' | 'servidor'), `status` y `mensajes` del backend. */
function errorApi(codigo, mensaje, status = 0, mensajes = []) {
  const e = new Error(mensaje);
  e.codigo = codigo;
  e.status = status;
  e.mensajes = mensajes;
  return e;
}

/** @param {string} endpoint @param {AbortSignal} [signal] */
export function get(endpoint, signal) {
  return request(endpoint, { method: 'GET', signal });
}

/** @param {string} endpoint @param {unknown} data */
export function post(endpoint, data) {
  return request(endpoint, { method: 'POST', body: JSON.stringify(data) });
}
