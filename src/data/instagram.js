// Publicaciones de Instagram mostradas en Inicio (3 al azar en cada visita).
// Para añadir una: `codigo` = lo que va tras /p/ o /reel/ en el enlace, `tipo` = 'p' o 'reel'.
// El embed oficial se carga al abrir Inicio. Sirve igual para fotos, carruseles y reels.
const P = (codigo) => ({ codigo, tipo: 'p' });

export const POSTS_INSTAGRAM = [
  P('DWmQtUfjo9B'),
  P('DflgGBCR1mD'),
  P('DfataPFmwGA'),
  P('DfNqrwHGyK1'),
  P('Ddmr7GpMR-i'),
  P('Dc_mJ_dxXtp'),
  P('DcJpmmPvChB'),
  P('DcEZyCOxule'),
  P('DcB9vVrPQid'),
];
