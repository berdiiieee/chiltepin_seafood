import { useState, useEffect } from 'react';
import './css/styles.css';
import Header from './components/Header';
import Footer from './components/Footer';
import ReservationSidebar from './components/ReservationSidebar';
import HomePage from './pages/HomePage';
import MenuPage from './pages/MenuPage';
import LocationPage from './pages/LocationPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import EventsPage from './pages/EventsPage';
import NewsletterPage from './pages/NewsletterPage';
import { useIntersectionObserver } from './hooks/useIntersectionObserver';

const App = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [isReservationOpen, setIsReservationOpen] = useState(false);
  const [reservationData, setReservationData] = useState(null);
  const [pageLoaded, setPageLoaded] = useState(false);
  const [modalData, setModalData] = useState(null);

  const locationMap = { seafood: 'Chiltepin Plaza Real', '450': 'Chiltepin Plaza 450' };

  const openReservation = (loc) => {
    if (loc && locationMap[loc]) {
      setReservationData({ location: locationMap[loc] });
    } else {
      setReservationData(null);
    }
    setIsReservationOpen(true);
  };

  const closeReservation = () => {
    setIsReservationOpen(false);
    setReservationData(null);
  };

  useEffect(() => {
    setPageLoaded(true);
  }, []);

  useIntersectionObserver([currentPage]);

  const navigate = (page) => {
    setCurrentPage(page);
    setIsReservationOpen(false);
    setReservationData(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateLocal = (page) => {
    setCurrentPage(page);
    setIsReservationOpen(false);
    setReservationData(null);
  };

  const handleModalAccept = () => setModalData(null);

  const renderPage = () => {
    if (currentPage.startsWith('eventos')) {
      const params = new URLSearchParams(currentPage.split('?')[1] || '');
      return <EventsPage initialTipo={params.get('tipo')} />;
    }
    if (currentPage.startsWith('horarioyubicacion')) {
      const params = new URLSearchParams(currentPage.split('?')[1] || '');
      const sucursal = params.get('sucursal');
      return <LocationPage initialSucursal={sucursal} onReservationClick={(loc) => openReservation(loc)} />;
    }
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={navigate} />;
      case 'menu':
        return <MenuPage />;
      case 'acercade':
        return <AboutPage onNavigate={navigate} onNavigateLocal={navigateLocal} />;
      case 'contacto':
        return <ContactPage onNavigate={navigate} onNavigateLocal={navigateLocal} />;
      case 'boletin':
        return <NewsletterPage onNavigate={navigate} onNavigateLocal={navigateLocal} />;
      default:
        return <HomePage onNavigate={navigate} />;
    }
  };

  return (
    <div className={pageLoaded ? 'page-loaded' : ''}>
      <Header
        onReservationClick={() => openReservation(null)}
        onNavigate={navigate}
      />

      {renderPage()}

      <div className="container">
        <Footer
          onJobClick={(msg) => setModalData(msg)}
          onNavigate={navigate}
        />
      </div>

      {modalData && (
        <div className="modal-overlay active" onClick={handleModalAccept}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <p>{modalData}</p>
            <button className="btn-submit-event" onClick={handleModalAccept} style={{ marginTop: 20 }}>Aceptar</button>
          </div>
        </div>
      )}

      <button
        className="scroll-top"
        id="scrollTopBtn"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Volver arriba"
      >↑</button>

      <ReservationSidebar
        isOpen={isReservationOpen}
        onClose={closeReservation}
        initialData={reservationData}
      />
    </div>
  );
};

export default App;
