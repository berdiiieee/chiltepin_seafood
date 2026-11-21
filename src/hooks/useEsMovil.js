import { useEffect, useState } from 'react';

// true en pantallas de celular (≤700 px, el mismo corte que el CSS móvil); se actualiza al girar o cambiar el tamaño
const CONSULTA_MOVIL = '(max-width: 700px)';

export function useEsMovil() {
  const [movil, setMovil] = useState(() => typeof window !== 'undefined' && window.matchMedia(CONSULTA_MOVIL).matches);
  useEffect(() => {
    const mq = window.matchMedia(CONSULTA_MOVIL);
    const cambia = () => setMovil(mq.matches);
    mq.addEventListener('change', cambia);
    return () => mq.removeEventListener('change', cambia);
  }, []);
  return movil;
}
