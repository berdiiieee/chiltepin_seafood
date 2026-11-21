import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import MenuItem from '../components/MenuItem';
import MenuSection from '../components/MenuSection';
import CabeceraPagina from '../components/CabeceraPagina';
import BloqueReserva from '../components/BloqueReserva';
import { useMenu } from '../hooks/useMenu';
import { useT } from '../context/Preferencias';
import { traductorMenu, indiceDia } from '../i18n/menu';
import { indiceHoy } from '../utils/horario';
import { useEsMovil } from '../hooks/useEsMovil';
import { useCarrito } from '../context/Carrito';
import { sePuedePedir, clavePlatillo, clavePromo } from '../data/pedido';
import BarraModoPedido from '../components/BarraModoPedido';

// El contenido (secciones, platillos, precios y promos) viene del panel: ver src/hooks/useMenu.js.
// Aquí solo vive el diseño: iconos por sección y cómo se pinta cada parte.

const t = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' };
const ICONOS = {
  entradas: <><path d="M4 17h16M5 17a7 7 0 0 1 14 0" {...t} /><path d="M12 8V6M10.5 6h3" {...t} /></>,
  aguachile: <><path d="M4 14a8 8 0 0 0 16 0z" {...t} /><path d="M12 14V8M8 14l2-5M16 14l-2-5" {...t} /></>,
  coctel: <><path d="M5 5h14l-7 8zM12 13v6M8.5 19h7" {...t} /><path d="M15 3l-2 4" {...t} /></>,
  kids: <><circle cx="12" cy="12" r="8" {...t} /><path d="M9 10v.5M15 10v.5M8.5 14c2 2.5 5 2.5 7 0" {...t} /></>,
  tostadas: <><circle cx="12" cy="12" r="8" {...t} /><path d="M9 10h.01M14 9h.01M15 14h.01M10 15h.01" {...t} strokeWidth="2.4" /></>,
  lonuevo: <><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.7 1.8L21.5 18.5l-1.8.7L19 21l-.7-1.8-1.8-.7 1.8-.7z" {...t} /></>,
  tacosburros: <><path d="M3 16a9 9 0 0 1 18 0z" {...t} /><path d="M8 12c1-1.5 2.5-1.5 3.5 0M13 11c1-1.5 2.5-1.5 3.5 0" {...t} /></>,
  bebidas: <><path d="M7 4h10l-1 16H8z" {...t} /><path d="M7.5 10h9" {...t} /></>,
  promos: <><path d="M3 12V4h8l10 10-8 8z" {...t} /><circle cx="7.5" cy="8.5" r="1.2" {...t} /></>,
};
// Para secciones nuevas que agregue el panel: un plato sencillo
const ICONO_GENERICO = <><circle cx="12" cy="12" r="8" {...t} /><circle cx="12" cy="12" r="4.5" {...t} /></>;
const icono = id => ICONOS[id] || ICONO_GENERICO;

const Icono = ({ id, className, size }) => (
  <svg className={className} viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">{icono(id)}</svg>
);

const precio = n => (n > 0 ? `$${n}` : '');

// + / − 1 + de una promo del día (mismo control que los platillos)
const PromoCtl = ({ pedido, nombre, t }) => (
  <span className="pedido-ctl">
    {pedido.cantidad > 0 ? (
      <>
        <button type="button" onClick={() => pedido.onCambiar(-1)} aria-label={t('pedido.quitarUno', { nombre })}>−</button>
        <span className="pedido-cant" aria-live="polite">{pedido.cantidad}</span>
        <button type="button" onClick={() => pedido.onCambiar(1)} aria-label={t('pedido.sumarUno', { nombre })}>+</button>
      </>
    ) : (
      <button type="button" className="pedido-agregar" onClick={() => pedido.onCambiar(1)} aria-label={t('pedido.agregar', { nombre })}>+</button>
    )}
  </span>
);

const MenuPage = ({ onReservationClick }) => {
  const { secciones, promos, estado, actualizado } = useMenu();
  const { t, idioma } = useT();
  const tr = traductorMenu(idioma);
  const esMovil = useEsMovil();
  const hoy = indiceHoy(); // para resaltar la promo del día
  // Modo pedido (desde A domicilio): solo lo que sale a domicilio (sin alcohol ni `domicilio:false`), con su +.
  // Fuera del modo pedido la carta es exactamente la de siempre.
  const carrito = useCarrito();
  const enPedido = carrito.modoPedido;
  const vista = enPedido
    ? secciones
      .map(s => ({
        ...s,
        items: s.items.filter(it => sePuedePedir(it, s.id)),
        subgrupos: s.subgrupos ? s.subgrupos.map(g => ({ ...g, items: g.items.filter(it => sePuedePedir(it, s.id)) })).filter(g => g.items.length) : null,
      }))
      .filter(s => s.items.length)
    : secciones;
  const pedidoDe = k => (enPedido && carrito.catalogo.has(k) ? {
    cantidad: carrito.cantidadDe(k), nota: carrito.notaDe(k), maxNota: carrito.maxNota,
    onCambiar: d => carrito.cambiar(k, d), onNota: x => carrito.ponerNota(k, x),
  } : undefined);
  const comida = vista.filter(s => s.id !== 'bebidas');
  const bebidas = vista.find(s => s.id === 'bebidas');

  // Chips en el orden en que se pintan: comida, bebidas, promociones
  const chips = [
    ...comida.map(s => ({ id: s.id, label: tr.chip(s) })),
    ...(bebidas ? [{ id: bebidas.id, label: tr.chip(bebidas) }] : []),
    ...(promos.length ? [{ id: 'promos', label: t('menu.promosChip') }] : []),
  ];
  const ids = chips.map(c => c.id);
  const idsClave = ids.join('|');
  const [activeCategory, setActiveCategory] = useState(ids[0]);

  // Línea roja que se desliza de una categoría a otra (en vez de saltar)
  const barraRef = useRef(null);
  const [linea, setLinea] = useState(null);
  useLayoutEffect(() => {
    const medir = () => {
      const barra = barraRef.current;
      const a = barra?.querySelector('.menu-nav a.active');
      if (!barra || !a) return;
      const rb = barra.getBoundingClientRect(), ra = a.getBoundingClientRect();
      setLinea({ x: ra.left - rb.left, y: ra.bottom - rb.top - 2, w: ra.width });
    };
    medir();
    const lista = barraRef.current?.querySelector('.menu-nav');
    window.addEventListener('resize', medir);
    lista?.addEventListener('scroll', medir, { passive: true });
    // Si cambia el tamaño de alguna categoría (llega la tipografía, cambia el idioma), se vuelve a medir
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(medir) : null;
    lista?.querySelectorAll('a').forEach(a => ro?.observe(a));
    document.fonts?.addEventListener?.('loadingdone', medir);
    return () => {
      window.removeEventListener('resize', medir);
      lista?.removeEventListener('scroll', medir);
      ro?.disconnect();
      document.fonts?.removeEventListener?.('loadingdone', medir);
    };
  }, [activeCategory, idsClave, idioma]);

  // En celular la fila de categorías se desliza: la categoría activa se lleva al centro de la fila
  // (solo se mueve la fila, nunca la página)
  useEffect(() => {
    const lista = barraRef.current?.querySelector('.menu-nav');
    const a = lista?.querySelector('a.active');
    if (!lista || !a || lista.scrollWidth <= lista.clientWidth) return;
    const rl = lista.getBoundingClientRect(), ra = a.getBoundingClientRect();
    lista.scrollTo({ left: lista.scrollLeft + ra.left - rl.left - (rl.width - ra.width) / 2, behavior: 'smooth' });
  }, [activeCategory]);

  // Resalta la categoría que se está leyendo: la última sección cuyo borde superior ya pasó
  // por debajo de la barra fija (header + chips).
  useEffect(() => {
    const lista = idsClave.split('|');
    let pendiente = false;
    const calcular = () => {
      pendiente = false;
      // Borde inferior real de los chips (sube cuando la navbar se esconde)
      const base = (document.querySelector('.menu-nav-wrapper')?.getBoundingClientRect().bottom || 160) + 48;
      let actual = lista[0];
      for (const id of lista) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= base) actual = id;
      }
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) actual = lista[lista.length - 1];
      setActiveCategory(actual);
    };
    const onScroll = () => { if (!pendiente) { pendiente = true; requestAnimationFrame(calcular); } };
    calcular();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); };
  }, [idsClave]);

  const irA = (e, id) => {
    e.preventDefault();
    setActiveCategory(id);
    const el = document.getElementById(id);
    if (!el) return;
    // Deja el título de la sección visible debajo de la barra fija. Al bajar, la navbar se esconde
    // y solo quedan los chips; al subir, vuelve a aparecer encima de ellos.
    const alto = document.querySelector('.menu-nav-wrapper')?.offsetHeight || 56;
    const navbar = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 100;
    const destino = el.getBoundingClientRect().top + window.scrollY;
    const baja = destino - alto - 28 > window.scrollY;
    window.scrollTo({ top: destino - alto - 28 - (baja ? 0 : navbar), behavior: 'smooth' });
  };

  return (
    <>
      <CabeceraPagina eyebrow={t('menu.eyebrow')} titulo={t('menu.titulo')} intro={t('menu.intro')} />
      {enPedido && <BarraModoPedido />}

      <div className={`menu-nav-wrapper${linea ? ' con-linea' : ''}`} ref={barraRef}>
        {linea && <span className="menu-nav-linea" aria-hidden="true" style={{ width: linea.w, transform: `translate(${linea.x}px, ${linea.y}px)` }} />}
        <ul className="menu-nav">
          {chips.map(cat => (
            <li key={cat.id}>
              <a href={`#${cat.id}`} className={activeCategory === cat.id ? 'active' : ''} onClick={e => irA(e, cat.id)}>
                <Icono id={cat.id} className="menu-nav-ico" size="24" />
                <span>{cat.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Aviso de precios: consultando / del panel con fecha / copia guardada (sujetos a cambios) */}
      <p key={estado} className={`menu-estado menu-estado-${estado}`} role="status">
        <span className="menu-estado-punto" aria-hidden="true" />
        {estado === 'ok'
          ? t('menu.estado.ok', { fecha: new Intl.DateTimeFormat(idioma === 'en' ? 'en-US' : 'es-MX', { day: 'numeric', month: 'long', year: 'numeric' }).format(actualizado) })
          : t(estado === 'loading' ? 'menu.estado.cargando' : 'menu.estado.respaldo')}
      </p>

      <main className="menu-container carta">
        {comida.map(section => (
          <MenuSection key={section.id} id={section.id} title={tr.seccion(section)} icono={icono(section.id)}>
            {section.items.map(item => (
              <MenuItem key={item.id ?? item.nombre} name={item.nombre} price={precio(item.precio)} desc={tr.descripcion(item) || undefined}
                pedido={pedidoDe(clavePlatillo(item.id))} idPedido={item.id} />
            ))}
          </MenuSection>
        ))}

        {bebidas && (
          <section id="bebidas" className="menu-section">
            <h2 className="section-heading">
              <Icono id="bebidas" className="seccion-ico" size="30" />
              {tr.seccion(bebidas)}
            </h2>
            {enPedido && <p className="pedido-aviso-menu">{t('pedido.sinAlcohol')}</p>}
            <div className="bebidas-cols">
              {bebidas.subgrupos.map(sub => {
                const lista = (
                  <div className="menu-grid">
                    {sub.items.map(item => (
                      <MenuItem key={item.id ?? item.nombre} name={item.nombre} price={precio(item.precio)} desc={tr.descripcion(item) || undefined}
                        pedido={pedidoDe(clavePlatillo(item.id))} idPedido={item.id} />
                    ))}
                  </div>
                );
                // Celular: cada subgrupo se abre al tocarlo (la lista completa era larguísima)
                return esMovil ? (
                  <details key={sub.titulo} className="bebida-sub bebida-plegable">
                    <summary className="bebida-titulo">
                      <span>{tr.subgrupo(sub)}</span>
                      <span className="bebida-cuenta">{sub.items.length}</span>
                      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </summary>
                    {lista}
                  </details>
                ) : (
                  <div key={sub.titulo} className="bebida-sub">
                    <h3 className="bebida-titulo">{tr.subgrupo(sub)}</h3>
                    {lista}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {promos.length > 0 && (
          <section className="promos-section menu-section" id="promos">
            <h2 className="section-heading">
              <Icono id="promos" className="seccion-ico" size="30" />
              {t('menu.promosTitulo')}
            </h2>
            <div className="promos-grid">
              {promos.map(col => (
                <div className="promo-col" key={col.location}>
                  <h3 className="promo-loc-title">{col.location}</h3>
                  {col.rows.map(r => {
                    const esHoy = indiceDia(r.day) === hoy;
                    const pedido = r.id != null ? pedidoDe(clavePromo(r.id)) : undefined;
                    return (
                    <div className={`promo-row${esHoy ? ' es-hoy' : ''}${pedido ? ' con-pedido' : ''}`} key={r.day + r.desc}>
                      <span className="promo-day">
                        {tr.dia(r.day)}
                        {esHoy && <span className="promo-hoy">{t('comun.hoy')}</span>}
                      </span>
                      <span className="promo-desc">{tr.promo(r)}</span>
                      <span className="promo-price">{precio(r.price)}</span>
                      {pedido && <PromoCtl pedido={pedido} nombre={tr.promo(r)} t={t} />}
                    </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {!enPedido && <BloqueReserva
        onReservationClick={onReservationClick}
        titulo={t('menu.antojoTitulo')}
        texto={t('menu.antojoTexto')}
        secundario={{ pregunta: t('menu.salirPregunta'), texto: t('menu.salirTexto'), to: '/delivery' }}
      />}
    </>
  );
};

export default MenuPage;
