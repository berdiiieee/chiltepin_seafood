import { useState, useEffect } from 'react';

const ReservationSidebar = ({ isOpen, onClose, initialData }) => {
  const [step, setStep] = useState(1);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedGuests, setSelectedGuests] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      if (initialData?.location) {
        setSelectedLocation(initialData.location);
      }
    }
  }, [isOpen]);

  const isLargeGroup = selectedGuests === '7+ Personas';

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const clearError = (id) => {
    setErrors(prev => ({ ...prev, [id]: '' }));
  };

  const showError = (id, msg) => {
    setErrors(prev => ({ ...prev, [id]: msg }));
  };

  const validateResDate = (value) => {
    if (!value) return;
    const day = new Date(value + 'T12:00:00').getDay();
    if (day === 0 || day === 6) {
      showError('error-fecha', 'Solo atendemos reservaciones entre semana. Los fines de semana te esperamos sin reservación.');
      setSelectedDate('');
    } else {
      clearError('error-fecha');
    }
  };

  const isWeekend = (dateStr) => {
    if (!dateStr) return false;
    const day = new Date(dateStr + 'T12:00:00').getDay();
    return day === 0 || day === 6;
  };

  const confirmStep1 = () => {
    setErrors({});
    if (!selectedDate) {
      showError('error-fecha', 'Selecciona una fecha');
      return;
    }
    if (!selectedTime) {
      showError('error-horario', 'Selecciona un horario');
      return;
    }
    if (isWeekend(selectedDate)) {
      showError('error-fecha', 'Solo atendemos reservaciones entre semana. Los fines de semana te esperamos sin reservación.');
      return;
    }
    setStep(2);
  };

  const goBackToStep1 = () => {
    setStep(1);
  };

  const submitReservation = (e) => {
    e.preventDefault();
    setErrors({});
    let valid = true;
    if (!formName.trim()) {
      showError('error-name', 'Ingresa tu nombre completo');
      valid = false;
    }
    if (!/^\d{10}$/.test(formPhone)) {
      showError('error-phone', 'Ingresa un teléfono válido de 10 dígitos');
      valid = false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formEmail)) {
      showError('error-email', 'Ingresa un correo electrónico válido');
      valid = false;
    }
    if (!valid) return;
    setStep(3);
  };

  const handleClose = () => {
    setStep(1);
    setSelectedLocation('');
    setSelectedGuests('');
    setSelectedDate('');
    setSelectedTime('');
    setFormName('');
    setFormPhone('');
    setFormEmail('');
    setErrors({});
    if (onClose) onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="res-overlay active" id="resOverlay" onClick={handleClose}></div>
      <aside className="res-sidebar active" id="resSidebar">
        <div className="res-header">
          <h2 className="res-title-bar">Reservaciones</h2>
          <button className="res-close" id="resClose" onClick={handleClose}>✕</button>
        </div>

        <div className="res-body">
          <div id="resStep1" className={`res-step${step === 1 ? ' active' : ''}`}>
            <div className="res-field">
              <label>Sucursal</label>
              <div className="res-location-pills" id="resLocation">
                {['Chiltepin Plaza Real', 'Chiltepin Plaza 450'].map(loc => (
                  <button
                    key={loc}
                    className={`loc-pill${selectedLocation === loc ? ' selected' : ''}`}
                    data-value={loc}
                    onClick={() => setSelectedLocation(loc)}
                  >
                    {loc === 'Chiltepin Plaza Real' ? 'Plaza Real' : 'Plaza 450'}
                  </button>
                ))}
              </div>
            </div>

            <div className="res-field">
              <label>Huéspedes</label>
              <div className="guest-pills" id="resGuests">
                {['1 Persona', '2 Personas', '3 Personas', '4 Personas', '5 Personas', '6 Personas', '7+ Personas'].map(g => (
                  <button
                    key={g}
                    className={`guest-pill${selectedGuests === g ? ' selected' : ''}`}
                    data-value={g}
                    onClick={() => setSelectedGuests(g)}
                  >
                    {g === '7+ Personas' ? '7+' : g.charAt(0)}
                  </button>
                ))}
              </div>
            </div>

            <div className="res-field">
              <label>Fecha</label>
              <input
                type="date"
                id="resDate"
                value={selectedDate}
                onChange={e => { setSelectedDate(e.target.value); validateResDate(e.target.value); }}
              />
            </div>
            <span className={`field-error${errors['error-fecha'] ? ' visible' : ''}`} id="error-fecha">
              {errors['error-fecha'] || ''}
            </span>

            <div className="res-field">
              <label>Horario</label>
              <div className="res-times-pills" id="resTimePills">
                {['11:30','12:00','12:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30','18:00','18:30','19:00'].map(t => (
                  <button
                    key={t}
                    className={`time-pill${selectedTime === t ? ' selected' : ''}`}
                    data-value={t}
                    onClick={() => setSelectedTime(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <span className={`field-error${errors['error-horario'] ? ' visible' : ''}`} id="error-horario">
                {errors['error-horario'] || ''}
              </span>
            </div>

            <button
              id="btnStep1Confirm"
              className={`btn-submit-event${isLargeGroup ? ' btn-contact' : ''}`}
              onClick={confirmStep1}
              style={{ marginTop: 20 }}
            >
              {isLargeGroup ? 'Contáctanos' : 'Confirmar Horario'}
            </button>
          </div>

          <div id="resStep2" className={`res-step${step === 2 ? ' active' : ''}`}>
            <button className="res-back" onClick={goBackToStep1}>❮ Cambiar Hora</button>

            <div className="res-summary">
              <p id="summaryLoc">{selectedLocation}</p>
              <span id="summaryDetails">{selectedGuests} • {selectedDate} • {selectedTime}</span>
            </div>

            {!isLargeGroup ? (
              <form className="event-form" onSubmit={submitReservation}>
                <div className="input-group full-width">
                  <label>Nombre Completo</label>
                  <input
                    type="text"
                    placeholder="Ej. Juan Pérez"
                    value={formName}
                    onChange={e => { setFormName(e.target.value); clearError('error-name'); }}
                  />
                  <span className={`field-error${errors['error-name'] ? ' visible' : ''}`} id="error-name">
                    {errors['error-name'] || ''}
                  </span>
                </div>
                <div className="input-group full-width">
                  <label>Teléfono</label>
                  <input
                    type="tel"
                    placeholder="618..."
                    value={formPhone}
                    onChange={e => { setFormPhone(e.target.value); clearError('error-phone'); }}
                  />
                  <span className={`field-error${errors['error-phone'] ? ' visible' : ''}`} id="error-phone">
                    {errors['error-phone'] || ''}
                  </span>
                </div>
                <div className="input-group full-width">
                  <label>Correo Electrónico</label>
                  <input
                    type="email"
                    placeholder="correo@ejemplo.com"
                    value={formEmail}
                    onChange={e => { setFormEmail(e.target.value); clearError('error-email'); }}
                  />
                  <span className={`field-error${errors['error-email'] ? ' visible' : ''}`} id="error-email">
                    {errors['error-email'] || ''}
                  </span>
                </div>
                <div className="full-width">
                  <button type="submit" className="btn-submit-event" style={{ marginTop: 20 }}>Confirmar Reserva</button>
                </div>
              </form>
            ) : (
              <div id="resContactInfo" className="res-contact" style={{ display: 'block' }}>
                <h3>Grandes Grupos</h3>
                <p>Para reservaciones de 7+ personas,<br />contáctanos directamente:</p>
                <p className="contact-phone"><a href="tel:6182003865">618.200.3865</a></p>
                <p className="contact-email">info@chiltepin.com</p>
                <button className="btn-submit-event" onClick={handleClose} style={{ marginTop: 20 }}>Cerrar</button>
              </div>
            )}
          </div>

          <div id="resStep3" className={`res-step${step === 3 ? ' active' : ''}`} style={{ textAlign: 'center', marginTop: 50 }}>
            <h2 style={{ fontFamily: 'var(--font-logo)', fontSize: '3rem', color: 'var(--accent-color)', marginBottom: 20 }}>
              ¡Reserva Confirmada!
            </h2>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: 30 }}>
              Te hemos enviado un correo con los detalles de tu reservación.
            </p>
            <button className="btn-submit-event" onClick={handleClose}>Cerrar</button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default ReservationSidebar;
