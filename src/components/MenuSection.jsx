const MenuSection = ({ id, title, delay, children }) => {
  const delayClass = delay ? ` delay-${delay}` : '';
  return (
    <section id={id} className={`menu-section reveal reveal-up${delayClass}`}>
      <h2 className="section-heading">{title}</h2>
      <div className="menu-grid">
        {children}
      </div>
    </section>
  );
};

export default MenuSection;
