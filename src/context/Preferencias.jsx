import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { flushSync } from 'react-dom';
import es from '../i18n/es';
import en from '../i18n/en';
import { conTransicion, movimientoReducido } from '../utils/transicion';

// Preferencias del visitante: tema (oscuro por defecto) e idioma (español por defecto).
// Se recuerdan en este navegador. No se sigue la preferencia del sistema: el sitio es oscuro de origen.
// Los cambios se animan con View Transitions: el tema entra como un círculo que nace del botón;
// el idioma, con un fundido cruzado (lo que no cambia, como las fotos, se queda quieto).
const DICCIONARIOS = { es, en };
const TEMAS = ['oscuro', 'claro'];
const IDIOMAS = ['es', 'en'];
const COLOR_BARRA = { oscuro: '#1a1a1a', claro: '#f6f1e8' };

const leer = (clave, validos, defecto) => {
  try {
    const v = localStorage.getItem(clave);
    return validos.includes(v) ? v : defecto;
  } catch { return defecto; }
};
const guardar = (clave, valor) => { try { localStorage.setItem(clave, valor); } catch { /* sin almacenamiento */ } };
const buscar = (dic, ruta) => ruta.split('.').reduce((o, k) => (o == null ? undefined : o[k]), dic);

function aplicarTemaDom(tema) {
  const html = document.documentElement;
  if (tema === 'claro') html.dataset.tema = 'claro'; else delete html.dataset.tema;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', COLOR_BARRA[tema]);
}

const Contexto = createContext(null);

export const PreferenciasProvider = ({ children }) => {
  const [tema, setTemaEstado] = useState(() => leer('chiltepin-tema', TEMAS, 'oscuro'));
  const [idioma, setIdiomaEstado] = useState(() => leer('chiltepin-idioma', IDIOMAS, 'es'));

  /** origen: { x, y } en pantalla desde donde crece el círculo (el botón del pie). */
  const setTema = useCallback((nuevo, origen) => {
    guardar('chiltepin-tema', nuevo);
    const cambio = () => { flushSync(() => setTemaEstado(nuevo)); aplicarTemaDom(nuevo); };
    // Sin View Transitions: fundido de colores en toda la página
    if (!document.startViewTransition && !movimientoReducido()) {
      const html = document.documentElement;
      html.classList.add('tema-fundido');
      setTimeout(() => html.classList.remove('tema-fundido'), 700);
    }
    const tr = conTransicion('vt-tema', cambio);
    if (!tr) return;
    const x = origen?.x ?? window.innerWidth / 2;
    const y = origen?.y ?? window.innerHeight / 2;
    const radio = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
    tr.ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radio}px at ${x}px ${y}px)`] },
        { duration: 900, easing: 'cubic-bezier(0.65, 0, 0.35, 1)', pseudoElement: '::view-transition-new(root)' },
      );
    }).catch(() => {});
  }, []);

  const setIdioma = useCallback((nuevo) => {
    guardar('chiltepin-idioma', nuevo);
    conTransicion('vt-idioma', () => flushSync(() => setIdiomaEstado(nuevo)));
  }, []);

  useEffect(() => { aplicarTemaDom(tema); }, [tema]);

  useEffect(() => {
    document.documentElement.lang = idioma;
    document.title = (DICCIONARIOS[idioma] || es).comun.tituloDocumento;
  }, [idioma]);

  // t('menu.titulo') o t('pie.copy', { anio: 2026 }). Si falta en inglés, usa el español.
  // Devuelve también listas u objetos (p. ej. pasos de Eventos) tal cual.
  const t = useCallback((ruta, vars) => {
    let v = buscar(DICCIONARIOS[idioma], ruta);
    if (v === undefined) v = buscar(es, ruta);
    if (v === undefined) return ruta;
    if (typeof v === 'string' && vars) v = v.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));
    return v;
  }, [idioma]);

  const valor = useMemo(() => ({ tema, setTema, idioma, setIdioma, t }), [tema, setTema, idioma, setIdioma, t]);
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
};

export const usePreferencias = () => useContext(Contexto);
/** Atajo para textos: const { t, idioma } = useT(); */
export const useT = () => useContext(Contexto);
