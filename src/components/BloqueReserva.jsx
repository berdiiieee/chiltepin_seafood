import { Link } from 'react-router-dom';
import { useT } from '../context/Preferencias';

// Franja roja con la acción principal. Jerarquía: Reservar > Menú > Eventos/Delivery.
// `secundario` ({ pregunta, texto, to }) añade una línea discreta bajo el botón (p. ej. "Te lo llevamos →").
const BloqueReserva = ({ onReservationClick, titulo, texto, secundario }) => {
  const { t } = useT();
  const tituloFinal = titulo ?? t('bloqueReserva.titulo');
  const textoFinal = texto ?? t('bloqueReserva.texto');
  return (
    <section className="bloque-reserva reveal reveal-up" aria-label={t('bloqueReserva.aria')}>
      <div className="container bloque-reserva-in">
        <div>
          <h2 className="bloque-reserva-titulo" style={textoFinal ? undefined : { margin: 0 }}>{tituloFinal}</h2>
          {textoFinal && <p className="bloque-reserva-texto">{textoFinal}</p>}
        </div>
        <div className="bloque-reserva-acciones">
          <button type="button" className="btn-blanco" onClick={() => onReservationClick(null)}>{t('comun.reservarMesa')}</button>
          {secundario && (
            <p className="bloque-reserva-extra">
              {secundario.pregunta}{' '}
              <Link to={secundario.to}>{secundario.texto} <span aria-hidden="true">→</span></Link>
            </p>
          )}
        </div>
      </div>
    </section>
  );
};

export default BloqueReserva;
