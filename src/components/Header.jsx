import { useState, useEffect, useRef } from 'react';

const Header = ({ onReservationClick, onNavigate }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [openSubDropdown, setOpenSubDropdown] = useState(null);
  const navRef = useRef(null);
  const hamburgerRef = useRef(null);

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
      document.body.style.overflow = 'hidden';
      document.body.classList.add('mobile-menu-open');
      window.scrollTo({ top: 0 });
    } else {
      document.body.style.overflow = '';
      document.body.classList.remove('mobile-menu-open');
    }
    return () => {
      document.body.style.overflow = '';
      document.body.classList.remove('mobile-menu-open');
    };
  }, [isMenuOpen]);

  return (
    <header>
      <div className="logo-link" style={{cursor:'pointer'}} onClick={() => { if (onNavigate) onNavigate('home'); }}>
        <img
          src="/img/logos/logo_chilte.png"
          alt="Chiltepin Plaza Real Logo"
          className="logo-img"
        />
      </div>
      <button
        className="hamburger"
        aria-label="Menú"
        ref={hamburgerRef}
        onClick={toggleMenu}
      >
        {isMenuOpen ? '\u2715' : '\u2630'}
      </button>
      <nav ref={navRef} className={isMenuOpen ? 'open' : ''}>
        <a href="#" onClick={e => handleNavClick(e, 'home')}>Inicio</a>
        <a href="#" onClick={e => handleNavClick(e, 'menu')}>Menú</a>

        <div className={`dropdown${openDropdown === 'horarios' ? ' open' : ''}`}>
          <button className="dropbtn" onClick={e => handleDropbtnClick(e, 'horarioyubicacion', 'horarios')}>Horarios & Ubicación</button>
          <div className="dropdown-content">
            <a href="#" onClick={e => handleNavClick(e, 'horarioyubicacion?sucursal=seafood')}>Chiltepin Plaza Real</a>
            <a href="#" onClick={e => handleNavClick(e, 'horarioyubicacion?sucursal=450')}>Chiltepin Plaza 450</a>
          </div>
        </div>

        <div className={`dropdown${openDropdown === 'delivery' ? ' open' : ''}`}>
          <button className="dropbtn" onClick={e => handleDropbtnClick(e, null, 'delivery')}>Delivery</button>
          <div className="dropdown-content">
            <div className={`sub-dropdown${openSubDropdown === 'real' ? ' open' : ''}`}>
              <button className="sub-dropbtn" onClick={e => handleSubDropbtnClick(e, 'real')}>Chiltepin Plaza Real</button>
              <div className="sub-dropdown-content">
                <a href="https://www.rappi.com.mx/restaurantes/1930107511-chiltepin-seafood" target="_blank" rel="noopener noreferrer">Rappi</a>
                <a href="https://www.didi-food.com/es-MX/food/store/5764607524473670170/?channel=10&cityId=52100200&lat=24.004475&lng=-104.653983&ddlCode=16Qms8&area=MX&lang=es-MX&appKey=dlp&redirectType=2&params=&pl=eyJwb2lJZCI6IkNoSUpQOERrSndfSW00WVJESzFBN2NEVU5TMCIsImFkZHJlc3NBbGxEaXNwbGF5IjoiTWFudWVsIEdhcmPDrWEgT2Jlc28gMzEzLCBDb2wgZGVsIFZhbGxlLCAzNDEzMCBEdXJhbmdvLCBEZ28uLCBNw6l4aWNvIiwiY2l0eSI6IkR1cmFuZ28iLCJjaXR5SWQiOjUyMTAwMjAwLCJjb3VudHJ5Q29kZSI6Ik1YIiwiY291bnRyeUlkIjo1MiwibGF0IjoyNC4wMDcxMTI0LCJsbmciOi0xMDQuNjczMzA3NCwiZGlzcGxheU5hbWUiOiJNYW51ZWwgR2FyY8OtYSBPYmVzbywgMzEzIiwiYWRkcmVzcyI6Ik1hbnVlbCBHYXJjw61hIE9iZXNvIDMxMywgQ29sIGRlbCBWYWxsZSwgMzQxMzAgRHVyYW5nbywgRGdvLiwgTcOpeGljbyIsImFkZHJlc3NBbGwiOiJNYW51ZWwgR2FyY8OtYSBPYmVzbyAzMTMsIENvbCBkZWwgVmFsbGUsIDM0MTMwIER1cmFuZ28sIERnby4sIE3DqXhpY28iLCJjb29yZGluYXRlVHlwZSI6Indnczg0IiwicG9pU3JjVGFnIjoibWFudWFsX3JnZW8iLCJzcmNUYWciOiJyZXZlcnNlZ2VvdG9wIiwic2VhcmNoSWQiOiIwYTkzYjkzNjY5ZWFkZjIyOThiZDhkZGMyMjliMjQwMiIsImRpc3RTdHIiOiIxMG0iLCJwb2lUeXBlIjoicHJlbWlzZTtzdHJlZXRfYWRkcmVzcyIsImNvdW50eUlkIjo1MjEwMDIwMSwiY291bnR5R3JvdXBJZCI6NTIxMDAyMDAwMDAxfQ%3D%3D" target="_blank" rel="noopener noreferrer">DiDi</a>
              </div>
            </div>
            <div className={`sub-dropdown${openSubDropdown === '450' ? ' open' : ''}`}>
              <button className="sub-dropbtn" onClick={e => handleSubDropbtnClick(e, '450')}>Chiltepin Plaza 450</button>
              <div className="sub-dropdown-content">
                <a href="https://www.didi-food.com/es-MX/food/store/5764610193128950278/?channel=10&cityId=52100200&lat=24.054347&lng=-104.643926&ddlCode=DGvdnr&area=MX&lang=es-MX&appKey=dlp&redirectType=2&params=&pl=eyJwb2lJZCI6IkNoSUpQOERrSndfSW00WVJESzFBN2NEVU5TMCIsImFkZHJlc3NBbGxEaXNwbGF5IjoiTWFudWVsIEdhcmPDrWEgT2Jlc28gMzEzLCBDb2wgZGVsIFZhbGxlLCAzNDEzMCBEdXJhbmdvLCBEZ28uLCBNw6l4aWNvIiwiY2l0eSI6IkR1cmFuZ28iLCJjaXR5SWQiOjUyMTAwMjAwLCJjb3VudHJ5Q29kZSI6Ik1YIiwiY291bnRyeUlkIjo1MiwibGF0IjoyNC4wMDcxMTI0LCJsbmciOi0xMDQuNjczMzA3NCwiZGlzcGxheU5hbWUiOiJNYW51ZWwgR2FyY8OtYSBPYmVzbywgMzEzIiwiYWRkcmVzcyI6Ik1hbnVlbCBHYXJjw61hIE9iZXNvIDMxMywgQ29sIGRlbCBWYWxsZSwgMzQxMzAgRHVyYW5nbywgRGdvLiwgTcOpeGljbyIsImFkZHJlc3NBbGwiOiJNYW51ZWwgR2FyY8OtYSBPYmVzbyAzMTMsIENvbCBkZWwgVmFsbGUsIDM0MTMwIER1cmFuZ28sIERnby4sIE3DqXhpY28iLCJjb29yZGluYXRlVHlwZSI6Indnczg0IiwicG9pU3JjVGFnIjoibWFudWFsX3JnZW8iLCJzcmNUYWciOiJyZXZlcnNlZ2VvdG9wIiwic2VhcmNoSWQiOiIwYTkzYjkzNjY5ZWFkZjIyOThiZDhkZGMyMjliMjQwMiIsImRpc3RTdHIiOiIxMG0iLCJwb2lUeXBlIjoicHJlbWlzZTtzdHJlZXRfYWRkcmVzcyIsImNvdW50eUlkIjo1MjEwMDIwMSwiY291bnR5R3JvdXBJZCI6NTIxMDAyMDAwMDAxfQ%3D%3D" target="_blank" rel="noopener noreferrer">DiDi</a>
              </div>
            </div>
          </div>
        </div>

        <div className={`dropdown${openDropdown === 'eventos' ? ' open' : ''}`}>
          <button className="dropbtn" onClick={e => handleDropbtnClick(e, 'eventos', 'eventos')}>Eventos</button>
          <div className="dropdown-content">
            <a href="#" onClick={e => handleNavClick(e, 'eventos?tipo=privados')}>Eventos Privados</a>
            <a href="#" onClick={e => handleNavClick(e, 'eventos?tipo=catering')}>Catering & Banquetes</a>
          </div>
        </div>

        <div className={`dropdown${openDropdown === 'acerca' ? ' open' : ''}`}>
          <button className="dropbtn" onClick={e => handleDropbtnClick(e, 'acercade', 'acerca')}>Acerca de</button>
          <div className="dropdown-content">
            <a href="#" onClick={e => handleNavClick(e, 'acercade')}>Nuestra Historia</a>
            <a href="#" onClick={e => handleNavClick(e, 'contacto')}>Contáctanos</a>
            <a href="#" onClick={e => handleNavClick(e, 'boletin')}>Boletín</a>
          </div>
        </div>

        <button className="btn-reservations res-trigger" onClick={() => { setIsMenuOpen(false); if (onReservationClick) onReservationClick(); }}>Reservaciones</button>
      </nav>
    </header>
  );
};

export default Header;
