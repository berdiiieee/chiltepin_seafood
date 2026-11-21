// /delivery/pedido — Termina tu pedido: 1 Entrega · 2 Tus datos · 3 Pago, con el resumen al lado.
// El total que se muestra y se cobra es el del backend (POST /api/domicilio/cotizar); nunca el del navegador.
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CabeceraPagina from '../components/CabeceraPagina';
import SelectorEntrega from '../components/SelectorEntrega';
import Campo from '../components/Campo';
import AvisoFormulario from '../components/AvisoFormulario';
import AvisoEspera from '../components/AvisoEspera';
import Turnstile from '../components/Turnstile';
import Negritas from '../i18n/Negritas';
import { useT } from '../context/Preferencias';
import { useCarrito } from '../context/Carrito';
import { useDomicilio, ventanaPara } from '../hooks/useDomicilio';
import { cotizarPedido, crearPedido, nuevoIdIntento } from '../api/pedidos';
import { mensajeError } from '../api/errores';
import { dinero } from '../data/pedido';
import { formatoHora } from '../utils/horario';
import { nombreSucursal } from '../utils/googleMaps';
import { AVISO_PRIVACIDAD_RUTA, SUCURSALES, TELEFONO } from '../config/negocio';
import { useEsMovil } from '../hooks/useEsMovil';

const LLAVE_DATOS = 'chiltepin-mis-datos';
const leerDatos = () => { try { return JSON.parse(localStorage.getItem(LLAVE_DATOS)) || null; } catch { return null; } };
const Flecha = () => <span aria-hidden="true">→</span>;

// Solo se sale del sitio hacia Mercado Pago (o una ruta propia en la demo): evita redirecciones abiertas.
function urlDePagoSegura(url) {
  if (typeof url !== 'string') return null;
  if (url.startsWith('/') && !url.startsWith('//')) return url;
  try {
    const u = new URL(url);
    return u.protocol === 'https:' && /(^|\.)mercadopago\.com(\.mx)?$/.test(u.hostname) ? u.href : null;
  } catch { return null; }
}

export default function CheckoutPage() {
  const { t, idioma } = useT();
  const navigate = useNavigate();
  const c = useCarrito();
  const { config, estado } = useDomicilio();
  const guardados = useMemo(leerDatos, []);
  const esMovil = useEsMovil();

  const [entrega, setEntrega] = useState(c.entrega);
  // Sin datos de Google, la calle arranca con lo que escribió en el buscador
  const [dir, setDir] = useState({ calle: c.entrega?.calle || c.entrega?.direccionTexto || '', interior: '', colonia: c.entrega?.colonia || '', referencias: '' });
  const [cuando, setCuando] = useState('asap');
  const [hora, setHora] = useState('');
  const [datos, setDatos] = useState({ nombre: guardados?.nombre || '', telefono: guardados?.telefono || '', email: guardados?.email || '' });
  const [factura, setFactura] = useState(false);
  const [recordar, setRecordar] = useState(Boolean(guardados));
  const [metodo, setMetodo] = useState('');
  const [pagaCon, setPagaCon] = useState('');
  const [propina, setPropina] = useState({ tipo: 'porcentaje', valor: 0 });
  const [terminos, setTerminos] = useState(false);
  const [errores, setErrores] = useState({});
  // Cada cotización (o su error) guarda la `clave` de lo que se cotizó: solo vale si coincide con lo que hay ahora
  const [cot, setCot] = useState(null);
  const [falloCot, setFalloCot] = useState(null);
  const [reintentoCot, setReintentoCot] = useState(0);
  const [cotizando, setCotizando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState('');
  const [turnstile, setTurnstile] = useState('');
  const intento = useRef(nuevoIdIntento());
  // Identidad de la dirección elegida (cambia con cada búsqueda, texto nuevo o "Usar mi ubicación"; no al afinar el pin)
  const lugarPrevio = useRef(c.entrega?.lugar ?? 0);

  // Al cambiar la entrega (otra sucursal), el carrito ajusta las promos que aplican
  const alCambiarEntrega = e => {
    setEntrega(e);
    if (e && (e.tipo !== c.entrega?.tipo || e.sucursal !== c.entrega?.sucursal || e.ubicacion !== c.entrega?.ubicacion)) c.iniciar(e);
    if (e?.tipo !== 'domicilio') return;
    if ((e.lugar ?? 0) !== lugarPrevio.current) {
      // Dirección nueva: calle y colonia salen de ella y se borra lo que era de la anterior,
      // para que lo escrito y el pin del mapa sean siempre la misma dirección.
      lugarPrevio.current = e.lugar ?? 0;
      setDir({ calle: e.calle || e.direccionTexto || '', interior: '', colonia: e.colonia || '', referencias: '' });
      setErrores(x => ({ ...x, calle: '', colonia: '' }));
    } else if (e.calle || e.colonia) {
      setDir(d => ({ ...d, calle: d.calle || e.calle || '', colonia: d.colonia || e.colonia || '' }));
    }
  };

  const items = c.lineas.map(l => (l.tipo === 'promo'
    ? { promoId: l.id, cantidad: l.cantidad, ...(l.nota ? { nota: l.nota } : {}) }
    : { id: l.id, cantidad: l.cantidad, ...(l.nota ? { nota: l.nota } : {}) }));
  // Propina solo a domicilio (BACKEND.md §7.3). La elección se conserva por si vuelve a domicilio, pero no se manda.
  const propinaEnvio = entrega?.tipo === 'domicilio' ? propina : null;
  const claveCot = JSON.stringify({ e: entrega && [entrega.tipo, entrega.sucursal, entrega.ubicacion], items, propina: propinaEnvio });

  // Cotización oficial del backend (con una pausa corta para no pedirla en cada tecla)
  useEffect(() => {
    if (!entrega || !items.length) { setCotizando(false); return; }
    let vivo = true;
    const clave = claveCot;
    setCotizando(true);
    const id = setTimeout(() => {
      cotizarPedido({
        tipo: entrega.tipo, sucursal: entrega.sucursal, ...(entrega.ubicacion ? { ubicacion: entrega.ubicacion } : {}),
        items, ...(propinaEnvio ? { propina: propinaEnvio } : {}),
      })
        .then(r => { if (vivo) { setCot({ ...r, clave }); setFalloCot(null); } })
        .catch(err => { if (vivo) setFalloCot({ clave, err }); })
        .finally(() => vivo && setCotizando(false));
    }, 400);
    return () => { vivo = false; clearTimeout(id); };
  }, [claveCot, reintentoCot]); // eslint-disable-line react-hooks/exhaustive-deps

  // Un intento nuevo (Idempotency-Key) cada vez que cambia lo que se va a mandar
  useEffect(() => { intento.current = nuevoIdIntento(); }, [claveCot, metodo, cuando, hora]);

  const ventana = config && entrega ? ventanaPara(config, entrega.sucursal) : null;
  const metodos = config?.metodos || [];
  const propinas = config?.propinas || [0, 10, 15];
  // Solo vale la cotización de lo que hay en pantalla AHORA: mientras se recalcula no hay total ni se puede confirmar
  const cotVigente = cot && cot.clave === claveCot ? cot : null;
  const falloVigente = !cotizando && falloCot && falloCot.clave === claveCot ? falloCot.err : null;
  const total = cotVigente?.total ?? null;
  const telSucursal = SUCURSALES.find(s => s.id === entrega?.sucursal)?.telefono || TELEFONO;

  if (!c.activo) return null;

  if (!c.lineas.length) {
    return (
      <main className="container">
        <CabeceraPagina eyebrow={t('pedido.checkoutEyebrow')} titulo={t('pedido.checkoutTitulo')} />
        <section className="home-seccion checkout-vacio">
          <p className="intro-text">{t('pedido.vacioCheckout')}</p>
          <Link className="link-flecha" to={c.modoPedido ? '/menu' : '/delivery'}>{t('pedido.volverCarta')} <Flecha /></Link>
        </section>
      </main>
    );
  }

  const set = (setter, campo) => e => { setter(v => ({ ...v, [campo]: e.target.value })); setErrores(x => ({ ...x, [campo]: '' })); };

  const validar = () => {
    const e = {};
    if (!entrega) e.entrega = entrega === null ? t('pedido.errUbicacion') : '';
    if (entrega?.tipo === 'domicilio') {
      if (dir.calle.trim().length < 3) e.calle = t('pedido.errCalle');
      if (dir.colonia.trim().length < 2) e.colonia = t('pedido.errColonia');
    }
    if (cuando === 'hora' && !hora) e.hora = t('pedido.errHora');
    const nombre = datos.nombre.trim().replace(/[’‘]/g, "'").replace(/\s+/g, ' ');
    if (nombre.length < 3) e.nombre = t('reservas.errNombre');
    else if (/[^\p{L}\s.'-]/u.test(nombre)) e.nombre = t('reservas.errNombreLetras');
    if (!/^\d{10}$/.test(datos.telefono.replace(/\D/g, ''))) e.telefono = t('reservas.errTelefono');
    if (datos.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.email.trim())) e.email = t('reservas.errCorreo');
    if (!metodo) e.metodo = t('pedido.errMetodo');
    if (metodo === 'efectivo' && pagaCon && total != null && Number(pagaCon) < total) e.pagaCon = t('pedido.errPagaCon');
    if (!terminos) e.terminos = t('pedido.errTerminos');
    Object.keys(e).forEach(k => !e[k] && delete e[k]);
    return e;
  };

  const enviar = async ev => {
    ev.preventDefault();
    if (enviando || !cotVigente) return;
    const e = validar();
    setErrores(e);
    setErrorEnvio('');
    if (Object.keys(e).length) {
      document.querySelector('.checkout-form [aria-invalid="true"], .checkout-form .field-error.visible')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    const nombre = datos.nombre.trim().replace(/[’‘]/g, "'").replace(/\s+/g, ' ');
    const telefono = datos.telefono.replace(/\D/g, '');
    const email = datos.email.trim();
    const cuerpo = {
      tipo: entrega.tipo,
      sucursal: entrega.sucursal,
      cuando: cuando === 'hora' ? { tipo: 'programado', hora } : { tipo: 'asap' },
      cliente: { nombre, telefono, ...(email ? { email } : {}) },
      ...(entrega.tipo === 'domicilio' ? {
        direccion: {
          calle: dir.calle.trim(), colonia: dir.colonia.trim(),
          ...(dir.interior.trim() ? { interior: dir.interior.trim() } : {}),
          ...(dir.referencias.trim() ? { referencias: dir.referencias.trim() } : {}),
          ubicacion: entrega.ubicacion,
        },
      } : {}),
      items,
      ...(propinaEnvio ? { propina: propinaEnvio } : {}),
      metodoPago: metodo,
      ...(metodo === 'efectivo' && pagaCon ? { pagaCon: Number(pagaCon) } : {}),
      factura,
      aceptaTerminos: true,
    };
    try { if (recordar) localStorage.setItem(LLAVE_DATOS, JSON.stringify({ nombre, telefono, email })); else localStorage.removeItem(LLAVE_DATOS); } catch { /* nada */ }
    setEnviando(true);
    try {
      const r = await crearPedido(cuerpo, { idempotencia: intento.current, turnstile });
      c.terminar(r.token);
      const pago = metodo === 'tarjeta' ? urlDePagoSegura(r.pagoUrl) : null;
      if (pago && !pago.startsWith('/')) { window.location.assign(pago); return; }
      navigate(pago || `/delivery/seguimiento/${r.token}`);
    } catch (err) {
      setErrorEnvio(mensajeError(err, t, idioma, { telefono: telSucursal }));
      setEnviando(false);
    }
  };

  const etiquetaBoton = !entrega ? t('pedido.faltaEntrega')
    : falloVigente ? t('pedido.sinTotal')
    : total == null ? t('pedido.cotizando')
    : t(metodo === 'tarjeta' ? 'pedido.pagar' : 'pedido.confirmar', { total: dinero(total, idioma) });
  const noDisponible = cotVigente?.disponible === false;

  return (
    <main className="container">
      <CabeceraPagina eyebrow={t('pedido.checkoutEyebrow')} titulo={t('pedido.checkoutTitulo')} />

      <section className="home-seccion checkout">
        <form className="checkout-form" onSubmit={enviar} noValidate>
          {/* 1 · Entrega */}
          <fieldset className="checkout-bloque">
            <legend className="checkout-titulo"><span>1</span>{t('pedido.bloqueEntrega')}</legend>
            {config && <SelectorEntrega config={config} inicial={c.entrega} onCambio={alCambiarEntrega} idBase="chk" />}
            {errores.entrega && <span className="field-error visible" role="alert">{errores.entrega}</span>}

            {entrega?.tipo === 'domicilio' && (
              <div className="form-abierto checkout-direccion">
                <Campo id="chk-calle" label={t('pedido.calle')} error={errores.calle}>
                  <input type="text" maxLength={120} autoComplete="address-line1" value={dir.calle} onChange={set(setDir, 'calle')} />
                </Campo>
                <Campo id="chk-interior" label={t('pedido.interior')} opcional>
                  <input type="text" maxLength={30} autoComplete="address-line2" value={dir.interior} onChange={set(setDir, 'interior')} />
                </Campo>
                <Campo id="chk-colonia" label={t('pedido.colonia')} error={errores.colonia}>
                  <input type="text" maxLength={80} value={dir.colonia} onChange={set(setDir, 'colonia')} />
                </Campo>
                <Campo id="chk-ref" label={t('pedido.referencias')} opcional>
                  <input type="text" maxLength={160} placeholder={t('pedido.referenciasPh')} value={dir.referencias} onChange={set(setDir, 'referencias')} />
                </Campo>
              </div>
            )}
            {entrega?.tipo === 'recoger' && <p className="checkout-recoges"><Negritas texto={t('pedido.recogesEn', { sucursal: nombreSucursal(entrega.sucursal) })} /></p>}

            <fieldset className="tipo-mensaje checkout-cuando">
              <legend>{t('pedido.cuando')}</legend>
              <div className="tipo-mensaje-opciones">
                {[['asap', t('pedido.loAntes')], ['hora', t('pedido.aUnaHora')]].map(([v, txt]) => (
                  <label key={v} className={cuando === v ? 'activo' : undefined}>
                    <input type="radio" name="chk-cuando" value={v} checked={cuando === v} onChange={() => setCuando(v)} />
                    <span>{txt}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            {cuando === 'hora' && (
              <div className="res-ops res-horas checkout-horas" role="radiogroup" aria-label={t('pedido.hora')}>
                {(ventana?.horas || []).map(h => (
                  <button key={h} type="button" role="radio" aria-checked={hora === h} className={`res-op${hora === h ? ' active' : ''}`} onClick={() => { setHora(h); setErrores(x => ({ ...x, hora: '' })); }}>
                    {formatoHora(h, idioma)}
                  </button>
                ))}
              </div>
            )}
            {errores.hora && <span className="field-error visible" role="alert">{errores.hora}</span>}
          </fieldset>

          {/* 2 · Tus datos */}
          <fieldset className="checkout-bloque">
            <legend className="checkout-titulo"><span>2</span>{t('pedido.bloqueDatos')}</legend>
            <div className="form-abierto">
              <Campo id="chk-nombre" label={t('formularios.nombre')} error={errores.nombre}>
                <input type="text" maxLength={100} autoComplete="name" placeholder={t('reservas.placeholderNombre')} value={datos.nombre} onChange={set(setDatos, 'nombre')} />
              </Campo>
              <Campo id="chk-tel" label={t('formularios.telefono')} error={errores.telefono}>
                <input type="tel" inputMode="numeric" maxLength={14} autoComplete="tel-national" value={datos.telefono} onChange={set(setDatos, 'telefono')} />
              </Campo>
              <Campo id="chk-email" label={t('formularios.correo')} opcional completo error={errores.email}>
                <input type="email" maxLength={255} autoComplete="email" placeholder={t('reservas.placeholderCorreo')} value={datos.email} onChange={set(setDatos, 'email')} />
              </Campo>
            </div>
            <label className="checkout-casilla">
              <input type="checkbox" checked={factura} onChange={e => setFactura(e.target.checked)} />
              <span>{t('pedido.factura')}<small>{t('pedido.facturaAyuda')}</small></span>
            </label>
            <label className="checkout-casilla">
              <input type="checkbox" checked={recordar} onChange={e => setRecordar(e.target.checked)} />
              <span>{t('pedido.recordar')}</span>
            </label>
          </fieldset>

          {/* 3 · Pago */}
          <fieldset className="checkout-bloque">
            <legend className="checkout-titulo"><span>3</span>{t('pedido.bloquePago')}</legend>

            <fieldset className="checkout-metodos" aria-describedby={errores.metodo ? 'chk-err-metodo' : undefined}>
              <legend>{t('pedido.metodo')}</legend>
              {metodos.map(m => (
                <label key={m} className={metodo === m ? 'activo' : undefined}>
                  <input type="radio" name="chk-metodo" value={m} checked={metodo === m} onChange={() => { setMetodo(m); setErrores(x => ({ ...x, metodo: '' })); }} />
                  <span><strong>{t(`pedido.${m}`)}</strong>{t(`pedido.${m}Detalle`)}</span>
                </label>
              ))}
            </fieldset>
            <span id="chk-err-metodo" className={`field-error${errores.metodo ? ' visible' : ''}`} role={errores.metodo ? 'alert' : undefined}>{errores.metodo || ''}</span>
            {metodo === 'tarjeta' && <p className="checkout-ayuda">{t('pedido.tarjetaAyuda')}</p>}
            {metodo === 'efectivo' && (
              <div className="form-abierto">
                <Campo id="chk-pagacon" label={t('pedido.pagaCon')} opcional error={errores.pagaCon}>
                  <input type="number" inputMode="numeric" min={0} max={20000} step={1} value={pagaCon} onChange={e => { setPagaCon(e.target.value); setErrores(x => ({ ...x, pagaCon: '' })); }} />
                </Campo>
                <p className="checkout-ayuda">{t('pedido.pagaConAyuda')}</p>
              </div>
            )}

            {entrega?.tipo === 'domicilio' && (
              <fieldset className="tipo-mensaje checkout-propina">
                <legend>{t('pedido.propinaTitulo')}</legend>
                <div className="tipo-mensaje-opciones">
                  {propinas.map(p => (
                    <label key={p} className={propina.tipo === 'porcentaje' && propina.valor === p ? 'activo' : undefined}>
                      <input type="radio" name="chk-propina" checked={propina.tipo === 'porcentaje' && propina.valor === p} onChange={() => setPropina({ tipo: 'porcentaje', valor: p })} />
                      <span>{p === 0 ? t('pedido.propinaNinguna') : `${p}%`}</span>
                    </label>
                  ))}
                  <label className={propina.tipo === 'monto' ? 'activo' : undefined}>
                    <input type="radio" name="chk-propina" checked={propina.tipo === 'monto'} onChange={() => setPropina({ tipo: 'monto', valor: 20 })} />
                    <span>{t('pedido.propinaOtra')}</span>
                  </label>
                </div>
                {propina.tipo === 'monto' && (
                  <div className="form-abierto checkout-propina-monto">
                    <Campo id="chk-propina-monto" label={t('pedido.propinaMonto')}>
                      <input type="number" inputMode="numeric" min={0} max={2000} step={1} value={propina.valor} onChange={e => setPropina({ tipo: 'monto', valor: Math.max(0, Math.round(Number(e.target.value) || 0)) })} />
                    </Campo>
                  </div>
                )}
              </fieldset>
            )}

            <label className="checkout-casilla">
              <input type="checkbox" checked={terminos} onChange={e => { setTerminos(e.target.checked); setErrores(x => ({ ...x, terminos: '' })); }} aria-invalid={errores.terminos ? true : undefined} />
              <span>
                {t('pedido.terminosAntes')} <Link to="/terminos-de-venta" target="_blank" rel="noopener noreferrer">{t('pedido.terminosEnlace')}</Link>{' '}
                {t('pedido.terminosY')} <Link to={AVISO_PRIVACIDAD_RUTA} target="_blank" rel="noopener noreferrer">{t('formularios.avisoEnlace')}</Link>.
              </span>
            </label>
            {errores.terminos && <span className="field-error visible" role="alert">{errores.terminos}</span>}
            <AvisoFormulario datos={t('pedido.avisoDatos')} finalidad={t('pedido.avisoFinalidad')} />
            <Turnstile onToken={setTurnstile} />

            {(errorEnvio || noDisponible) && (
              <div className="checkout-error" role="alert">
                <strong>{t('pedido.errorTitulo')}</strong>
                {errorEnvio && <p>{errorEnvio}</p>}
                {!errorEnvio && cotVigente.motivos.map(m => <p key={m}>{m}</p>)}
              </div>
            )}
            {falloVigente && !errorEnvio && (
              <div className="checkout-error" role="alert">
                <strong>{t('pedido.errorCotTitulo')}</strong>
                <p>{mensajeError(falloVigente, t, idioma, { telefono: telSucursal })}</p>
                <button type="button" className="ev-enlace" onClick={() => setReintentoCot(n => n + 1)}>{t('pedido.reintentar')}</button>
              </div>
            )}
            <AvisoEspera activo={enviando} />
            <div className="form-abierto-acciones">
              <button type="submit" className="btn-principal" disabled={enviando || estado !== 'abierto' || !cotVigente || noDisponible}>
                {enviando ? t('pedido.enviando') : etiquetaBoton}
              </button>
              <Link className="ev-enlace" to="/menu">{t('pedido.volverCarta')}</Link>
            </div>
          </fieldset>
        </form>

        <aside className="checkout-resumen" aria-label={t('pedido.tuPedido')}>
          {/* En celular el resumen arriba empieza plegado; en escritorio siempre abierto */}
          <details key={esMovil ? 'm' : 'e'} open={!esMovil} className="checkout-resumen-plegable">
            <summary>
              <span>{t('pedido.tuPedido')}</span>
              <span>{total != null ? dinero(total, idioma) : '…'}</span>
            </summary>
            <ul className="pedido-lineas pedido-lineas-chico">
              {c.lineas.map(l => (
                <li key={l.clave}>
                  <span className="pedido-linea-nombre">{l.cantidad}× {(idioma === 'en' && l.nombre_en) || l.nombre}{l.nota && <small>{l.nota}</small>}</span>
                  <span className="pedido-linea-importe">{dinero(l.importe, idioma)}</span>
                </li>
              ))}
            </ul>
            <dl className="pedido-totales" aria-live="polite" aria-busy={cotizando}>
              <div><dt>{t('pedido.subtotal')}</dt><dd>{dinero(cotVigente?.subtotal ?? c.subtotal, idioma)}</dd></div>
              {entrega?.tipo === 'domicilio' && <div><dt>{t('pedido.envio')}</dt><dd>{dinero(cotVigente?.envio ?? entrega.envio, idioma)}</dd></div>}
              {cotVigente?.propina > 0 && <div><dt>{t('pedido.propina')}</dt><dd>{dinero(cotVigente.propina, idioma)}</dd></div>}
              <div className="pedido-total"><dt>{t('pedido.total')}</dt><dd>{total != null ? dinero(total, idioma) : falloVigente ? t('pedido.sinTotal') : t('pedido.cotizando')}</dd></div>
            </dl>
          </details>
        </aside>
      </section>
    </main>
  );
}
