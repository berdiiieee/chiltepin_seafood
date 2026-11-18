// Mensaje para mostrar cuando un envío falla, según el tipo de error (ver `codigo` en client.js).
// En español se muestra el detalle que manda el backend cuando es un error de datos (es útil y ya
// viene en español); en inglés se usa un texto propio traducido.
// `telefono`: si viene, se sugiere llamar ("Intenta de nuevo o llámanos al ...").
export function mensajeError(err, t, idioma, { telefono } = {}) {
  const codigo = err?.codigo || 'servidor';
  let base;
  if ((codigo === 'datos' || codigo === 'duplicado') && idioma !== 'en' && err?.message) base = err.message;
  else base = t(`formularios.errores.${codigo}`);
  const cierre = telefono ? t('formularios.intentaLlama', { telefono }) : t('formularios.intenta');
  return codigo === 'duplicado' ? base : `${base} ${cierre}`;
}
