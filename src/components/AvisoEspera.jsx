import { useEffect, useState } from 'react';
import { useT } from '../context/Preferencias';

// Si un envío tarda más de unos segundos (el backend en Render "despierta" la primera vez y puede
// tardar hasta un minuto), avisa que siga esperando en vez de dejar al visitante sin respuesta.
export default function AvisoEspera({ activo, retraso = 5000 }) {
  const { t } = useT();
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!activo) { setVisible(false); return undefined; }
    const id = setTimeout(() => setVisible(true), retraso);
    return () => clearTimeout(id);
  }, [activo, retraso]);
  if (!visible) return null;
  return <p className="aviso-espera" role="status">{t('formularios.esperando')}</p>;
}
