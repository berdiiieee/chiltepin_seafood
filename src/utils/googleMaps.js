// Google Maps (solo para ubicar la dirección de entrega). Se carga bajo demanda, nunca en las demás páginas.
// La llave es PÚBLICA (VITE_GOOGLE_MAPS_KEY): en Google Cloud restríngela al dominio del sitio y a
// "Maps JavaScript API" + "Places API (New)", y ponle alerta de presupuesto.
import { GOOGLE_MAPS_KEY, PEDIDOS } from '../config/api';
import { SUCURSALES } from '../config/negocio';

export const CENTRO_DURANGO = { lat: 24.0277, lng: -104.6532 };
export const hayGoogleMaps = Boolean(GOOGLE_MAPS_KEY);

let carga = null;
export function cargarGoogleMaps(idioma = 'es') {
  if (!GOOGLE_MAPS_KEY) return Promise.reject(new Error('Sin llave de Google Maps'));
  if (window.google?.maps?.importLibrary) return Promise.resolve(window.google.maps);
  if (!carga) {
    carga = new Promise((resolve, reject) => {
      const cb = '__chiltepinMaps';
      window[cb] = () => { delete window[cb]; resolve(window.google.maps); };
      const s = document.createElement('script');
      const q = new URLSearchParams({ key: GOOGLE_MAPS_KEY, v: 'weekly', loading: 'async', callback: cb, language: idioma, region: 'MX' });
      s.src = `https://maps.googleapis.com/maps/api/js?${q}`;
      s.async = true;
      s.onerror = () => { carga = null; reject(new Error('No cargó Google Maps')); };
      document.head.appendChild(s);
    });
  }
  return carga;
}

/** Sugerencias de dirección (Places API New) cerca de Durango: [{ texto, prediccion }] */
export async function sugerencias(texto, sesion) {
  const maps = await cargarGoogleMaps();
  const { AutocompleteSuggestion } = await maps.importLibrary('places');
  const { suggestions } = await AutocompleteSuggestion.fetchAutocompleteSuggestions({
    input: texto,
    sessionToken: sesion,
    includedRegionCodes: ['mx'],
    locationBias: { center: CENTRO_DURANGO, radius: 15000 },
  });
  return suggestions.filter(s => s.placePrediction).slice(0, 5).map(s => ({ texto: s.placePrediction.text.toString(), prediccion: s.placePrediction }));
}

export async function nuevaSesion() {
  const maps = await cargarGoogleMaps();
  const { AutocompleteSessionToken } = await maps.importLibrary('places');
  return new AutocompleteSessionToken();
}

/** Lugar elegido -> { ubicacion: {lat, lng}, texto, calle, colonia } */
export async function detalleLugar(prediccion) {
  const lugar = prediccion.toPlace();
  await lugar.fetchFields({ fields: ['location', 'formattedAddress', 'addressComponents'] });
  const comp = tipo => lugar.addressComponents?.find(c => c.types.includes(tipo))?.longText || '';
  const calle = [comp('route'), comp('street_number')].filter(Boolean).join(' ');
  return {
    ubicacion: { lat: lugar.location.lat(), lng: lugar.location.lng() },
    texto: lugar.formattedAddress,
    calle,
    colonia: comp('sublocality_level_1') || comp('sublocality') || comp('neighborhood'),
  };
}

// DEMO sin llave de Google: una ubicación inventada (pero estable) cerca de una sucursal, para poder
// probar la zona de entrega. Si el texto dice "lejos", cae fuera de zona.
export function ubicacionSimulada(texto) {
  if (PEDIDOS !== 'demo') return null;
  let h = 0;
  for (const c of texto) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  if (/lejos|far/i.test(texto)) return { lat: CENTRO_DURANGO.lat + 0.2, lng: CENTRO_DURANGO.lng };
  const base = h % 2 ? { lat: 24.00465, lng: -104.65695 } : { lat: 24.0543, lng: -104.64658 };
  const ang = (h % 360) * (Math.PI / 180), km = 0.5 + (h % 40) / 10; // 0.5–4.4 km
  return { lat: base.lat + (km / 111) * Math.cos(ang), lng: base.lng + (km / 101) * Math.sin(ang) };
}

export const nombreSucursal = id => SUCURSALES.find(s => s.id === id)?.nombreCorto || '';
