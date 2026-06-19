import NavArrow from '../components/NavArrow';

const services = [
  { title: 'Catering & Banquetes', text: 'Servicio integral para eventos: paquetes personalizados que incluyen alimentos, complementos (salsas, tortillas, tostadas) y equipo de servicio completo.' },
  { title: 'Menús Personalizados', text: 'Si bien operamos a la carta, diseñamos menús de tres tiempos y menús estructurados para ocasiones especiales con la anticipación adecuada.' },
  { title: 'Delivery Propio', text: 'Actualmente enviamos a través de Rappi y DiDi Food con el menú completo disponible. El siguiente paso estratégico es implementar flotilla propia de reparto.' },
  { title: 'Salsas Artesanales', text: 'Estamos a punto de lanzar oficialmente nuestra línea de salsas para llevar, incluyendo la salsa estrella a base de chiltepín, para que lleves el sabor de la casa a tu hogar.' }
];

const AboutPage = ({ onNavigate, onNavigateLocal }) => {

  return (
    <>
      <div className="container">
        <div className="page-header" style={{ backgroundImage: "linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('/img/ubicaciones/plaza-real/escaleras.jpg')" }}>
          <div>
            <h1 className="page-title">Nuestra Historia</h1>
            <p className="page-subtitle">Y lo que nos define</p>
          </div>
          <NavArrow direction="left" onClick={() => onNavigateLocal && onNavigateLocal('boletin')} />
          <NavArrow direction="right" onClick={() => onNavigateLocal && onNavigateLocal('contacto')} />
        </div>
      </div>

      <main className="container">
        <section className="story-section">
          <div className="story-grid">
            <div className="story-text reveal reveal-left">
              <h2 className="section-title">Inspiración</h2>
              <p>
                <strong>Chiltepin Seafood abrió sus puertas el 3 de diciembre de 2022</strong>, pero su historia comenzó mucho antes. La inspiración nació del sueño de toda la vida de tener un restaurante propio, un anhelo que nos acompañó durante años.
              </p>
              <p>
                El proyecto se conceptualizó trabajabando en el sector de la construcción en <strong>Canadá</strong>. Fue allí, lejos de casa, donde tomamos la decisión de regresar a <strong>Durango, México</strong>, para emprender y crear un concepto gastronómico completamente diferente a lo convencional.
              </p>
            </div>
            <div className="story-image right reveal reveal-right" style={{ backgroundImage: "url('/img/galeria/galeria2.jpeg')" }}></div>
          </div>
        </section>

        <section className="story-section">
          <div className="story-grid">
            <div className="story-image left reveal reveal-left" style={{ backgroundImage: "url('/img/acercade/origennombre.jpg')" }}></div>
            <div className="story-text reveal reveal-right">
              <h2 className="section-title">El ingrediente estrella</h2>
              <p>
                Durante el desarrollo del menú, notamos que el sazonador principal de nuestros platillos se convirtió naturalmente en el ingrediente estrella de la casa. Este pequeño chile silvestre, originario de regiones como Sinaloa y Sonora, le da identidad a cada receta.
              </p>
            </div>
          </div>
        </section>

        <div className="quote-block reveal">
          <blockquote>&ldquo;No solo creamos un restaurante, creamos un concepto que rompe con lo tradicional&rdquo;</blockquote>
        </div>

        <section className="services-section reveal">
          <p className="section-subtitle" style={{ textAlign: 'center', marginBottom: 0 }}>Más allá del restaurante</p>
          <h2 className="section-title" style={{ display: 'block', textAlign: 'center' }}>Servicios &amp; Expansión</h2>
          <div className="services-grid">
            {services.map((s, i) => (
              <div key={i} className="service-card">
                <span className="service-num">{String(i + 1).padStart(2, '0')}</span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
};

export default AboutPage;
