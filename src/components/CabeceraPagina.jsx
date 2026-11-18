import { Link } from 'react-router-dom';
import { useT } from '../context/Preferencias';

// Cabecera única de páginas internas: eyebrow, título Anton, ornamento de trazo que se dibuja e intro.
// `siguiente` ({ to, nombre, lado: 'der' | 'izq' }) añade una flecha discreta junto al título
// (p. ej. ida y vuelta entre sucursales: → en la primera, ← en la segunda).
const CabeceraPagina = ({ eyebrow, titulo, intro, divisor = false, siguiente, children }) => {
  const izq = siguiente?.lado === 'izq';
  const { t } = useT();
  return (
  <div className="cabecera-pagina container">
    {eyebrow && <p className="eyebrow cabecera-eyebrow">{eyebrow}</p>}
    <div className="cabecera-titulo-fila">
      <h1 className="titulo-seccion cabecera-titulo">{titulo}</h1>
      {siguiente && (
        <Link to={siguiente.to} className={`cabecera-siguiente${izq ? ' izq' : ''}`} aria-label={t('sucursales.verOtra', { nombre: siguiente.nombre })}>
          <svg viewBox="0 0 32 32" width="30" height="30" aria-hidden="true">
            <path d={izq ? 'M26 16H6M14 8l-8 8 8 8' : 'M6 16h20M18 8l8 8-8 8'} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="cabecera-siguiente-nombre">{siguiente.nombre}</span>
        </Link>
      )}
    </div>
    <div className="cabecera-orn" aria-hidden="true">
      <span className="cabecera-linea" />
      <svg viewBox="0 0 32 32" width="26" height="26">
        <path d="M21 8c4 2 6 7 3 12-3 5-9 7-16 6 7-1 11-5 12-10 .5-3-.5-5-3-6M21 8c0-2 1-3 3-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="cabecera-linea" />
    </div>
    {intro && <p className="cabecera-intro">{intro}</p>}
    {children}
    {divisor && <hr className="cabecera-divisor" />}
  </div>
  );
};

export default CabeceraPagina;
