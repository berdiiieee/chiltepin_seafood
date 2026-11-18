// El panel manda "Bebidas" como una lista plana. Aquí se dice en qué subgrupo va cada bebida
// (por nombre exacto, como está en el panel) y en qué orden se muestran los subgrupos.
// - Si el panel algún día manda `subcategoria` en la bebida, esa manda sobre este mapa.
// - Una bebida nueva que no esté aquí cae en "Otras" (al final) hasta que se agregue.
export const SUBGRUPOS_BEBIDAS = [
  { titulo: 'Bebidas sin Alcohol', bebidas: ['Refresco', 'Limonada', 'Agua del día', 'Clamato Mineral', 'Botella Agua', 'Agua Mineral'] },
  { titulo: 'Coctelería', bebidas: ['Carajillo', 'Mi Viaje', 'Chiltepino', 'Tritón'] },
  { titulo: 'Cervezas', bebidas: ['Corona', 'Victoria', 'Pacífico', 'Modelo Negra', 'Ultra', 'Michelado', 'Clamato', 'Chelado'] },
  { titulo: 'Licores - Tequila', bebidas: ['Tradicional', 'José Cuervo', 'Don Julio 70', 'Maestro Dobel', 'Gran Malo'] },
  { titulo: 'Licores - Whiskey', bebidas: ['Red Label', "Jack Daniel's", "Buchanan's", 'Black Label'] },
  { titulo: 'Licores - Mezcal', bebidas: ['De la Casa', 'Apaluz', 'Boscal'] },
  { titulo: 'Licores - Vodka', bebidas: ['Absolut 70', 'Smirnoff de Tamarindo'] },
  { titulo: 'Licores - Gin', bebidas: ["Gibson's", 'Tanqueray', 'Bombay', 'Hendricks'] },
  { titulo: 'Licores - Ron', bebidas: ['Bacardi', 'Kraken', 'Bacardi Solera', 'Havana'] },
  { titulo: 'Otros Licores', bebidas: ['Jager', 'Licor 43', 'Aperol', 'Hipnótic'] },
];

export const SUBGRUPO_OTRAS = 'Otras';
