import { HORARIO, RESERVACIONES } from '../config/negocio';

// Durango usa el horario del centro sin cambio de horario de verano.
const ZONA_DURANGO = 'America/Monterrey';

/** Minutos desde la medianoche para una hora "HH:MM". */
export function aMinutos(hora) {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + m;
}

function deMinutos(minutos) {
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/** "19:30" -> "7:30 p. m." (en inglés: "7:30 PM") */
export function formatoHora(hora, idioma = 'es') {
  const [h, m] = hora.split(':').map(Number);
  const sufijo = idioma === 'en' ? (h >= 12 ? 'PM' : 'AM') : (h >= 12 ? 'p. m.' : 'a. m.');
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${sufijo}`;
}

/** Fecha (YYYY-MM-DD) y minutos actuales en Durango, sin importar la zona del visitante. */
export function ahoraEnDurango(fecha = new Date()) {
  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: ZONA_DURANGO,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(fecha);
  const valor = (tipo) => partes.find(p => p.type === tipo)?.value ?? '00';
  return {
    fecha: `${valor('year')}-${valor('month')}-${valor('day')}`,
    minutos: Number(valor('hour')) * 60 + Number(valor('minute')),
  };
}

/** Abierto/cerrado ahora en Durango. Devuelve claves de texto (estado.*) para traducir en el componente. */
export function estadoHorario(fecha = new Date()) {
  const { minutos } = ahoraEnDurango(fecha);
  const abre = aMinutos(HORARIO.abre);
  const cierra = aMinutos(HORARIO.cierra);
  if (minutos >= abre && minutos < cierra) {
    return { abierto: true, titulo: 'estado.abierto', detalle: 'estado.cerramosA', hora: HORARIO.cierra };
  }
  return { abierto: false, titulo: 'estado.cerrado', detalle: minutos < abre ? 'estado.abrimosHoy' : 'estado.abrimosManana', hora: HORARIO.abre };
}

/** "Lunes a domingo, de 11:30 a. m. a 7:30 p. m." en el idioma pedido */
export function textoHorario(t, idioma) {
  return t('comun.horarioTexto', { abre: formatoHora(HORARIO.abre, idioma), cierra: formatoHora(HORARIO.cierra, idioma) });
}

/** Horas en las que se puede reservar: desde que abre hasta una hora antes de cerrar. */
export function horasDeReservacion() {
  const inicio = aMinutos(HORARIO.abre);
  const fin = aMinutos(HORARIO.cierra) - RESERVACIONES.ultimaAntesDeCerrarMin;
  const horas = [];
  for (let m = inicio; m <= fin; m += RESERVACIONES.intervaloMin) horas.push(deMinutos(m));
  return horas;
}

/** Fecha de hoy YYYY-MM-DD según la hora LOCAL del visitante (no UTC). */
export function hoyLocal() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

/** "2026-11-18" -> "miércoles 18 de noviembre" (en inglés: "Wednesday, November 18") */
export function formatoFechaLarga(fechaIso, idioma = 'es') {
  const [y, m, d] = fechaIso.split('-').map(Number);
  return new Intl.DateTimeFormat(idioma === 'en' ? 'en-US' : 'es-MX', { weekday: 'long', day: 'numeric', month: 'long' }).format(
    new Date(y, m - 1, d),
  );
}
