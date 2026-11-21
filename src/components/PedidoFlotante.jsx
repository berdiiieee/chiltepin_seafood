// Barra fija "3 platillos · $495  Revisar →" (solo en el Menú en modo pedido) y el panel "Tu pedido".
// Mismo patrón que el panel de Reservar: siempre montado, `inert` cerrado, Esc cierra y el Tab queda dentro.
import { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useT } from '../context/Preferencias';
import { useCarrito } from '../context/Carrito';
import { dinero } from '../data/pedido';

export function BarraPedido() {
  const { t, idioma } = useT();
  const c = useCarrito();
  const { pathname } = useLocation();
  if (!c.modoPedido || pathname !== '/menu' || c.cantidadTotal === 0) return null;
  return (
    <div className="pedido-barra" role="region" aria-label={t('pedido.tuPedido')}>
      <button type="button" className="pedido-barra-btn" onClick={c.abrirPanel} aria-haspopup="dialog">
        <span>{c.cantidadTotal === 1 ? t('pedido.platillo1') : t('pedido.platillosN', { n: c.cantidadTotal })} · <strong>{dinero(c.subtotal, idioma)}</strong></span>
        <span className="pedido-barra-accion">{t('pedido.revisar')} <span aria-hidden="true">→</span></span>
      </button>
    </div>
  );
}

export function PanelPedido() {
  const { t, idioma } = useT();
  const c = useCarrito();
  const panelRef = useRef(null);
  const abierto = c.panelAbierto;
  const cerrar = c.cerrarPanel;

  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    if (abierto) el.removeAttribute('inert'); else el.setAttribute('inert', '');
    if (!abierto) return;
    const previo = document.activeElement;
    document.body.style.overflow = 'hidden';
    const id = setTimeout(() => el.querySelector('button, a[href]')?.focus(), 50);
    const onKey = e => {
      if (e.key === 'Escape') { cerrar(); return; }
      if (e.key !== 'Tab') return;
      const f = el.querySelectorAll('button:not([disabled]), input, a[href]');
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => { clearTimeout(id); document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; previo?.focus?.(); };
  }, [abierto, cerrar]);

  if (!c.activo) return null;
  const nombre = l => (idioma === 'en' && l.nombre_en) || l.nombre;

  return (
    <>
      <div className={`res-overlay${abierto ? ' active' : ''}`} onClick={cerrar} aria-hidden="true" />
      <aside ref={panelRef} className={`res-sidebar pedido-panel${abierto ? ' active' : ''}`} role="dialog" aria-modal="true" aria-labelledby="pedido-titulo">
        <div className="res-header">
          <h2 className="res-title-bar" id="pedido-titulo">{t('pedido.tuPedido')}</h2>
          <button className="res-close" onClick={cerrar} aria-label={t('pedido.cerrarAria')}>✕</button>
        </div>
        <div className="res-body">
          {c.lineas.length === 0 ? (
            <p className="pedido-vacio">{t('pedido.vacio')}</p>
          ) : (
            <ul className="pedido-lineas">
              {c.lineas.map(l => (
                <li key={l.clave}>
                  <span className="pedido-linea-nombre">
                    {nombre(l)}
                    {l.nota && <small>{l.nota}</small>}
                  </span>
                  <span className="pedido-ctl">
                    <button type="button" onClick={() => c.cambiar(l.clave, -1)} aria-label={t('pedido.quitarUno', { nombre: nombre(l) })}>−</button>
                    <span className="pedido-cant">{l.cantidad}</span>
                    <button type="button" onClick={() => c.cambiar(l.clave, 1)} aria-label={t('pedido.sumarUno', { nombre: nombre(l) })}>+</button>
                  </span>
                  <span className="pedido-linea-importe">{dinero(l.importe, idioma)}</span>
                </li>
              ))}
            </ul>
          )}

          {c.lineas.length > 0 && (
            <dl className="pedido-totales">
              <div><dt>{t('pedido.subtotal')}</dt><dd>{dinero(c.subtotal, idioma)}</dd></div>
              {c.entrega?.tipo === 'domicilio' && <div><dt>{t('pedido.envio')}</dt><dd>{dinero(c.entrega.envio, idioma)}</dd></div>}
              <div className="pedido-total"><dt>{t('pedido.total')}</dt><dd>{dinero(c.subtotal + (c.entrega?.envio || 0), idioma)}</dd></div>
            </dl>
          )}
          {c.lineas.length > 0 && <p className="pedido-nota-total">{t('pedido.totalFinal')}</p>}

          <div className="pedido-panel-acciones">
            {c.lineas.length > 0 && <Link to="/delivery/pedido" className="btn-principal" onClick={cerrar}>{t('pedido.continuar')} <span aria-hidden="true">→</span></Link>}
            <button type="button" className="ev-enlace" onClick={cerrar}>{t('pedido.seguirViendo')}</button>
          </div>
        </div>
      </aside>
    </>
  );
}
