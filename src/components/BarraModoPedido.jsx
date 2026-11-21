// Franja delgada bajo la cabecera del Menú en modo pedido: para quién es el pedido, cambiar o salir.
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useT } from '../context/Preferencias';
import { useCarrito } from '../context/Carrito';
import { nombreSucursal } from '../utils/googleMaps';

export default function BarraModoPedido() {
  const { t } = useT();
  const c = useCarrito();
  const { entrega, quitados, limpiarQuitados } = c;

  // El aviso de "quitamos algo" se va solo
  useEffect(() => {
    if (!quitados) return;
    const id = setTimeout(limpiarQuitados, 6000);
    return () => clearTimeout(id);
  }, [quitados, limpiarQuitados]);

  if (!entrega) return null;
  const sucursal = nombreSucursal(entrega.sucursal);
  return (
    <div className="modo-pedido">
      <p className="modo-pedido-texto">
        {t('pedido.pidiendo', { tipo: t(entrega.tipo === 'domicilio' ? 'pedido.tipoDomicilio' : 'pedido.tipoRecoger'), sucursal })}
        <span className="modo-pedido-promos">{t('pedido.promosHoy', { sucursal })}</span>
      </p>
      <span className="modo-pedido-acciones">
        <Link to="/delivery" className="ev-enlace">{t('pedido.cambiar')}</Link>
        <button type="button" className="ev-enlace" onClick={c.salir}>{t('pedido.salir')}</button>
      </span>
      {quitados > 0 && <p className="modo-pedido-aviso" role="status">{t('pedido.quitados')}</p>}
    </div>
  );
}
