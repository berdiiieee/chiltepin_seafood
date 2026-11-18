// Datos del negocio que aparecen en varias partes del sitio.
// Si algo cambia (correo, horario, sucursales, responsable), se cambia solo aquí.

export const NOMBRE_COMERCIAL = 'Chiltepin Seafood';

export const CORREO_CONTACTO = 'grupochiltepin@chiltepin.com';

// Cada sucursal tiene su teléfono (ver SUCURSALES[].telefono). Este es el número general
// (el de Plaza Real) para mensajes cortos donde no hay una sucursal elegida.
export const TELEFONO = '618 200 3865';
export const TELEFONO_LINK = 'tel:+526182003865';

// WhatsApp del restaurante (solo dígitos con lada de país, ej. 5216182003865). Vacío = no se muestra el botón.
export const WHATSAPP = '';
export const whatsappLink = (texto = 'Hola, quisiera reservar para un grupo') =>
  WHATSAPP ? `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(texto)}` : '';

export const INSTAGRAM = { usuario: '@chiltepinseafood', url: 'https://www.instagram.com/chiltepinseafood/' };
export const FACEBOOK = { nombre: 'Chiltepin Seafood', url: 'https://www.facebook.com/Chiltepinseafood/' };

// Horario de servicio (igual en las dos sucursales). Formato 24 h.
export const HORARIO = {
  abre: '11:30',
  cierra: '19:30',
  texto: 'Lunes a domingo, de 11:30 a. m. a 7:30 p. m.',
};

// Reservaciones: solo de lunes a viernes. Sábados y domingos se atiende por orden de llegada.
// Días con el formato de Date.getDay(): 0 = domingo ... 6 = sábado.
export const RESERVACIONES = {
  dias: [1, 2, 3, 4, 5],
  ultimaAntesDeCerrarMin: 60,
  intervaloMin: 30,
  maxPersonasEnLinea: 6,
  texto: 'Reservamos de lunes a viernes. Sábados y domingos atendemos por orden de llegada.',
};

function rutaGoogleMaps(destino) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destino)}`;
}

export const SUCURSALES = [
  {
    id: 'plaza-real',
    nombre: 'Chiltepin Plaza Real',
    nombreCorto: 'Plaza Real',
    claveUrl: 'seafood',
    direccion: ['Politécnico Nacional 403', 'Huizache I, 34170 Durango, Dgo.'],
    telefono: '618 200 3865',
    telefonoLink: 'tel:+526182003865',
    mapaEmbed:
      'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3607.0499283099075!2d-104.65695134982525!3d24.004646701859894!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x869bb72a9cd96645%3A0xa72b972e2d936398!2sChiltepin%20SeaFood!5e0!3m2!1ses!2smx!4v1776994599450!5m2!1ses!2smx',
    comoLlegar: rutaGoogleMaps('Chiltepin SeaFood, Politécnico Nacional 403, Huizache I, Durango'),
    delivery: [
      { app: 'Rappi', url: 'https://www.rappi.com.mx/restaurantes/1930107511-chiltepin-seafood' },
      { app: 'DiDi Food', url: 'https://www.didi-food.com/es-MX/food/store/5764607524473670170' },
    ],
    seccionImagenes: 'sucursal-plaza-real',
    imagenes: [
      '/img/ubicaciones/plaza-real/fachada.jpeg',
      '/img/ubicaciones/plaza-real/interior2doP.jpg',
      '/img/ubicaciones/plaza-real/escaleras.jpg',
    ],
  },
  {
    id: 'plaza-450',
    nombre: 'Chiltepin Plaza 450',
    nombreCorto: 'Plaza 450',
    claveUrl: '450',
    direccion: ['Local 77, Plaza 450', 'Los Cipreses, 34217 Durango, Dgo.'],
    telefono: '618 815 8940',
    telefonoLink: 'tel:+526188158940',
    mapaEmbed:
      'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3643.340741445057!2d-104.646585725027!3d24.05430247846428!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x869bb738f6f10615%3A0x7e423aadb19046ab!2sChiltepin%20450!5e0!3m2!1ses!2smx!4v1776994643801!5m2!1ses!2smx',
    comoLlegar: rutaGoogleMaps('Chiltepin 450, Plaza 450, Los Cipreses, Durango'),
    delivery: [
      { app: 'DiDi Food', url: 'https://www.didi-food.com/es-MX/food/store/5764610193128950278' },
    ],
    seccionImagenes: 'sucursal-plaza-450',
    imagenes: [
      '/img/ubicaciones/450/fachada.jpeg',
      '/img/ubicaciones/450/1.jpeg',
      '/img/ubicaciones/450/2.jpeg',
      '/img/ubicaciones/450/3.jpeg',
      '/img/ubicaciones/450/4.jpeg',
    ],
  },
];

export function buscarSucursal(valor) {
  if (!valor) return undefined;
  return SUCURSALES.find(s => s.id === valor || s.claveUrl === valor || s.nombre === valor);
}

// TODO: Responsable de los datos personales (LFPDPPP, art. 15 fr. I). Confirmar con el dueño.
// Mientras esté vacío, los avisos muestran el nombre comercial.
export const RESPONSABLE_NOMBRE = '';
export const RESPONSABLE_DOMICILIO = 'Politécnico Nacional 403, Huizache I, C.P. 34170, Durango, Dgo.';

export const AVISO_PRIVACIDAD_RUTA = '/aviso-de-privacidad';
export const AVISO_PRIVACIDAD_FECHA = '17 de noviembre de 2026';

export function nombreResponsable() {
  return RESPONSABLE_NOMBRE.trim() || NOMBRE_COMERCIAL;
}
