import { useEffect, useState } from 'react';
import { get } from '../api/client';
import { MENU_RESPALDO } from '../data/menuRespaldo';
import { PROMOS_RESPALDO } from '../data/promos';
import { normalizarSecciones, normalizarPromos } from '../data/menuNormalizar';

// Menú del panel (GET /api/menu), compartido entre páginas: se pide una sola vez por visita.
// Mientras responde (Render puede tardar en despertar) se muestra el respaldo local; si falla,
// se queda el respaldo con estado 'fallback' (la página avisa que los precios podrían cambiar).
const RESPALDO = {
  secciones: normalizarSecciones(MENU_RESPALDO.sections),
  promos: PROMOS_RESPALDO.map(c => ({ location: c.location, rows: c.rows.map(r => ({ ...r, desc_en: '' })) })),
};

let cache = null;
let pendiente = null;

function pedirMenu() {
  if (!pendiente) {
    pendiente = get('/api/menu')
      .then(data => {
        const secciones = normalizarSecciones(data?.sections);
        if (!secciones.length) throw new Error('Menú vacío');
        const promos = normalizarPromos(data?.promos);
        // Fecha de los precios: la que mande el backend (opcional) o la de esta consulta
        const fechaPanel = data?.actualizado ?? data?.updatedAt ?? data?.fechaActualizacion;
        const actualizado = fechaPanel && !Number.isNaN(new Date(fechaPanel).getTime()) ? new Date(fechaPanel) : new Date();
        cache = { secciones, promos: promos.length ? promos : RESPALDO.promos, estado: 'ok', actualizado };
        return cache;
      })
      .catch(() => {
        pendiente = null; // en la próxima visita a una página con menú se vuelve a intentar
        return { ...RESPALDO, estado: 'fallback' };
      });
  }
  return pendiente;
}

export function useMenu() {
  const [menu, setMenu] = useState(() => cache ?? { ...RESPALDO, estado: 'loading' });
  useEffect(() => {
    if (cache) return undefined;
    let vivo = true;
    pedirMenu().then(m => { if (vivo) setMenu(m); });
    return () => { vivo = false; };
  }, []);
  return menu;
}

/**
 * Pide el menú en segundo plano (se llama al abrir el sitio). Además de dejarlo listo, "despierta"
 * al backend de Render para que reservaciones y formularios respondan rápido.
 */
export function precargarMenu() {
  if (!cache) pedirMenu();
}
