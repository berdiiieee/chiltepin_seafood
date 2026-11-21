import { useEffect, useState } from 'react';
import CabeceraPagina from '../components/CabeceraPagina';
import BandaFoto from '../components/BandaFoto';
import Campo from '../components/Campo';
import AvisoFormulario from '../components/AvisoFormulario';
import AvisoEspera from '../components/AvisoEspera';
import { post } from '../api/client';
import { mensajeError } from '../api/errores';
import { conIdioma } from '../config/api';
import { hoyLocal } from '../utils/horario';
import { SUCURSALES, TELEFONO } from '../config/negocio';
import { useT } from '../context/Preferencias';

// Límites de invitados. El backend acepta 10–500; por ahora el dueño quiere tope de 100
// (sin decirlo en pantalla: a los grupos más grandes se les invita a llamar).
const MIN_INVITADOS = 10;
const MAX_INVITADOS = 100;
const TELEFONO_VALIDO = /^[\d\s+\-()]{7,20}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VACIO = { nombre: '', telefono: '', email: '', fecha: '', invitados: '', comentarios: '' };

// Iconos de trazo: mismo estilo que los sellos del Inicio y de Sucursales.
const trazo = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' };
const Icono = ({ children, size = 30 }) => (
  <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden="true">{children}</svg>
);
const I = {
  plato: <path d="M4 25h24M6 25a10 10 0 0 1 20 0M16 15v-3M14 12h4" {...trazo} />,
  persona: <><circle cx="16" cy="10" r="4.5" {...trazo} /><path d="M7 27c0-5 4-8.5 9-8.5s9 3.5 9 8.5" {...trazo} /></>,
  sobre: <><rect x="4" y="8" width="24" height="16" rx="1.5" {...trazo} /><path d="M4.5 9l11.5 9 11.5-9" {...trazo} /></>,
  tazon: <><path d="M4 15h24a12 12 0 0 1-24 0z" {...trazo} /><path d="M12 15c0-3 2-5 4-6M17 15c0-2 1.5-4 4-5M9 27h14" {...trazo} /></>,
  mesa: <><path d="M3 13h26M6 13v13M26 13v13M6 19h20" {...trazo} /><path d="M10 13c0-3 3-5 6-5s6 2 6 5" {...trazo} /></>,
  pastel: <><rect x="6" y="15" width="20" height="11" {...trazo} /><path d="M6 19.5c2.5 2 4.5 2 7 0s4.5-2 6.5 0 4.5 2 6.5 0M16 15v-4M16 6.5c1 1 1 2.5 0 3-1-.5-1-2 0-3z" {...trazo} /></>,
  copas: <><path d="M7 4h7l-.5 6a3 3 0 0 1-6 0zM10.5 13v10M7.5 23h6M18 4h7l-.5 6a3 3 0 0 1-6 0zM21.5 13v10M18.5 23h6" {...trazo} /></>,
  maletin: <><rect x="4" y="10" width="24" height="16" rx="1.5" {...trazo} /><path d="M12 10V7h8v3M4 17h24M15 17v2h2v-2" {...trazo} /></>,
  birrete: <><path d="M2 12l14-6 14 6-14 6z" {...trazo} /><path d="M8 15v6c3 3 13 3 16 0v-6M27 13v7" {...trazo} /></>,
  mano: <><path d="M10 17V8a1.8 1.8 0 0 1 3.6 0v7M13.6 14V6a1.8 1.8 0 0 1 3.6 0v8M17.2 14V7.5a1.8 1.8 0 0 1 3.6 0V16M20.8 14a1.8 1.8 0 0 1 3.6 0v4c0 5-3.5 9-8.4 9-3.5 0-5.5-1.5-7.5-4l-3-4.5a1.8 1.8 0 0 1 3-2L10 19" {...trazo} /></>,
  anillos: <><circle cx="12" cy="19" r="7" {...trazo} /><circle cx="20" cy="19" r="7" {...trazo} /><path d="M10 9l2-3 2 3" {...trazo} /></>,
  corona: <><path d="M5 24l-1.5-13 7 6L16 7l5.5 10 7-6L27 24z" {...trazo} /><path d="M6 28h20" {...trazo} /></>,
  pino: <><path d="M16 3l-6 8h3.5l-5.5 7h4l-6 7h20l-6-7h4l-5.5-7H22z" {...trazo} /><path d="M16 25v4" {...trazo} /></>,
  edificio: <><path d="M6 28V5h13v23M19 12h7v16M3 28h26" {...trazo} /><path d="M10 9h1.5M13.5 9H15M10 14h1.5M13.5 14H15M10 19h1.5M13.5 19H15M22 17v.5M22 22v.5M11 28v-4h4v4" {...trazo} /></>,
  paloma: <><path d="M4 18c4 0 7-2 9-6 1.5-3 4-5 7-5 2 0 3.5 1 4.5 2.5L28 10l-3 2c0 6-4.5 11-11 11-3 0-6-1.5-8-3z" {...trazo} /><path d="M13 12c2 3 5 4 8 3" {...trazo} /></>,
  lapiz: <><path d="M6 26l1.5-6L21 6.5a2.1 2.1 0 0 1 3 0l1.5 1.5a2.1 2.1 0 0 1 0 3L12 24.5z" {...trazo} /><path d="M18.5 9l4.5 4.5M7.5 20l4.5 4.5" {...trazo} /></>,
  telefono: <><path d="M8 5h5l2 6-3 2a15 15 0 0 0 7 7l2-3 6 2v5a2 2 0 0 1-2 2C14.5 26 6 17.5 6 7a2 2 0 0 1 2-2z" {...trazo} /></>,
  lista: <><path d="M12 9h14M12 16h14M12 23h14" {...trazo} /><path d="M5 9l1.5 1.5L9 8M5 16l1.5 1.5L9 15M5 23l1.5 1.5L9 22" {...trazo} /></>,
  estrella: <><path d="M16 4l3.6 7.4 8.1 1.2-5.9 5.7 1.4 8.1L16 22.6l-7.2 3.8 1.4-8.1-5.9-5.7 8.1-1.2z" {...trazo} /></>,
};

// Lo que no se traduce: iconos y el valor de `tipoEvento` que espera el backend.
// Los textos de cada tipo están en src/i18n (eventos.privados / eventos.catering).
const EVENTOS = {
  privados: { tipoEvento: 'Evento Privado', sellos: ['plato', 'persona', 'sobre'], ocasiones: ['pastel', 'copas', 'maletin', 'birrete', 'mano'] },
  catering: { tipoEvento: 'Catering y Banquetes', sellos: ['tazon', 'mesa', 'sobre'], ocasiones: ['anillos', 'corona', 'pino', 'edificio', 'paloma'] },
};
const ICONOS_PASOS = ['lapiz', 'telefono', 'lista', 'estrella'];

// Une iconos + textos del idioma actual
const armarEvento = (tipo, t) => {
  const base = EVENTOS[tipo];
  const txt = t(`eventos.${tipo}`);
  return {
    ...txt,
    tipoEvento: base.tipoEvento,
    sellos: txt.sellos.map((s, i) => ({ ...s, icono: base.sellos[i] })),
    ocasiones: txt.ocasiones.map((nombre, i) => ({ nombre, icono: base.ocasiones[i] })),
  };
};

const pasos = (ev, t) => t('eventos.pasos').map((p, i) => ({
  icono: ICONOS_PASOS[i],
  titulo: p.titulo,
  texto: p.texto ?? ev.pasoArmamos,
}));

const FormularioEvento = ({ ev, onReservationClick }) => {
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

  const validar = () => {
    const err = {};
    if (form.nombre.trim().length < 3) err.nombre = t('formularios.errNombre');
    if (!TELEFONO_VALIDO.test(form.telefono.trim())) err.telefono = t('formularios.errTelefonoValido');
    if (!EMAIL_RE.test(form.email.trim())) err.email = t('formularios.errCorreo');
    if (!form.fecha) err.fecha = t('eventos.errFecha');
    else if (form.fecha < hoyLocal()) err.fecha = t('eventos.errFechaPasada');
    const n = Number(form.invitados);
    if (!form.invitados || !Number.isInteger(n) || n < 1) err.invitados = t('eventos.errInvitados');
    else if (n < MIN_INVITADOS) err.invitados = t('eventos.errPocos', { min: MIN_INVITADOS });
    else if (n > MAX_INVITADOS) err.invitados = t('eventos.errMuchos', { telefono: TELEFONO });
    return err;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validar();
    setErrores(err);
    if (Object.keys(err).length) return;

    setEnviando(true);
    setErrorEnvio('');
    try {
      await post('/api/catering', conIdioma({
        nombre: form.nombre.trim(),
        telefono: form.telefono.trim(),
        email: form.email.trim(),
        fechaEvento: form.fecha,
        personas: Number(form.invitados),
        tipoEvento: ev.tipoEvento,
        detalles: form.comentarios.trim() || undefined,
      }, idioma));
      setEnviado(true);
      setForm(VACIO);
    } catch (error) {
      setErrorEnvio(mensajeError(error, t, idioma, { telefono: TELEFONO }));
    } finally {
      setEnviando(false);
    }
  };

  if (enviado) {
    return (
      <div className="form-ok" role="status">
        <svg className="form-ok-check" viewBox="0 0 52 52" width="64" height="64" aria-hidden="true">
          <circle cx="26" cy="26" r="24" {...trazo} />
          <path d="M15 27l7 7 15-15" {...trazo} strokeWidth="2" />
        </svg>
        <h3 className="form-ok-titulo">{t('eventos.okTitulo')}</h3>
        <p>
          {t('eventos.okTexto')}{' '}
          {SUCURSALES.map((s, i) => (
            <span key={s.id}>{i > 0 && ' · '}{s.nombreCorto} <a href={s.telefonoLink}>{s.telefono}</a></span>
          ))}.
        </p>
        <button type="button" className="link-flecha" onClick={() => setEnviado(false)}>{t('eventos.otra')} <span aria-hidden="true">→</span></button>
      </div>
    );
  }

  return (
    <form className="form-abierto" onSubmit={handleSubmit} noValidate>
      <Campo id="ev-nombre" label={t('formularios.nombre')} error={errores.nombre}>
        <input type="text" name="nombre" maxLength={100} autoComplete="name" value={form.nombre} onChange={handleChange} />
      </Campo>
      <Campo id="ev-tel" label={t('formularios.telefono')} error={errores.telefono}>
        <input type="tel" name="telefono" maxLength={20} autoComplete="tel" value={form.telefono} onChange={handleChange} />
      </Campo>
      <Campo id="ev-email" label={t('formularios.correo')} completo error={errores.email}>
        <input type="email" name="email" maxLength={255} autoComplete="email" value={form.email} onChange={handleChange} />
      </Campo>
      <Campo id="ev-fecha" label={t('eventos.fecha')} error={errores.fecha}>
        <input type="date" name="fecha" min={hoyLocal()} value={form.fecha} onChange={handleChange} />
      </Campo>
      <Campo id="ev-inv" label={t('eventos.invitados')} error={errores.invitados}>
        <input type="number" name="invitados" min={MIN_INVITADOS} max={MAX_INVITADOS} inputMode="numeric" value={form.invitados} onChange={handleChange} />
      </Campo>
      <Campo id="ev-com" label={t('eventos.comentarios')} opcional completo>
        <textarea name="comentarios" rows="2" maxLength={1000} placeholder={t('eventos.placeholder')} value={form.comentarios} onChange={handleChange}></textarea>
      </Campo>
      <div className="full-width form-abierto-pie">
        <AvisoFormulario datos={t('eventos.avisoDatos')} finalidad={t('eventos.avisoFinalidad')} />
        {errorEnvio && <p className="form-error-envio" role="alert">{errorEnvio}</p>}
        <AvisoEspera activo={enviando} />
        <div className="form-abierto-acciones">
          <button type="submit" className="btn-principal" disabled={enviando}>{enviando ? t('formularios.enviando') : t('eventos.enviar')}</button>
          <p className="ev-grupo-chico">
            {t('eventos.menosDe', { min: MIN_INVITADOS })}{' '}
            <button type="button" className="ev-enlace" onClick={() => onReservationClick(null)}>{t('eventos.apartaMesa')} <span aria-hidden="true">→</span></button>
          </p>
        </div>
      </div>
    </form>
  );
};

const EventsPage = ({ initialTipo, onReservationClick }) => {
  const tipo = EVENTOS[initialTipo] ? initialTipo : 'privados';
  const { t } = useT();
  const ev = armarEvento(tipo, t);
  const otro = tipo === 'privados' ? 'catering' : 'privados';

  // "Cotizar ahora ↑": la barra de arriba reaparece al subir, así que se deja su alto más un respiro.
  // En escritorio queda a la vista el bloque completo (texto | formulario); en celular, el formulario
  // es más alto que la pantalla y se llega directo a su primer campo.
  const irACotizar = () => {
    const bloque = document.getElementById('cotizar');
    if (!bloque) return;
    const movil = window.innerWidth <= 700;
    const objetivo = movil ? bloque.querySelector('form') || bloque : bloque.querySelector('.nosotros-texto') || bloque;
    const barra = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 80;
    const y = objetivo.getBoundingClientRect().top + window.scrollY - barra - (movil ? 20 : 36);
    window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
  };

  // Al cambiar de tipo (flecha o menú) la página se monta de nuevo: empezar arriba
  useEffect(() => { window.scrollTo({ top: 0 }); }, []);

  return (
    <main>
     <div className="container">
      <CabeceraPagina
        eyebrow={t('eventos.eyebrow')}
        titulo={ev.titulo}
        intro={ev.intro}
        divisor
        siguiente={{ to: `/eventos?tipo=${otro}`, nombre: t(`eventos.${otro}.titulo`), lado: tipo === 'privados' ? 'der' : 'izq' }}
      />

      <div className="ev-contenido">
        {/* Lo más importante primero: qué incluye y el formulario, lado a lado */}
        <section className="home-seccion home-nosotros suc-principal ev-intro" id="cotizar" aria-label={t('eventos.cotiza')}>
          <div className="nosotros-texto reveal reveal-up">
            <p className="eyebrow">{t('eventos.cotiza')}</p>
            <h2 className="titulo-seccion">{ev.incluyeTitulo}</h2>
            <p className="intro-text">{ev.incluyeTexto}</p>
            <ul className="sellos ev-sellos">
              {ev.sellos.map((s, i) => (
                <li key={s.titulo} style={{ '--i': i }}>
                  <Icono size={32}>{I[s.icono]}</Icono>
                  <span><strong>{s.titulo}</strong>{s.texto}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="reveal reveal-up delay-2">
            <FormularioEvento ev={ev} onReservationClick={onReservationClick} />
          </div>
        </section>

        <section className="home-seccion suc-bloque ev-ocasiones-bloque ev-zigzag" aria-label={t('eventos.ocasionesAria')}>
          <div className="seccion-cabecera suc-cabecera reveal reveal-up">
            <div>
              <p className="eyebrow">{t('eventos.paraCada')}</p>
              <h2 className="titulo-seccion">{t('eventos.pretexto')}</h2>
            </div>
          </div>
          <ul className="ev-ocasiones reveal reveal-up">
            {ev.ocasiones.map((o, i) => (
              <li key={o.nombre} style={{ '--i': i }}>
                <Icono size={42}>{I[o.icono]}</Icono>
                <span>{o.nombre}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
     </div>

      {/* Franja a sangre con video: el platillo llegando a la mesa (sin sonido, en loop) */}
      <BandaFoto
        className="banda-servicio"
        src="/video/eventos-servicio.jpg"
        video="/video/eventos-servicio.mp4"
        frase={t('eventos.bandaFrase')}
        alt={t('eventos.bandaAlt')}
      />

     <div className="container">
      <div className="ev-contenido">
        <section className="home-seccion suc-bloque ev-zigzag ev-zigzag-inv" aria-label={t('eventos.comoFunciona')}>
          <div className="seccion-cabecera suc-cabecera reveal reveal-up">
            <div>
              <p className="eyebrow">{t('eventos.pasoAPaso')}</p>
              <h2 className="titulo-seccion">{t('eventos.comoLeHacemos')}</h2>
            </div>
            <a href="#cotizar" className="link-flecha" onClick={(e) => { e.preventDefault(); irACotizar(); }}>{t('eventos.cotizarAhora')} <span aria-hidden="true">↑</span></a>
          </div>
          <ol className="ev-pasos reveal">
            {pasos(ev, t).map((p, i) => (
              <li key={p.titulo} style={{ '--i': i }}>
                <span className="ev-paso-icono"><Icono size={26}>{I[p.icono]}</Icono></span>
                <span><strong>{p.titulo}</strong>{p.texto}</span>
              </li>
            ))}
          </ol>
        </section>
      </div>
     </div>
    </main>
  );
};

export default EventsPage;
