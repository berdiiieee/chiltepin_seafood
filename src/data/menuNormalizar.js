// Convierte la respuesta de GET /api/menu (o el respaldo local) en lo que pinta el sitio.
// Tolerante: campos opcionales que el backend puede agregar después (ver docs/BACKEND.md)
// se leen si existen y se ignoran si no.
import { SUBGRUPOS_BEBIDAS, SUBGRUPO_OTRAS } from './bebidasSubgrupos';
import { SUCURSALES } from '../config/negocio';

/** 'Tacos, Burros y Más' -> 'tacosburrosymas' (sin acentos, espacios ni signos) */
export const clave = (texto = '') =>
  String(texto).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');

// Secciones que ya conoce el diseño: id del ancla (y del icono) y etiqueta corta del chip.
// Una sección nueva del panel no necesita estar aquí: sale con su nombre y un icono genérico.
const SECCIONES_CONOCIDAS = {
  entradas: { id: 'entradas', chip: 'Entradas' },
  aguachile: { id: 'aguachile', chip: 'Aguachile' },
  aguachiles: { id: 'aguachile', chip: 'Aguachile' },
  coctel: { id: 'coctel', chip: 'Cóctel' },
  cocteles: { id: 'coctel', chip: 'Cóctel' },
  kids: { id: 'kids', chip: 'Kids' },
  tostadas: { id: 'tostadas', chip: 'Tostadas' },
  lonuevo: { id: 'lonuevo', chip: 'Lo Nuevo' },
  tacosburrosymas: { id: 'tacosburros', chip: 'Tacos & Burros' },
  tacosyburros: { id: 'tacosburros', chip: 'Tacos & Burros' },
  bebidas: { id: 'bebidas', chip: 'Bebidas' },
};

const texto = v => (typeof v === 'string' ? v.trim() : '');
const disponible = item => item && item.disponible !== false && item.activo !== false;

const normalizarItem = item => ({
  id: item.id,
  nombre: texto(item.name ?? item.nombre),
  precio: Number(item.price ?? item.precio) || 0,
  descripcion: texto(item.descripcion ?? item.desc ?? item.description),
  descripcion_en: texto(item.descripcion_en ?? item.desc_en),
  subcategoria: texto(item.subcategoria),
  subcategoria_en: texto(item.subcategoria_en),
});

// Bebidas en subgrupos: primero `subcategoria` del panel; si no, el mapa local; si no, "Otras".
function agruparBebidas(items) {
  const porNombre = new Map();
  SUBGRUPOS_BEBIDAS.forEach(g => g.bebidas.forEach(b => porNombre.set(clave(b), g.titulo)));
  const grupos = new Map(SUBGRUPOS_BEBIDAS.map(g => [clave(g.titulo), { titulo: g.titulo, titulo_en: '', items: [] }]));
  const otras = [];
  items.forEach(item => {
    const titulo = item.subcategoria || porNombre.get(clave(item.nombre));
    if (!titulo) { otras.push(item); return; }
    const k = clave(titulo);
    if (!grupos.has(k)) grupos.set(k, { titulo, titulo_en: '', items: [] });
    const g = grupos.get(k);
    if (item.subcategoria_en && !g.titulo_en) g.titulo_en = item.subcategoria_en;
    g.items.push(item);
  });
  if (otras.length) grupos.set(clave(SUBGRUPO_OTRAS), { titulo: SUBGRUPO_OTRAS, titulo_en: '', items: otras });
  return [...grupos.values()].filter(g => g.items.length);
}

export function normalizarSecciones(sections) {
  if (!Array.isArray(sections)) return [];
  const usados = new Set();
  return sections
    .filter(sec => disponible(sec) && Array.isArray(sec.items))
    .map(sec => {
      const nombre = texto(sec.name ?? sec.nombre);
      const k = clave(nombre);
      const conocida = SECCIONES_CONOCIDAS[k];
      let id = conocida?.id || k || `seccion${sec.id ?? ''}`;
      while (usados.has(id)) id += '-2';
      usados.add(id);
      const items = sec.items.filter(disponible).map(normalizarItem).filter(it => it.nombre);
      return {
        id,
        nombre,
        nombre_en: texto(sec.name_en ?? sec.nombre_en),
        chip: conocida?.chip || nombre,
        conocida: Boolean(conocida),
        items,
        subgrupos: id === 'bebidas' ? agruparBebidas(items) : null,
      };
    })
    .filter(sec => sec.items.length);
}

// Promos planas de la API -> [{ location, rows: [{ day, desc, desc_en, price }] }], en el orden de SUCURSALES.
export function normalizarPromos(promos) {
  if (!Array.isArray(promos)) return [];
  const orden = SUCURSALES.map(s => s.nombreCorto);
  const grupos = new Map();
  promos.filter(disponible).forEach(p => {
    const location = texto(p.location);
    if (!grupos.has(location)) grupos.set(location, []);
    grupos.get(location).push({
      day: texto(p.day),
      desc: texto(p.desc ?? p.descripcion),
      desc_en: texto(p.desc_en ?? p.descripcion_en),
      price: Number(p.price) || 0,
    });
  });
  const pos = l => (orden.includes(l) ? orden.indexOf(l) : orden.length);
  return [...grupos.entries()]
    .sort((a, b) => pos(a[0]) - pos(b[0]))
    .map(([location, rows]) => ({ location, rows }));
}
