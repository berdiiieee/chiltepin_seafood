import { Link } from 'react-router-dom';
import { AVISO_PRIVACIDAD_RUTA, nombreResponsable } from '../config/negocio';
import { useT } from '../context/Preferencias';

// Aviso de privacidad simplificado junto a cada formulario; enlaza al aviso integral.
// `datos` y `finalidad` llegan ya traducidos.
export default function AvisoFormulario({ datos, finalidad }) {
  const { t } = useT();
  return (
    <p className="aviso-formulario">
      {t('formularios.aviso', { responsable: nombreResponsable(), datos, finalidad })}{' '}
      <Link to={AVISO_PRIVACIDAD_RUTA} target="_blank" rel="noopener noreferrer">{t('formularios.avisoEnlace')}</Link>.
    </p>
  );
}
