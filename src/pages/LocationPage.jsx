import { Link } from 'react-router-dom';
import CabeceraPagina from '../components/CabeceraPagina';
import { useImagenes } from '../hooks/useImagenes';
import { useT } from '../context/Preferencias';
import { SUCURSALES } from '../config/negocio';
import { textoHorario } from '../utils/horario';

// Resumen: foto, nombre, dirección y enlaces. El mapa y lo específico van en el detalle.
const Sucursal = ({ s, i }) => {
  const { t } = useT();
  const fotos = useImagenes(s.seccionImagenes, s.imagenes);
  return (
    <article className={`suc-ubica reveal reveal-up${i ? ' delay-2' : ''}`}>
      <Link to={`/horarios/${s.id}`} className="suc-ubica-foto" aria-label={t('comun.verDetallesDe', { nombre: s.nombre })}>
        <img src={fotos[0]} alt={t('comun.fachadaDe', { nombre: s.nombre })} decoding="async" />
      </Link>
      <h2 className="suc-ubica-nombre">{s.nombre}</h2>
      <p className="suc-ubica-dir">{s.direccion[0]}<br />{s.direccion[1]}</p>
      <div className="suc-ubica-enlaces">
        <Link className="link-flecha" to={`/horarios/${s.id}`}>{t('comun.verDetalles')} <span aria-hidden="true">→</span></Link>
        <a className="link-flecha" href={s.comoLlegar} target="_blank" rel="noopener noreferrer">{t('comun.comoLlegar')} <span aria-hidden="true">→</span></a>
      </div>
    </article>
  );
};

const LocationPage = () => {
  const { t, idioma } = useT();
  return (
  <main className="container">
    <CabeceraPagina
      eyebrow={t('sucursales.eyebrow')}
      titulo={t('sucursales.titulo')}
      intro={t('sucursales.intro', { horario: textoHorario(t, idioma) })}
      divisor
    />
    <div className="suc-ubicaciones">
      {SUCURSALES.map((s, i) => <Sucursal key={s.id} s={s} i={i} />)}
    </div>
  </main>
  );
};

export default LocationPage;
