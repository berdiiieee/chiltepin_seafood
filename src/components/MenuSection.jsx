const MenuSection = ({ id, title, icono, children }) => (
  <section id={id} className="menu-section">
    <h2 className="section-heading">
      {icono && <svg className="seccion-ico" viewBox="0 0 24 24" width="30" height="30" aria-hidden="true">{icono}</svg>}
      {title}
    </h2>
    <div className="menu-grid">{children}</div>
  </section>
);

export default MenuSection;
