// ¿A domicilio o paso a recoger? Con domicilio: dirección (sugerencias de Google) + mapa con el pin al centro
// (el cliente mueve el mapa hasta su puerta) + "Usar mi ubicación". Dice al momento qué sucursal atiende y
// cuánto cuesta el envío, o si está fuera de zona. Se usa en la portada de A domicilio y en el checkout.
// Lo que calcula aquí es una vista previa: el backend vuelve a calcular zona y envío.
import { useEffect, useRef, useState } from 'react';
import { useT } from '../context/Preferencias';
import Negritas from '../i18n/Negritas';
import { SUCURSALES } from '../config/negocio';
import { sucursalParaUbicacion, dinero } from '../data/pedido';
import { hayGoogleMaps, cargarGoogleMaps, sugerencias, nuevaSesion, detalleLugar, ubicacionSimulada, CENTRO_DURANGO, nombreSucursal } from '../utils/googleMaps';

const trazo = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' };
const IconoMoto = () => (<svg viewBox="0 0 32 32" width="30" height="30" aria-hidden="true"><circle cx="8" cy="22" r="4" {...trazo} /><circle cx="24" cy="22" r="4" {...trazo} /><path d="M12 22h7l3-8h-5M22 14l2 8M6 14h7l2 4" {...trazo} /></svg>);
const IconoBolsa = () => (<svg viewBox="0 0 32 32" width="30" height="30" aria-hidden="true"><path d="M7 11h18l-1.5 16h-15z" {...trazo} /><path d="M12 11V9a4 4 0 0 1 8 0v2" {...trazo} /></svg>);
const IconoMira = () => (<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="12" cy="12" r="4" {...trazo} /><path d="M12 2v4M12 18v4M2 12h4M18 12h4" {...trazo} /></svg>);

export default function SelectorEntrega({ config, inicial, onCambio, idBase = 'ent' }) {
  const { t, idioma } = useT();
  const [tipo, setTipo] = useState(inicial?.tipo || 'domicilio');
  const [texto, setTexto] = useState(inicial?.direccionTexto || '');
  const [ubicacion, setUbicacion] = useState(inicial?.tipo === 'domicilio' ? inicial.ubicacion : null);
  const [recoger, setRecoger] = useState(inicial?.tipo === 'recoger' ? inicial.sucursal : '');
  const [lista, setLista] = useState([]);
  const [aviso, setAviso] = useState('');
  const [buscando, setBuscando] = useState(false);
  const datosLugar = useRef({ calle: inicial?.calle || '', colonia: inicial?.colonia || '' });

  const sucursalesConfig = config?.sucursales || [];
  const zona = tipo === 'domicilio' && ubicacion ? sucursalParaUbicacion(ubicacion, sucursalesConfig) : null;
  const paraRecoger = SUCURSALES.filter(s => {
    const c = sucursalesConfig.find(x => x.id === s.id);
    return c && c.recoger !== false && !c.pausada;
  });

  // Avisa al padre con la entrega completa (o null si falta algo)
  const onCambioRef = useRef(onCambio);
  onCambioRef.current = onCambio;
  useEffect(() => {
    let entrega = null;
    if (tipo === 'recoger' && recoger) entrega = { tipo, sucursal: recoger, envio: 0 };
    if (tipo === 'domicilio' && zona) {
      entrega = { tipo, sucursal: zona.sucursal, envio: zona.envio, distanciaKm: zona.distanciaKm, ubicacion, direccionTexto: texto, ...datosLugar.current };
    }
    onCambioRef.current(entrega);
  }, [tipo, recoger, zona?.sucursal, zona?.envio, ubicacion, texto]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---- Mapa (solo con llave de Google) ----
  const mapaEl = useRef(null);
  const mapa = useRef(null);
  const sesion = useRef(null);
  const [mapaListo, setMapaListo] = useState(false);
  useEffect(() => {
    if (tipo !== 'domicilio' || !hayGoogleMaps || mapa.current) return;
    let vivo = true;
    cargarGoogleMaps(idioma).then(async maps => {
      if (!vivo || !mapaEl.current) return;
      const { Map } = await maps.importLibrary('maps');
      mapa.current = new Map(mapaEl.current, {
        center: ubicacion || CENTRO_DURANGO, zoom: ubicacion ? 17 : 13,
        disableDefaultUI: true, zoomControl: true, gestureHandling: 'cooperative', clickableIcons: false,
      });
      // Al soltar el mapa, el pin del centro marca la ubicación
      mapa.current.addListener('dragend', () => {
        const c = mapa.current.getCenter();
        setUbicacion({ lat: c.lat(), lng: c.lng() });
      });
      sesion.current = await nuevaSesion();
      setMapaListo(true);
    }).catch(() => setAviso(t('pedido.ubicacionError')));
    return () => { vivo = false; };
  }, [tipo]); // eslint-disable-line react-hooks/exhaustive-deps

  const irA = (u, zoom = 17) => {
    setUbicacion(u);
    if (mapa.current) { mapa.current.panTo(u); mapa.current.setZoom(zoom); }
  };

  // Sugerencias mientras escribe (Google); sin Google, se busca al picar "Buscar"
  useEffect(() => {
    if (!hayGoogleMaps || !mapaListo || texto.trim().length < 4 || texto === datosLugar.current.elegido) { setLista([]); return; }
    const id = setTimeout(() => {
      sugerencias(texto, sesion.current).then(setLista).catch(() => setLista([]));
    }, 300);
    return () => clearTimeout(id);
  }, [texto, mapaListo]);

  const elegir = async s => {
    setLista([]);
    setBuscando(true);
    try {
      const d = await detalleLugar(s.prediccion);
      datosLugar.current = { calle: d.calle, colonia: d.colonia, elegido: d.texto };
      setTexto(d.texto);
      irA(d.ubicacion);
      setAviso('');
      nuevaSesion().then(x => { sesion.current = x; }).catch(() => {});
    } catch { setAviso(t('pedido.noEncontrada')); }
    setBuscando(false);
  };

  const buscarSinGoogle = e => {
    e?.preventDefault();
    if (hayGoogleMaps) { if (lista[0]) elegir(lista[0]); return; }
    const u = texto.trim().length >= 4 ? ubicacionSimulada(texto.trim()) : null;
    if (u) { setAviso(''); irA(u); } else setAviso(t('pedido.ubicacionError'));
  };

  const miUbicacion = () => {
    if (!navigator.geolocation) { setAviso(t('pedido.ubicacionError')); return; }
    setBuscando(true);
    navigator.geolocation.getCurrentPosition(
      p => { setBuscando(false); setAviso(''); irA({ lat: p.coords.latitude, lng: p.coords.longitude }); },
      () => { setBuscando(false); setAviso(t('pedido.ubicacionError')); },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  };

  return (
    <div className="entrega">
      <fieldset className="entrega-tipos">
        <legend className="sr-only">{t('pedido.comoLoQuieres')}</legend>
        {[
          { v: 'domicilio', titulo: t('pedido.domicilio'), detalle: t('pedido.domicilioDetalle'), Icono: IconoMoto },
          { v: 'recoger', titulo: t('pedido.recoger'), detalle: t('pedido.recogerDetalle'), Icono: IconoBolsa },
        ].map(({ v, titulo, detalle, Icono }) => (
          <label key={v} className={tipo === v ? 'activo' : undefined}>
            <input type="radio" name={`${idBase}-tipo`} value={v} checked={tipo === v} onChange={() => setTipo(v)} />
            <Icono />
            <span><strong>{titulo}</strong>{detalle}</span>
          </label>
        ))}
      </fieldset>

      {tipo === 'domicilio' ? (
        <div className="entrega-domicilio">
          <div className="entrega-buscar">
            <label htmlFor={`${idBase}-dir`}>{t('pedido.tuDireccion')}</label>
            <div className="entrega-buscar-fila">
              <input
                id={`${idBase}-dir`} type="text" autoComplete="street-address" maxLength={200}
                placeholder={t('pedido.direccionPh')} value={texto}
                onChange={e => { setTexto(e.target.value); datosLugar.current = { calle: '', colonia: '' }; }}
                onKeyDown={e => { if (e.key === 'Enter') buscarSinGoogle(e); if (e.key === 'Escape') setLista([]); }}
                aria-autocomplete="list" aria-controls={`${idBase}-sug`} aria-expanded={lista.length > 0}
              />
              <button type="button" className="ev-enlace" onClick={buscarSinGoogle}>{t('pedido.buscar')}</button>
            </div>
            {lista.length > 0 && (
              <ul id={`${idBase}-sug`} className="entrega-sugerencias" role="listbox">
                {lista.map(s => (
                  <li key={s.texto} role="option" aria-selected="false">
                    <button type="button" onClick={() => elegir(s)}>{s.texto}</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button type="button" className="entrega-ubicacion" onClick={miUbicacion} disabled={buscando}>
            <IconoMira /> {t('pedido.usarUbicacion')}
          </button>

          {hayGoogleMaps && (
            <div className="entrega-mapa">
              <div ref={mapaEl} className="entrega-mapa-lienzo" role="application" aria-label={t('pedido.mapaAria')} />
              <span className="entrega-pin" aria-hidden="true" />
              {ubicacion && <p className="entrega-mapa-nota">{t('pedido.ajustaPin')}</p>}
            </div>
          )}

          <p className="entrega-resultado" role="status">
            {aviso || (ubicacion && (zona
              ? <span className="entrega-ok"><Negritas texto={t('pedido.teAtiende', { sucursal: nombreSucursal(zona.sucursal), envio: dinero(zona.envio, idioma) })} /></span>
              : <span className="entrega-fuera">{t('pedido.fueraZona')} <button type="button" className="ev-enlace" onClick={() => setTipo('recoger')}>{t('pedido.recoger')} <span aria-hidden="true">→</span></button></span>))}
          </p>
        </div>
      ) : (
        <fieldset className="tipo-mensaje entrega-sucursales">
          <legend>{t('pedido.eligeSucursal')}</legend>
          <div className="tipo-mensaje-opciones">
            {paraRecoger.map(s => (
              <label key={s.id} className={recoger === s.id ? 'activo' : undefined}>
                <input type="radio" name={`${idBase}-suc`} value={s.id} checked={recoger === s.id} onChange={() => setRecoger(s.id)} />
                <span>{s.nombreCorto}</span>
              </label>
            ))}
          </div>
        </fieldset>
      )}
    </div>
  );
}
