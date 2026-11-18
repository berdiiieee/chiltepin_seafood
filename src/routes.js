import { buscarSucursal } from './config/negocio';

// Mapa entre las claves "legacy" de página (usadas por onNavigate) y las URLs reales.
const RUTAS = {
  home: '/',
  menu: '/menu',
  horarioyubicacion: '/horarios',
  delivery: '/delivery',
  eventos: '/eventos',
  acercade: '/acerca',
  contacto: '/contacto',
  boletin: '/boletin',
  privacidad: '/aviso-de-privacidad',
};

/** 'eventos?tipo=catering' -> '/eventos?tipo=catering';  'horarioyubicacion?sucursal=450' -> '/horarios/plaza-450' */
export function toPath(page = 'home') {
  const [base, query] = page.split('?');
  if (base === 'horarioyubicacion' && query) {
    const sucursal = buscarSucursal(new URLSearchParams(query).get('sucursal'));
    if (sucursal) return `/horarios/${sucursal.id}`;
  }
  const ruta = RUTAS[base] ?? (base.startsWith('/') ? base : '/');
  return query ? `${ruta}?${query}` : ruta;
}
