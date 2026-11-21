import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useT } from '../context/Preferencias';

// Pantalla de bienvenida: solo la primera vez que se abre el sitio en esa pestaña (sessionStorage),
// en cualquier página. Si recargas, ya no sale. Se monta en App.jsx, fuera de .pagina.
// Secuencia: el logo "Chiltepin" se escribe a mano (de la C a la n) → aparece el chiltepín sobre la i →
// el chiltepín del ornamento se dibuja y sus líneas se estiran → lema → la pantalla sube como cortina.
// Un clic o cualquier tecla la adelanta.
const CLAVE = 'splashShown';
const SALIDA = 900; // ms de la cortina

// La "pluma": trazos sobre el logo (PNG de 440x194) en el orden en que se escribe en cursiva.
// Cada trazo es una máscara gruesa que va descubriendo los píxeles por donde pasa. Para ajustarlos se
// usó una herramienta que pinta en magenta lo que queda sin cubrir (ver docs/SIGUIENTE_SESION.md).
const PLUMA = [
  { w: 27, d: 'M62 112 C65 95 71 70 76 50 C79 40 75 33 67 33 C55 33 42 44 32 58 C19 78 11 105 11 128 C11 150 19 164 34 166 C50 167 64 158 78 144' }, // C
  { d: 'M131 55 C118 78 96 116 81 150' }, // h: asta
  { d: 'M100 122 C110 108 122 96 131 96 C139 97 138 106 134 116 C128 130 118 142 122 146 C126 149 132 147 136 144' }, // h: arco
  { d: 'M136 144 C144 132 152 112 159 97 C155 115 148 132 148 142 C149 149 158 145 166 138' }, // i
  { d: 'M166 138 C178 118 198 78 214 49 C204 75 186 118 176 146 C172 158 182 160 192 152 C198 146 204 138 208 130' }, // l
  { d: 'M244 54 C234 80 220 112 213 138 C209 156 212 166 224 165' }, // t: asta
  { d: 'M207 70 C225 66 250 64 262 68 C268 71 268 78 266 82' }, // t: travesaño
  { d: 'M240 121 C252 118 266 110 272 98 C276 88 268 81 258 85 C244 92 232 115 232 132 C232 148 244 152 258 146 C266 142 274 134 284 124' }, // e
  { d: 'M284 124 C290 110 294 96 297 85 C288 110 270 160 260 183' }, // p: asta
  { d: 'M290 108 C298 98 308 92 316 94 C324 97 323 110 318 120 C311 134 300 146 288 148' }, // p: panza
  { d: 'M318 112 C328 107 338 104 352 98 C348 112 340 132 338 142 C338 150 348 148 356 140' }, // i
  { d: 'M356 140 C364 125 372 105 378 92 C374 108 366 130 361 148' }, // n: asta
  { d: 'M372 118 C382 106 394 96 404 95 C410 96 406 106 401 116 C396 128 393 140 396 146 C400 152 412 146 420 136 C426 128 432 116 436 108' }, // n: arco y salida
];
const ANCHO = 23;     // grosor de la pluma (unidades del logo)
const INICIO = 0.25;  // s antes de empezar a escribir
const ESCRITURA = 1.6;  // s que tarda la pluma en recorrer toda la palabra (sin contar pausas)
const LEVANTA = 0.04; // s de pausa cuando la pluma "se levanta" entre trazos

/** ¿Toca mostrar el splash? (primera vez en la pestaña y sin "reducir movimiento") */
export function debeMostrarSplash() {
  try {
    if (sessionStorage.getItem(CLAVE)) return false;
    return !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  } catch { return false; }
}

export default function Splash({ onFin }) {
  const { t } = useT();
  const [saliendo, setSaliendo] = useState(false);
  const raiz = useRef(null);
  const [fin, setFin] = useState(null); // s en que termina de escribirse la palabra

  // Velocidad pareja: cada trazo dura en proporción a su largo y empieza cuando termina el anterior
  useLayoutEffect(() => {
    const trazos = [...raiz.current.querySelectorAll('.splash-trazo')];
    const largos = trazos.map(p => p.getTotalLength());
    const total = largos.reduce((a, b) => a + b, 0);
    let t0 = INICIO;
    trazos.forEach((p, i) => {
      const dur = (ESCRITURA * largos[i]) / total;
      p.style.setProperty('--ini', `${t0.toFixed(3)}s`);
      p.style.setProperty('--dur', `${dur.toFixed(3)}s`);
      t0 += dur + LEVANTA;
    });
    raiz.current.style.setProperty('--fin', `${t0.toFixed(3)}s`);
    setFin(t0);
  }, []);

  useEffect(() => {
    if (fin == null) return undefined;
    try { sessionStorage.setItem(CLAVE, 'true'); } catch { /* sin almacenamiento */ }
    const html = document.documentElement;
    html.classList.add('con-splash');
    // La cortina sube un poco después del lema
    const id = setTimeout(() => setSaliendo(true), (fin + 0.95) * 1000);
    const saltar = () => setSaliendo(true);
    window.addEventListener('keydown', saltar);
    return () => { clearTimeout(id); window.removeEventListener('keydown', saltar); html.classList.remove('con-splash'); };
  }, [fin]);

  useEffect(() => {
    if (!saliendo) return undefined;
    const id = setTimeout(onFin, SALIDA);
    return () => clearTimeout(id);
  }, [saliendo, onFin]);

  return (
    <div ref={raiz} className={`splash${saliendo ? ' saliendo' : ''}`} onClick={() => setSaliendo(true)} aria-hidden="true">
      <div className="splash-centro">
        <svg className="splash-logo" viewBox="0 0 440 194">
          <defs>
            <mask id="splash-pluma" maskUnits="userSpaceOnUse" x="0" y="0" width="440" height="194">
              {PLUMA.map(tr => (
                <path
                  key={tr.d}
                  className="splash-trazo"
                  d={tr.d}
                  pathLength="1"
                  fill="none"
                  stroke="#fff"
                  strokeWidth={tr.w || ANCHO}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ))}
              {/* El chiltepín (el chile sobre la i) y sus hojas aparecen al final, como el punto de la i */}
              <ellipse className="splash-chile" cx="172" cy="70" rx="25" ry="31" fill="#fff" />
              {/* Al terminar, un fundido cortito limpia las orillas que la pluma no alcanzó */}
              <rect className="splash-limpia" width="440" height="194" fill="#fff" />
            </mask>
          </defs>
          <image href="/img/logos/logo_chilte.png" width="440" height="194" mask="url(#splash-pluma)" />
        </svg>
        <div className="splash-orn">
          <span className="splash-linea" />
          <svg viewBox="0 0 32 32" width="44" height="44">
            <path
              pathLength="1"
              d="M21 8c4 2 6 7 3 12-3 5-9 7-16 6 7-1 11-5 12-10 .5-3-.5-5-3-6M21 8c0-2 1-3 3-4"
              fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"
            />
          </svg>
          <span className="splash-linea" />
        </div>
        <p className="splash-lema">{t('splash.lema')}</p>
      </div>
    </div>
  );
}
