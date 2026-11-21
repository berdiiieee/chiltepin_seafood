// Carrito del pedido a domicilio / para recoger.
// - Platillos (llave, cantidad, nota) en localStorage: sobreviven a recargar. SIN precios ni datos personales.
// - La entrega (tipo, sucursal y, si es a domicilio, la ubicación) en sessionStorage: se borra al cerrar la pestaña.
// - Nombres y precios salen en vivo del menú del panel; lo que ya no se puede pedir se quita solo.
// El total que vale es el del backend (POST /api/domicilio/cotizar); el de aquí es solo una vista previa.
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useMenu } from '../hooks/useMenu';
import { PEDIDOS_ACTIVOS } from '../config/api';
import { catalogoPedido } from '../data/pedido';
import { indiceHoy } from '../utils/horario';

const LLAVE_ITEMS = 'chiltepin-pedido';
const LLAVE_ENTREGA = 'chiltepin-entrega';
const LLAVE_ULTIMO = 'chiltepin-ultimo-pedido';
const MAX_CANTIDAD = 20;
const MAX_NOTA = 120;

function leer(almacen, llave, defecto) {
  try { const v = JSON.parse(almacen.getItem(llave)); return v ?? defecto; } catch { return defecto; }
}
function escribir(almacen, llave, valor) {
  try { valor == null ? almacen.removeItem(llave) : almacen.setItem(llave, JSON.stringify(valor)); } catch { /* sin almacenamiento */ }
}
const local = () => (typeof localStorage !== 'undefined' ? localStorage : null);
const sesion = () => (typeof sessionStorage !== 'undefined' ? sessionStorage : null);

const Contexto = createContext(null);

export const CarritoProvider = ({ children }) => {
  const { secciones, promos, estado } = useMenu();
  const [items, setItems] = useState(() => (PEDIDOS_ACTIVOS && local() ? leer(local(), LLAVE_ITEMS, []) : []));
  const [entrega, setEntrega] = useState(() => (PEDIDOS_ACTIVOS && sesion() ? leer(sesion(), LLAVE_ENTREGA, null) : null));
  const [ultimoPedido, setUltimoPedido] = useState(() => (PEDIDOS_ACTIVOS && local() ? leer(local(), LLAVE_ULTIMO, null) : null));
  const [panelAbierto, setPanelAbierto] = useState(false);

  useEffect(() => { if (PEDIDOS_ACTIVOS && local()) escribir(local(), LLAVE_ITEMS, items.length ? items : null); }, [items]);
  useEffect(() => { if (PEDIDOS_ACTIVOS && sesion()) escribir(sesion(), LLAVE_ENTREGA, entrega); }, [entrega]);
  useEffect(() => { if (PEDIDOS_ACTIVOS && local()) escribir(local(), LLAVE_ULTIMO, ultimoPedido); }, [ultimoPedido]);

  // Sin un menú real del panel no se puede pedir (el respaldo local puede tener precios viejos)
  const menuListo = estado === 'ok';
  const puedePedir = PEDIDOS_ACTIVOS && menuListo;

  const catalogo = useMemo(
    () => (menuListo ? catalogoPedido(secciones, promos, entrega?.sucursal, indiceHoy()) : new Map()),
    [menuListo, secciones, promos, entrega?.sucursal],
  );

  // Quita lo que ya no existe, se agotó o (al cambiar de sucursal) la promo que no aplica
  const [quitados, setQuitados] = useState(0);
  useEffect(() => {
    if (!menuListo || !entrega) return;
    const quedan = items.filter(it => catalogo.has(it.clave));
    if (quedan.length !== items.length) {
      setQuitados(items.length - quedan.length);
      setItems(quedan);
    }
  }, [catalogo, menuListo, entrega, items]);

  const lineas = useMemo(() => items
    .filter(it => catalogo.has(it.clave))
    .map(it => { const p = catalogo.get(it.clave); return { ...it, nombre: p.nombre, nombre_en: p.nombre_en, precio: p.precio, importe: p.precio * it.cantidad }; }),
  [items, catalogo]);
  const cantidadTotal = lineas.reduce((s, l) => s + l.cantidad, 0);
  const subtotal = lineas.reduce((s, l) => s + l.importe, 0);

  const cantidadDe = useCallback(k => items.find(it => it.clave === k)?.cantidad || 0, [items]);
  const notaDe = useCallback(k => items.find(it => it.clave === k)?.nota || '', [items]);

  const cambiar = useCallback((k, delta) => {
    setItems(prev => {
      const actual = prev.find(it => it.clave === k);
      if (!actual) {
        if (delta <= 0) return prev;
        const [tipo, id] = k.startsWith('promo:') ? ['promo', k.slice(6)] : ['platillo', k.slice(2)];
        return [...prev, { clave: k, tipo, id, cantidad: Math.min(delta, MAX_CANTIDAD), nota: '' }];
      }
      const cantidad = Math.min(actual.cantidad + delta, MAX_CANTIDAD);
      return cantidad <= 0 ? prev.filter(it => it.clave !== k) : prev.map(it => (it.clave === k ? { ...it, cantidad } : it));
    });
  }, []);
  const ponerNota = useCallback((k, nota) => {
    const limpia = String(nota).slice(0, MAX_NOTA);
    setItems(prev => prev.map(it => (it.clave === k ? { ...it, nota: limpia } : it)));
  }, []);
  const vaciar = useCallback(() => setItems([]), []);

  /** Empieza (o cambia) la entrega: { tipo: 'domicilio'|'recoger', sucursal, ubicacion?, direccionTexto?, envio?, distanciaKm? } */
  const iniciar = useCallback(datos => setEntrega(datos), []);
  /** Sale del modo pedido (el carrito se queda guardado por si vuelve). */
  const salir = useCallback(() => { setEntrega(null); setPanelAbierto(false); }, []);
  /** Pedido confirmado: guarda su enlace de seguimiento y limpia el carrito. */
  const terminar = useCallback(token => { setUltimoPedido(token); setItems([]); setEntrega(null); setPanelAbierto(false); }, []);

  const abrirPanel = useCallback(() => setPanelAbierto(true), []);
  const cerrarPanel = useCallback(() => setPanelAbierto(false), []);
  const limpiarQuitados = useCallback(() => setQuitados(0), []);
  const olvidarUltimo = useCallback(() => setUltimoPedido(null), []);

  const valor = {
    activo: PEDIDOS_ACTIVOS, puedePedir, menuListo, estadoMenu: estado,
    modoPedido: puedePedir && Boolean(entrega), entrega,
    items, lineas, cantidadTotal, subtotal, catalogo, quitados, limpiarQuitados,
    cantidadDe, notaDe, cambiar, ponerNota, vaciar, iniciar, salir, terminar,
    ultimoPedido, olvidarUltimo,
    panelAbierto, abrirPanel, cerrarPanel,
    maxNota: MAX_NOTA,
  };
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
};

export const useCarrito = () => useContext(Contexto);
