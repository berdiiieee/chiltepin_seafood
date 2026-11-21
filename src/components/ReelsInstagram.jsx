import { useEffect, useRef, useState } from 'react';
import { INSTAGRAM } from '../config/negocio';
import { POSTS_INSTAGRAM } from '../data/instagram';
import { useT } from '../context/Preferencias';
import { useEsMovil } from '../hooks/useEsMovil';

// Elige n al azar sin repetir
const alAzar = (lista, n) => [...lista].sort(() => Math.random() - 0.5).slice(0, n);

// Embed oficial de Instagram (iframe). Se precarga en cuanto termina de cargar la página (sin esperar
// a que la sección entre en pantalla) para que al bajar ya esté listo; no frena el hero.
const ReelsInstagram = () => {
  const [posts] = useState(() => alAzar(POSTS_INSTAGRAM, 3));
  const { t } = useT();
  const [precarga, setPrecarga] = useState(document.readyState === 'complete');
  const [listos, setListos] = useState({});
  // Celular: una sola publicación (las otras dos no se ven, así que tampoco se cargan)
  const esMovil = useEsMovil();
  const visibles = esMovil ? posts.slice(0, 1) : posts;

  // Instagram avisa la altura real de cada publicación (mensaje "MEASURE"); en celular el marco
  // toma esa altura para no cortar la parte de abajo (likes y "View more on Instagram")
  const marcos = useRef({});
  const [alturas, setAlturas] = useState({});
  useEffect(() => {
    const onMensaje = e => {
      if (!/^https:\/\/www\.instagram\.com$/.test(e.origin) || typeof e.data !== 'string') return;
      let msg;
      try { msg = JSON.parse(e.data); } catch { return; }
      const alto = msg?.type === 'MEASURE' ? Number(msg.details?.height) : 0;
      if (!alto) return;
      const codigo = Object.keys(marcos.current).find(c => marcos.current[c]?.contentWindow === e.source);
      if (codigo) setAlturas(a => (a[codigo] === alto ? a : { ...a, [codigo]: alto }));
    };
    window.addEventListener('message', onMensaje);
    return () => window.removeEventListener('message', onMensaje);
  }, []);

  useEffect(() => {
    if (precarga) return;
    const ir = () => setPrecarga(true);
    window.addEventListener('load', ir, { once: true });
    return () => window.removeEventListener('load', ir);
  }, [precarga]);
  return (
    <section className="reels" aria-label={t('instagram.aria')}>
      <div className="seccion-cabecera">
        <div>
          <p className="eyebrow">Instagram</p>
          <h2 className="titulo-seccion">{t('instagram.titulo')}</h2>
        </div>
        <a className="link-flecha" href={INSTAGRAM.url} target="_blank" rel="noopener noreferrer">{INSTAGRAM.usuario}</a>
      </div>
      <div className="reels-fila">
        {visibles.map(r => (
          <div
            className={`reel${listos[r.codigo] ? ' listo' : ''}`}
            key={r.codigo}
            style={esMovil && alturas[r.codigo] ? { height: alturas[r.codigo] } : undefined}
          >
            {precarga && <iframe
              ref={el => { marcos.current[r.codigo] = el; }}
              onLoad={() => setListos(l => ({ ...l, [r.codigo]: true }))}
              src={`https://www.instagram.com/${r.tipo}/${r.codigo}/embed`}
              title={t('instagram.iframe')}
              loading="eager"
              // Sin scroll propio: la rueda del mouse sigue moviendo la página aunque pases por encima
              scrolling="no"
              allow="autoplay; encrypted-media; fullscreen"
              allowFullScreen
            />}
          </div>
        ))}
      </div>
      <p className="reels-nota">{t('instagram.nota')} <a href="/aviso-de-privacidad">{t('instagram.notaEnlace')}</a>.</p>
    </section>
  );
};

export default ReelsInstagram;
