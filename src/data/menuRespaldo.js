// Respaldo del menú: SOLO se usa si el servidor no responde (o mientras despierta).
// El menú real vive en el panel del backend (GET /api/menu). Tiene la misma forma que la API
// para pasar por la misma normalización (src/data/menuNormalizar.js).
// Última copia: noviembre 2026 (igual que el panel en ese momento).

const s = (name, items) => ({ name, items });
const i = (name, price, descripcion = '') => ({ name, price, descripcion });

export const MENU_RESPALDO = {
  sections: [
    s('Entradas', [
      i('Callo de hacha', 145, 'Laminado bañado de nuestra salsa.'),
      i('Guacamole', 65, '100 g de guacamole acompañado de chicharrón de cuero y salsa majada.'),
      i('Shot de ostión', 85, 'Ostión, camarón cocido, callo de almeja acompañado de pepino, cebolla morada, cilantro y leche de tigre.'),
      i('Shot de camarón', 80, 'Camarón, pepino, cebolla morada, cilantro y leche de tigre.'),
      i('Shot mix', 90, 'Camarón, ceviche, pulpo, pepino, cebolla morada, cilantro, leche de tigre y carne seca.'),
    ]),
    s('Aguachile', [
      i('Aguachile chiltepín', 199, 'Camarón curtido en limón, acompañado de salsa chiltepín.'),
      i('Aguachile de temporada', 199, 'Camarón curtido en limón, salsa de temporada y piña.'),
      i('Aguachile mixto', 199, 'Combinación perfecta de la casa.'),
      i('Aguachile verde', 199, 'Camarón curtido en limón, bañado en salsa de chile serrano - habanero.'),
      i('Aguachile con atún', 260, 'Camarón cocido, atún fresco. Puede ser cocido o aguachileado.'),
      i('Aguachile con pulpo', 330),
    ]),
    s('Cóctel', [
      i('Cóctel de camarón', 130, 'Camarón cocido, aguacate y salsa coctelera.'),
      i('Cóctel combinado', 180, 'Camarón cocido, camarón aguachile y ceviche de pescado.'),
      i('Cóctel chiltepín premium', 240, 'Camarón cocido, camarón aguachile, ceviche de pescado, atún fresco y pulpo.'),
      i('Tostada vaciada', 100, 'Ceviche de pescado, salsa coctelera.'),
    ]),
    s('Kids', [
      i('Mini burger', 94, 'Carne de res y papas a la francesa.'),
      i('Chicken tenders', 84, 'Pollo frito con papas a la francesa y aderezo.'),
      i('Papas chiltepín', 114, 'Papas crisscut, carne asada y aguacate.'),
      i('Postre', 100),
    ]),
    s('Tostadas', [
      i('Combinada especial', 135, 'Ceviche de pescado, camarón aguachileado y cocido.'),
      i('Tostada chiltepín premium', 230, 'Ceviche de pescado acompañado de camarón aguachile, camarón cocido, atún y pulpo.'),
      i('Tostada de aguachile', 145, 'Camarón aguachile en salsa a elegir: verde, temporada o chiltepín.'),
      i('Tosticeviches', 165, 'Ceviche de pescado, aguacate, leche de tigre. Camarón cocido y aguachile.'),
      i('Trilogía de camarón', 175, 'Ceviche de camarón cocido, camarón aguachile y camarón seco, bañados en salsa a elegir: verde, temporada o chiltepín.'),
      i('Sample mini tostadas', 204, '3 tipos de mini tostadas, ceviche, camarón y atún.'),
      i('Ceviche chiltepín', 75, 'Pescado curtido en limón acompañado de chiltepín, cebolla morada, tomate, pepino, aguacate, bañados en salsa de la casa.'),
      i('Atún en salsas negras', 184, 'Atún en láminas, pepino, cebolla, aguacate, bañados en leche de tigre y salsas negras.'),
      i('Chicharrón', 150, 'Ceviche de pescado con camarón, sobre chicharrón de cerdo.'),
    ]),
    s('Lo Nuevo', [
      i('Tacos de asada', 105, '4 tacos de asada con una tostada llena de queso con guacamole y salsa majada.'),
      i('Dobladita', 70, 'Taco dorado de chicharrón o frijoles con un topping de camarón aguachileado o ceviche de pescado.'),
      i('Taco harina', 80, 'Camarón zarandeado sobre una cama de frijol con queso en tortilla de harina.'),
      i('Taco caribe', 70, 'Chile caribe relleno de marlín ahumado.'),
      i('Sopa marinera', 204, 'Pescado, camarón, papa, zanahoria y apio.'),
    ]),
    s('Tacos, Burros y Más', [
      i('Taco camarón capeado', 45),
      i('Taco pescado capeado', 45),
      i('Taco de atún', 84, 'Carnitas de atún, aguacate y cebolla curtida.'),
      i('Taco güero', 135, 'Carne asada, camarón, queso y chile güero.'),
      i('Burro norteño', 135, 'Carne asada, camarón capeado y aguacate. 30 cm tortilla.'),
      i('Volcán marino', 104, 'Carne asada, camarón, queso y aguacate.'),
      i('Hamburguesa bucanera', 150, 'Carne de res, camarón capeado, queso y tocino.'),
      i('Pescado empanizado', 204, 'Pescado y arroz.'),
      i('Ensalada chiltepín', 145, 'Col morada, zanahoria, tomate, pepino, arándanos, aguacate, chicharrón de atún y aderezos.'),
    ]),
    s('Bebidas', [
      i('Refresco', 39), i('Limonada', 45), i('Agua del día', 35), i('Clamato Mineral', 95), i('Botella Agua', 30), i('Agua Mineral', 40),
      i('Carajillo', 130, 'Licor 43, café expreso, guarnitura naranja, canela.'),
      i('Mi Viaje', 130, 'Tequila, jugo de guayaba natural, miel de agave, romero y limón.'),
      i('Chiltepino', 130, 'Mezcal, endulzante, limón y pepino.'),
      i('Tritón', 130, 'Ginebra, jugo de piña natural, arándano y un toque de limón.'),
      i('Corona', 43), i('Victoria', 43), i('Pacífico', 43), i('Modelo Negra', 48), i('Ultra', 45), i('Michelado', 30), i('Clamato', 35), i('Chelado', 25),
      i('Tradicional', 110), i('José Cuervo', 110), i('Don Julio 70', 150), i('Maestro Dobel', 150), i('Gran Malo', 110),
      i('Red Label', 120), i("Jack Daniel's", 310), i("Buchanan's", 140), i('Black Label', 140),
      i('De la Casa', 60), i('Apaluz', 110), i('Boscal', 140),
      i('Absolut 70', 120), i('Smirnoff de Tamarindo', 120),
      i("Gibson's", 90), i('Tanqueray', 140), i('Bombay', 140), i('Hendricks', 130),
      i('Bacardi', 100), i('Kraken', 90), i('Bacardi Solera', 100), i('Havana', 130),
      i('Jager', 110), i('Licor 43', 110), i('Aperol', 120), i('Hipnótic', 130),
    ]),
  ],
};
