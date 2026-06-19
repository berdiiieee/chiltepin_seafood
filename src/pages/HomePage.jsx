import { useEffect, useState } from 'react';

const locationCards = [
  {
    key: 'plaza',
    images: [
      '/img/ubicaciones/plaza-real/fachada.jpeg',
      '/img/ubicaciones/plaza-real/interior2doP.jpg',
      '/img/ubicaciones/plaza-real/escaleras.jpg',
    ],
    title: 'CHILTEPIN PLAZA REAL',
    address: 'Politecnico Nacional 403<br />Huizache I, Durango, Dgo 34170',
    navTarget: 'horarioyubicacion?sucursal=seafood',
  },
  {
    key: '450',
    images: [
      '/img/ubicaciones/450/fachada.jpeg',
      '/img/ubicaciones/450/1.jpeg',
      '/img/ubicaciones/450/2.jpeg',
      '/img/ubicaciones/450/3.jpeg',
      '/img/ubicaciones/450/4.jpeg',
    ],
    title: 'CHILTEPIN PLAZA 450',
    address: 'Local 77, Plaza 450<br />Los Cipreses, Durango, Dgo 34217',
    navTarget: 'horarioyubicacion?sucursal=450',
  },
];

const HomePage = ({ onNavigate }) => {
  const [showSplash, setShowSplash] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [cardSlides, setCardSlides] = useState({ plaza: 0, '450': 0 });
  const slideCount = 3;

  useEffect(() => {
    if (sessionStorage.getItem('splashShown')) {
      setShowSplash(false);
    } else {
      const fadeTimer = setTimeout(() => setFadeOut(true), 2400);
      const removeTimer = setTimeout(() => {
        setShowSplash(false);
        sessionStorage.setItem('splashShown', 'true');
      }, 2900);
      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(removeTimer);
      };
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slideCount);
    }, 5000);
    return () => clearInterval(timer);
  }, [currentSlide]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCardSlides(prev => {
        const next = { ...prev };
        for (const card of locationCards) {
          next[card.key] = (next[card.key] + 1) % card.images.length;
        }
        return next;
      });
    }, 5000);
    return () => clearInterval(timer);
  }, [cardSlides]);

  useEffect(() => {
    const counters = document.querySelectorAll('.counter-value');
    if (counters.length === 0) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.dataset.target);
          const duration = 1500;
          const startTime = performance.now();
          function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            el.textContent = Math.floor(progress * target);
            if (progress < 1) requestAnimationFrame(update);
          }
          requestAnimationFrame(update);
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slideCount) % slideCount);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slideCount);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const goToCardSlide = (card, index) => {
    setCardSlides(prev => ({ ...prev, [card]: index }));
  };

  const prevCardSlide = (card) => {
    const count = locationCards.find(c => c.key === card).images.length;
    setCardSlides(prev => ({ ...prev, [card]: (prev[card] - 1 + count) % count }));
  };

  const nextCardSlide = (card) => {
    const count = locationCards.find(c => c.key === card).images.length;
    setCardSlides(prev => ({ ...prev, [card]: (prev[card] + 1) % count }));
  };

  return (
    <>
      {showSplash && (
        <div id="splash" className={fadeOut ? 'fade-out' : ''}>
          <img src="/img/logos/logo_chilte.png" alt="Chiltepin Plaza Real" />
        </div>
      )}

      <section className="carousel-section">
        <div className="carousel-track" id="carouselTrack" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
          <div className="carousel-slide" style={{ backgroundImage: "url('/img/hero/carousel1.jpg')" }}></div>
          <div className="carousel-slide" style={{ backgroundImage: "url('/img/hero/carousel2.jpg')" }}></div>
          <div className="carousel-slide" style={{ backgroundImage: "url('/img/hero/carousel3.jpg')" }}></div>
        </div>
        <button className="carousel-arrow prev" onClick={prevSlide}>&lt;</button>
        <button className="carousel-arrow next" onClick={nextSlide}>&gt;</button>
        <div className="carousel-dots" id="carouselDots">
          {[0, 1, 2].map((i) => (
            <span key={i} className={`dot${i === currentSlide ? ' active' : ''}`} data-slide={i} onClick={() => goToSlide(i)}></span>
          ))}
        </div>
      </section>

      <div className="container">
        <main>
          <section id="about" className="reveal reveal-up">
            <h1 className="section-title">Sobre Nosotros</h1>
            <p className="intro-text">
              Fundado en el corazón de Durango, Chiltepin Seafood nace del amor por el mar y el sabor auténtico de la costa del Pacífico. Nuestra cocina se guía por el chile chiltepín silvestre y relaciones duraderas con pescadores locales y proveedores de ingredientes frescos de la región.
            </p>
          </section>

          <div className="counter-grid">
            <div className="counter-item reveal reveal-up">
              <span className="counter-number"><span className="counter-value" data-target="2022">0</span></span>
              <span className="counter-label">Fundación</span>
            </div>
            <div className="counter-item reveal reveal-up delay-1">
              <span className="counter-number"><span className="counter-value" data-target="200">0</span><span className="suffix">+</span></span>
              <span className="counter-label">Clientes por Día</span>
            </div>
            <div className="counter-item reveal reveal-up delay-2">
              <span className="counter-number"><span className="counter-value" data-target="2">0</span></span>
              <span className="counter-label">Sucursales</span>
            </div>
          </div>

          <section id="locations">
            <div className="locations-grid">
              {locationCards.map((card, idx) => {
                const slide = cardSlides[card.key] || 0;
                return (
                  <div key={card.key} className={`location-card reveal reveal-up${idx > 0 ? ' delay-2' : ''}`}>
                    <div className="loc-card-carousel">
                      <div className="loc-card-track" style={{ transform: `translateX(-${slide * 100}%)` }}>
                        {card.images.map((img, i) => (
                          <div key={i} className="loc-card-slide" style={{ backgroundImage: `url('${img}')` }}></div>
                        ))}
                      </div>
                      <button className="carousel-arrow prev" onClick={() => prevCardSlide(card.key)}>&lt;</button>
                      <button className="carousel-arrow next" onClick={() => nextCardSlide(card.key)}>&gt;</button>
                      <div className="loc-card-dots">
                        {card.images.map((_, i) => (
                          <span key={i} className={`dot${i === slide ? ' active' : ''}`} onClick={() => goToCardSlide(card.key, i)}></span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h2 className="location-title">{card.title}</h2>
                    </div>
                    <div className="location-details">
                      <p dangerouslySetInnerHTML={{ __html: card.address }}></p>
                      <strong>Teléfono:</strong>
                      <p><a href="tel:6182003865">618.200.3865</a></p>
                      <strong>Email:</strong>
                      <p>info@chiltepin.com</p>
                      <button className="btn-location" onClick={() => onNavigate(card.navTarget)}>Ver Detalles y Mapa</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <hr className="divider" />
          <section id="gallery">
            <h2 className="section-title"></h2>
            <div className="gallery-grid">
              <div className="gallery-card reveal reveal-up" style={{ backgroundImage: "url('/img/galeria/galeria1.jpeg')" }}></div>
              <div className="gallery-card reveal reveal-up delay-1" style={{ backgroundImage: "url('/img/galeria/galeria2.jpeg')" }}></div>
              <div className="gallery-card reveal reveal-up delay-2" style={{ backgroundImage: "url('/img/galeria/galeria3.jpeg')" }}></div>
              <div className="gallery-card reveal reveal-up delay-3" style={{ backgroundImage: "url('/img/galeria/galeria4.jpeg')" }}></div>
              <div className="gallery-card reveal reveal-up delay-4" style={{ backgroundImage: "url('/img/galeria/galeria5.jpeg')" }}></div>
              <div className="gallery-card reveal reveal-up delay-5" style={{ backgroundImage: "url('/img/galeria/galeria6.jpeg')" }}></div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
};

export default HomePage;
