import { useState, useEffect, useRef, useMemo } from 'react';
import { post } from '../api/client';
import { mensajeError } from '../api/errores';
import { conIdioma } from '../config/api';
import Campo from './Campo';
import AvisoFormulario from './AvisoFormulario';
import AvisoEspera from './AvisoEspera';
import { SUCURSALES, RESERVACIONES, TELEFONO, TELEFONO_LINK, CORREO_CONTACTO, buscarSucursal } from '../config/negocio';
import { ahoraEnDurango, aMinutos, formatoHora, formatoFechaLarga, horasDeReservacion } from '../utils/horario';
import { useT } from '../context/Preferencias';

const PERSONAS = Array.from({ length: RESERVACIONES.maxPersonasEnLinea }, (_, i) => String(i + 1));
const MAS = `${RESERVACIONES.maxPersonasEnLinea + 1}+`;
const trazo = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' };

const isoLocal = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

// Próximos días hábiles (los que se pueden reservar); hoy solo si aún queda una hora disponible
function diasDisponibles(ahora, ultimaHora, cuantos = 5) {
  const base = new Date(`${ahora.fecha}T12:00:00`);
  const dias = [];
  for (let i = 0; dias.length < cuantos && i < 14; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    if (!RESERVACIONES.dias.includes(d.getDay())) continue;
    if (i === 0 && ahora.minutos >= ultimaHora) continue;
    dias.push({ iso: isoLocal(d), desde: i, d });
  }
  return dias;
}

const ReservationSidebar = ({ isOpen, onClose, initialData }) => {
  const [step, setStep] = useState(1);
  const [sucursal, setSucursal] = useState('');
  const [personas, setPersonas] = useState('');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState('');
  const [otraFecha, setOtraFecha] = useState(false);
  const fechaRef = useRef(null);
  const panelRef = useRef(null);
  const focoPrevio = useRef(null);
  const { t, idioma } = useT();

  const grupoGrande = personas === MAS;
  const horas = useMemo(() => horasDeReservacion(), []);
  const ahora = ahoraEnDurango();
  const ultimaHora = aMinutos(horas[horas.length - 1]);
  const dias = diasDisponibles(ahora, ultimaHora);

  // Al abrir: precarga sucursal, guarda el foco previo y lo devuelve al cerrar
  useEffect(() => {
    if (!isOpen) return;
    // Si abren desde otra sucursal distinta a la del borrador, se empieza de nuevo con esa
    if (initialData?.location && initialData.location !== sucursal) { setSucursal(initialData.location); setStep(1); }
    focoPrevio.current = document.activeElement;
    document.body.style.overflow = 'hidden';
    const espera = setTimeout(() => panelRef.current?.querySelector('button, input')?.focus(), 50);
    return () => {
      clearTimeout(espera);
      document.body.style.overflow = '';
      focoPrevio.current?.focus?.();
    };
  }, [isOpen]);

  // Esc cierra y el Tab queda atrapado dentro del panel
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') { handleClose(); return; }
      if (e.key !== 'Tab' || !panelRef.current) return;
      const focusables = panelRef.current.querySelectorAll('button:not([disabled]), input, select, textarea, a[href]');
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  });

  // Cerrado: fuera del orden de tabulación y de lectores de pantalla
  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    if (isOpen) el.removeAttribute('inert'); else el.setAttribute('inert', '');
  }, [isOpen]);

  const setError = (id, msg) => setErrors(prev => ({ ...prev, [id]: msg }));
  const clearError = (id) => setErrors(prev => ({ ...prev, [id]: '' }));

  const esDiaValido = (iso) => RESERVACIONES.dias.includes(new Date(iso + 'T12:00:00').getDay());
  const horaDisponible = (h) => fecha !== ahora.fecha || aMinutos(h) > ahora.minutos;

  const onFecha = (value) => {
    setFecha(value);
    clearError('fecha');
    if (value && !esDiaValido(value)) {
      setError('fecha', t('reservas.finDeSemana'));
      setFecha('');
      return;
    }
    if (value === ahora.fecha && ahora.minutos >= ultimaHora) {
      setError('fecha', t('reservas.sinHorasHoy'));
      setFecha('');
      return;
    }
    if (value === ahora.fecha && hora && aMinutos(hora) <= ahora.minutos) setHora('');
  };

  const continuar = () => {
    const e = {};
    if (!sucursal) e.sucursal = t('reservas.errSucursal');
    if (!personas) e.personas = t('reservas.errPersonas');
    if (!grupoGrande) {
      if (!fecha) e.fecha = t('reservas.errFecha');
      if (!hora) e.hora = t('reservas.errHora');
    }
    setErrors(e);
    if (Object.keys(e).length === 0) setStep(2);
  };

  const enviar = async (ev) => {
    ev.preventDefault();
    const digitos = telefono.replace(/\D/g, '');
    const e = {};
    // El backend acepta letras (con acentos), espacios y . ' - ; el apóstrofo tipográfico (’, el del iPhone) lo rechaza,
    // así que se cambia por el simple antes de validar y enviar.
    const nombreLimpio = nombre.trim().replace(/[’‘]/g, "'").replace(/\s+/g, ' ');
    if (nombreLimpio.length < 3) e.nombre = t('reservas.errNombre');
    else if (/[^\p{L}\s.'-]/u.test(nombreLimpio)) e.nombre = t('reservas.errNombreLetras');
    if (!/^\d{10}$/.test(digitos)) e.telefono = t('reservas.errTelefono');
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) e.email = t('reservas.errCorreo');
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setEnviando(true);
    setErrorEnvio('');
    try {
      await post('/api/reservas', conIdioma({
        nombre: nombreLimpio,
        telefono: digitos,
        email: email.trim() || undefined,
        fecha,
        hora,
        personas: Number(personas),
        sucursal,
      }, idioma));
      setStep(3);
    } catch (err) {
      setErrorEnvio(mensajeError(err, t, idioma, { telefono: buscarSucursal(sucursal)?.telefono || TELEFONO }));
    } finally {
      setEnviando(false);
    }
  };

  // Si se cierra por accidente a medias, los datos se conservan; solo se limpian tras confirmar
  const handleClose = () => {
    if (step === 3) reiniciar();
    if (onClose) onClose();
  };

  const reiniciar = () => {
    setOtraFecha(false);
    setStep(1);
    setSucursal('');
    setPersonas('');
    setFecha('');
    setHora('');
    setNombre('');
    setTelefono('');
    setEmail('');
    setErrors({});
    setErrorEnvio('');
  };

  const elegida = buscarSucursal(sucursal);
  const nombreCorto = elegida?.nombreCorto || sucursal;
  // Teléfono de la sucursal elegida; si aún no eligen, los dos con su nombre
  const telefonos = elegida ? [elegida] : SUCURSALES;

  const diaCorto = (d) => new Intl.DateTimeFormat(idioma === 'en' ? 'en-US' : 'es-MX', { weekday: 'short' }).format(d).replace('.', '');
  const resumen = `${personas} ${personas === '1' ? t('reservas.persona1') : t('reservas.personasN')} · ${fecha ? formatoFechaLarga(fecha, idioma) : ''} · ${hora ? formatoHora(hora, idioma).replace(/ /g, '\u00A0') : ''}`;
  const mostrarOtra = otraFecha || (fecha && !dias.some(d => d.iso === fecha));

  const abrirOtraFecha = () => {
    setOtraFecha(true);
    setTimeout(() => { fechaRef.current?.focus(); try { fechaRef.current?.showPicker?.(); } catch { /* sin selector */ } }, 30);
  };

  const Err = ({ id }) => (
    <p id={`res-err-${id}`} className={`field-error${errors[id] ? ' visible' : ''}`} role={errors[id] ? 'alert' : undefined}>{errors[id] || ''}</p>
  );

  return (
    <>
      <div className={`res-overlay${isOpen ? ' active' : ''}`} onClick={handleClose} aria-hidden="true"></div>
      <aside
        ref={panelRef}
        className={`res-sidebar${isOpen ? ' active' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="res-titulo"
      >
        <div className="res-header">
          <h2 className="res-title-bar" id="res-titulo">{t('reservas.titulo')}</h2>
          <button className="res-close" onClick={handleClose} aria-label={t('reservas.cerrarAria')}>✕</button>
        </div>

        <div className="res-body">
          {step === 1 && (
            <div className="res-step active">
              <fieldset className="res-grupo" aria-describedby={errors.sucursal ? 'res-err-sucursal' : undefined}>
                <legend>{t('reservas.sucursal')}</legend>
                <div className="res-ops">
                  {SUCURSALES.map(s => (
                    <button
                      type="button"
                      key={s.id}
                      className="res-op"
                      aria-pressed={sucursal === s.nombre}
                      onClick={() => { setSucursal(s.nombre); clearError('sucursal'); }}
                    >
                      {s.nombreCorto}
                    </button>
                  ))}
                </div>
                <Err id="sucursal" />
              </fieldset>

              <fieldset className="res-grupo" aria-describedby={errors.personas ? 'res-err-personas' : undefined}>
                <legend>{t('reservas.personas')}</legend>
                <div className="res-ops" role="group" aria-label={t('reservas.personasAria')}>
                  {[...PERSONAS, MAS].map(g => (
                    <button
                      type="button"
                      key={g}
                      className="res-op"
                      aria-pressed={personas === g}
                      aria-label={g === MAS ? t('reservas.sieteOMas') : `${g} ${g === '1' ? t('reservas.persona1') : t('reservas.personasN')}`}
                      onClick={() => { setPersonas(g); clearError('personas'); }}
                    >
                      {g}
                    </button>
                  ))}
                </div>
                <Err id="personas" />
              </fieldset>

              {!grupoGrande && (
                <>
                  <fieldset className="res-grupo" aria-describedby={errors.fecha ? 'res-err-fecha' : undefined}>
                    <legend>{t('reservas.fecha')}</legend>
                    <div className="res-ops res-dias">
                      {dias.map(({ iso, desde, d }) => (
                        <button
                          type="button"
                          key={iso}
                          className="res-op res-dia"
                          aria-pressed={fecha === iso}
                          aria-label={formatoFechaLarga(iso, idioma)}
                          onClick={() => onFecha(iso)}
                        >
                          <span className="res-dia-sem">{desde === 0 ? t('reservas.hoy') : desde === 1 ? t('reservas.manana') : diaCorto(d)}</span>
                          <span className="res-dia-num">{d.getDate()}</span>
                        </button>
                      ))}
                    </div>
                    {mostrarOtra ? (
                      <input
                        ref={fechaRef}
                        type="date"
                        className="res-fecha-otra"
                        aria-label={t('reservas.fecha')}
                        min={ahora.fecha}
                        value={fecha}
                        onChange={e => onFecha(e.target.value)}
                      />
                    ) : (
                      <button type="button" className="link-flecha res-otra" onClick={abrirOtraFecha}>{t('reservas.otraFecha')} <span aria-hidden="true">→</span></button>
                    )}
                    <Err id="fecha" />
                    <p className="res-regla">{t('reservas.regla')}</p>
                  </fieldset>

                  <fieldset className="res-grupo" aria-describedby={errors.hora ? 'res-err-hora' : undefined}>
                    <legend>{t('reservas.hora')}</legend>
                    <div className="res-ops res-horas">
                      {horas.filter(horaDisponible).map(h => (
                        <button
                          type="button"
                          key={h}
                          className="res-op"
                          aria-pressed={hora === h}
                          onClick={() => { setHora(h); clearError('hora'); }}
                        >
                          {formatoHora(h, idioma)}
                        </button>
                      ))}
                    </div>
                    <Err id="hora" />
                  </fieldset>
                </>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="res-step active">
              <button type="button" className="res-back" onClick={() => setStep(1)}>{t('reservas.cambiar')}</button>

              {grupoGrande ? (
                <div className="res-contact" style={{ display: 'block' }}>
                  <h3>{t('reservas.gruposGrandes')}</h3>
                  <p>{t('reservas.gruposTexto')}</p>
                  {telefonos.map(s => (
                    <p key={s.id} className="contact-phone">
                      {telefonos.length > 1 && <span className="contact-phone-suc">{s.nombreCorto} </span>}
                      <a href={s.telefonoLink}>{s.telefono}</a>
                    </p>
                  ))}
                  <p className="contact-email"><a href={`mailto:${CORREO_CONTACTO}`}>{CORREO_CONTACTO}</a></p>
                </div>
              ) : (
                <>
                  <div className="res-summary">
                    <p>{nombreCorto}</p>
                    <span>{resumen}</span>
                  </div>

                  <form id="res-form" className="event-form" onSubmit={enviar} noValidate>
                    <Campo id="res-nombre" label={t('formularios.nombreCompleto')} completo error={errors.nombre}>
                      <input type="text" maxLength={100} autoComplete="name" placeholder={t('reservas.placeholderNombre')} value={nombre}
                        onChange={e => { setNombre(e.target.value); clearError('nombre'); }} />
                    </Campo>
                    <Campo id="res-tel" label={t('formularios.telefono')} completo error={errors.telefono}>
                      <input type="tel" inputMode="numeric" maxLength={20} autoComplete="tel" placeholder="618 123 4567" value={telefono}
                        onChange={e => { setTelefono(e.target.value); clearError('telefono'); }} />
                    </Campo>
                    <Campo id="res-email" label={t('formularios.correo')} opcional completo error={errors.email}>
                      <input type="email" maxLength={255} autoComplete="email" placeholder={t('reservas.placeholderCorreo')} value={email}
                        onChange={e => { setEmail(e.target.value); clearError('email'); }} />
                    </Campo>
                    <div className="full-width">
                      <AvisoFormulario datos={t('reservas.avisoDatos')} finalidad={t('reservas.avisoFinalidad')} />
                    </div>
                  </form>
                </>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="res-step active">
              <div className="form-ok" role="status">
                <svg className="form-ok-check" viewBox="0 0 52 52" width="64" height="64" aria-hidden="true">
                  <circle cx="26" cy="26" r="24" {...trazo} />
                  <path d="M15 27l7 7 15-15" {...trazo} strokeWidth="2" />
                </svg>
                <h3 className="form-ok-titulo">{t('reservas.exito')}</h3>
                <p>
                  {nombreCorto} · {formatoFechaLarga(fecha, idioma)} · {formatoHora(hora, idioma)}
                  <br />
                  {t('reservas.cambiarAlgo')} <a href={elegida?.telefonoLink || TELEFONO_LINK}>{elegida?.telefono || TELEFONO}</a>.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Acción principal fija al fondo: siempre a la vista, aunque el teclado o la pantalla sean chicos */}
        <div className="res-pie">
          {step === 2 && !grupoGrande && errorEnvio && <p className="form-error-envio" role="alert">{errorEnvio}</p>}
          {step === 2 && !grupoGrande && <AvisoEspera activo={enviando} />}
          {step === 1 && (
            <button type="button" className="btn-principal" onClick={continuar}>
              {grupoGrande ? t('reservas.verComo') : t('reservas.continuar')}
            </button>
          )}
          {step === 2 && !grupoGrande && (
            <button type="submit" form="res-form" className="btn-principal" disabled={enviando}>
              {enviando ? t('formularios.enviando') : t('reservas.confirmar')}
            </button>
          )}
          {(step === 3 || (step === 2 && grupoGrande)) && (
            <button type="button" className="btn-principal" onClick={handleClose}>{t('comun.cerrar')}</button>
          )}
        </div>
      </aside>
    </>
  );
};

export default ReservationSidebar;
