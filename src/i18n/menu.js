// Cómo se traduce el contenido que viene del panel (secciones, descripciones, promos, días).
// Prioridad en inglés: campo *_en del panel → traducciones del sitio → texto en español.
import es from './es';
import en from './en';
import { DESCRIPCIONES_EN, PROMOS_EN } from './menu-en';

const clave = (s = '') => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z]/g, '');

// 'Mié' / 'Miércoles' / 'mie' -> índice 0–6 (Dom = 0), o -1 si no se reconoce
export function indiceDia(dia) {
  const k = clave(dia).slice(0, 3);
  return es.comun.dias.findIndex(d => clave(d) === k);
}

export function traductorMenu(idioma) {
  const ingles = idioma === 'en';
  return {
    seccion: s => (ingles ? s.nombre_en || (s.conocida && en.menu.secciones[s.id]) || s.nombre : s.nombre),
    chip: s => (ingles ? (s.conocida && en.menu.chips[s.id]) || s.nombre_en || s.chip : s.chip),
    subgrupo: g => (ingles ? g.titulo_en || en.menu.subgrupos[g.titulo] || g.titulo : g.titulo),
    descripcion: it => (ingles ? it.descripcion_en || DESCRIPCIONES_EN[it.descripcion] || it.descripcion : it.descripcion),
    promo: r => (ingles ? r.desc_en || PROMOS_EN[r.desc] || r.desc : r.desc),
    dia: d => {
      const i = indiceDia(d);
      return i < 0 ? d : (ingles ? en : es).comun.dias[i];
    },
  };
}
