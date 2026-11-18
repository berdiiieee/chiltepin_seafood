// Muestra un texto del diccionario donde las partes entre **dobles asteriscos** van en <strong>.
export default function Negritas({ texto }) {
  return String(texto).split(/\*\*(.+?)\*\*/g).map((parte, i) => (i % 2 ? <strong key={i}>{parte}</strong> : parte));
}
