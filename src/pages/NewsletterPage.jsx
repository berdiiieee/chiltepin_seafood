import { useState } from 'react';
import NavArrow from '../components/NavArrow';

const NewsletterPage = ({ onNavigate, onNavigateLocal }) => {
  const [form, setForm] = useState({ nombre: '', email: '', telefono: '' });

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => e.preventDefault();

  return (
    <>
      <div className="container">
        <div className="page-header" style={{ backgroundImage: "linear-gradient(rgba(0,0,0,0.65), rgba(0,0,0,0.65)), url('/img/galeria/galeria3.jpeg')" }}>
          <div>
            <h1 className="page-title">Boletín</h1>
            <p className="page-subtitle">Recibe noticias y promociones exclusivas</p>
          </div>
          <NavArrow direction="left" onClick={() => onNavigateLocal && onNavigateLocal('contacto')} />
          <NavArrow direction="right" onClick={() => onNavigateLocal && onNavigateLocal('acercade')} />
        </div>
      </div>

      <main className="container">
        <section className="newsletter-section reveal reveal-up">
          <h2>Suscríbete a nuestro boletín</h2>
          <p>Déjanos tu correo o tu teléfono y recibe las últimas novedades de Chiltepin Seafood directamente en tu bandeja.</p>

          <form id="boletinForm" onSubmit={handleSubmit}>
            <div className="input-group reveal reveal-up delay-1">
              <label>Nombre</label>
              <input type="text" name="nombre" placeholder="Tu nombre (opcional)" value={form.nombre} onChange={handleChange} />
            </div>

            <div className="input-group reveal reveal-up delay-1" style={{ marginTop: 20 }}>
              <label>Correo Electrónico</label>
              <input type="email" name="email" placeholder="correo@ejemplo.com" value={form.email} onChange={handleChange} />
              <span className="field-error" id="err-bol-email"></span>
            </div>

            <div className="input-group reveal reveal-up delay-2" style={{ marginTop: 20 }}>
              <label>Teléfono</label>
              <input type="tel" name="telefono" placeholder="618..." value={form.telefono} onChange={handleChange} />
              <span className="field-error" id="err-bol-telefono"></span>
            </div>

            <button type="submit" className="btn-submit-event reveal reveal-up delay-2" style={{ marginTop: 20 }}>Suscribirme</button>
          </form>
        </section>
      </main>
    </>
  );
};

export default NewsletterPage;
