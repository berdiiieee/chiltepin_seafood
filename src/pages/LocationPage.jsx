import { useState, useEffect } from 'react';

const locationsData = {
  seafood: {
    title: 'CHILTEPIN PLAZA REAL',
    address: 'Politecnico Nacional 403<br />Huizache I, Durango, Dgo 34170',
    phone: '618.200.3865',
    email: 'info@chiltepin.com',
    hours: [
      { label: 'Lunes a Jueves', time: '12:00 PM - 10:00 PM' },
      { label: 'Viernes a Sábado', time: '12:00 PM - 12:00 AM' },
      { label: 'Domingo', time: '12:00 PM - 8:00 PM' },
    ],
    images: [
      '/img/ubicaciones/plaza-real/fachada.jpeg',
      '/img/ubicaciones/plaza-real/interior2doP.jpg',
      '/img/ubicaciones/plaza-real/escaleras.jpg',
    ],
    promos: [
      { day: 'Lun', desc: 'Ceviche + agua del día', price: '$65' },
      { day: 'Mar', desc: 'Tacos 3x2', price: '' },
      { day: 'Mié', desc: 'Chicharrón', price: '$110' },
      { day: 'Jue', desc: 'Atún salsas negras', price: '$160' },
      { day: 'Vie', desc: 'Burro norteño', price: '$110' },
    ],
    mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3607.0499283099075!2d-104.65695134982525!3d24.004646701859894!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x869bb72a9cd96645%3A0xa72b972e2d936398!2sChiltepin%20SeaFood!5e0!3m2!1ses!2smx!4v1776994599450!5m2!1ses!2smx',
  },
  450: {
    title: 'CHILTEPIN<br />PLAZA 450',
    address: 'Local 77, Plaza 450<br />Los Cipreses, Durango, Dgo 34217',
    phone: '618.200.3865',
    email: '450@chiltepin.com',
    hours: [
      { label: 'Lunes a Domingo', time: '11:30 AM - 7:00 PM' },
    ],
    images: [
      '/img/ubicaciones/450/fachada.jpeg',
      '/img/ubicaciones/450/1.jpeg',
      '/img/ubicaciones/450/2.jpeg',
      '/img/ubicaciones/450/3.jpeg',
      '/img/ubicaciones/450/4.jpeg',
    ],
    promos: [
      { day: 'Lun', desc: 'Tostada ceviche + agua', price: '$65' },
      { day: 'Mar', desc: 'Tacos capeados 3x2', price: '' },
      { day: 'Mié', desc: 'Chicharrón', price: '$110' },
      { day: 'Jue', desc: 'Hamburguesa bucanera + papas', price: '$99' },
      { day: 'Vie', desc: 'Aguachiles gratis en compra de cubeta de cerveza', price: '' },
    ],
    mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3643.340741445057!2d-104.646585725027!3d24.05430247846428!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x869bb738f6f10615%3A0x7e423aadb19046ab!2sChiltepin%20450!5e0!3m2!1ses!2smx!4v1776994643801!5m2!1ses!2smx',
  },
};

const LocationPage = ({ initialSucursal, onReservationClick }) => {
  const [activeSucursal, setActiveSucursal] = useState(initialSucursal || 'seafood');
  const [imageIndex, setImageIndex] = useState({ seafood: 0, 450: 0 });

  useEffect(() => {
    if (initialSucursal && locationsData[initialSucursal]) {
      setActiveSucursal(initialSucursal);
    }
  }, [initialSucursal]);

  useEffect(() => {
    const count = locationsData[activeSucursal].images.length;
    const timer = setInterval(() => {
      setImageIndex(prev => ({
        ...prev,
        [activeSucursal]: (prev[activeSucursal] + 1) % count,
      }));
    }, 5000);
    return () => clearInterval(timer);
  }, [activeSucursal, imageIndex]);

  const data = locationsData[activeSucursal] || locationsData.seafood;

  return (
    <>
      <main className="container">
        <div className="location-view">
          <div className="loc-details reveal reveal-left">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 30 }}>
              <h1 className="loc-title" id="display-title" style={{ marginBottom: 0 }} dangerouslySetInnerHTML={{ __html: data.title }}></h1>
              <button
                onClick={() => setActiveSucursal(activeSucursal === 'seafood' ? '450' : 'seafood')}
                style={{
                  background: 'none', border: 'none', color: 'var(--accent-color)',
                  cursor: 'pointer', padding: 0, lineHeight: 1, flexShrink: 0,
                  fontFamily: 'var(--font-headings)', fontSize: '3.2rem', fontWeight: 600,
                  opacity: 0.55, transition: 'opacity 0.2s, transform 0.2s'
                }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateX(3px)'; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '0.55'; e.currentTarget.style.transform = 'translateX(0)'; }}
              >{activeSucursal === 'seafood' ? '>' : '<'}</button>
            </div>

            <div key={activeSucursal} className="fade-in">
            <div className="loc-block">
              <strong>Dirección</strong>
              <p id="display-address" dangerouslySetInnerHTML={{ __html: data.address }}></p>
            </div>

            <div className="loc-block">
              <strong>Contacto</strong>
              <p id="display-phone"><a href={`tel:${data.phone}`}>{data.phone}</a></p>
              <a href={`mailto:${data.email}`} id="display-email">{data.email}</a>
            </div>

            <div className="loc-block">
              <strong>Horarios</strong>
              <div id="display-hours">
                {data.hours.map((row, i) => (
                  <div className="hours-row" key={i}>
                    <span>{row.label}</span>
                    <span>{row.time}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="loc-block" id="display-promos-block">
              <strong>Promociones de la Semana</strong>
              <div id="display-promos">
                {data.promos.map((p, i) => (
                  <div className="promo-row" key={i}>
                    <span className="promo-day">{p.day}</span>
                    <span className="promo-desc">{p.desc}</span>
                    <span className="promo-price">{p.price}</span>
                  </div>
                ))}
              </div>
            </div>

            <a
              href="#"
              className="btn-outline"
              onClick={e => { e.preventDefault(); if (onReservationClick) onReservationClick(activeSucursal); }}
            >
              Reservar Mesa
            </a>
            </div>
          </div>

          <div key={activeSucursal} className="loc-image-container reveal reveal-right fade-in">
            <div className="loc-image-track" style={{ transform: `translateX(-${(imageIndex[activeSucursal] || 0) * 100}%)` }}>
              {data.images.map((img, i) => (
                <div key={i} className="loc-image-slide" style={{ backgroundImage: `url('${img}')` }}></div>
              ))}
            </div>
            <button className="carousel-arrow prev" onClick={() => {
              const count = data.images.length;
              setImageIndex(prev => ({ ...prev, [activeSucursal]: (prev[activeSucursal] - 1 + count) % count }));
            }}>&lt;</button>
            <button className="carousel-arrow next" onClick={() => {
              const count = data.images.length;
              setImageIndex(prev => ({ ...prev, [activeSucursal]: (prev[activeSucursal] + 1) % count }));
            }}>&gt;</button>
            <div className="loc-card-dots">
              {data.images.map((_, i) => (
                <span key={i} className={`dot${i === (imageIndex[activeSucursal] || 0) ? ' active' : ''}`} onClick={() => setImageIndex(prev => ({ ...prev, [activeSucursal]: i }))}></span>
              ))}
            </div>
          </div>
        </div>
      </main>

      <div key={activeSucursal} className="map-section reveal reveal-scale fade-in">
        <iframe
          id="display-map"
          src={data.mapUrl}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Ubicación en mapa"
        ></iframe>
      </div>
    </>
  );
};

export default LocationPage;
