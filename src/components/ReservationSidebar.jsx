import { useState, useEffect, useRef, useMemo } from 'react';
import { post } from '../api/client';
import { mensajeError } from '../api/errores';
import { conIdioma } from '../config/api';
import Campo from './Campo';
import AvisoFormulario from './AvisoFormulario';
import AvisoEspera from './AvisoEspera';
import { SUCURSALES, RESERVACIONES, TELEFONO, TELEFONO_LINK, CORREO_CONTACTO, buscarSucursal } from '../config/negocio';
import { ahoraEnDurango, aMinutos, formatoHora, formatoFechaLarga, horasDeReservacion, hoyLocal } from '../utils/horario';
import { useT } from '../context/Preferencias';

const PERSONAS = [1, 2, 3, 4, 5, 6];

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
  const panelRef = useRef(null);
  const focoPrevio = useRef(null);
  const { t, idioma } = useT();

  const grupoGrande = personas === '7+';
  const horas = useMemo(() => horasDeReservacion(), []);
  const ahora = ahoraEnDurango();

  // Al abrir: precarga sucursal, guarda el foco previo y lo devuelve al cerrar
  useEffect(() => {
    if (!isOpen) return;
    if (initialData?.location) setSucursal(initialData.location);
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

  const handleClose = () => {
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
    if (onClose) onClose();
  };

  const elegida = buscarSucursal(sucursal);
  const nombreCorto = elegida?.nombreCorto || sucursal;
  // Teléfono de la sucursal elegida; si aún no eligen, los dos con su nombre
  const telefonos = elegida ? [elegida] : SUCURSALES;

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
              <p className="res-regla">{t('reservas.regla')}</p>

              <div className="res-field">
                <label>{t('reservas.sucursal')}</label>
                <div className="res-location-pills" role="group" aria-label={t('reservas.sucursal')}>
                  {SUCURSALES.map(s => (
                    <button
                      type="button"
                      key={s.id}
                      className={`loc-pill${sucursal === s.nombre ? ' selected' : ''}`}
                      aria-pressed={sucursal === s.nombre}
                      onClick={() => { setSucursal(s.nombre); clearError('sucursal'); }}
                    >
                      {s.nombreCorto}
                    </button>
                  ))}
                </div>
                <span className={`field-error${errors.sucursal ? ' visible' : ''}`}>{errors.sucursal || ''}</span>
              </div>

              <div className="res-field">
                <label>{t('reservas.personas')}</label>
                <div className="guest-pills" role="group" aria-label={t('reservas.personasAria')}>
                  {[...PERSONAS.map(String), '7+'].map(g => (
                    <button
                      type="button"
                      key={g}
                      className={`guest-pill${personas === g ? ' selected' : ''}`}
                      aria-pressed={personas === g}
                      aria-label={g === '7+' ? t('reservas.sieteOMas') : `${g} ${g === '1' ? t('reservas.persona1') : t('reservas.personasN')}`}
                      onClick={() => { setPersonas(g); clearError('personas'); }}
                    >
                      {g}
                    </button>
                  ))}
                </div>
                <span className={`field-error${errors.personas ? ' visible' : ''}`}>{errors.personas || ''}</span>
              </div>

              {!grupoGrande && (
                <>
                  <div className="res-field">
                    <label htmlFor="resDate">{t('reservas.fecha')}</label>
                    <input
                      type="date"
                      id="resDate"
                      min={hoyLocal()}
                      value={fecha}
                      onChange={e => onFecha(e.target.value)}
                    />
                    <span className={`field-error${errors.fecha ? ' visible' : ''}`}>{errors.fecha || ''}</span>
                  </div>

                  <div className="res-field">
                    <label>{t('reservas.hora')}</label>
                    <div className="res-times-pills" role="group" aria-label={t('reservas.hora')}>
                      {horas.map(h => (
                        <button
                          type="button"
                          key={h}
                          className={`time-pill${hora === h ? ' selected' : ''}`}
                          aria-pressed={hora === h}
                          disabled={!horaDisponible(h)}
                          onClick={() => { setHora(h); clearError('hora'); }}
                        >
                          {formatoHora(h, idioma)}
                        </button>
                      ))}
                    </div>
                    <span className={`field-error${errors.hora ? ' visible' : ''}`}>{errors.hora || ''}</span>
                  </div>
                </>
              )}

              <button
                type="button"
                className={`btn-submit-event${grupoGrande ? ' btn-contact' : ''}`}
                onClick={continuar}
                style={{ marginTop: 20 }}
              >
                {grupoGrande ? t('reservas.verComo') : t('reservas.continuar')}
              </button>
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
                  <button type="button" className="btn-submit-event" onClick={handleClose} style={{ marginTop: 20 }}>{t('comun.cerrar')}</button>
                </div>
              ) : (
                <>
                  <div className="res-summary">
                    <p>{nombreCorto}</p>
                    <span>{personas} {personas === '1' ? t('reservas.persona1') : t('reservas.personasN')} • {formatoFechaLarga(fecha, idioma)} • {formatoHora(hora, idioma)}</span>
                  </div>

                  <form className="event-form" onSubmit={enviar} noValidate>
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
                      {errorEnvio && <p className="form-error-envio" role="alert">{errorEnvio}</p>}
                      <AvisoEspera activo={enviando} />
                      <button type="submit" className="btn-submit-event" disabled={enviando} style={{ marginTop: 12 }}>
                        {enviando ? t('formularios.enviando') : t('reservas.confirmar')}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="res-step active res-exito">
              <h2>{t('reservas.exito')}</h2>
              <p>
                {nombreCorto} · {formatoFechaLarga(fecha, idioma)} · {formatoHora(hora, idioma)}
                <br />
                {t('reservas.cambiarAlgo')} <a href={elegida?.telefonoLink || TELEFONO_LINK}>{elegida?.telefono || TELEFONO}</a>.
              </p>
              <button type="button" className="btn-submit-event" onClick={handleClose}>{t('comun.cerrar')}</button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default ReservationSidebar;
