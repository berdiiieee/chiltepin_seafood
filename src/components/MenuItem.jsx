import { useState } from 'react';
import { useT } from '../context/Preferencias';

// Platillo de la carta. Sin `pedido`, el markup es el de siempre (la carta aprobada).
// Con `pedido` (Menú en modo pedido): + al final de la línea punteada, que cambia a − 1 +, y nota para cocina.
// pedido = { cantidad, nota, maxNota, onCambiar(delta), onNota(texto) }
const Contador = ({ name, pedido, t }) => (
  pedido.cantidad > 0 ? (
    <span className="pedido-ctl" role="group" aria-label={name}>
      <button type="button" onClick={() => pedido.onCambiar(-1)} aria-label={t('pedido.quitarUno', { nombre: name })}>−</button>
      <span className="pedido-cant" aria-live="polite">{pedido.cantidad}</span>
      <button type="button" onClick={() => pedido.onCambiar(1)} aria-label={t('pedido.sumarUno', { nombre: name })}>+</button>
    </span>
  ) : (
    <span className="pedido-ctl">
      <button type="button" className="pedido-agregar" onClick={() => pedido.onCambiar(1)} aria-label={t('pedido.agregar', { nombre: name })}>+</button>
    </span>
  )
);

const Nota = ({ id, pedido, t }) => {
  const [abierta, setAbierta] = useState(Boolean(pedido.nota));
  if (!abierta) {
    return <button type="button" className="pedido-nota-abrir" onClick={() => setAbierta(true)}>{t('pedido.agregarNota')}</button>;
  }
  return (
    <span className="pedido-nota">
      <label className="sr-only" htmlFor={id}>{t('pedido.nota')}</label>
      <input id={id} type="text" maxLength={pedido.maxNota} placeholder={t('pedido.notaPh')} value={pedido.nota}
        onChange={e => pedido.onNota(e.target.value)} autoFocus={!pedido.nota} />
    </span>
  );
};

const MenuItem = ({ name, desc, price, pedido, idPedido }) => {
  const { t } = useT();
  return (
    <div className={`menu-item${pedido?.cantidad ? ' en-pedido' : ''}`}>
      <div className="dish-header">
        <span className="dish-name">{name}</span>
        <span className="dish-price">{price}</span>
        {pedido && <Contador name={name} pedido={pedido} t={t} />}
      </div>
      {desc !== undefined && <p className="dish-desc">{desc}</p>}
      {pedido && pedido.cantidad > 0 && <Nota id={`nota-${idPedido}`} pedido={pedido} t={t} />}
    </div>
  );
};

export default MenuItem;
