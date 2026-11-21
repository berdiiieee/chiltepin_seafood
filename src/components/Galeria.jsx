import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useT } from '../context/Preferencias';
import { useEsMovil } from '../hooks/useEsMovil';
import VideoLoop from './VideoLoop';

// Cada elemento es la URL de una foto o un video corto: { video, poster }
const esVideo = m => typeof m === 'object' && m !== null && !!m.video;
const clave = m => (esVideo(m) ? m.video : m);
const Medio = ({ m, alt }) => (esVideo(m)
  ? <VideoLoop src={m.video} poster={m.poster} />
  : <img src={m} alt={alt} loading="lazy" decoding="async" />);

// Mosaico con personalidad: tres columnas escalonadas con fotos de distinto tamaño y visor a
// pantalla completa al hacer clic (se monta en document.body para que `fixed` no dependa de .pagina).
const COLUMNAS = [
  { clase: 'col-a', fotos: [{ i: 0, forma: 'alta' }, { i: 3, forma: 'cuadrada' }] },
  { clase: 'col-b', fotos: [{ i: 1, forma: 'cuadrada' }, { i: 4, forma: 'alta' }] },
  { clase: 'col-c', fotos: [{ i: 2, forma: 'media' }, { i: 5, forma: 'ancha' }] },
];
// Variante de 3 fotos (sucursales): una por columna, la del centro más baja.
const COLUMNAS_TRES = [
  { clase: 'col-a', fotos: [{ i: 0, forma: 'llena' }] },
  { clase: 'col-b', fotos: [{ i: 1, forma: 'llena' }] },
  { clase: 'col-c', fotos: [{ i: 2, forma: 'llena' }] },
];

export default function Galeria({ fotos, etiqueta: etiquetaProp, altBase: altBaseProp }) {
  const { t } = useT();
  const etiqueta = etiquetaProp ?? t('galeria.etiqueta');
  const altBase = altBaseProp ?? t('galeria.altBase');
  const [abierta, setAbierta] = useState(null);
  const cerrarRef = useRef(null);
  const total = fotos.length;
  // Celular: en vez del mosaico (6 fotos del Inicio o 3 de cada sucursal), una tira que se desliza con el dedo
  const esMovil = useEsMovil();
  const tira = esMovil;

  // Tira: qué foto está al frente (para el contador y la línea de progreso)
  const pistaRef = useRef(null);
  const [actual, setActual] = useState(0);
  useEffect(() => {
    const pista = pistaRef.current;
    if (!tira || !pista) return;
    let pendiente = false;
    const medir = () => {
      pendiente = false;
      const paso = pista.firstElementChild?.getBoundingClientRect().width || 1;
      const gap = parseFloat(getComputedStyle(pista).columnGap) || 0;
      // Al final de la tira, la última cuenta como la del frente aunque no llegue al borde
      const alFinal = pista.scrollLeft + pista.clientWidth >= pista.scrollWidth - 4;
      setActual(alFinal ? total - 1 : Math.min(total - 1, Math.round(pista.scrollLeft / (paso + gap))));
    };
    const onScroll = () => { if (!pendiente) { pendiente = true; requestAnimationFrame(medir); } };
    pista.addEventListener('scroll', onScroll, { passive: true });
    return () => pista.removeEventListener('scroll', onScroll);
  }, [tira, total]);

  const ir = useCallback((d) => setAbierta(a => (a == null ? a : (a + d + total) % total)), [total]);

  // Visor: Esc cierra, flechas navegan, el scroll de fondo se bloquea
  useEffect(() => {
    if (abierta == null) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setAbierta(null);
      if (e.key === 'ArrowLeft') ir(-1);
      if (e.key === 'ArrowRight') ir(1);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    cerrarRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [abierta, ir]);

  return (
    <>
      {tira ? (
        <div className="tira" role="group" aria-label={etiqueta}>
          <div className="tira-pista" ref={pistaRef}>
            {fotos.map((m, i) => (
              <button key={clave(m)} type="button" className="tira-foto" onClick={() => setAbierta(i)} aria-label={t('galeria.ampliar', { n: i + 1, total })}>
                <Medio m={m} alt={`${altBase} ${i + 1}`} />
              </button>
            ))}
          </div>
          <div className="tira-pie" aria-hidden="true">
            <span className="tira-barra"><span style={{ transform: `scaleX(${(actual + 1) / total})` }} /></span>
            <span className="tira-cuenta">{actual + 1} / {total}</span>
          </div>
        </div>
      ) : (
      <div className={`mosaico${total === 3 ? ' mosaico-tres' : ''}`} aria-label={etiqueta}>
        {(total === 3 ? COLUMNAS_TRES : COLUMNAS).map(col => (
          <div key={col.clase} className={`mosaico-col ${col.clase}`}>
            {col.fotos.map(f => (
              <button
                key={f.i}
                type="button"
                className={`mosaico-foto ${f.forma}`}
                onClick={() => setAbierta(f.i)}
                aria-label={t('galeria.ampliar', { n: f.i + 1, total })}
              >
                <Medio m={fotos[f.i]} alt={`${altBase} ${f.i + 1}`} />
              </button>
            ))}
          </div>
        ))}
      </div>
      )}

      {abierta != null && createPortal(
        <div className="visor" role="dialog" aria-modal="true" aria-label={t('galeria.ampliada')} onClick={() => setAbierta(null)}>
          <button ref={cerrarRef} type="button" className="visor-cerrar" onClick={() => setAbierta(null)} aria-label={t('comun.cerrar')}>✕</button>
          <button type="button" className="visor-nav prev" onClick={(e) => { e.stopPropagation(); ir(-1); }} aria-label={t('galeria.anterior')}>‹</button>
          {esVideo(fotos[abierta])
            ? <video className="visor-img" src={fotos[abierta].video} poster={fotos[abierta].poster} autoPlay muted loop playsInline onClick={(e) => e.stopPropagation()} />
            : <img className="visor-img" src={fotos[abierta]} alt={`${altBase} ${abierta + 1}`} onClick={(e) => e.stopPropagation()} />}
          <button type="button" className="visor-nav next" onClick={(e) => { e.stopPropagation(); ir(1); }} aria-label={t('galeria.siguiente')}>›</button>
          <span className="visor-cuenta">{abierta + 1} / {total}</span>
        </div>,
        document.body
      )}
    </>
  );
}
