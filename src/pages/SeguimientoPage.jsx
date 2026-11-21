// /delivery/seguimiento/:token — estado del pedido, en vivo. El token es secreto (≥128 bits, nunca el folio):
// quien tiene el enlace ve el pedido, así que se muestra lo mínimo y la página no se indexa ni filtra su URL.
// También es la URL de regreso de Mercado Pago: el estado del pago SIEMPRE se le pregunta al backend,
// nunca se cree lo que diga la URL (?status=approved).
import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import CabeceraPagina from '../components/CabeceraPagina';
import { useT } from '../context/Preferencias';
import { useCarrito } from '../context/Carrito';
import { consultarPedido, cancelarPedido, ESTADOS_FINALES } from '../api/pedidos';
import { mensajeError } from '../api/errores';
import { dinero } from '../data/pedido';
import { formatoHora } from '../utils/horario';
import { SUCURSALES } from '../config/negocio';
import NotFoundPage from './NotFoundPage';

const CADA_MS = 15_000;
const TOKEN_VALIDO = /^[A-Za-z0-9_-]{16,128}$/;
const trazo = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' };
const ICONOS = {
  recibido: <path d="M6 13l4 4 8-9" {...trazo} />,
  en_cocina: <><path d="M5 11h14l-1 8H6z" {...trazo} /><path d="M9 7c0-1 1-2 0-3M12 7c0-1 1-2 0-3M15 7c0-1 1-2 0-3" {...trazo} /></>,
  en_camino: <><circle cx="6" cy="17" r="2.5" {...trazo} /><circle cx="18" cy="17" r="2.5" {...trazo} /><path d="M8.5 17h6l2-6h-4M4 11h5l1.5 3" {...trazo} /></>,
  listo_recoger: <><path d="M5 9h14l-1.2 11H6.2z" {...trazo} /><path d="M9 9V7a3 3 0 0 1 6 0v2" {...trazo} /></>,
  entregado: <><path d="M4 12l3 3 5-6" {...trazo} /><path d="M11 15l1 0M13 12l7-7" {...trazo} /></>,
};

// Meta temporales solo para esta página (se quitan al salir)
function useMetasPrivadas() {
  useEffect(() => {
    const metas = [['robots', 'noindex, nofollow'], ['referrer', 'no-referrer']].map(([name, content]) => {
      const m = document.createElement('meta');
      m.name = name; m.content = content;
      document.head.appendChild(m);
      return m;
    });
    return () => metas.forEach(m => m.remove());
  }, []);
}

export default function SeguimientoPage() {
  const { token } = useParams();
  const valido = TOKEN_VALIDO.test(token || '');
  useMetasPrivadas();
  const { t, idioma } = useT();
  const c = useCarrito();
  const [pedido, setPedido] = useState(null);
  const [falla, setFalla] = useState('');
  const [noExiste, setNoExiste] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [cancelando, setCancelando] = useState(false);

  const consultar = useCallback(signal => consultarPedido(token, signal)
    .then(p => { setPedido(p); setFalla(''); })
    .catch(err => {
      if (err?.name === 'AbortError') return;
      if (err?.status === 404) setNoExiste(true);
      else setFalla(mensajeError(err, t, idioma));
    }), [token, t, idioma]);

  useEffect(() => {
    if (!valido) return undefined;
    const ctl = new AbortController();
    consultar(ctl.signal);
    return () => ctl.abort();
  }, [valido, consultar]);

  // Consulta periódica mientras no esté en un estado final y la pestaña esté visible
  const final = pedido && ESTADOS_FINALES.includes(pedido.estado);
  useEffect(() => {
    if (!valido || !pedido || final) return undefined;
    const id = setInterval(() => { if (!document.hidden) consultar(); }, CADA_MS);
    const alVolver = () => { if (!document.hidden) consultar(); };
    document.addEventListener('visibilitychange', alVolver);
    return () => { clearInterval(id); document.removeEventListener('visibilitychange', alVolver); };
  }, [valido, pedido, final, consultar]);

  // Ya terminó: deja de ofrecer "Ver mi pedido en curso"
  useEffect(() => {
    if (final && c.ultimoPedido === token) c.olvidarUltimo();
  }, [final, token, c]);

  if (!valido || noExiste) return valido ? (
    <main className="container">
      <CabeceraPagina eyebrow={t('domicilio.titulo')} titulo={t('pedido.segTitulo')} />
      <section className="home-seccion"><p className="intro-text">{t('pedido.noEncontrado')}</p>
        <Link className="link-flecha" to="/delivery">{t('pedido.pedirOtro')} <span aria-hidden="true">→</span></Link></section>
    </main>
  ) : <NotFoundPage />;

  const cancelar = async () => {
    setCancelando(true);
    try { setPedido(await cancelarPedido(token)); setConfirmando(false); }
    catch (err) { setFalla(mensajeError(err, t, idioma)); }
    setCancelando(false);
  };

  const suc = SUCURSALES.find(s => s.id === pedido?.sucursal);
  const pasos = pedido?.tipo === 'recoger' ? ['recibido', 'en_cocina', 'listo_recoger', 'entregado'] : ['recibido', 'en_cocina', 'en_camino', 'entregado'];
  const actual = pedido ? pasos.indexOf(pedido.estado) : -1;
  const problema = pedido && (actual === -1);
  const metodoTxt = pedido && t(`pedido.${pedido.metodoPago}`);

  return (
    <main className="container">
      <CabeceraPagina
        eyebrow={pedido ? t('pedido.folio', { folio: pedido.folio }) : t('domicilio.titulo')}
        titulo={pedido ? t(`pedido.estados.${pedido.estado}`) : t('pedido.segTitulo')}
        intro={pedido ? t(`pedido.detalles.${pedido.estado}`) : t('pedido.cargando')}
      />

      {pedido && (
        <section className="home-seccion seguimiento">
          {!problema && (
            <ol className="ev-pasos seguimiento-pasos visible" style={{ '--avance': Math.max(0, actual) / (pasos.length - 1) }}>
              {pasos.map((p, i) => (
                <li key={p} className={i < actual ? 'hecho' : i === actual ? 'actual' : undefined} aria-current={i === actual ? 'step' : undefined}>
                  <span className="ev-paso-icono"><svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">{ICONOS[p]}</svg></span>
                  <span><strong>{t(`pedido.estados.${p}`)}</strong></span>
                </li>
              ))}
            </ol>
          )}

          <div className="seguimiento-cols">
            <div className="seguimiento-datos">
              {!final && pedido.cuando?.tipo === 'programado'
                ? <p className="seguimiento-eta">{t('pedido.programadoPara', { hora: formatoHora(pedido.cuando.hora, idioma) })}</p>
                : !final && pedido.etaMin > 0 && <p className="seguimiento-eta">{t('pedido.eta', { min: pedido.etaMin })}</p>}
              <p>{pedido.metodoPago === 'tarjeta' ? t('pedido.pagadoEnLinea') : t('pedido.pagasAlRecibir', { metodo: metodoTxt })}</p>
              {pedido.direccion && <p className="seguimiento-dir">{[pedido.direccion.calle, pedido.direccion.colonia].filter(Boolean).join(', ')}</p>}
              <p className="seguimiento-intro">{t('pedido.segIntro')}</p>
              {suc && <p>{t('pedido.dudas', { sucursal: suc.nombreCorto })} <a href={suc.telefonoLink}>{suc.telefono}</a></p>}
              {falla && <p className="field-error visible" role="alert">{falla}</p>}

              {pedido.puedeCancelar && (confirmando ? (
                <p className="seguimiento-cancelar">
                  {t('pedido.cancelarSeguro')}{' '}
                  <button type="button" className="ev-enlace" onClick={cancelar} disabled={cancelando}>{t('pedido.siCancelar')}</button>{' '}
                  <button type="button" className="ev-enlace" onClick={() => setConfirmando(false)}>{t('pedido.noCancelar')}</button>
                </p>
              ) : (
                <button type="button" className="ev-enlace seguimiento-cancelar" onClick={() => setConfirmando(true)}>{t('pedido.cancelar')}</button>
              ))}
              {final && <Link className="link-flecha" to="/delivery">{t('pedido.pedirOtro')} <span aria-hidden="true">→</span></Link>}
            </div>

            <div className="checkout-resumen seguimiento-resumen">
              <ul className="pedido-lineas pedido-lineas-chico">
                {pedido.lineas?.map(l => (
                  <li key={l.clave || l.nombre}>
                    <span className="pedido-linea-nombre">{l.cantidad}× {l.nombre}</span>
                    <span className="pedido-linea-importe">{dinero(l.importe, idioma)}</span>
                  </li>
                ))}
              </ul>
              <dl className="pedido-totales">
                <div><dt>{t('pedido.subtotal')}</dt><dd>{dinero(pedido.subtotal, idioma)}</dd></div>
                {pedido.tipo === 'domicilio' && <div><dt>{t('pedido.envio')}</dt><dd>{dinero(pedido.envio, idioma)}</dd></div>}
                {pedido.propina > 0 && <div><dt>{t('pedido.propina')}</dt><dd>{dinero(pedido.propina, idioma)}</dd></div>}
                <div className="pedido-total"><dt>{t('pedido.total')}</dt><dd>{dinero(pedido.total, idioma)}</dd></div>
              </dl>
            </div>
          </div>
        </section>
      )}
      {!pedido && falla && <section className="home-seccion"><p className="field-error visible" role="alert">{falla}</p></section>}
    </main>
  );
}
