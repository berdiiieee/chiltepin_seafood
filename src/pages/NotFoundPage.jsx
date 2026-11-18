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
        <Link to="/" className="btn-submit-event">{t('noEncontrada.irInicio')}</Link>
        <Link to="/menu" className="btn-location">{t('comun.verMenu')}</Link>
      </div>
    </section>
  </main>
  );
};

export default NotFoundPage;
