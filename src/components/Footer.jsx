import { Link } from 'react-router-dom';
import { SUCURSALES, INSTAGRAM, FACEBOOK, AVISO_PRIVACIDAD_RUTA, HORARIO, CORREO_CONTACTO, whatsappLink } from '../config/negocio';
import { formatoHora } from '../utils/horario';
import { usePreferencias } from '../context/Preferencias';

// Pie compacto en dos franjas:
// 1) marca | Plaza Real | Plaza 450 | horario y correo (cada teléfono junto a su sucursal)
// 2) enlaces en una línea | legal + idioma (ES · EN) + modo claro/oscuro
const ENLACES = [
  { to: '/menu', clave: 'nav.menu' },
  { to: '/horarios', clave: 'nav.sucursales' },
  { to: '/delivery', clave: 'nav.domicilio' },
  { to: '/eventos', clave: 'nav.eventos' },
  { to: '/acerca', clave: 'nav.historia' },
  { to: '/contacto', clave: 'nav.contacto' },
  { to: '/boletin', clave: 'nav.boletin' },
];

const trazo = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' };
const IconoSol = () => (
  <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true">
    <circle cx="12" cy="12" r="4" {...trazo} />
    <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" {...trazo} />
  </svg>
);
const IconoLuna = () => (
  <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true">
    <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" {...trazo} />
  </svg>
);

const Footer = ({ onJobClick }) => {
  const { t, idioma, setIdioma, tema, setTema } = usePreferencias();
  const wa = whatsappLink();
  const oscuro = tema !== 'claro';

  return (
    <footer className="pie">
      <div className="pie-fila">
        <div className="pie-marca">
          <Link to="/" aria-label={t('pie.inicioAria')}>
            <img src="/img/logos/logo_chilte.png" alt="Chiltepin Seafood" className="pie-logo" />
          </Link>
          <p>{t('pie.lema')}</p>
          <p className="pie-redes">
            <a href={INSTAGRAM.url} target="_blank" rel="noopener noreferrer">Instagram</a>
            <span aria-hidden="true"> · </span>
            <a href={FACEBOOK.url} target="_blank" rel="noopener noreferrer">Facebook</a>
            {wa && <><span aria-hidden="true"> · </span><a href={wa} target="_blank" rel="noopener noreferrer">WhatsApp</a></>}
          </p>
        </div>

        {SUCURSALES.map(s => (
          <div key={s.id} className="pie-sucursal">
            <p className="pie-titulo"><Link to={`/horarios/${s.id}`}>{s.nombreCorto}</Link></p>
            <p>{s.direccion[0]}<br />{s.direccion[1]}</p>
            <p className="pie-sucursal-acciones">
              <a href={s.telefonoLink} className="pie-tel">{s.telefono}</a>
              <a href={s.comoLlegar} target="_blank" rel="noopener noreferrer" className="pie-flecha">{t('comun.comoLlegar')} <span aria-hidden="true">→</span></a>
            </p>
          </div>
        ))}

        <div className="pie-sucursal">
          <p className="pie-titulo">{t('comun.horario')}</p>
          <p>{t('comun.diasServicio')}<br />{t('comun.rangoHoras', { abre: formatoHora(HORARIO.abre, idioma), cierra: formatoHora(HORARIO.cierra, idioma) })}</p>
          <p><a href={`mailto:${CORREO_CONTACTO}`} className="pie-correo">{CORREO_CONTACTO}</a></p>
        </div>
      </div>

      <div className="pie-legal">
        {/* div con role (no <nav>) para no heredar los estilos globales del navbar */}
        <div className="pie-enlaces" role="navigation" aria-label={t('pie.navAria')}>
          {ENLACES.map(e => <Link key={e.to} to={e.to}>{t(e.clave)}</Link>)}
        </div>
        <span className="pie-legal-links">
          <span>© {new Date().getFullYear()} Chiltepin Seafood</span>
          <a href="#" onClick={e => { e.preventDefault(); onJobClick?.(t('pie.bolsaMensaje')); }}>{t('pie.bolsa')}</a>
          <Link to={AVISO_PRIVACIDAD_RUTA}>{t('pie.privacidad')}</Link>
          {/* Preferencias: discretas, al final de la línea legal */}
          <span className="pie-prefs">
            <span className="pie-idioma" role="group" aria-label={t('pie.idiomaAria')}>
              <button type="button" lang="es" aria-pressed={idioma === 'es'} onClick={() => setIdioma('es')}>ES</button>
              <span aria-hidden="true">·</span>
              <button type="button" lang="en" aria-pressed={idioma === 'en'} onClick={() => setIdioma('en')}>EN</button>
            </span>
            <button
              type="button"
              className="pie-tema"
              onClick={e => {
                // El círculo del cambio de tema nace del centro de este botón
                const r = e.currentTarget.getBoundingClientRect();
                setTema(oscuro ? 'claro' : 'oscuro', { x: r.left + r.width / 2, y: r.top + r.height / 2 });
              }}
              aria-label={oscuro ? t('pie.modoClaro') : t('pie.modoOscuro')}
              title={oscuro ? t('pie.modoClaro') : t('pie.modoOscuro')}
            >
              {/* key: al cambiar, el icono nuevo entra girando */}
              <span key={tema} className="pie-tema-icono">{oscuro ? <IconoSol /> : <IconoLuna />}</span>
            </button>
          </span>
        </span>
      </div>
    </footer>
  );
};

export default Footer;
