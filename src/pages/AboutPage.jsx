import CabeceraPagina from '../components/CabeceraPagina';
import BandaFoto from '../components/BandaFoto';
import Negritas from '../i18n/Negritas';
import { useT } from '../context/Preferencias';

// Nuestra historia: dos capítulos en espejo (texto | equipo, chiltepín | texto) y, entre ellos, la cita sobre el mural del pulpo.
// Fotos distintas a las de Sucursales a propósito: aquí va la gente y el chile, no los locales.
const AboutPage = () => {
  const { t } = useT();
  return (
    <main>
      <div className="container">
        <CabeceraPagina eyebrow={t('historia.eyebrow')} titulo={t('historia.titulo')} intro={t('historia.intro')} divisor />

        <section className="home-seccion home-nosotros suc-principal hist-capitulo">
          <div className="nosotros-texto reveal reveal-up">
            <p className="eyebrow">{t('historia.c1Eyebrow')}</p>
            <h2 className="titulo-seccion">{t('historia.c1Titulo')}</h2>
            <p className="intro-text"><Negritas texto={t('historia.c1P1')} /></p>
            <p className="intro-text"><Negritas texto={t('historia.c1P2')} /></p>
          </div>
          <div className="foto-recta hist-foto-neon reveal reveal-up delay-2">
            <img src="/img/ubicaciones/450/3.jpeg" alt={t('historia.neonAlt')} loading="lazy" decoding="async" />
          </div>
        </section>
      </div>

      <BandaFoto
        className="banda-cita"
        src="/img/ubicaciones/plaza-real/escaleras.jpg"
        frase={t('historia.cita')}
        alt={t('historia.citaAlt')}
      />

      <div className="container">
        <section className="home-seccion home-nosotros hist-capitulo hist-invertido">
          <div className="foto-recta reveal reveal-up">
            <img src="/img/acercade/origennombre.jpg" alt={t('historia.chileAlt')} loading="lazy" decoding="async" />
          </div>
          <div className="nosotros-texto reveal reveal-up delay-2">
            <p className="eyebrow">{t('historia.c2Eyebrow')}</p>
            <h2 className="titulo-seccion">{t('historia.c2Titulo')}</h2>
            <p className="intro-text"><Negritas texto={t('historia.c2P1')} /></p>
            <p className="intro-text"><Negritas texto={t('historia.c2P2')} /></p>
          </div>
        </section>
      </div>
    </main>
  );
};

export default AboutPage;
