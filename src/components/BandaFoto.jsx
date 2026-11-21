import VideoLoop from './VideoLoop';

// Banda a sangre: foto de borde a borde con una frase corta en Anton. Rompe el ritmo entre secciones.
// `className` permite variantes (p. ej. `banda-cita` para frases largas de 3 renglones).
// `video` (opcional): en vez de la foto, un video corto sin sonido en loop; `src` queda como su portada.
const BandaFoto = ({ src, video, frase, alt = '', className = '' }) => (
  <section className={`banda-foto reveal reveal-up ${className}`.trim()} aria-label={alt || frase.replace(/\n/g, ' ')}>
    {video
      ? <VideoLoop src={video} poster={src} className="banda-medio" />
      : <img className="banda-medio" src={src} alt="" loading="lazy" decoding="async" />}
    <span className="banda-calor" aria-hidden="true" />
    <p className="banda-frase">{frase.split('\n').map((l, i) => <span key={i}><i style={{ '--d': `${0.25 + i * 0.18}s` }}>{l}</i></span>)}</p>
    <span className="banda-linea" aria-hidden="true" />
  </section>
);

export default BandaFoto;
