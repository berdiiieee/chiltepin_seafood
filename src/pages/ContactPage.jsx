import { useState } from 'react';
import { Link } from 'react-router-dom';
import CabeceraPagina from '../components/CabeceraPagina';
import Campo from '../components/Campo';
import AvisoFormulario from '../components/AvisoFormulario';
import AvisoEspera from '../components/AvisoEspera';
import CorreoLink from '../components/CorreoLink';
import { post } from '../api/client';
import { mensajeError } from '../api/errores';
import { conIdioma } from '../config/api';
import { SUCURSALES, TELEFONO, CORREO_CONTACTO, whatsappLink } from '../config/negocio';
import { useT } from '../context/Preferencias';

// Valores que acepta el backend en `tipoMensaje` (se envían en español; en pantalla se traducen)
const TIPOS = ['Comentario', 'Pregunta', 'Sugerencia', 'Queja', 'Otro'];
const VACIO = { nombre: '', telefono: '', email: '', tipo: 'Comentario', mensaje: '' };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Iconos de trazo: mismo estilo que los sellos del resto del sitio.
const trazo = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' };
const IconoTel = () => (<svg viewBox="0 0 32 32" width="32" height="32" aria-hidden="true"><path d="M8 5h5l2 6-3 2a15 15 0 0 0 7 7l2-3 6 2v5a2 2 0 0 1-2 2C14.5 26 6 17.5 6 7a2 2 0 0 1 2-2z" {...trazo} /></svg>);
const IconoCorreo = () => (<svg viewBox="0 0 32 32" width="32" height="32" aria-hidden="true"><rect x="4" y="8" width="24" height="16" rx="1.5" {...trazo} /><path d="M4.5 9l11.5 9 11.5-9" {...trazo} /></svg>);
const IconoChat = () => (<svg viewBox="0 0 32 32" width="32" height="32" aria-hidden="true"><path d="M16 5a11 11 0 0 0-9.5 16.5L5 27l5.7-1.5A11 11 0 1 0 16 5z" {...trazo} /><path d="M12 13c0 4 3 7 7 7" {...trazo} /></svg>);
const Flecha = () => <span aria-hidden="true">→</span>;

const ContactPage = () => {
  const [formData, setFormData] = useState(VACIO);
  const [errores, setErrores] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState('');
  const { t, idioma } = useT();
  const whatsapp = whatsappLink(t('contacto.whatsappMensaje'));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrores(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = {};
    if (formData.nombre.trim().length < 3) err.nombre = t('formularios.errNombre');
    if (!EMAIL_RE.test(formData.email.trim())) err.email = t('formularios.errCorreo');
    if (formData.telefono.trim() && !/^[\d\s+\-()]{7,20}$/.test(formData.telefono.trim())) err.telefono = t('formularios.errTelefono');
    if (formData.mensaje.trim().length < 10) err.mensaje = t('contacto.errMensaje');
    setErrores(err);
    if (Object.keys(err).length) return;

    setEnviando(true);
    setErrorEnvio('');
    try {
      await post('/api/contacto', conIdioma({
        nombre: formData.nombre.trim(),
        telefono: formData.telefono.trim() || undefined,
        email: formData.email.trim(),
        tipoMensaje: formData.tipo,
        mensaje: formData.mensaje.trim(),
      }, idioma));
      setEnviado(true);
      setFormData(VACIO);
    } catch (error) {
      setErrorEnvio(mensajeError(error, t, idioma, { telefono: TELEFONO }));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <main className="container">
      <CabeceraPagina eyebrow={t('contacto.eyebrow')} titulo={t('contacto.titulo')} intro={t('contacto.intro')} divisor />

      <section className="home-seccion home-nosotros suc-principal form-bloque" aria-label={t('contacto.eyebrow')}>
        <div className="nosotros-texto reveal reveal-up">
          <p className="eyebrow">{t('contacto.hablemos')}</p>
          <h2 className="titulo-seccion">{t('contacto.teLeemos')}</h2>
          <p className="intro-text">{t('contacto.texto')}</p>
          <ul className="sellos ev-sellos suc-datos">
            {SUCURSALES.map((s, i) => (
              <li key={s.id} style={{ '--i': i }}>
                <IconoTel />
                <span><strong>{s.nombreCorto}</strong><a href={s.telefonoLink}>{s.telefono}</a></span>
              </li>
            ))}
            <li style={{ '--i': SUCURSALES.length }}>
              <IconoCorreo />
              <span><strong>{t('contacto.correo')}</strong><CorreoLink correo={CORREO_CONTACTO} /></span>
            </li>
            {whatsapp && (
              <li style={{ '--i': SUCURSALES.length + 1 }}>
                <IconoChat />
                <span><strong>WhatsApp</strong><a href={whatsapp} target="_blank" rel="noopener noreferrer">{t('contacto.whatsapp')}</a></span>
              </li>
            )}
          </ul>
          <p className="contacto-sucursal">
            {t('contacto.buscasSucursal')} <Link to="/horarios" className="ev-enlace">{t('contacto.verSucursales')} <Flecha /></Link>
          </p>
        </div>

        <div className="reveal reveal-up delay-2">
          {enviado ? (
            <div className="form-ok" role="status">
              <svg className="form-ok-check" viewBox="0 0 52 52" width="64" height="64" aria-hidden="true">
                <circle cx="26" cy="26" r="24" {...trazo} />
                <path d="M15 27l7 7 15-15" {...trazo} strokeWidth="2" />
              </svg>
              <h3 className="form-ok-titulo">{t('contacto.okTitulo')}</h3>
              <p>{t('contacto.okTexto')}</p>
              <button type="button" className="link-flecha" onClick={() => setEnviado(false)}>{t('contacto.otro')} <Flecha /></button>
            </div>
          ) : (
            <form className="form-abierto" onSubmit={handleSubmit} noValidate>
              <fieldset className="tipo-mensaje full-width">
                <legend>{t('contacto.sobreQue')}</legend>
                <div className="tipo-mensaje-opciones">
                  {TIPOS.map(tipo => (
                    <label key={tipo} className={formData.tipo === tipo ? 'activo' : undefined}>
                      <input type="radio" name="tipo" value={tipo} checked={formData.tipo === tipo} onChange={handleChange} />
                      <span>{t(`contacto.tipos.${tipo}`)}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <Campo id="ctc-nombre" label={t('formularios.nombre')} error={errores.nombre}>
                <input type="text" name="nombre" maxLength={100} autoComplete="name" value={formData.nombre} onChange={handleChange} />
              </Campo>
              <Campo id="ctc-telefono" label={t('formularios.telefono')} opcional error={errores.telefono}>
                <input type="tel" name="telefono" maxLength={20} autoComplete="tel" value={formData.telefono} onChange={handleChange} />
              </Campo>
              <Campo id="ctc-email" label={t('formularios.correo')} completo error={errores.email}>
                <input type="email" name="email" maxLength={255} autoComplete="email" value={formData.email} onChange={handleChange} />
              </Campo>
              <Campo id="ctc-mensaje" label={t('contacto.mensaje')} completo error={errores.mensaje}>
                <textarea name="mensaje" rows="3" maxLength={1000} placeholder={t('contacto.placeholder')} value={formData.mensaje} onChange={handleChange}></textarea>
              </Campo>
              <div className="full-width">
                <AvisoFormulario datos={t('contacto.avisoDatos')} finalidad={t('contacto.avisoFinalidad')} />
                {errorEnvio && <p className="form-error-envio" role="alert">{errorEnvio}</p>}
                <AvisoEspera activo={enviando} />
                <div className="form-abierto-acciones">
                  <button type="submit" className="btn-principal" disabled={enviando}>{enviando ? t('formularios.enviando') : t('contacto.enviar')}</button>
                </div>
              </div>
            </form>
          )}
        </div>
      </section>
    </main>
  );
};

export default ContactPage;
