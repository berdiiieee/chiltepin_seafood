import { cloneElement, isValidElement } from 'react';
import { useT } from '../context/Preferencias';

// Etiqueta + control + error, con atributos de accesibilidad conectados
// (el lector de pantalla anuncia el error al enfocar el campo). Usa las clases existentes .input-group / .field-error.
export default function Campo({ id, label, opcional, error, completo, children }) {
  const { t } = useT();
  const control = isValidElement(children)
    ? cloneElement(children, {
        id,
        'aria-invalid': error ? true : undefined,
        'aria-describedby': error ? `${id}-error` : undefined,
      })
    : children;

  return (
    <div className={`input-group${completo ? ' full-width' : ''}`}>
      <label htmlFor={id}>
        {label}
        {opcional && <span className="opcional"> {t('formularios.opcional')}</span>}
      </label>
      {control}
      <span id={`${id}-error`} className={`field-error${error ? ' visible' : ''}`} role={error ? 'alert' : undefined}>
        {error || ''}
      </span>
    </div>
  );
}
