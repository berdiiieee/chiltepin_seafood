import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { toPath } from '../routes';
import { SUCURSALES } from '../config/negocio';
import { useT } from '../context/Preferencias';

const Header = ({ onReservationClick, onNavigate }) => {
  const { t } = useT();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [openSubDropdown, setOpenSubDropdown] = useState(null);
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
    setOpenSubDropdown(null);
  };

  const toggleMenu = () => {
    setIsMenuOpen(prev => !prev);
  };

  const handleNavClick = (e, page) => {
    e.preventDefault();
    if (window.innerWidth <= 1100) closeAll();
    if (onNavigate) onNavigate(page);
  };

  const handleDropbtnClick = (e, page, name) => {
    if (window.innerWidth <= 1100) {
      e.preventDefault();
      e.stopPropagation();
      setOpenSubDropdown(null);
      setOpenDropdown(prev => (prev === name ? null : name));
    } else if (page && onNavigate) {
      e.preventDefault();
      onNavigate(page);
    }
  };

  const handleSubDropbtnClick = (e, name) => {
    if (window.innerWidth <= 1100) {
      e.preventDefault();
      e.stopPropagation();
      setOpenSubDropdown(prev => (prev === name ? null : name));
    }
  };

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
      <a className="logo-link" href="/" aria-label={t('nav.logoAria')} onClick={e => handleNavClick(e, 'home')}>
        <img
          src="/img/logos/logo_chilte.png"
          alt="Chiltepin Seafood"
          className="logo-img"
        />
      </a>
      <button
        className="hamburger"
        aria-label={t('nav.abrirMenu')}
        aria-expanded={isMenuOpen}
        ref={hamburgerRef}
        onClick={toggleMenu}
      >
        {isMenuOpen ? '\u2715' : '\u2630'}
      </button>
      <nav ref={navRef} className={isMenuOpen ? 'open' : ''}>
        <a href={toPath('home')} onClick={e => handleNavClick(e, 'home')}>{t('nav.inicio')}</a>
        <a href={toPath('menu')} onClick={e => handleNavClick(e, 'menu')}>{t('nav.menu')}</a>

        <div className={`dropdown${openDropdown === 'horarios' ? ' open' : ''}`}>
          <button className="dropbtn" onClick={e => handleDropbtnClick(e, 'horarioyubicacion', 'horarios')}>{t('nav.sucursales')}</button>
          <div className="dropdown-content">
            <a href={toPath('horarioyubicacion?sucursal=seafood')} onClick={e => handleNavClick(e, 'horarioyubicacion?sucursal=seafood')}>Chiltepin Plaza Real</a>
            <a href={toPath('horarioyubicacion?sucursal=450')} onClick={e => handleNavClick(e, 'horarioyubicacion?sucursal=450')}>Chiltepin Plaza 450</a>
          </div>
        </div>

        <div className={`dropdown${openDropdown === 'delivery' ? ' open' : ''}`}>
          <button className="dropbtn" onClick={e => handleDropbtnClick(e, 'delivery', 'delivery')}>{t('nav.domicilio')}</button>
          <div className="dropdown-content">
            {SUCURSALES.flatMap(s => s.delivery.map(d => (
              <a key={`${s.id}-${d.app}`} href={d.url} target="_blank" rel="noopener noreferrer" onClick={closeAll}>
                {s.nombreCorto} · {d.app}
              </a>
            )))}
          </div>
        </div>

        <div className={`dropdown${openDropdown === 'eventos' ? ' open' : ''}`}>
          <button className="dropbtn" onClick={e => handleDropbtnClick(e, 'eventos', 'eventos')}>{t('nav.eventos')}</button>
          <div className="dropdown-content">
            <a href={toPath('eventos?tipo=privados')} onClick={e => handleNavClick(e, 'eventos?tipo=privados')}>{t('nav.eventosPrivados')}</a>
            <a href={toPath('eventos?tipo=catering')} onClick={e => handleNavClick(e, 'eventos?tipo=catering')}>{t('nav.catering')}</a>
          </div>
        </div>

        <div className={`dropdown${openDropdown === 'acerca' ? ' open' : ''}`}>
          <button className="dropbtn" onClick={e => handleDropbtnClick(e, 'acercade', 'acerca')}>{t('nav.acerca')}</button>
          <div className="dropdown-content">
            <a href={toPath('acercade')} onClick={e => handleNavClick(e, 'acercade')}>{t('nav.historiaMenu')}</a>
            <a href={toPath('contacto')} onClick={e => handleNavClick(e, 'contacto')}>{t('nav.contactanos')}</a>
            <a href={toPath('boletin')} onClick={e => handleNavClick(e, 'boletin')}>{t('nav.boletin')}</a>
          </div>
        </div>

        <button className={`btn-reservations res-trigger${ocultarCta ? ' cta-oculto' : ''}`} onClick={() => { setIsMenuOpen(false); if (onReservationClick) onReservationClick(); }}>{t('nav.reservar')}</button>
      </nav>
    </header>
  );
};

export default Header;
