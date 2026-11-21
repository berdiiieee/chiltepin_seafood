// Reglas del pedido a domicilio que necesita la pantalla (qué se puede pedir, alcohol, promos de hoy).
// OJO: son solo para mostrar. El backend vuelve a validar y a calcular TODO (precios, envío, totales);
// nunca se confía en lo que manda el navegador. Ver docs/BACKEND.md, sección 7.
import { SUBGRUPOS_BEBIDAS } from './bebidasSubgrupos';
import { clave } from './menuNormalizar';
import { SUCURSALES } from '../config/negocio';
import { indiceDia } from '../i18n/menu';

// Subgrupo de bebidas que se sabe sin alcohol. Cualquier otro (incluido "Otras") se trata como
// alcohol hasta que el panel diga `alcohol:false`: ante la duda, no se vende a domicilio.
const SIN_ALCOHOL = clave('Bebidas sin Alcohol');
const subgrupoDe = new Map();
SUBGRUPOS_BEBIDAS.forEach(g => g.bebidas.forEach(b => subgrupoDe.set(clave(b), clave(g.titulo))));

export function esAlcohol(item, seccionId) {
  if (seccionId !== 'bebidas') return item.alcohol === true;
  if (typeof item.alcohol === 'boolean') return item.alcohol;
  const sub = item.subcategoria ? clave(item.subcategoria) : subgrupoDe.get(clave(item.nombre));
  return sub !== SIN_ALCOHOL;
}

/** ¿Este platillo se puede agregar a un pedido a domicilio o para recoger? */
export const sePuedePedir = (item, seccionId) =>
  item.id != null && item.precio > 0 && item.domicilio !== false && !esAlcohol(item, seccionId);

// Llaves del carrito: un platillo y una promo pueden tener el mismo id en el panel.
export const clavePlatillo = id => `p:${id}`;
export const clavePromo = id => `promo:${id}`;

/** Todo lo que se puede pedir, por llave del carrito: { tipo, id, nombre, precio, seccion } */
export function catalogoPedido(secciones, promos, sucursalId, diaHoy) {
  const mapa = new Map();
  secciones.forEach(sec => sec.items.forEach(item => {
    if (sePuedePedir(item, sec.id)) {
      mapa.set(clavePlatillo(item.id), { tipo: 'platillo', id: item.id, nombre: item.nombre, precio: item.precio, seccion: sec.id });
    }
  }));
  promosDeHoy(promos, sucursalId, diaHoy).forEach(p => {
    mapa.set(clavePromo(p.id), { tipo: 'promo', id: p.id, nombre: p.desc, nombre_en: p.desc_en, precio: p.price, seccion: 'promos' });
  });
  return mapa;
}

/** Promos de HOY de la sucursal que atiende (solo esas se pueden pedir). */
export function promosDeHoy(promos, sucursalId, diaHoy) {
  const suc = SUCURSALES.find(s => s.id === sucursalId);
  if (!suc) return [];
  const col = promos.find(c => c.location === suc.nombreCorto);
  if (!col) return [];
  return col.rows.filter(r => r.id != null && r.price > 0 && r.domicilio !== false && indiceDia(r.day) === diaHoy);
}

// Distancia en línea recta (km). El backend puede usar la distancia por calles; esto es solo una vista previa.
export function distanciaKm(a, b) {
  const rad = x => (x * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat), dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

/** Sucursal más cercana que cubre la ubicación, con su costo de envío. null = fuera de zona. */
export function sucursalParaUbicacion(ubicacion, sucursalesConfig) {
  let mejor = null;
  sucursalesConfig.forEach(s => {
    if (s.pausada || !s.ubicacion) return;
    const km = distanciaKm(ubicacion, s.ubicacion);
    if (km > s.radioKm) return;
    const tarifa = [...s.tarifas].sort((x, y) => x.hastaKm - y.hastaKm).find(t => km <= t.hastaKm);
    if (!tarifa) return;
    if (!mejor || km < mejor.distanciaKm) mejor = { sucursal: s.id, distanciaKm: Math.round(km * 10) / 10, envio: tarifa.costo };
  });
  return mejor;
}

/** Pesos -> "$1,250" (sin centavos si es entero) */
export function dinero(n, idioma = 'es') {
  const v = Number(n) || 0;
  return '$' + v.toLocaleString(idioma === 'en' ? 'en-US' : 'es-MX', { minimumFractionDigits: Number.isInteger(v) ? 0 : 2, maximumFractionDigits: 2 });
}
