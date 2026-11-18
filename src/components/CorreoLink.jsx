// Muestra el correo como enlace mailto.
export default function CorreoLink({ correo }) {
  return <a href={`mailto:${correo}`}>{correo}</a>;
}
