// Pedidos a domicilio / para recoger. Contrato completo en docs/BACKEND.md, sección 7.
// Con VITE_PEDIDOS=demo todo se resuelve en el navegador (src/api/pedidosDemo.js), sin backend.
import { get, post } from './client';
import { PEDIDOS } from '../config/api';
import * as demo from './pedidosDemo';

const real = {
  config: signal => get('/api/domicilio/config', signal),
  cotizar: cuerpo => post('/api/domicilio/cotizar', cuerpo),
  crear: (cuerpo, { idempotencia, turnstile } = {}) =>
    post('/api/pedidos', cuerpo, {
      'Idempotency-Key': idempotencia,
      ...(turnstile ? { 'CF-Turnstile-Token': turnstile } : {}),
    }),
  consultar: (token, signal) => get(`/api/pedidos/${encodeURIComponent(token)}`, signal),
  cancelar: token => post(`/api/pedidos/${encodeURIComponent(token)}/cancelar`, {}),
};

const api = PEDIDOS === 'demo' ? demo : real;

/** Reglas del servicio: sucursales (ubicación, radio, tarifas, pausa), métodos de pago, propinas, topes. */
export const configDomicilio = signal => api.config(signal);
/** Precio oficial del pedido (el que se muestra antes de confirmar). */
export const cotizarPedido = cuerpo => api.cotizar(cuerpo);
/** Crea el pedido. `idempotencia` = UUID por intento: si se repite, el backend devuelve el mismo pedido. */
export const crearPedido = (cuerpo, opciones) => api.crear(cuerpo, opciones);
export const consultarPedido = (token, signal) => api.consultar(token, signal);
export const cancelarPedido = token => api.cancelar(token);

/** Token aleatorio para Idempotency-Key. */
export function nuevoIdIntento() {
  if (globalThis.crypto?.randomUUID) return crypto.randomUUID();
  const b = crypto.getRandomValues(new Uint8Array(16));
  return [...b].map(x => x.toString(16).padStart(2, '0')).join('');
}

// Estados del pedido, en orden. Los "finales" detienen la consulta periódica.
export const ESTADOS_FINALES = ['entregado', 'cancelado', 'rechazado', 'pago_fallido', 'reembolsado'];
