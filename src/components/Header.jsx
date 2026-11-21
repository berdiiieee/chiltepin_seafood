import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { toPath } from '../routes';
import { SUCURSALES } from '../config/negocio';
import { useT } from '../context/Preferencias';
import { PEDIDOS_ACTIVOS } from '../config/api';

const Header = ({ onReservationClick, onNavigate }) => {
  const { t } = useT();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const navRef = useRef(null);
  const hamburgerRef = useRef(null);
  const { pathname } = useLocation();
  const [pasadoHero, setPasadoHero] = useState(false);
  const [oculta, setOculta] = useState(false);
  const ultimaY = useRef(0);

  // En el inicio el hero ya trae "Reservar mesa"; el botón de la barra aparece al bajar.
  // La barra se esconde al bajar y vuelve en cuanto subes un poco (con un margen para no parpadear).
  useEffect(() => {
    ultimaY.current = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setPasadoHero(y > window.innerHeight * 0.55);
      if (document.body.classList.contains('mobile-menu-open') || y < 10) {
        setOculta(false);
        ultimaY.current = y;
        return;
      }
      const delta = y - ultimaY.current;
      if (Math.abs(delta) < 10) return;
      setOculta(delta > 0);
      ultimaY.current = y;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const ocultarCta = pathname === '/' && !pasadoHero;
  const barraOculta = oculta && !isMenuOpen;

  // La clase en <html> deja que otras barras fijas (chips del menú) suban a ocupar su lugar
  useEffect(() => {
    document.documentElement.classList.toggle('nav-oculta', barraOculta);
  }, [barraOculta]);

  const closeAll = () => {
    setIsMenuOpen(false);
    setOpenDropdown(null);
  };

  const toggleMenu = () => {
    setIsMenuOpen(prev => !prev);
  };

  const handleNavClick = (e, page) => {
    e.preventDefault();
    if (window.innerWidth <= 1100) closeAll();
    if (onNavigate) onNavigate(page);
  };

  // El nombre de la sección siempre lleva a su página; en móvil, la flecha de al lado abre el submenú
  const handleDropbtnClick = (e, page) => {
    e.preventDefault();
    if (window.innerWidth <= 1100) closeAll();
    if (page && onNavigate) onNavigate(page);
  };

  const flechaSubmenu = (name, etiqueta) => (
    <button
      type="button"
      className="dropflecha"
      aria-label={t('nav.verOpciones', { seccion: etiqueta })}
      aria-expanded={openDropdown === name}
      onClick={e => {
        e.stopPropagation();
        setOpenDropdown(prev => (prev === name ? null : name));
      }}
    >
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
        <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );

  // Escape cierra el menú móvil
  useEffect(() => {
    if (!isMenuOpen) return;
    const onKey = e => { if (e.key === 'Escape') { closeAll(); hamburgerRef.current?.focus(); } };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isMenuOpen]);


  useEffect(() => {
    const handleClickOutside = e => {
      if (
        navRef.current &&
        hamburgerRef.current &&
        !navRef.current.contains(e.target) &&
        !hamburgerRef.current.contains(e.target)
      ) {
        closeAll();
      }
    };
    if (isMenuOpen) document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMenuOpen]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1100) closeAll();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.width = '100%';
      document.body.classList.add('mobile-menu-open');
    } else {
      const scrollY = parseInt(document.body.style.top || '0', 10) * -1;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.width = '';
      document.body.classList.remove('mobile-menu-open');
      window.scrollTo({ top: scrollY });
      ultimaY.current = scrollY; // regresar a la posición no cuenta como "bajar"
    }
    return () => {
      const scrollY = parseInt(document.body.style.top || '0', 10) * -1;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.width = '';
      document.body.classList.remove('mobile-menu-open');
      if (scrollY) window.scrollTo({ top: scrollY });
    };
  }, [isMenuOpen]);

  return (
    <header className={barraOculta ? 'oculta' : ''} onFocus={() => setOculta(false)}>
      <a className="logo-link" href="/" title={t('nav.logoTitulo')} aria-label={t('nav.logoAria')} onClick={e => handleNavClick(e, 'home')}>
        <img
          src="/img/logos/logo_chilte.png"
          alt="Chiltepin Seafood"
          className="logo-img"
          draggable="false"
        />
      </a>
      <button
        type="button"
        className={`hamburger${isMenuOpen ? ' abierta' : ''}`}
        aria-label={isMenuOpen ? t('nav.cerrarMenu') : t('nav.abrirMenu')}
        aria-expanded={isMenuOpen}
        ref={hamburgerRef}
        onClick={toggleMenu}
      >
        {/* Tres l\u00edneas que se cruzan en una X al abrir */}
        <span className="hamburger-lineas" aria-hidden="true"><span /><span /><span /></span>
      </button>
      <nav ref={navRef} className={isMenuOpen ? 'open' : ''}>
        <a href={toPath('home')} onClick={e => handleNavClick(e, 'home')}>{t('nav.inicio')}</a>
        <a href={toPath('menu')} onClick={e => handleNavClick(e, 'menu')}>{t('nav.menu')}</a>

        <div className={`dropdown${openDropdown === 'horarios' ? ' open' : ''}`}>
          <div className="dropfila">
            <button className="dropbtn" onClick={e => handleDropbtnClick(e, 'horarioyubicacion')}>{t('nav.sucursales')}</button>
            {flechaSubmenu('horarios', t('nav.sucursales'))}
          </div>
          <div className="dropdown-content">
            <a href={toPath('horarioyubicacion?sucursal=seafood')} onClick={e => handleNavClick(e, 'horarioyubicacion?sucursal=seafood')}>Chiltepin Plaza Real</a>
            <a href={toPath('horarioyubicacion?sucursal=450')} onClick={e => handleNavClick(e, 'horarioyubicacion?sucursal=450')}>Chiltepin Plaza 450</a>
          </div>
        </div>

        <div className={`dropdown${openDropdown === 'delivery' ? ' open' : ''}`}>
          <div className="dropfila">
            <button className="dropbtn" onClick={e => handleDropbtnClick(e, 'delivery')}>{t('nav.domicilio')}</button>
            {flechaSubmenu('delivery', t('nav.domicilio'))}
          </div>
          <div className="dropdown-content">
            {/* Con pedidos propios: primero el servicio de la casa; las apps quedan abajo, como segunda opción */}
            {PEDIDOS_ACTIVOS && (
              <>
                <a href={toPath('delivery')} onClick={e => handleNavClick(e, 'delivery')}>{t('pedido.navPedir')}</a>
                <a href={toPath('delivery?tipo=recoger')} onClick={e => handleNavClick(e, 'delivery?tipo=recoger')}>{t('pedido.navRecoger')}</a>
                <span className="dropdown-separador">{t('pedido.navApps')}</span>
              </>
            )}
            {SUCURSALES.flatMap(s => s.delivery.map(d => (
              <a key={`${s.id}-${d.app}`} href={d.url} target="_blank" rel="noopener noreferrer" onClick={closeAll}>
                {s.nombreCorto} · {d.app}
              </a>
            )))}
          </div>
        </div>

        <div className={`dropdown${openDropdown === 'eventos' ? ' open' : ''}`}>
          <div className="dropfila">
            <button className="dropbtn" onClick={e => handleDropbtnClick(e, 'eventos')}>{t('nav.eventos')}</button>
            {flechaSubmenu('eventos', t('nav.eventos'))}
          </div>
          <div className="dropdown-content">
            <a href={toPath('eventos?tipo=privados')} onClick={e => handleNavClick(e, 'eventos?tipo=privados')}>{t('nav.eventosPrivados')}</a>
            <a href={toPath('eventos?tipo=catering')} onClick={e => handleNavClick(e, 'eventos?tipo=catering')}>{t('nav.catering')}</a>
          </div>
        </div>

        <div className={`dropdown${openDropdown === 'acerca' ? ' open' : ''}`}>
          <div className="dropfila">
            <button className="dropbtn" onClick={e => handleDropbtnClick(e, 'acercade')}>{t('nav.acerca')}</button>
            {flechaSubmenu('acerca', t('nav.acerca'))}
          </div>
          <div className="dropdown-content">
            <a href={toPath('acercade')} onClick={e => handleNavClick(e, 'acercade')}>{t('nav.historiaMenu')}</a>
            <a href={toPath('contacto')} onClick={e => handleNavClick(e, 'contacto')}>{t('nav.contactanos')}</a>
            <a href={toPath('boletin')} onClick={e => handleNavClick(e, 'boletin')}>{t('nav.boletin')}</a>
          </div>
        </div>

        <button className={`btn-reservations res-trigger${ocultarCta ? ' cta-oculto' : ''}`} onClick={() => { setIsMenuOpen(false); if (onReservationClick) onReservationClick(); }}>{t('nav.reservar')}</button>

        {/* Solo en el menú móvil: el teléfono de cada sucursal, listo para tocar */}
        <div className="nav-movil-tels">
          {SUCURSALES.map(s => (
            <a key={s.id} href={s.telefonoLink} className="nav-movil-tel">
              <span>{s.nombreCorto}</span>{s.telefono}
            </a>
          ))}
        </div>
      </nav>
    </header>
  );
};

export default Header;
