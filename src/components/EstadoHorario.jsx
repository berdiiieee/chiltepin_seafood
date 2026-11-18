import { useEffect, useState } from 'react';
import { estadoHorario, formatoHora, textoHorario } from '../utils/horario';
import { useT } from '../context/Preferencias';

// "Abierto ahora / Cerrado" según la hora de Durango. Se actualiza cada minuto.
// compacto: una sola línea discreta, sin recuadro.
export default function EstadoHorario({ conHorario = true, compacto = false, className = '' }) {
  const [estado, setEstado] = useState(() => estadoHorario());
  const { t, idioma } = useT();

  useEffect(() => {
    const id = setInterval(() => setEstado(estadoHorario()), 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className={`estado-horario${compacto ? ' compacto' : ''} ${className}`} role="status">
      <p className="estado-linea">
        <span className={`estado-punto${estado.abierto ? ' abierto' : ''}`} aria-hidden="true" />
        <strong>{t(estado.titulo)}</strong>
        <span className="estado-detalle">· {t(estado.detalle, { hora: formatoHora(estado.hora, idioma) })}</span>
      </p>
      {conHorario && <p className="estado-horario-texto">{textoHorario(t, idioma)}</p>}
    </div>
  );
}
