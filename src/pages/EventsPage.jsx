import { useState, useEffect, useRef } from 'react';
import { usePreloadImages } from '../hooks/usePreloadImages';

const eventData = {
  privados: {
    title: 'Eventos\nPrivados',
    desc: 'Crea momentos inolvidables en nuestras instalaciones. Ofrecemos áreas exclusivas para celebraciones personales o corporativas con un servicio impecable y la mejor cocina del mar en Durango.',
    img: '/img/galeria/galeria2.jpeg',
    form: 'Cotizar Evento Privado'
  },
  catering: {
    title: 'Catering & Banquetes',
    desc: 'Llevamos la experiencia Chiltepin Plaza Real a tu puerta. Servicio de barras de aguachile, ceviches y banquetes completos para bodas, fiestas y eventos corporativos externos.',
    img: '/img/galeria/galeria3.jpeg',
    form: 'Cotizar Servicio de Catering'
  }
};

const EventsPage = ({ initialTipo }) => {
  const [activeTab, setActiveTab] = useState(initialTipo || 'privados');
  const [form, setForm] = useState({ nombre: '', telefono: '', email: '', fecha: '', invitados: '', comentarios: '' });
  const contentRef = useRef(null);

  usePreloadImages([eventData.privados.img, eventData.catering.img]);

  useEffect(() => {
    if (initialTipo) setActiveTab(initialTipo);
  }, [initialTipo]);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
    }
  }, [activeTab]);

  const data = eventData[activeTab] || eventData.privados;

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => e.preventDefault();

  return (
    <main className="container">

      <div className="event-view">
        <div key={activeTab} className="event-image-side fade-in" style={{ backgroundImage: `url('${data.img}')` }}></div>

        <div className="event-content-side">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h1 className="event-title" style={{ marginBottom: 0 }}>{data.title}</h1>
            <button
              onClick={() => setActiveTab(activeTab === 'privados' ? 'catering' : 'privados')}
              style={{
                background: 'none', border: 'none', color: 'var(--accent-color)',
                cursor: 'pointer', padding: 0, lineHeight: 1, flexShrink: 0,
                fontFamily: 'var(--font-headings)', fontSize: '3.2rem', fontWeight: 600,
                opacity: 0.55, transition: 'opacity 0.2s, transform 0.2s'
              }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateX(3px)'; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '0.55'; e.currentTarget.style.transform = 'translateX(0)'; }}
            >{activeTab === 'privados' ? '>' : '<'}</button>
          </div>
          <div key={activeTab} className="fade-in" ref={contentRef}>
            <p className="event-description">{data.desc}</p>
            <div className="form-container">
              <h2 className="form-title">{data.form}</h2>
            <form className="event-form" onSubmit={handleSubmit}>
              <div className="input-group reveal reveal-up">
                <label>Nombre</label>
                <input type="text" name="nombre" required value={form.nombre} onChange={handleChange} />
                <span className="field-error" id="err-cot-nombre"></span>
              </div>
              <div className="input-group reveal reveal-up delay-1">
                <label>Teléfono</label>
                <input type="tel" name="telefono" value={form.telefono} onChange={handleChange} />
                <span className="field-error" id="err-cot-telefono"></span>
              </div>
              <div className="input-group full-width reveal reveal-up delay-2">
                <label>Correo Electrónico</label>
                <input type="email" name="email" required value={form.email} onChange={handleChange} />
                <span className="field-error" id="err-cot-email"></span>
              </div>
              <div className="input-group reveal reveal-up delay-3">
                <label>Fecha del Evento</label>
                <input type="date" name="fecha" required value={form.fecha} onChange={handleChange} />
                <span className="field-error" id="err-cot-fecha"></span>
              </div>
              <div className="input-group reveal reveal-up delay-4">
                <label>Nº de Invitados</label>
                <input type="number" name="invitados" required min="1" value={form.invitados} onChange={handleChange} />
                <span className="field-error" id="err-cot-invitados"></span>
              </div>
              <div className="input-group full-width reveal reveal-up delay-5">
                <label>Comentarios Adicionales</label>
                <textarea name="comentarios" rows="3" placeholder="Restricciones alimenticias, motivo del evento, etc." value={form.comentarios} onChange={handleChange}></textarea>
              </div>
              <div className="full-width">
                <button type="submit" className="btn-submit-event">Enviar Solicitud</button>
              </div>
            </form>
          </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default EventsPage;
