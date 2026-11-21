import { useState, useEffect, useLayoutEffect, useCallback, useRef } from 'react';
import { flushSync } from 'react-dom';
import { Routes, Route, Link, Navigate, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import ReservationSidebar from './components/ReservationSidebar';
import HomePage from './pages/HomePage';
import MenuPage from './pages/MenuPage';
import LocationPage from './pages/LocationPage';
import LocationDetailPage from './pages/LocationDetailPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import EventsPage from './pages/EventsPage';
import NewsletterPage from './pages/NewsletterPage';
import PrivacyPage from './pages/PrivacyPage';
import NotFoundPage from './pages/NotFoundPage';
import DeliveryPage from './pages/DeliveryPage';
import CheckoutPage from './pages/CheckoutPage';
import SeguimientoPage from './pages/SeguimientoPage';
import TerminosPage from './pages/TerminosPage';
import { BarraPedido, PanelPedido } from './components/PedidoFlotante';
import { PEDIDOS_ACTIVOS } from './config/api';
import { useIntersectionObserver } from './hooks/useIntersectionObserver';
import { buscarSucursal } from './config/negocio';
import { toPath } from './routes';
import { useT } from './context/Preferencias';
import { conTransicion, hayTransiciones } from './utils/transicion';
import { precargarMenu } from './hooks/useMenu';
import Splash, { debeMostrarSplash } from './components/Splash';

const EventsRoute = ({ onReservationClick }) => {
  const [params] = useSearchParams();
  const tipo = params.get('tipo') === 'catering' ? 'catering' : 'privados';
  // key: al cambiar de tipo se monta una página nueva (cabecera animada y formulario limpio), nunca dos a la vez
  return <EventsPage key={tipo} initialTipo={tipo} onReservationClick={onReservationClick} />;
};

// /horarios?sucursal=450 (enlaces viejos) -> /horarios/plaza-450
const LocationRoute = ({ onReservationClick }) => {
  const [params] = useSearchParams();
  const viejo = buscarSucursal(params.get('sucursal'));
  if (viejo) return <Navigate to={`/horarios/${viejo.id}`} replace />;
  return <LocationPage onReservationClick={onReservationClick} />;
};

const LocationDetailRoute = ({ onReservationClick }) => {
  const { id } = useParams();
  const sucursal = buscarSucursal(id);
  if (!sucursal) return <NotFoundPage />;
  return <LocationDetailPage key={sucursal.id} sucursal={sucursal} onReservationClick={onReservationClick} />;
};

const App = () => {
  const [isReservationOpen, setIsReservationOpen] = useState(false);
  const [reservationData, setReservationData] = useState(null);
  const [pageLoaded, setPageLoaded] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [pasadoHero, setPasadoHero] = useState(false);
  const [verSubir, setVerSubir] = useState(false);
  const [splash, setSplash] = useState(debeMostrarSplash);
  const cerrarSplash = useCallback(() => setSplash(false), []);
  const routerNavigate = useNavigate();
  const { pathname, search } = useLocation();
  const { t } = useT();

  const openReservation = useCallback((loc) => {
    const sucursal = buscarSucursal(loc);
    setReservationData(sucursal ? { location: sucursal.nombre } : null);
    setIsReservationOpen(true);
  }, []);

  const closeReservation = () => {
    setIsReservationOpen(false);
    setReservationData(null);
  };

  useEffect(() => { setPageLoaded(true); }, []);

  // Al terminar de cargar: pide el menú en segundo plano (despierta al backend de Render)
  useEffect(() => {
    const ir = () => precargarMenu();
    if (document.readyState === 'complete') ir(); else window.addEventListener('load', ir, { once: true });
    return () => window.removeEventListener('load', ir);
  }, []);

  // Barra móvil: se quita mientras escribes en un formulario (el teclado la subiría encima del campo)
  const [escribiendo, setEscribiendo] = useState(false);
  useEffect(() => {
    const esCampo = el => el?.matches?.('input:not([type=radio]):not([type=checkbox]), textarea, select');
    const entra = e => { if (esCampo(e.target)) setEscribiendo(true); };
    const sale = e => { if (esCampo(e.target)) setEscribiendo(false); };
    document.addEventListener('focusin', entra);
    document.addEventListener('focusout', sale);
    return () => { document.removeEventListener('focusin', entra); document.removeEventListener('focusout', sale); };
  }, []);

  // La barra móvil se retira al llegar al pie, para no tapar sus teléfonos ni los botones de idioma y tema
  const [pieVisible, setPieVisible] = useState(false);
  useEffect(() => {
    const pie = document.querySelector('footer.pie');
    if (!pie || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([e]) => setPieVisible(e.isIntersecting));
    io.observe(pie);
    return () => io.disconnect();
  }, []);

  // En el inicio, la barra móvil aparece al pasar el hero (que ya trae sus propios botones)
  useEffect(() => {
    const onScroll = () => {
      setPasadoHero(window.scrollY > window.innerHeight * 0.6);
      // La flecha para volver arriba aparece después de bajar poco más de una pantalla
      setVerSubir(window.scrollY > window.innerHeight * 1.2);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Cambio de página con View Transition: la página que se va se desvanece y la nueva sube suave
  // (la barra de arriba se queda en su lugar). Si ya estás en esa página, solo sube al inicio.
  // `vtRuta` = ruta a la que se llegó así: su .pagina no repite la animación de entrada.
  const vtRuta = useRef(null);
  const pendiente = useRef(null);
  const irA = useCallback((destino) => {
    if (destino === window.location.pathname + window.location.search) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (pendiente.current === destino) return; // el mismo clic llegó por dos caminos (enlace + onNavigate)
    if (!hayTransiciones()) { routerNavigate(destino); return; }
    pendiente.current = destino;
    vtRuta.current = destino.split(/[?#]/)[0];
    conTransicion('vt-pagina', () => {
      pendiente.current = null;
      flushSync(() => routerNavigate(destino));
    });
  }, [routerNavigate]);

  // Todos los enlaces internos (navbar, pie, botones con <Link>, enlaces sueltos) pasan por irA.
  // Se escucha en captura: al marcar preventDefault, <Link> ya no navega por su cuenta.
  useEffect(() => {
    const alPicar = e => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target.closest?.('a[href]');
      if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
      if (a.getAttribute('href').startsWith('#')) return; // anclas y enlaces "#" con su propio onClick
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin || url.hash) return;
      e.preventDefault();
      irA(url.pathname + url.search);
    };
    document.addEventListener('click', alPicar, true);
    return () => document.removeEventListener('click', alPicar, true);
  }, [irA]);

  // Cada cambio de ruta: cierra el sidebar y vuelve arriba. En layout effect para que la página
  // nueva ya esté arriba cuando la View Transition la captura.
  useLayoutEffect(() => {
    setIsReservationOpen(false);
    setReservationData(null);
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname]);

  useIntersectionObserver([pathname, search]);

  // Misma firma que antes ('menu', 'eventos?tipo=catering'), ahora con URL real
  // Si ya estás en esa página (p. ej. "Sucursales" estando en Sucursales), solo sube
  const navigate = useCallback((page) => irA(toPath(page)), [irA]);

  const handleModalAccept = () => setModalData(null);

  return (
    <div className={pageLoaded ? 'page-loaded' : ''}>
      {splash && <Splash onFin={cerrarSplash} />}
      <a className="skip-link" href="#contenido">{t('comun.saltarContenido')}</a>
      <Header onReservationClick={() => openReservation(null)} onNavigate={navigate} />

      <div id="contenido" key={pathname} className={`pagina${vtRuta.current === pathname ? ' sin-entrada' : ''}`}>
        <Routes>
          <Route path="/" element={<HomePage onNavigate={navigate} onReservationClick={openReservation} />} />
          <Route path="/menu" element={<MenuPage onReservationClick={openReservation} />} />
          <Route path="/horarios" element={<LocationRoute onReservationClick={openReservation} />} />
          <Route path="/horarios/:id" element={<LocationDetailRoute onReservationClick={openReservation} />} />
          <Route path="/delivery" element={<DeliveryPage />} />
          {PEDIDOS_ACTIVOS && <Route path="/delivery/pedido" element={<CheckoutPage />} />}
          {PEDIDOS_ACTIVOS && <Route path="/delivery/seguimiento/:token" element={<SeguimientoPage />} />}
          {PEDIDOS_ACTIVOS && <Route path="/terminos-de-venta" element={<TerminosPage />} />}
          <Route path="/eventos" element={<EventsRoute onReservationClick={openReservation} />} />
          <Route path="/acerca" element={<AboutPage onNavigate={navigate} onNavigateLocal={navigate} />} />
          <Route path="/contacto" element={<ContactPage onNavigate={navigate} onNavigateLocal={navigate} />} />
          <Route path="/boletin" element={<NewsletterPage onNavigate={navigate} onNavigateLocal={navigate} />} />
          <Route path="/aviso-de-privacidad" element={<PrivacyPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>

      <div className="container">
        <Footer onJobClick={(msg) => setModalData(msg)} onNavigate={navigate} />
      </div>

      {modalData && (
        <div className="modal-overlay active" onClick={handleModalAccept}>
          <div className="modal-box" role="dialog" aria-modal="true" onClick={e => e.stopPropagation()}>
            <p>{modalData}</p>
            <button className="btn-submit-event" onClick={handleModalAccept} style={{ marginTop: 20 }}>{t('comun.aceptar')}</button>
          </div>
        </div>
      )}

      <button
        type="button"
        className={`scroll-top${verSubir ? ' visible' : ''}${pieVisible ? ' en-pie' : ''}`}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label={t('comun.volverArriba')}
        tabIndex={verSubir ? 0 : -1}
      >
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
          <path d="M12 19V5M6 11l6-6 6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Sin barra en el hero del inicio (trae sus botones), en el Menú (ya estás ahí y cierra con su franja roja) ni al escribir */}
      <div className={`barra-movil${(pathname === '/' && !pasadoHero) || pathname === '/menu' || pathname.startsWith('/delivery/') || escribiendo || pieVisible ? ' oculta' : ''}`} role="group" aria-label={t('comun.accesosRapidos')}>
        <button type="button" className="barra-movil-reservar" onClick={() => openReservation(null)}>{t('comun.reservarMesa')}</button>
        <Link to="/menu" className="barra-movil-menu">{t('comun.verMenuCorto')}</Link>
      </div>

      {PEDIDOS_ACTIVOS && <BarraPedido />}
      {PEDIDOS_ACTIVOS && <PanelPedido />}

      <ReservationSidebar
        isOpen={isReservationOpen}
        onClose={closeReservation}
        initialData={reservationData}
      />
    </div>
  );
};

export default App;
