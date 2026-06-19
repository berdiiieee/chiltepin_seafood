import { useState } from 'react';
import NavArrow from '../components/NavArrow';

const ContactPage = ({ onNavigate, onNavigateLocal }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    email: '',
    tipo: 'Comentario',
    mensaje: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <>
      <div className="container">
        <div className="page-header" style={{ backgroundImage: "linear-gradient(rgba(0,0,0,0.65), rgba(0,0,0,0.65)), url('/img/hero/amigoschilte.jpeg')" }}>
          <div>
            <h1 className="page-title">Contáctanos</h1>
            <p className="page-subtitle">Estamos aquí para escucharte</p>
          </div>
          <NavArrow direction="left" onClick={() => onNavigateLocal && onNavigateLocal('acercade')} />
          <NavArrow direction="right" onClick={() => onNavigateLocal && onNavigateLocal('boletin')} />
        </div>
      </div>

      <main className="container">
        <section className="contact-section">
          <div className="contact-grid">
            <div className="contact-info reveal reveal-up">
              <div className="contact-info-item">
                <svg className="contact-info-icon" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="var(--accent-color)" strokeWidth="2" fill="none"/>
                  <circle cx="12" cy="9" r="2.5" stroke="var(--accent-color)" strokeWidth="2" fill="none"/>
                </svg>
                <div className="contact-info-text">
                  <strong>Chiltepin Plaza Real</strong>
                  Politécnico Nacional 403, Huizache I
                </div>
              </div>
              <div className="contact-info-item">
                <svg className="contact-info-icon" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="var(--accent-color)" strokeWidth="2" fill="none"/>
                  <circle cx="12" cy="9" r="2.5" stroke="var(--accent-color)" strokeWidth="2" fill="none"/>
                </svg>
                <div className="contact-info-text">
                  <strong>Chiltepin Plaza 450</strong>
                  Local 77, Plaza 450, Los Cipreses
                </div>
              </div>
              <div className="contact-info-item">
                <svg className="contact-info-icon" viewBox="0 0 24 24" fill="none">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" stroke="var(--accent-color)" strokeWidth="2" fill="none"/>
                </svg>
                <div className="contact-info-text">
                  <strong>Teléfono</strong>
                  618.200.3865
                </div>
              </div>
              <div className="contact-info-item">
                <svg className="contact-info-icon" viewBox="0 0 24 24" fill="none">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="var(--accent-color)" strokeWidth="2" fill="none"/>
                  <polyline points="22,6 12,13 2,6" stroke="var(--accent-color)" strokeWidth="2" fill="none"/>
                </svg>
                <div className="contact-info-text">
                  <strong>Correo Electrónico</strong>
                  info@chiltepin.com
                </div>
              </div>
              <div className="contact-info-item">
                <svg className="contact-info-icon" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="var(--accent-color)" strokeWidth="2" fill="none"/>
                  <path d="M12 6v6l4 2" stroke="var(--accent-color)" strokeWidth="2" fill="none"/>
                </svg>
                <div className="contact-info-text">
                  <strong>Horarios</strong>
                  Lun - Dom: 11:30 AM - 7:00 PM
                </div>
              </div>
            </div>

            <div className="reveal reveal-up delay-1">
              <form className="event-form" id="contactoForm" onSubmit={handleSubmit}>
                <div className="input-group">
                  <label>Nombre Completo</label>
                  <input type="text" name="nombre" required placeholder="Ej. Juan Pérez" value={formData.nombre} onChange={handleChange} />
                  <span className="field-error" id="err-ctc-nombre"></span>
                </div>
                <div className="input-group">
                  <label>Teléfono (opcional)</label>
                  <input type="tel" name="telefono" placeholder="618..." value={formData.telefono} onChange={handleChange} />
                  <span className="field-error" id="err-ctc-telefono"></span>
                </div>
                <div className="input-group full-width">
                  <label>Correo Electrónico</label>
                  <input type="email" name="email" required placeholder="correo@ejemplo.com" value={formData.email} onChange={handleChange} />
                  <span className="field-error" id="err-ctc-email"></span>
                </div>
                <div className="input-group full-width">
                  <label>Tipo de Mensaje</label>
                  <select name="tipo" value={formData.tipo} onChange={handleChange}>
                    <option>Comentario</option>
                    <option>Sugerencia</option>
                    <option>Queja</option>
                    <option>Otro</option>
                  </select>
                </div>
                <div className="input-group full-width">
                  <label>Mensaje</label>
                  <textarea name="mensaje" rows="5" required placeholder="Escribe tu mensaje aquí..." value={formData.mensaje} onChange={handleChange}></textarea>
                  <span className="field-error" id="err-ctc-mensaje"></span>
                </div>
                <div className="full-width">
                  <button type="submit" className="btn-submit-event">Enviar Mensaje</button>
                </div>
              </form>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default ContactPage;
