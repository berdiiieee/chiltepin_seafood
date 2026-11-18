import { useEffect, useState } from 'react';
import { INSTAGRAM } from '../config/negocio';
import { POSTS_INSTAGRAM } from '../data/instagram';
import { useT } from '../context/Preferencias';

// Elige n al azar sin repetir
const alAzar = (lista, n) => [...lista].sort(() => Math.random() - 0.5).slice(0, n);

// Embed oficial de Instagram (iframe). Se precarga en cuanto termina de cargar la página (sin esperar
// a que la sección entre en pantalla) para que al bajar ya esté listo; no frena el hero.
const ReelsInstagram = () => {
  const [posts] = useState(() => alAzar(POSTS_INSTAGRAM, 3));
  const { t } = useT();
  const [precarga, setPrecarga] = useState(document.readyState === 'complete');
  const [listos, setListos] = useState({});
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
        {posts.map(r => (
          <div className={`reel${listos[r.codigo] ? ' listo' : ''}`} key={r.codigo}>
            {precarga && <iframe
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
