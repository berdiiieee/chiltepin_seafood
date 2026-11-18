import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useT } from '../context/Preferencias';

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
                <img src={fotos[f.i]} alt={`${altBase} ${f.i + 1}`} loading="lazy" decoding="async" />
              </button>
            ))}
          </div>
        ))}
      </div>

      {abierta != null && createPortal(
        <div className="visor" role="dialog" aria-modal="true" aria-label={t('galeria.ampliada')} onClick={() => setAbierta(null)}>
          <button ref={cerrarRef} type="button" className="visor-cerrar" onClick={() => setAbierta(null)} aria-label={t('comun.cerrar')}>✕</button>
          <button type="button" className="visor-nav prev" onClick={(e) => { e.stopPropagation(); ir(-1); }} aria-label={t('galeria.anterior')}>‹</button>
          <img className="visor-img" src={fotos[abierta]} alt={`${altBase} ${abierta + 1}`} onClick={(e) => e.stopPropagation()} />
          <button type="button" className="visor-nav next" onClick={(e) => { e.stopPropagation(); ir(1); }} aria-label={t('galeria.siguiente')}>›</button>
          <span className="visor-cuenta">{abierta + 1} / {total}</span>
        </div>,
        document.body
      )}
    </>
  );
}
