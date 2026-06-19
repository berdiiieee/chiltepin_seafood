const Footer = ({ onJobClick, onNavigate }) => {
  const handleJobClick = e => {
    e.preventDefault();
    if (onJobClick) {
      onJobClick('Actualmente no estamos buscando empleados.');
    }
    return false;
  };

  const handleNavClick = (e, page) => {
    e.preventDefault();
    if (onNavigate) onNavigate(page);
  };

  return (
    <footer>
      <hr className="divider" />
      <div className="footer-grid">
        <div className="footer-col">
          <h4>Ubicaciones</h4>
          <a href="#" onClick={e => handleNavClick(e, 'horarioyubicacion?sucursal=seafood')}>Chiltepin Plaza Real</a>
          <a href="#" onClick={e => handleNavClick(e, 'horarioyubicacion?sucursal=450')}>Chiltepin Plaza 450</a>
        </div>

        <div className="footer-col">
          <h4>Contacto</h4>
          <p><strong>Teléfono:</strong></p>
          <p><a href="tel:6182003865">618.200.3865</a></p>
          <br />
          <p><strong>Correo:</strong></p>
          <p>info@chiltepin.com</p>
          <a href="https://www.instagram.com/chiltepinseafood/" target="_blank" rel="noopener noreferrer">Instagram</a>
          <a href="https://www.facebook.com/Chiltepinseafood/?locale=es_LA" target="_blank" rel="noopener noreferrer">Facebook</a>
        </div>

        <div className="footer-col">
          <h4>Reservaciones</h4>
          <a href="#" onClick={e => handleNavClick(e, 'eventos?tipo=catering')}>Catering &amp; Banquetes</a>
          <a href="#" onClick={e => handleNavClick(e, 'eventos?tipo=privados')}>Eventos Privados</a>
        </div>

        <div className="footer-col">
          <h4>Bolsa de Trabajo</h4>
          <a href="#" onClick={handleJobClick}>Únete a nuestro equipo</a>
        </div>

        <div className="newsletter">
          <a href="#" className="btn-newsletter" onClick={e => handleNavClick(e, 'boletin')}>Suscríbete al Boletín</a>
        </div>
      </div>

      <p className="credits">Desarrollado para Chiltepin Seafood</p>
    </footer>
  );
};

export default Footer;
