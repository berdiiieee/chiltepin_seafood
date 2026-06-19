const MenuItem = ({ name, desc, price }) => (
  <div className="menu-item">
    <div className="dish-header">
      <span className="dish-name">{name}</span>
      <span className="dish-price">{price}</span>
    </div>
    {desc !== undefined && <p className="dish-desc">{desc}</p>}
  </div>
);

export default MenuItem;
