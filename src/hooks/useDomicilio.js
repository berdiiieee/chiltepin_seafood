// Reglas del servicio a domicilio (GET /api/domicilio/config), pedidas una vez por visita,
// y si en este momento se puede pedir (horario de hoy en Durango + pausa de las sucursales).
import { useEffect, useState } from 'react';
import { configDomicilio } from '../api/pedidos';
import { PEDIDOS_ACTIVOS } from '../config/api';
import { ventanaDePedidos } from '../utils/horario';

let cache = null;
let pendiente = null;
function pedir() {
  if (!pendiente) {
    pendiente = configDomicilio()
      .then(c => { cache = c; return c; })
      .catch(e => { pendiente = null; throw e; });
  }
  return pendiente;
}

/** Ventana de hoy para una sucursal (o la más rápida si no hay sucursal). */
export function ventanaPara(config, sucursalId) {
  const suc = config?.sucursales?.find(s => s.id === sucursalId);
  const tiempos = (config?.sucursales || []).map(s => s.tiempoEstimadoMin || 45);
  return ventanaDePedidos({
    ultimoAntesDeCerrarMin: config?.ultimoAntesDeCerrarMin ?? 30,
    tiempoEstimadoMin: suc?.tiempoEstimadoMin ?? (tiempos.length ? Math.min(...tiempos) : 45),
  });
}

export function useDomicilio() {
  const [config, setConfig] = useState(cache);
  const [error, setError] = useState(false);
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!PEDIDOS_ACTIVOS || cache) return;
    let vivo = true;
    pedir().then(c => vivo && setConfig(c)).catch(() => vivo && setError(true));
    return () => { vivo = false; };
  }, []);

  // El horario cambia con el reloj: se revisa cada minuto
  useEffect(() => {
    const id = setInterval(() => setTick(x => x + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  let estado = 'cargando';
  if (!PEDIDOS_ACTIVOS) estado = 'apagado';
  else if (error) estado = 'error';
  else if (config) {
    const v = ventanaPara(config);
    const todasPausadas = (config.sucursales || []).every(s => s.pausada);
    estado = config.activo === false ? 'error' : !v.abierto ? (v.antesDeAbrir ? 'antes' : 'cerrado') : todasPausadas ? 'pausado' : 'abierto';
  }
  return { config, estado };
}
