import { useEffect, useMemo, useState } from 'react';
import { get } from '../api/client';

const CACHE_PREFIX = 'chiltepin:imagenes:';

function leerCache(seccion) {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + seccion);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function guardarCache(seccion, imagenes) {
  try {
    localStorage.setItem(CACHE_PREFIX + seccion, JSON.stringify(imagenes));
  } catch { /* almacenamiento no disponible */ }
}

/**
 * Combina las imágenes subidas desde el panel con las fotos originales:
 * el lugar N usa la imagen con orden N del panel y, si no existe, la foto original N.
 */
function combinar(imagenes, respaldo) {
  const porOrden = new Map(imagenes.map(img => [img.orden, img.url]));
  const total = Math.max(respaldo.length, ...imagenes.map(img => img.orden), 0);
  const resultado = [];
  for (let orden = 1; orden <= total; orden++) {
    const url = porOrden.get(orden) ?? respaldo[orden - 1];
    if (url) resultado.push(url);
  }
  return resultado;
}

/** Imágenes de una sección administrable (carrusel, sucursal-plaza-real, ...). Devuelve URLs. */
export function useImagenes(seccion, respaldo) {
  const [imagenes, setImagenes] = useState(() => leerCache(seccion) ?? []);

  useEffect(() => {
    const controller = new AbortController();
    get(`/api/imagenes?seccion=${encodeURIComponent(seccion)}`, controller.signal)
      .then(data => {
        if (!Array.isArray(data)) return;
        setImagenes(data);
        guardarCache(seccion, data);
      })
      .catch(() => { /* si falla, se quedan las fotos originales */ });
    return () => controller.abort();
  }, [seccion]);

  return useMemo(() => combinar(imagenes, respaldo), [imagenes, respaldo]);
}
