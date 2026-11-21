// Cloudflare Turnstile: comprueba que quien pide es una persona (gratis y casi siempre invisible).
// Solo se carga si hay VITE_TURNSTILE_SITE_KEY. El token se manda al backend, que lo valida con su llave secreta.
import { useEffect, useRef } from 'react';
import { TURNSTILE_SITE_KEY } from '../config/api';
import { useT } from '../context/Preferencias';

let carga = null;
function cargar() {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (!carga) {
    carga = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      s.async = true;
      s.onload = () => resolve(window.turnstile);
      s.onerror = () => { carga = null; reject(new Error('Turnstile no cargó')); };
      document.head.appendChild(s);
    });
  }
  return carga;
}

export default function Turnstile({ onToken }) {
  const { idioma, tema } = useT();
  const caja = useRef(null);
  const cb = useRef(onToken);
  cb.current = onToken;

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY) return undefined;
    let id = null;
    let vivo = true;
    cargar().then(ts => {
      if (!vivo || !caja.current) return;
      id = ts.render(caja.current, {
        sitekey: TURNSTILE_SITE_KEY,
        language: idioma,
        theme: tema === 'claro' ? 'light' : 'dark',
        appearance: 'interaction-only',
        callback: tok => cb.current(tok),
        'expired-callback': () => cb.current(''),
        'error-callback': () => cb.current(''),
      });
    }).catch(() => {});
    return () => { vivo = false; if (id != null) window.turnstile?.remove(id); };
  }, [idioma, tema]);

  if (!TURNSTILE_SITE_KEY) return null;
  return <div ref={caja} className="turnstile" />;
}
