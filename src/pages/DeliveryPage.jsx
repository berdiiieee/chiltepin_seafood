import CabeceraPagina from '../components/CabeceraPagina';
import { SUCURSALES } from '../config/negocio';
import { useT } from '../context/Preferencias';

// Mismo trazo que los sellos de "Del mar a tu mesa" y del detalle de sucursal.
const trazo = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' };
const IconoPin = () => (<svg viewBox="0 0 32 32" width="30" height="30" aria-hidden="true"><path d="M16 28s9-8.2 9-15a9 9 0 0 0-18 0c0 6.8 9 15 9 15z" {...trazo} /><circle cx="16" cy="13" r="3.2" {...trazo} /></svg>);
const Flecha = () => <span aria-hidden="true">→</span>;

// Página corta: las apps de cada sucursal. Dirección, horario y promos viven en Sucursales.
const DeliveryPage = () => {
  const { t } = useT();
  return (
  <main className="container">
    <CabeceraPagina eyebrow={t('domicilio.eyebrow')} titulo={t('domicilio.titulo')} intro={t('domicilio.intro')} divisor />

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
                  <a
                    key={d.app}
                    className="suc-dato-enlace"
                    href={d.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${d.app}, ${s.nombreCorto} ${t('comun.nuevaPestana')}`}
                  >
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
  </main>
  );
};

export default DeliveryPage;
