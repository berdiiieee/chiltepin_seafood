// Backend SIMULADO para revisar el flujo de pedidos (VITE_PEDIDOS=demo). No cobra ni manda nada.
// Se porta como el backend real debería: recalcula precios, envío y totales desde el menú,
// ignora lo que el navegador diga de precios y valida horario, zona, alcohol y topes.
// Los pedidos de prueba se guardan solo en este navegador (localStorage).
import { get } from './client';
import { normalizarSecciones, normalizarPromos } from '../data/menuNormalizar';
import { catalogoPedido, sucursalParaUbicacion } from '../data/pedido';
import { ventanaDePedidos, indiceHoy } from '../utils/horario';
import { SUCURSALES } from '../config/negocio';

const LLAVE = 'chiltepin-demo-pedidos';
const espera = (ms = 450) => new Promise(r => setTimeout(r, ms));

// Valores de ejemplo: el negocio aún no define radios ni tarifas.
const CONFIG = {
  activo: true,
  metodos: ['efectivo', 'terminal'],
  propinas: [0, 10, 15],
  topeNuevos: { pedidos: 2, monto: 800 },
  ultimoAntesDeCerrarMin: 30,
  sucursales: [
    { id: 'plaza-real', ubicacion: { lat: 24.00465, lng: -104.65695 }, radioKm: 6, tarifas: [{ hastaKm: 3, costo: 30 }, { hastaKm: 6, costo: 45 }], tiempoEstimadoMin: 45, pausada: false, recoger: true },
    { id: 'plaza-450', ubicacion: { lat: 24.0543, lng: -104.64658 }, radioKm: 6, tarifas: [{ hastaKm: 3, costo: 30 }, { hastaKm: 6, costo: 45 }], tiempoEstimadoMin: 45, pausada: false, recoger: true },
  ],
};

function leer() { try { return JSON.parse(localStorage.getItem(LLAVE)) || {}; } catch { return {}; } }
function guardar(p) { try { localStorage.setItem(LLAVE, JSON.stringify(p)); } catch { /* sin almacenamiento */ } }

function error(mensajes, status = 400) {
  const e = new Error(mensajes.join(', '));
  e.codigo = status === 409 ? 'duplicado' : 'datos';
  e.status = status;
  e.mensajes = mensajes;
  return e;
}

let menu = null;
async function catalogo(sucursalId) {
  if (!menu) {
    const data = await get('/api/menu');
    menu = { secciones: normalizarSecciones(data?.sections), promos: normalizarPromos(data?.promos) };
  }
  return catalogoPedido(menu.secciones, menu.promos, sucursalId, indiceHoy());
}

export async function config() {
  await espera(250);
  // Para probar el flujo con tarjeta: localStorage['chiltepin-demo-tarjeta'] = '1'
  let tarjeta = false;
  try { tarjeta = localStorage.getItem('chiltepin-demo-tarjeta') === '1'; } catch { /* nada */ }
  return { ...CONFIG, metodos: tarjeta ? [...CONFIG.metodos, 'tarjeta'] : CONFIG.metodos };
}

async function calcular(c) {
  const motivos = [];
  let sucursal = c.sucursal, envio = 0, distanciaKm = null;
  if (c.tipo === 'domicilio') {
    // cotizar manda `ubicacion`; crear la manda en `direccion.ubicacion`
    const u = c.ubicacion || c.direccion?.ubicacion;
    const z = u && sucursalParaUbicacion(u, CONFIG.sucursales);
    if (!z) motivos.push('Esa dirección está fuera de nuestra zona de entrega. Puedes pasar a recogerlo.');
    else ({ sucursal, envio, distanciaKm } = z);
  } else if (!SUCURSALES.some(s => s.id === sucursal)) {
    motivos.push('Elige la sucursal donde pasarás a recoger.');
  }
  const cat = sucursal ? await catalogo(sucursal) : new Map();
  const lineas = [];
  (c.items || []).forEach(it => {
    const k = it.promoId != null ? `promo:${it.promoId}` : `p:${it.id}`;
    const p = cat.get(k);
    const cantidad = Math.min(20, Math.max(1, Math.floor(Number(it.cantidad) || 0)));
    if (!p) { motivos.push('Uno de tus platillos ya no está disponible a domicilio hoy.'); return; }
    lineas.push({ clave: k, nombre: p.nombre, cantidad, precio: p.precio, importe: p.precio * cantidad });
  });
  if (!lineas.length && !motivos.length) motivos.push('Tu pedido está vacío.');
  const subtotal = lineas.reduce((s, l) => s + l.importe, 0);
  const pr = c.propina || { tipo: 'porcentaje', valor: 0 };
  const propina = pr.tipo === 'monto' ? Math.min(Math.max(0, Math.round(Number(pr.valor) || 0)), subtotal) : Math.round(subtotal * (CONFIG.propinas.includes(Number(pr.valor)) ? Number(pr.valor) : 0) / 100);
  return { sucursal, distanciaKm, lineas, subtotal, envio, propina, total: subtotal + envio + propina, motivos };
}

export async function cotizar(c) {
  await espera();
  const r = await calcular(c);
  return { ...r, disponible: r.motivos.length === 0 };
}

const pedidosPorTel = tel => Object.values(leer()).filter(p => p.cliente.telefono === tel && p.estado !== 'cancelado').length;

export async function crear(c, { idempotencia } = {}) {
  await espera(700);
  const todos = leer();
  const repetido = Object.values(todos).find(p => p.idempotencia && p.idempotencia === idempotencia);
  if (repetido) return resumen(repetido);

  const r = await calcular(c);
  const v = ventanaDePedidos({ ultimoAntesDeCerrarMin: CONFIG.ultimoAntesDeCerrarMin, tiempoEstimadoMin: 45 });
  if (!v.abierto) r.motivos.push('En este momento no estamos tomando pedidos.');
  if (c.cuando?.tipo === 'programado' && !v.horas.includes(c.cuando.hora)) r.motivos.push('Esa hora ya no está disponible hoy.');
  const tel = String(c.cliente?.telefono || '');
  if (!/^\d{10}$/.test(tel)) r.motivos.push('El teléfono debe tener 10 dígitos.');
  if (!c.aceptaTerminos) r.motivos.push('Acepta los términos de venta para continuar.');
  const metodos = (await config()).metodos;
  if (!metodos.includes(c.metodoPago)) r.motivos.push('Elige una forma de pago válida.');
  if (c.metodoPago !== 'tarjeta' && pedidosPorTel(tel) < CONFIG.topeNuevos.pedidos && r.total > CONFIG.topeNuevos.monto) {
    r.motivos.push(`En tus primeros pedidos, el máximo para pagar al recibir es $${CONFIG.topeNuevos.monto}. Llámanos para pedidos más grandes.`);
  }
  if (r.motivos.length) throw error(r.motivos);

  const b = crypto.getRandomValues(new Uint8Array(16));
  const token = [...b].map(x => x.toString(16).padStart(2, '0')).join('');
  const folio = String(1000 + Object.keys(todos).length + 1);
  const pedido = {
    token, folio, idempotencia, creado: Date.now(), tipo: c.tipo, sucursal: r.sucursal,
    cuando: c.cuando, metodoPago: c.metodoPago, pagaCon: c.pagaCon, factura: Boolean(c.factura),
    cliente: { nombre: c.cliente.nombre, telefono: tel },
    direccion: c.tipo === 'domicilio' ? { calle: c.direccion?.calle, colonia: c.direccion?.colonia } : null,
    lineas: r.lineas, subtotal: r.subtotal, envio: r.envio, propina: r.propina, total: r.total,
    estado: c.metodoPago === 'tarjeta' ? 'pendiente_pago' : 'recibido',
  };
  todos[token] = pedido;
  guardar(todos);
  const res = resumen(pedido);
  // Con tarjeta, el backend real devuelve la liga de Mercado Pago; aquí se simula el regreso.
  if (c.metodoPago === 'tarjeta') res.pagoUrl = `/delivery/seguimiento/${token}?demo_pago=1`;
  return res;
}

// El estado avanza solo con el tiempo, para ver la página de seguimiento en acción.
function estadoActual(p) {
  if (['cancelado', 'rechazado', 'pago_fallido', 'reembolsado'].includes(p.estado)) return p.estado;
  const s = (Date.now() - p.creado) / 1000;
  if (p.estado === 'pendiente_pago' && s < 6) return 'pendiente_pago';
  if (s < 60) return 'recibido';
  if (s < 180) return 'en_cocina';
  if (s < 300) return p.tipo === 'domicilio' ? 'en_camino' : 'listo_recoger';
  return 'entregado';
}

function resumen(p) {
  const estado = estadoActual(p);
  const nombre = String(p.cliente.nombre || '').split(' ')[0];
  return {
    token: p.token, folio: p.folio, estado, tipo: p.tipo, sucursal: p.sucursal, cuando: p.cuando,
    metodoPago: p.metodoPago, cliente: { nombre },
    direccion: p.direccion ? { calle: p.direccion.calle, colonia: p.direccion.colonia } : null,
    lineas: p.lineas, subtotal: p.subtotal, envio: p.envio, propina: p.propina, total: p.total,
    puedeCancelar: estado === 'recibido' || estado === 'pendiente_pago',
    etaMin: estado === 'entregado' ? 0 : 45,
  };
}

export async function consultar(token) {
  await espera(200);
  const p = leer()[token];
  if (!p) throw Object.assign(new Error('No encontramos ese pedido.'), { codigo: 'datos', status: 404, mensajes: ['No encontramos ese pedido.'] });
  return resumen(p);
}

export async function cancelar(token) {
  await espera();
  const todos = leer();
  const p = todos[token];
  if (!p) throw error(['No encontramos ese pedido.'], 404);
  if (!resumen(p).puedeCancelar) throw error(['Tu pedido ya está en cocina; llama a la sucursal para cambiarlo.'], 409);
  p.estado = 'cancelado';
  guardar(todos);
  return resumen(p);
}
