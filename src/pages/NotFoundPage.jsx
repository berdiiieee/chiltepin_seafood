import { Link } from 'react-router-dom';
import { useT } from '../context/Preferencias';

const NotFoundPage = () => {
  const { t } = useT();
  return (
  <main className="container">
    <section className="notfound">
      <p className="notfound-code">404</p>
      <h1>{t('noEncontrada.titulo')}</h1>
      <p>{t('noEncontrada.texto')}</p>
      <div className="notfound-actions">
        {/* Enlaces con flecha, como en el resto del sitio (el botón rojo relleno es solo para reservar) */}
        <Link to="/" className="link-flecha">{t('noEncontrada.irInicio')} <span aria-hidden="true">→</span></Link>
        <Link to="/menu" className="link-flecha">{t('comun.verMenu')} <span aria-hidden="true">→</span></Link>
      </div>
    </section>
  </main>
  );
};

export default NotFoundPage;
