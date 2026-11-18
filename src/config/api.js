// Ajustes de lo que se manda al backend. Ver docs/BACKEND.md.

// Mandar el idioma en que se llenó el formulario ('es' | 'en') en reservas, contacto, catering y boletín.
// APAGADO: hoy el backend rechaza campos que no conoce ("property idioma should not exist").
// Cuando el backend acepte `idioma` (opcional), cambiar a true y listo.
export const ENVIAR_IDIOMA = false;

/** Agrega { idioma } al cuerpo solo si ENVIAR_IDIOMA está activo. */
export const conIdioma = (cuerpo, idioma) => (ENVIAR_IDIOMA ? { ...cuerpo, idioma } : cuerpo);
