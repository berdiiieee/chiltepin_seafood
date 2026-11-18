// View Transitions compartidas (tema, idioma y cambio de página).
export const movimientoReducido = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
export const hayTransiciones = () => Boolean(document.startViewTransition) && !movimientoReducido();

/**
 * Corre `cambio` dentro de una View Transition. `clase` va en <html> mientras dura y elige el
 * estilo en CSS (vt-tema, vt-idioma, vt-pagina). Sin soporte o con "reducir movimiento", aplica
 * el cambio directo. Devuelve la transición o null.
 * Seguro: si el navegador no llega a pintar (pestaña en segundo plano, etc.), el cambio se aplica
 * igual a los 600 ms sin animación; `hecho` evita aplicarlo dos veces.
 */
export function conTransicion(clase, cambio) {
  if (!hayTransiciones()) { cambio(); return null; }
  const html = document.documentElement;
  html.classList.add(clase);
  let hecho = false;
  const correr = () => { if (!hecho) { hecho = true; cambio(); } };
  const tr = document.startViewTransition(correr);
  const seguro = setTimeout(() => { if (!hecho) { tr.skipTransition(); correr(); html.classList.remove(clase); } }, 600);
  tr.finished.finally(() => { clearTimeout(seguro); html.classList.remove(clase); }).catch(() => {});
  return tr;
}
