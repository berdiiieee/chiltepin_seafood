import { useState } from 'react';
import CabeceraPagina from '../components/CabeceraPagina';
import Campo from '../components/Campo';
import AvisoFormulario from '../components/AvisoFormulario';
import AvisoEspera from '../components/AvisoEspera';
import { post } from '../api/client';
import { mensajeError } from '../api/errores';
import { conIdioma } from '../config/api';
import { useT } from '../context/Preferencias';

const VACIO = { nombre: '', email: '', telefono: '' };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Iconos de trazo: mismo estilo que los sellos del resto del sitio.
const trazo = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' };
const IconoEtiqueta = () => (<svg viewBox="0 0 32 32" width="32" height="32" aria-hidden="true"><path d="M4 5h11l13 13-10 10L5 15z" {...trazo} /><circle cx="10.5" cy="10.5" r="2" {...trazo} /></svg>);
const IconoPlato = () => (<svg viewBox="0 0 32 32" width="32" height="32" aria-hidden="true"><path d="M4 25h24M6 25a10 10 0 0 1 20 0M16 15v-3M14 12h4" {...trazo} /></svg>);
const IconoCalendario = () => (<svg viewBox="0 0 32 32" width="32" height="32" aria-hidden="true"><rect x="5" y="7" width="22" height="20" rx="1.5" {...trazo} /><path d="M5 13h22M11 4v6M21 4v6M15 19l1.5 1.5L20 17" {...trazo} /></svg>);
const Flecha = () => <span aria-hidden="true">→</span>;

// Textos en boletin.items (mismo orden)
const ICONOS = [IconoEtiqueta, IconoPlato, IconoCalendario];

const NewsletterPage = () => {
  const [form, setForm] = useState(VACIO);
  const [errores, setErrores] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState('');
  const { t, idioma } = useT();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setErrores(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = {};
    if (!EMAIL_RE.test(form.email.trim())) err.email = t('formularios.errCorreo');
    if (form.telefono.trim() && !/^[\d\s+\-()]{7,20}$/.test(form.telefono.trim())) err.telefono = t('formularios.errTelefono');
    setErrores(err);
    if (Object.keys(err).length) return;

    setEnviando(true);
    setErrorEnvio('');
    try {
      await post('/api/boletin', conIdioma({
        nombre: form.nombre.trim() || undefined,
        email: form.email.trim(),
        telefono: form.telefono.trim() || undefined,
      }, idioma));
      setEnviado(true);
      setForm(VACIO);
    } catch (error) {
      setErrorEnvio(mensajeError(error, t, idioma));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <main className="container">
      <CabeceraPagina eyebrow={t('boletin.eyebrow')} titulo={t('boletin.titulo')} intro={t('boletin.intro')} divisor />

      <section className="home-seccion home-nosotros suc-principal form-bloque boletin-bloque" aria-label={t('boletin.aria')}>
        <div className="nosotros-texto reveal reveal-up">
          <p className="eyebrow">{t('boletin.queTeLlega')}</p>
          <h2 className="titulo-seccion">{t('boletin.sumate')}</h2>
          <p className="intro-text">{t('boletin.texto')}</p>
          <ul className="sellos ev-sellos">
            {t('boletin.items').map(({ titulo, texto }, i) => {
              const Icono = ICONOS[i];
              return (
              <li key={titulo} style={{ '--i': i }}>
                {Icono && <Icono />}
                <span><strong>{titulo}</strong>{texto}</span>
              </li>
              );
            })}
          </ul>
        </div>

        <div className="reveal reveal-up delay-2">
          {enviado ? (
            <div className="form-ok" role="status">
              <svg className="form-ok-check" viewBox="0 0 52 52" width="64" height="64" aria-hidden="true">
                <circle cx="26" cy="26" r="24" {...trazo} />
                <path d="M15 27l7 7 15-15" {...trazo} strokeWidth="2" />
              </svg>
              <h3 className="form-ok-titulo">{t('boletin.okTitulo')}</h3>
              <p>{t('boletin.okTexto')}</p>
              <button type="button" className="link-flecha" onClick={() => setEnviado(false)}>{t('boletin.otro')} <Flecha /></button>
            </div>
          ) : (
            <form className="form-abierto" onSubmit={handleSubmit} noValidate>
              <Campo id="bol-email" label={t('formularios.correo')} completo error={errores.email}>
                <input type="email" name="email" maxLength={255} autoComplete="email" value={form.email} onChange={handleChange} />
              </Campo>
              <Campo id="bol-nombre" label={t('formularios.nombre')} opcional>
                <input type="text" name="nombre" maxLength={100} autoComplete="name" value={form.nombre} onChange={handleChange} />
              </Campo>
              <Campo id="bol-tel" label={t('formularios.telefono')} opcional error={errores.telefono}>
                <input type="tel" name="telefono" maxLength={20} autoComplete="tel" value={form.telefono} onChange={handleChange} />
              </Campo>
              <div className="full-width">
                <AvisoFormulario datos={t('boletin.avisoDatos')} finalidad={t('boletin.avisoFinalidad')} />
                {errorEnvio && <p className="form-error-envio" role="alert">{errorEnvio}</p>}
                <AvisoEspera activo={enviando} />
                <div className="form-abierto-acciones">
                  <button type="submit" className="btn-principal" disabled={enviando}>{enviando ? t('formularios.enviando') : t('boletin.enviar')}</button>
                </div>
              </div>
            </form>
          )}
        </div>
      </section>
    </main>
  );
};

export default NewsletterPage;
