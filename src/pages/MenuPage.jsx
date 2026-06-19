import { useState, useEffect, useRef } from 'react';
import MenuItem from '../components/MenuItem';
import MenuSection from '../components/MenuSection';

const categories = [
  { id: 'all', label: 'Todo' },
  { id: 'entradas', label: 'Entradas' },
  { id: 'aguachile', label: 'Aguachile' },
  { id: 'coctel', label: 'Cóctel' },
  { id: 'kids', label: 'Kids' },
  { id: 'tostadas', label: 'Tostadas' },
  { id: 'lonuevo', label: 'Lo Nuevo' },
  { id: 'tacosburros', label: 'Tacos & Burros' },
  { id: 'bebidas', label: 'Bebidas' },
  { id: 'promos', label: 'Promociones' },
];

const foodSections = [
  {
    id: 'entradas', title: 'Entradas', delay: '',
    items: [
      { name: 'Callo de hacha', price: '$145', desc: 'Laminado bañado de nuestra salsa.' },
      { name: 'Guacamole', price: '$65', desc: '100 g de guacamole acompañado de chicharrón de cuero y salsa majada.' },
      { name: 'Shot de ostión', price: '$85', desc: 'Ostión, camarón cocido, callo de almeja acompañado de pepino, cebolla morada, cilantro y leche de tigre.' },
      { name: 'Shot de camarón', price: '$80', desc: 'Camarón, pepino, cebolla morada, cilantro y leche de tigre.' },
      { name: 'Shot mix', price: '$90', desc: 'Camarón, ceviche, pulpo, pepino, cebolla morada, cilantro, leche de tigre y carne seca.' },
    ],
  },
  {
    id: 'aguachile', title: 'Aguachile', delay: '1',
    items: [
      { name: 'Aguachile chiltepín', price: '$199', desc: 'Camarón curtido en limón, acompañado de salsa chiltepín.' },
      { name: 'Aguachile de temporada', price: '$199', desc: 'Camarón curtido en limón, salsa de temporada y piña.' },
      { name: 'Aguachile mixto', price: '$199', desc: 'Combinación perfecta de la casa.' },
      { name: 'Aguachile verde', price: '$199', desc: 'Camarón curtido en limón, bañado en salsa de chile serrano - habanero.' },
      { name: 'Aguachile con atún', price: '$260', desc: 'Camarón cocido, atún fresco. Puede ser cocido o aguachileado.' },
      { name: 'Aguachile con pulpo', price: '$330', desc: '' },
    ],
  },
  {
    id: 'coctel', title: 'Cóctel', delay: '2',
    items: [
      { name: 'Cóctel de camarón', price: '$130', desc: 'Camarón cocido, aguacate y salsa coctelera.' },
      { name: 'Cóctel combinado', price: '$180', desc: 'Camarón cocido, camarón aguachile y ceviche de pescado.' },
      { name: 'Cóctel chiltepín premium', price: '$240', desc: 'Camarón cocido, camarón aguachile, ceviche de pescado, atún fresco y pulpo.' },
      { name: 'Tostada vaciada', price: '$100', desc: 'Ceviche de pescado, salsa coctelera.' },
    ],
  },
  {
    id: 'kids', title: 'Kids', delay: '3',
    items: [
      { name: 'Mini burger', price: '$94', desc: 'Carne de res y papas a la francesa.' },
      { name: 'Chicken tenders', price: '$84', desc: 'Pollo frito con papas a la francesa y aderezo.' },
      { name: 'Papas chiltepín', price: '$114', desc: 'Papas crisscut, carne asada y aguacate.' },
      { name: 'Postre', price: '$100', desc: '' },
    ],
  },
  {
    id: 'tostadas', title: 'Tostadas', delay: '',
    items: [
      { name: 'Combinada especial', price: '$135', desc: 'Ceviche de pescado, camarón aguachileado y cocido.' },
      { name: 'Tostada chiltepín premium', price: '$230', desc: 'Ceviche de pescado acompañado de camarón aguachile, camarón cocido, atún y pulpo.' },
      { name: 'Tostada de aguachile', price: '$145', desc: 'Camarón aguachile en salsa a elegir: verde, temporada o chiltepín.' },
      { name: 'Tosticeviches', price: '$165', desc: 'Ceviche de pescado, aguacate, leche de tigre. Camarón cocido y aguachile.' },
      { name: 'Trilogía de camarón', price: '$175', desc: 'Ceviche de camarón cocido, camarón aguachile y camarón seco, bañados en salsa a elegir: verde, temporada o chiltepín.' },
      { name: 'Sample mini tostadas', price: '$204', desc: '3 tipos de mini tostadas, ceviche, camarón y atún.' },
      { name: 'Ceviche chiltepín', price: '$75', desc: 'Pescado curtido en limón acompañado de chiltepín, cebolla morada, tomate, pepino, aguacate, bañados en salsa de la casa.' },
      { name: 'Atún en salsas negras', price: '$184', desc: 'Atún en láminas, pepino, cebolla, aguacate, bañados en leche de tigre y salsas negras.' },
      { name: 'Chicharrón', price: '$150', desc: 'Ceviche de pescado con camarón, sobre chicharrón de cerdo.' },
    ],
  },
  {
    id: 'lonuevo', title: 'Lo Nuevo', delay: '1',
    items: [
      { name: 'Tacos de asada', price: '$105', desc: '4 tacos de asada con una tostada llena de queso con guacamole y salsa majada.' },
      { name: 'Dobladita', price: '$70', desc: 'Taco dorado de chicharrón o frijoles con un topping de camarón aguachileado o ceviche de pescado.' },
      { name: 'Taco harina', price: '$80', desc: 'Camarón zarandeado sobre una cama de frijol con queso en tortilla de harina.' },
      { name: 'Taco caribe', price: '$70', desc: 'Chile caribe relleno de marlín ahumado.' },
      { name: 'Sopa marinera', price: '$204', desc: 'Pescado, camarón, papa, zanahoria y apio.' },
    ],
  },
  {
    id: 'tacosburros', title: 'Tacos, Burros y Más', delay: '2',
    items: [
      { name: 'Taco camarón capeado', price: '$45', desc: '' },
      { name: 'Taco pescado capeado', price: '$45', desc: '' },
      { name: 'Taco de atún', price: '$84', desc: 'Carnitas de atún, aguacate y cebolla curtida.' },
      { name: 'Taco güero', price: '$135', desc: 'Carne asada, camarón, queso y chile güero.' },
      { name: 'Burro norteño', price: '$135', desc: 'Carne asada, camarón capeado y aguacate. 30 cm tortilla.' },
      { name: 'Volcán marino', price: '$104', desc: 'Carne asada, camarón, queso y aguacate.' },
      { name: 'Hamburguesa bucanera', price: '$150', desc: 'Carne de res, camarón capeado, queso y tocino.' },
      { name: 'Pescado empanizado', price: '$204', desc: 'Pescado y arroz.' },
      { name: 'Ensalada chiltepín', price: '$145', desc: 'Col morada, zanahoria, tomate, pepino, arándanos, aguacate, chicharrón de atún y aderezos.' },
    ],
  },
];

const bebidaSubs = [
  {
    title: 'Bebidas sin Alcohol',
    items: [
      { name: 'Refresco', price: '$39' },
      { name: 'Limonada', price: '$45' },
      { name: 'Agua del día', price: '$35' },
      { name: 'Clamato Mineral', price: '$95' },
      { name: 'Botella Agua', price: '$30' },
      { name: 'Agua Mineral', price: '$40' },
    ],
  },
  {
    title: 'Coctelería',
    items: [
      { name: 'Carajillo', price: '$130', desc: 'Licor 43, café expreso, guarnitura naranja, canela.' },
      { name: 'Mi Viaje', price: '$130', desc: 'Tequila, jugo de guayaba natural, miel de agave, romero y limón.' },
      { name: 'Chiltepino', price: '$130', desc: 'Mezcal, endulzante, limón y pepino.' },
      { name: 'Tritón', price: '$130', desc: 'Ginebra, jugo de piña natural, arándano y un toque de limón.' },
    ],
  },
  {
    title: 'Cervezas',
    items: [
      { name: 'Corona', price: '$43' },
      { name: 'Victoria', price: '$43' },
      { name: 'Pacífico', price: '$43' },
      { name: 'Modelo Negra', price: '$48' },
      { name: 'Ultra', price: '$45' },
      { name: 'Michelado', price: '$30' },
      { name: 'Clamato', price: '$35' },
      { name: 'Chelado', price: '$25' },
    ],
  },
  {
    title: 'Licores - Tequila',
    items: [
      { name: 'Tradicional', price: '$110' },
      { name: 'José Cuervo', price: '$110' },
      { name: 'Don Julio 70', price: '$150' },
      { name: 'Maestro Dobel', price: '$150' },
      { name: 'Gran Malo', price: '$110' },
    ],
  },
  {
    title: 'Licores - Whiskey',
    items: [
      { name: 'Red Label', price: '$120' },
      { name: "Jack Daniel's", price: '$310' },
      { name: "Buchanan's", price: '$140' },
      { name: 'Black Label', price: '$140' },
    ],
  },
  {
    title: 'Licores - Mezcal',
    items: [
      { name: 'De la Casa', price: '$60' },
      { name: 'Apaluz', price: '$110' },
      { name: 'Boscal', price: '$140' },
    ],
  },
  {
    title: 'Licores - Vodka',
    items: [
      { name: 'Absolut 70', price: '$120' },
      { name: 'Smirnoff de Tamarindo', price: '$120' },
    ],
  },
  {
    title: 'Licores - Gin',
    items: [
      { name: "Gibson's", price: '$90' },
      { name: 'Tanqueray', price: '$140' },
      { name: 'Bombay', price: '$140' },
      { name: 'Hendricks', price: '$130' },
    ],
  },
  {
    title: 'Licores - Ron',
    items: [
      { name: 'Bacardi', price: '$100' },
      { name: 'Kraken', price: '$90' },
      { name: 'Bacardi Solera', price: '$100' },
      { name: 'Havana', price: '$130' },
    ],
  },
  {
    title: 'Otros Licores',
    items: [
      { name: 'Jager', price: '$110' },
      { name: 'Licor 43', price: '$110' },
      { name: 'Aperol', price: '$120' },
      { name: 'Hipnótic', price: '$130' },
    ],
  },
];

const subHeadingStyle = {
  fontFamily: 'var(--font-headings)',
  fontSize: '1.8rem',
  color: 'var(--accent-color)',
  textTransform: 'uppercase',
  letterSpacing: '1px',
  marginBottom: 30,
};

const MenuPage = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [prices, setPrices] = useState({});
  const sectionRefs = useRef({});

  useEffect(() => {
    fetch('/api/menu')
      .then(r => r.json())
      .then(data => {
        const map = {};
        data.sections.forEach(s => {
          s.items.forEach(i => {
            map[i.name] = i.price;
          });
        });
        setPrices(map);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const ids = ['entradas','aguachile','coctel','kids','tostadas','lonuevo','tacosburros','bebidas','promos'];
    const observer = new IntersectionObserver(entries => {
      const visible = entries
        .filter(e => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible.length > 0) {
        setActiveCategory(visible[0].target.id);
      }
    }, {
      rootMargin: '-80px 0px -60% 0px',
      threshold: 0,
    });
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const handleNavClick = (e, catId) => {
    e.preventDefault();
    document.getElementById(catId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const p = (hardcoded, dishName) => {
    if (prices[dishName] !== undefined) return '$' + prices[dishName];
    return hardcoded;
  };

  return (
    <>
      <div className="page-header" style={{ backgroundImage: "linear-gradient(rgba(0,0,0,0.52), rgba(0,0,0,0.52)), url('/img/menu/img_menu.jpg')" }}>
        <h1 className="page-title">Nuestro Menú</h1>
      </div>

      <div className="menu-nav-wrapper">
        <ul className="menu-nav">
          {categories.map(cat => (
            <li key={cat.id}>
              <a
                href="#"
                className={activeCategory === cat.id ? 'active' : ''}
                onClick={e => handleNavClick(e, cat.id)}
              >
                {cat.label}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <main className="menu-container">
        {foodSections.map(section => (
          <MenuSection key={section.id} id={section.id} title={section.title} delay={section.delay}>
            {section.items.map(item => (
              <MenuItem key={item.name} name={item.name} price={p(item.price, item.name)} desc={item.desc} />
            ))}
          </MenuSection>
        ))}

        <section id="bebidas" className="menu-section reveal reveal-up delay-3">
          <h2 className="section-heading">Bebidas</h2>
          {bebidaSubs.map(sub => (
            <div key={sub.title} style={{ marginBottom: 80 }}>
              <h3 style={subHeadingStyle}>{sub.title}</h3>
              <div className="menu-grid">
                {sub.items.map(item => (
                  <MenuItem key={item.name} name={item.name} price={p(item.price, item.name)} desc={item.desc} />
                ))}
              </div>
            </div>
          ))}
        </section>

        <section className="promos-section menu-section" id="promos">
          <div className="container">
            <h2 className="section-heading">Promociones de la Semana</h2>
            <div className="promos-grid">
              <div className="promo-col">
                <h3 className="promo-loc-title">Plaza Real</h3>
                <div className="promo-row"><span className="promo-day">Lun</span><span className="promo-desc">Ceviche + agua del día</span><span className="promo-price">$65</span></div>
                <div className="promo-row"><span className="promo-day">Mar</span><span className="promo-desc">Tacos 3x2</span><span className="promo-price"></span></div>
                <div className="promo-row"><span className="promo-day">Mié</span><span className="promo-desc">Chicharrón</span><span className="promo-price">$110</span></div>
                <div className="promo-row"><span className="promo-day">Jue</span><span className="promo-desc">Atún salsas negras</span><span className="promo-price">$160</span></div>
                <div className="promo-row"><span className="promo-day">Vie</span><span className="promo-desc">Burro norteño</span><span className="promo-price">$110</span></div>
              </div>
              <div className="promo-col">
                <h3 className="promo-loc-title">Plaza 450</h3>
                <div className="promo-row"><span className="promo-day">Lun</span><span className="promo-desc">Tostada ceviche + agua</span><span className="promo-price">$65</span></div>
                <div className="promo-row"><span className="promo-day">Mar</span><span className="promo-desc">Tacos capeados 3x2</span><span className="promo-price"></span></div>
                <div className="promo-row"><span className="promo-day">Mié</span><span className="promo-desc">Chicharrón</span><span className="promo-price">$110</span></div>
                <div className="promo-row"><span className="promo-day">Jue</span><span className="promo-desc">Hamburguesa bucanera + papas</span><span className="promo-price">$99</span></div>
                <div className="promo-row"><span className="promo-day">Vie</span><span className="promo-desc">Aguachiles gratis en compra de cubeta de cerveza</span><span className="promo-price"></span></div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default MenuPage;
