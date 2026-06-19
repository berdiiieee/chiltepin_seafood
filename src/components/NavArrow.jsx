const NavArrow = ({ direction, onClick }) => (
  <button
    className={`nav-arrow-btn nav-arrow-btn--${direction}`}
    onClick={onClick}
    aria-label={direction === 'left' ? 'Anterior' : 'Siguiente'}
  >
    {direction === 'left' ? '<' : '>'}
  </button>
);

export default NavArrow;
