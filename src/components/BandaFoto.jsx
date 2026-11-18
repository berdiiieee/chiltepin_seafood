// Banda a sangre: foto de borde a borde con una frase corta en Anton. Rompe el ritmo entre secciones.
// `className` permite variantes (p. ej. `banda-cita` para frases largas de 3 renglones).
const BandaFoto = ({ src, frase, alt = '', className = '' }) => (
  <section className={`banda-foto reveal reveal-up ${className}`.trim()} aria-label={alt || frase.replace(/\n/g, ' ')}>
    <img src={src} alt="" loading="lazy" decoding="async" />
    <span className="banda-calor" aria-hidden="true" />
    <p className="banda-frase">{frase.split('\n').map((l, i) => <span key={i}><i style={{ '--d': `${0.25 + i * 0.18}s` }}>{l}</i></span>)}</p>
    <span className="banda-linea" aria-hidden="true" />
  </section>
);

export default BandaFoto;
