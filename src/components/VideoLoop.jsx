import { useEffect, useRef, useState } from 'react';

const sinMovimiento = () => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// Video corto de ambiente: sin sonido, en loop, sin controles. No descarga nada hasta que está por
// entrar en pantalla, se pausa cuando sale y, con "reducir movimiento", se queda en la portada (poster).
export default function VideoLoop({ src, poster, className = '', label }) {
  const ref = useRef(null);
  const [cerca, setCerca] = useState(false);
  const [quieto] = useState(sinMovimiento);

  useEffect(() => {
    const v = ref.current;
    if (!v) return undefined;
    if (typeof IntersectionObserver === 'undefined') { setCerca(true); return undefined; }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setCerca(true);
        // Ya cargado: al volver a la pantalla sigue donde iba
        if (!quieto && v.currentSrc) v.play().catch(() => { /* se queda la portada */ });
      } else if (v.currentSrc) {
        v.pause();
      }
    }, { rootMargin: '200px 0px' });
    io.observe(v);
    return () => io.disconnect();
  }, [quieto]);

  return (
    <video
      ref={ref}
      className={className}
      src={cerca ? src : undefined}
      poster={poster}
      autoPlay={cerca && !quieto}
      muted
      loop
      playsInline
      preload="none"
      aria-label={label}
      aria-hidden={label ? undefined : true}
      disablePictureInPicture
    />
  );
}
