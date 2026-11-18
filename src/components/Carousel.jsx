import { useCallback, useEffect, useRef, useState } from 'react';
import { useT } from '../context/Preferencias';

/**
 * Carrusel accesible con fundido suave, pausa/play, flechas, swipe y una barra de progreso
 * dentro del punto activo (se llena mientras llega la siguiente foto).
 *
 * El avance lo manda la propia animación de la barra (onAnimationEnd), así que pausar,
 * reanudar y cambiar a mano siempre quedan sincronizados con lo que se ve.
 *
 * images: [{ src, alt }] (o strings) · variant: 'fade' | 'slide'
 * priority: la primera imagen se carga con fetchpriority="high" (solo en el hero)
 * startDelay: ms extra antes del primer cambio (para que dos carruseles no cambien a la vez)
 */
const Carousel = ({
  images,
  label,
  interval = 6000,
  variant = 'fade',
  className = '',
  priority = false,
  startDelay = 0,
  children,
}) => {
  const slides = images.map(img => (typeof img === 'string' ? { src: img, alt: '' } : img));
  const { t } = useT();
  const count = slides.length;
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true); // siempre arranca solo; el usuario puede pausar
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [yaAvanzo, setYaAvanzo] = useState(false);
  const touchX = useRef(null);
  const raizRef = useRef(null);
  const arrastre = useRef(null);
  const [arrastrando, setArrastrando] = useState(false);
  const calmo = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  const go = useCallback((i) => setIndex(((i % count) + count) % count), [count]);
  const corriendo = playing && !focused && !hidden && count > 1;
  const duracion = yaAvanzo ? interval : interval + startDelay;

  useEffect(() => {
    const onVis = () => setHidden(document.hidden);
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  const avanzar = (e) => {
    if (e.target !== e.currentTarget) return;
    setYaAvanzo(true);
    setIndex(i => (i + 1) % count);
  };

  // Scroll horizontal del trackpad: un cambio por gesto (la inercia manda muchos eventos seguidos).
  // Escucha no pasiva para que el gesto no haga "atrás" en el navegador ni mueva la página de lado.
  useEffect(() => {
    const el = raizRef.current;
    if (!el || count < 2) return undefined;
    let acumulado = 0, bloqueado = false, silencio;
    const onWheel = (e) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return; // gesto vertical: que la página haga scroll
      e.preventDefault();
      clearTimeout(silencio);
      silencio = setTimeout(() => { acumulado = 0; bloqueado = false; }, 220);
      if (bloqueado) return;
      acumulado += e.deltaX;
      if (Math.abs(acumulado) > 45) {
        const dir = acumulado > 0 ? 1 : -1;
        setIndex(i => (((i + dir) % count) + count) % count);
        bloqueado = true;
        acumulado = 0;
      }
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => { el.removeEventListener('wheel', onWheel); clearTimeout(silencio); };
  }, [count]);

  // Arrastrar con el mouse (en táctil ya está el swipe). No arranca sobre botones ni enlaces.
  const onPointerDown = (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0 || count < 2 || e.target.closest('button, a')) return;
    arrastre.current = { x: e.clientX, movido: false };
  };
  const onPointerMove = (e) => {
    const a = arrastre.current;
    if (!a) return;
    if (!a.movido && Math.abs(e.clientX - a.x) > 8) { a.movido = true; setArrastrando(true); }
  };
  const onPointerUp = (e) => {
    const a = arrastre.current;
    arrastre.current = null;
    setArrastrando(false);
    if (!a) return;
    const dx = e.clientX - a.x;
    if (Math.abs(dx) > 50) go(index + (dx < 0 ? 1 : -1));
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowLeft') go(index - 1);
    if (e.key === 'ArrowRight') go(index + 1);
  };
  const onTouchStart = (e) => { touchX.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    if (touchX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
    touchX.current = null;
  };

  return (
    <div
      ref={raizRef}
      className={`cx cx-${variant}${calmo ? ' cx-calmo' : ''}${arrastrando ? ' cx-arrastrando' : ''} ${className}`}
      role="region"
      aria-roledescription="carrusel"
      aria-label={label}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
    >
      <div className="cx-track" style={variant === 'slide' ? { transform: `translateX(-${index * 100}%)` } : undefined}>
        {slides.map((s, i) => (
          <div
            className={`cx-slide${i === index ? ' activa' : ''}`}
            key={s.src}
            aria-hidden={i !== index}
            role="group"
            aria-label={t('carrusel.nDe', { n: i + 1, total: count })}
          >
            <img
              src={s.src}
              alt={s.alt || ''}
              loading={priority && i === 0 ? 'eager' : 'lazy'}
              fetchPriority={priority && i === 0 ? 'high' : undefined}
              decoding="async"
              draggable="false"
            />
          </div>
        ))}
      </div>

      {children}

      {count > 1 && (
        <>
          <button type="button" className="cx-arrow prev" onClick={() => go(index - 1)} aria-label={t('carrusel.anterior')}>‹</button>
          <button type="button" className="cx-arrow next" onClick={() => go(index + 1)} aria-label={t('carrusel.siguiente')}>›</button>
          <div
            className="cx-controls"
            onMouseEnter={() => setFocused(true)}
            onMouseLeave={() => setFocused(false)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          >
            <button
              type="button"
              className="cx-playpause"
              onClick={() => setPlaying(p => !p)}
              aria-label={playing ? t('carrusel.pausar') : t('carrusel.reanudar')}
            >
              {playing ? (
                <svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true"><path fill="currentColor" d="M6 5h4v14H6zM14 5h4v14h-4z" /></svg>
              ) : (
                <svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7z" /></svg>
              )}
            </button>
            <div className="cx-dots">
              {slides.map((s, i) => (
                <button
                  type="button"
                  key={s.src}
                  className={`cx-dot${i === index ? ' active' : ''}`}
                  onClick={() => go(i)}
                  aria-label={t('carrusel.irA', { n: i + 1 })}
                  aria-current={i === index}
                >
                  {i === index && (
                    <span
                      key={`${index}-${yaAvanzo}`}
                      className={`cx-dot-fill${corriendo ? '' : ' pausa'}`}
                      style={{ animationDuration: `${duracion}ms` }}
                      onAnimationEnd={avanzar}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Carousel;
