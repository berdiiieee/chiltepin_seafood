import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Carousel from '../components/Carousel';
import Galeria from '../components/Galeria';
import BandaFoto from '../components/BandaFoto';
import ReelsInstagram from '../components/ReelsInstagram';
import EstadoHorario from '../components/EstadoHorario';
import { useImagenes } from '../hooks/useImagenes';
import { SUCURSALES, HORARIO } from '../config/negocio';
import { formatoHora } from '../utils/horario';
import { useT } from '../context/Preferencias';

const HERO_IMAGES = ['/img/hero/carousel1.jpg', '/img/hero/carousel2.jpg', '/img/hero/carousel3.jpg'];
const GALERIA = [1, 2, 3, 4, 5, 6].map(n => `/img/galeria/galeria${n}.jpeg`);

const trazo = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' };
const IconoChile = () => (<svg viewBox="0 0 32 32" width="30" height="30" aria-hidden="true"><path d="M21 8c4 2 6 7 3 12-3 5-9 7-16 6 7-1 11-5 12-10 .5-3-.5-5-3-6" {...trazo} /><path d="M21 8c0-2 1-3 3-4" {...trazo} /></svg>);
const IconoPez = () => (<svg viewBox="0 0 32 32" width="30" height="30" aria-hidden="true"><path d="M3 16c4-6 11-8 17-4l7-4-2 8 2 8-7-4c-6 4-13 2-17-4z" {...trazo} /><circle cx="21" cy="14" r=".9" fill="currentColor" /></svg>);
const IconoOla = () => (<svg viewBox="0 0 32 32" width="30" height="30" aria-hidden="true"><path d="M2 13c3-4 5-4 7.5 0s5 4 7.5 0 5-4 7.5 0 3 3 5 1M2 21c3-4 5-4 7.5 0s5 4 7.5 0 5-4 7.5 0 3 3 5 1" {...trazo} /></svg>);

const Flecha = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
);

const SucursalCard = ({ s, desfase }) => {
  const { t, idioma } = useT();
  const respaldo = useMemo(() => s.imagenes, [s]);
  const fotos = useImagenes(s.seccionImagenes, respaldo);
  return (
    <article className={`suc-tile reveal reveal-up${desfase ? ' delay-2' : ''}`}>
      <Carousel
        className="cx-card"
        label={t('comun.fotosDe', { nombre: s.nombre })}
        startDelay={desfase}
        images={fotos.map((src, i) => ({ src, alt: i === 0 ? t('comun.fachadaDe', { nombre: s.nombre }) : t('comun.fotoN', { nombre: s.nombre, n: i + 1 }) }))}
      />
      <div className="suc-tile-info">
        <h3 className="suc-tile-nombre">{s.nombre}</h3>
        <p className="suc-tile-dir">{s.direccion[0]}, {s.direccion[1]}</p>
        <div className="suc-tile-horario">
          <EstadoHorario conHorario={false} compacto /> <span>{formatoHora(HORARIO.abre, idioma)} – {formatoHora(HORARIO.cierra, idioma)}</span>
        </div>
        <Link to={`/horarios/${s.id}`} className="link-flecha" aria-label={t('comun.verDetallesDe', { nombre: s.nombre })}>{t('comun.verDetalles')} <Flecha /></Link>
      </div>
    </article>
  );
};

const HomePage = ({ onReservationClick }) => {
  const { t } = useT();
  const sellos = t('inicio.sellos');
  const heroDelPanel = useImagenes('carrusel', HERO_IMAGES);
  // El hero usa las fotos locales; para administrarlas desde el panel: VITE_HERO_DESDE_PANEL=true
  const heroFotos = import.meta.env.VITE_HERO_DESDE_PANEL === 'true' ? heroDelPanel : HERO_IMAGES;

  useEffect(() => {
    const counters = document.querySelectorAll('.counter-value');
    if (counters.length === 0) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = Number.parseInt(el.dataset.target, 10);
        const duration = 1500;
        const startTime = performance.now();
        const update = (now) => {
          const progress = Math.min((now - startTime) / duration, 1);
          el.textContent = Math.floor(progress * target);
          if (progress < 1) requestAnimationFrame(update);
        };
        requestAnimationFrame(update);
        observer.unobserve(el);
      });
    }, { threshold: 0.5 });
    counters.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <section className="hero" aria-label={t('inicio.bienvenida')}>
        <Carousel
          className="cx-hero"
          label={t('inicio.heroCarrusel')}
          priority
          interval={6500}
          images={heroFotos.map((src, i) => ({ src, alt: i === 0 ? t('inicio.heroAlt') : '' }))}
        >
          <div className="hero-overlay">
            <div className="hero-content">
              <p className="hero-eyebrow">{t('inicio.heroEyebrow')}</p>
              <h1 className="hero-title">{t('inicio.heroTitulo')}</h1>
              <p className="hero-sub">{t('inicio.heroSub')}</p>

              <div className="hero-acciones">
                <button type="button" className="btn-principal" onClick={() => onReservationClick(null)}>{t('comun.reservarMesa')}</button>
                <Link to="/menu" className="link-hero">{t('comun.verMenu')}</Link>
                <Link to="/eventos" className="link-hero">{t('inicio.eventosCatering')}</Link>
              </div>

              <div className="hero-estado"><EstadoHorario className="estado-hero" conHorario={false} compacto /></div>
            </div>
          </div>
        </Carousel>
      </section>

      <div className="container home-body">
        <section id="locations" aria-label={t('nav.sucursales')} className="home-seccion">
          <div className="seccion-cabecera reveal reveal-up">
            <div>
              <p className="eyebrow">{t('inicio.sucEyebrow')}</p>
              <h2 className="titulo-seccion">{t('inicio.sucTitulo')}</h2>
            </div>
            <Link to="/horarios" className="link-flecha">{t('inicio.verSucursales')} <Flecha /></Link>
          </div>
          <div className="suc-tiles">
            {SUCURSALES.map((s, i) => <SucursalCard key={s.id} s={s} desfase={i * 2500} />)}
          </div>
        </section>
      </div>

      <BandaFoto className="banda-cocina" src="/video/cocina.jpg" video="/video/cocina.mp4" frase={t('inicio.bandaFrase')} alt={t('inicio.bandaAlt')} />

      <div className="container home-body">
        <section id="about" className="home-seccion home-nosotros">
          <div className="nosotros-texto reveal reveal-up">
            <p className="eyebrow">{t('inicio.nosEyebrow')}</p>
            <h2 className="titulo-seccion">{t('inicio.nosTitulo')}</h2>
            <p className="intro-text">{t('inicio.nosTexto')}</p>
            <div className="counter-grid">
              <div className="counter-item">
                <span className="counter-number"><span className="counter-value" data-target="2022">0</span></span>
                <span className="counter-label">{t('inicio.fundacion')}</span>
              </div>
              <div className="counter-item">
                <span className="counter-number"><span className="counter-value" data-target="200">0</span><span className="suffix">+</span></span>
                <span className="counter-label">{t('inicio.clientesDia')}</span>
              </div>
              <div className="counter-item">
                <span className="counter-number"><span className="counter-value" data-target="2">0</span></span>
                <span className="counter-label">{t('inicio.sucursales')}</span>
              </div>
            </div>
            <ul className="sellos">
              {[IconoChile, IconoPez, IconoOla].map((Icono, i) => (
                <li key={i}><Icono /><span><strong>{sellos[i].titulo}</strong>{sellos[i].texto}</span></li>
              ))}
            </ul>
            <div className="nosotros-links">
              <Link to="/acerca" className="link-flecha">{t('inicio.nuestraHistoria')} <Flecha /></Link>
            </div>
          </div>

          <Galeria fotos={GALERIA} />
        </section>
      </div>

      <div className="container home-body">
        <section className="home-seccion home-instagram"><ReelsInstagram /></section>
      </div>
    </>
  );
};

export default HomePage;
