import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import CabeceraPagina from '../components/CabeceraPagina';
import SelectorEntrega from '../components/SelectorEntrega';
import Negritas from '../i18n/Negritas';
import { SUCURSALES, HORARIO } from '../config/negocio';
import { useT } from '../context/Preferencias';
import { useCarrito } from '../context/Carrito';
import { useDomicilio } from '../hooks/useDomicilio';
import { formatoHora } from '../utils/horario';

// Mismo trazo que los sellos de "Del mar a tu mesa" y del detalle de sucursal.
const trazo = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' };
const IconoPin = () => (<svg viewBox="0 0 32 32" width="30" height="30" aria-hidden="true"><path d="M16 28s9-8.2 9-15a9 9 0 0 0-18 0c0 6.8 9 15 9 15z" {...trazo} /><circle cx="16" cy="13" r="3.2" {...trazo} /></svg>);
const Flecha = () => <span aria-hidden="true">→</span>;

// Las apps de cada sucursal (Rappi, DiDi). Con pedidos propios quedan como segunda opción.
const EnlacesApps = ({ t }) => SUCURSALES.flatMap(s => s.delivery.map(d => (
  <a key={s.id + d.app} className="suc-dato-enlace" href={d.url} target="_blank" rel="noopener noreferrer"
    aria-label={`${d.app}, ${s.nombreCorto} ${t('comun.nuevaPestana')}`}>
    {d.app} <span className="delivery-apps-suc">{s.nombreCorto}</span> <Flecha />
  </a>
)));

// Sin pedidos propios (VITE_PEDIDOS=off): la página de siempre, con las apps de cada sucursal.
const SoloApps = ({ t }) => (
  <section className="home-seccion home-nosotros suc-principal delivery-bloque">
    <div className="nosotros-texto reveal reveal-up">
      <p className="eyebrow">{t('domicilio.pideAhora')}</p>
      <h2 className="titulo-seccion">{t('domicilio.desdeDonde')}</h2>
      <p className="intro-text">{t('domicilio.texto')}</p>
      <ul className="sellos suc-datos">
        {SUCURSALES.map(s => (
          <li key={s.id}>
            <IconoPin />
            <strong>{s.nombreCorto}</strong>
            <span className="suc-dato-apps delivery-apps">
              {s.delivery.map(d => (
                <a key={d.app} className="suc-dato-enlace" href={d.url} target="_blank" rel="noopener noreferrer"
                  aria-label={`${d.app}, ${s.nombreCorto} ${t('comun.nuevaPestana')}`}>
                  {d.app} <Flecha />
                </a>
              ))}
            </span>
          </li>
        ))}
      </ul>
    </div>
    <div className="delivery-foto reveal reveal-up delay-2">
      <img src="/img/menu/img_menu.jpg" alt={t('domicilio.fotoAlt')} />
    </div>
  </section>
);

const Telefonos = () => (
  <span className="pedir-telefonos">
    {SUCURSALES.map(s => <a key={s.id} href={s.telefonoLink}>{s.nombreCorto} · {s.telefono}</a>)}
  </span>
);

const IconoPaso = ({ n }) => {
  const iconos = [
    <><path d="M9 7h14M9 13h14M9 19h9" {...trazo} /><circle cx="5" cy="7" r="1" {...trazo} /><circle cx="5" cy="13" r="1" {...trazo} /><circle cx="5" cy="19" r="1" {...trazo} /></>,
    <><path d="M16 28s9-8.2 9-15a9 9 0 0 0-18 0c0 6.8 9 15 9 15z" {...trazo} /><circle cx="16" cy="13" r="3.2" {...trazo} /></>,
    <><path d="M6 17l6 6 14-14" {...trazo} /></>,
  ];
  return <svg viewBox="0 0 32 32" width="30" height="30" aria-hidden="true">{iconos[n]}</svg>;
};

const ConPedidos = () => {
  const { t, idioma } = useT();
  const carrito = useCarrito();
  const { config, estado } = useDomicilio();
  const [entrega, setEntrega] = useState(null);
  // ?tipo=recoger (desde el navbar) abre directo en "Paso a recoger"
  const [params] = useSearchParams();
  const tipoUrl = params.get('tipo') === 'recoger' ? 'recoger' : '';
  const inicial = tipoUrl ? { ...(carrito.entrega?.tipo === tipoUrl ? carrito.entrega : {}), tipo: tipoUrl } : carrito.entrega;

  const mensaje = {
    cargando: t('pedido.cargando'),
    antes: t('pedido.antesDeAbrir', { hora: formatoHora(HORARIO.abre, idioma) }),
    cerrado: t('pedido.yaCerramos', { hora: formatoHora(HORARIO.abre, idioma) }),
    pausado: t('pedido.pausado'),
  }[estado];
  const sinMenu = estado === 'abierto' && carrito.estadoMenu === 'fallback';
  const sinServicio = estado === 'error' || sinMenu;
  const listo = estado === 'abierto' && carrito.puedePedir;
  const texto = sinServicio ? null : (estado === 'abierto' ? t('pedido.cargando') : mensaje);

  return (
    <>
      <section className="home-seccion home-nosotros suc-principal delivery-bloque pedir-bloque">
        <div className="nosotros-texto reveal reveal-up">
          <p className="eyebrow">{t('domicilio.pideAhora')}</p>
          <h2 className="titulo-seccion">{t('pedido.comoLoQuieres')}</h2>

          {carrito.ultimoPedido && (
            <p className="pedir-en-curso">
              <Link className="link-flecha" to={`/delivery/seguimiento/${carrito.ultimoPedido}`}>{t('pedido.verMiPedido')} <Flecha /></Link>
            </p>
          )}

          {listo ? (
            <>
              <SelectorEntrega key={tipoUrl} config={config} inicial={inicial} onCambio={setEntrega} idBase="portada" />
              <div className="form-abierto-acciones">
                {/* El enlace global navega antes de cualquier onClick: sin entrega, un botón deshabilitado */}
                {entrega ? (
                  <Link to="/menu" className="btn-principal" onClick={() => carrito.iniciar(entrega)}>
                    {t('pedido.verCarta')} <Flecha />
                  </Link>
                ) : (
                  <button type="button" className="btn-principal" disabled>{t('pedido.verCarta')} <Flecha /></button>
                )}
              </div>
            </>
          ) : (
            <output className="pedir-estado">
              {sinServicio ? <>{t(sinMenu ? 'pedido.sinMenu' : 'pedido.sinServicio')} <Telefonos /></> : texto}
            </output>
          )}
        </div>

        <div className="delivery-foto reveal reveal-up delay-2">
          <img src="/img/menu/img_menu.jpg" alt={t('domicilio.fotoAlt')} />
        </div>
      </section>

      <section className="home-seccion pedir-como">
        <div className="seccion-cabecera reveal reveal-up">
          <div>
            <p className="eyebrow">{t('domicilio.eyebrow')}</p>
            <h2 className="titulo-seccion">{t('pedido.comoFunciona')}</h2>
          </div>
        </div>
        <ol className="ev-pasos pedir-pasos reveal">
          {[1, 2, 3].map((n, i) => (
            <li key={n} style={{ '--i': i }}>
              <span className="ev-paso-icono"><IconoPaso n={i} /></span>
              <span><strong>{t(`pedido.paso${n}Titulo`)}</strong>{t(`pedido.paso${n}`)}</span>
            </li>
          ))}
        </ol>
      </section>

      <p className="pedir-apps">
        <Negritas texto={t('pedido.tambienEn')} /> <EnlacesApps t={t} />
      </p>
    </>
  );
};

const DeliveryPage = () => {
  const { t } = useT();
  const { activo } = useCarrito();
  return (
    <main className="container">
      <CabeceraPagina eyebrow={t('domicilio.eyebrow')} titulo={t('domicilio.titulo')} intro={t('domicilio.intro')} divisor />
      {activo ? <ConPedidos /> : <SoloApps t={t} />}
    </main>
  );
};

export default DeliveryPage;
