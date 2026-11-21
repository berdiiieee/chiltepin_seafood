import {
  AVISO_PRIVACIDAD_FECHA,
  AVISO_PRIVACIDAD_RUTA,
  CORREO_CONTACTO,
  RESPONSABLE_DOMICILIO,
  nombreResponsable,
} from '../config/negocio';
import { useT } from '../context/Preferencias';
import CabeceraPagina from '../components/CabeceraPagina';
import { PEDIDOS_ACTIVOS } from '../config/api';

// Aviso de privacidad integral (LFPDPPP, art. 15).
// TODO: confirmar con el responsable legal (nombre, correo y fecha) antes de publicar.
const PrivacyPage = () => {
  const responsable = nombreResponsable();
  const { t, idioma } = useT();
  const correo = <a href={`mailto:${CORREO_CONTACTO}`}>{CORREO_CONTACTO}</a>;

  return (
    <>
      {/* Misma cabecera que las demás subpáginas */}
      <CabeceraPagina
        eyebrow={t('privacidad.eyebrow')}
        titulo={t('privacidad.titulo')}
        intro={t('privacidad.actualizado', { fecha: AVISO_PRIVACIDAD_FECHA })}
        divisor
      />
      <div className="container aviso-page">
        {/* El aviso legal va en español (LFPDPPP); en inglés solo se explica por qué */}
        {idioma === 'en' && (
          <p className="aviso-nota-idioma" lang="en">{t('privacidad.notaIngles')} {correo}.</p>
        )}
<section className="aviso-seccion">
        <h2>1. Quién es responsable de tus datos</h2>
        <p>
          <strong>{responsable}</strong>, con domicilio en {RESPONSABLE_DOMICILIO}, es responsable del uso y
          protección de los datos personales que nos compartes en este sitio. Para cualquier tema de privacidad
          escríbenos a {correo}. Ahí atendemos todas las solicitudes relacionadas con tus datos.
        </p>
      </section>

      <section className="aviso-seccion">
        <h2>2. Qué datos recabamos</h2>
        <p>Solo los que escribes en nuestros formularios:</p>
        <ul>
          <li><strong>Reservaciones:</strong> nombre, teléfono, correo, sucursal, fecha, hora y número de personas.</li>
          <li><strong>Eventos privados y catering:</strong> nombre, teléfono, correo, fecha del evento, número de invitados, tipo de evento y los detalles que nos escribas.</li>
          <li><strong>Contacto:</strong> nombre, correo, teléfono (opcional), tipo de mensaje y tu mensaje.</li>
          <li><strong>Boletín:</strong> correo y, si quieres, nombre y teléfono.</li>
          {/* TODO (dueño): revisar este texto antes de encender los pedidos a domicilio */}
          {PEDIDOS_ACTIVOS && (
            <li><strong>Pedidos a domicilio o para recoger:</strong> nombre, teléfono, correo (opcional), dirección de entrega, su ubicación en el mapa, referencias, lo que pides, tus notas para cocina, la forma de pago y si necesitas factura. <strong>No recibimos ni guardamos los datos de tu tarjeta:</strong> si pagas en línea, los captura directamente Mercado Pago.</li>
          )}
        </ul>
        <p>
          <strong>Datos sensibles:</strong> no te los pedimos. El único caso posible es que decidas contarnos sobre
          alergias o restricciones alimentarias (datos de salud) en los detalles de un evento o en un mensaje. Si lo
          haces, nos das tu consentimiento expreso para usarlos únicamente para preparar tus alimentos de forma segura.
        </p>
      </section>

      <section className="aviso-seccion">
        <h2>3. Para qué los usamos</h2>
        <p>Finalidades necesarias para darte el servicio que pides:</p>
        <ul>
          <li>Registrar, confirmar y administrar tu reservación, y avisarte si hay algún cambio.</li>
          <li>Cotizar y organizar tu evento privado o servicio de catering.</li>
          <li>Responder tus mensajes, preguntas, quejas o sugerencias.</li>
          {PEDIDOS_ACTIVOS && <li>Preparar, entregar y darte seguimiento a tu pedido, avisarte de su estado, cobrarlo y, si la pides, emitir tu factura. También para prevenir pedidos falsos (por ejemplo, limitar pedidos repetidos desde un mismo teléfono).</li>}
        </ul>
        <p>
          Finalidad que depende de tu consentimiento: <strong>enviarte el boletín</strong> con promociones y
          novedades. Solo lo recibes si te suscribes, y puedes darte de baja cuando quieras. No usamos los datos
          de reservaciones, eventos o contacto para mandarte publicidad.
        </p>
      </section>

      <section className="aviso-seccion">
        <h2>4. Con quién los compartimos</h2>
        <p>
          No vendemos, rentamos ni compartimos tus datos con otras empresas para sus propios fines. Se guardan en
          servicios de alojamiento y base de datos que contratamos, que solo los resguardan por nuestra cuenta y
          pueden tener sus servidores fuera de México. Solo los entregaríamos a una autoridad si la ley nos obliga.
        </p>
        {PEDIDOS_ACTIVOS && (
          <p>
            En los pedidos usamos además: <strong>Mercado Pago</strong>, que procesa los pagos en línea con tarjeta
            (recibe tu nombre, el monto y los datos de pago que le das directamente); <strong>Google Maps</strong>,
            para ubicar tu dirección en el mapa, y <strong>Cloudflare Turnstile</strong>, para comprobar que quien
            pide es una persona. Cada uno trata esos datos conforme a su propia política de privacidad.
          </p>
        )}
      </section>

      <section className="aviso-seccion">
        <h2>5. Cómo limitar el uso de tus datos</h2>
        <p>
          Para dejar de recibir el boletín o pedir que no te contactemos, escribe a {correo} con el asunto
          “Baja” y el correo o teléfono que nos diste.
        </p>
      </section>

      <section className="aviso-seccion">
        <h2>6. Tus derechos (ARCO) y cómo retirar tu consentimiento</h2>
        <p>
          Tienes derecho a <strong>acceder</strong> a tus datos, <strong>rectificarlos</strong> si están mal,
          <strong> cancelarlos</strong> (que los borremos) y <strong>oponerte</strong> a su uso. También puedes
          retirar en cualquier momento el consentimiento que nos diste. Es gratuito.
        </p>
        <p>Envía tu solicitud a {correo} con:</p>
        <ul>
          <li>Tu nombre y un medio para responderte (correo o domicilio).</li>
          <li>Una copia de tu identificación oficial, o la de tu representante y el documento que lo acredite.</li>
          <li>Qué datos son y qué derecho quieres ejercer (en el acceso basta con pedirlo).</li>
          <li>Si pides una corrección, el cambio y, en su caso, el documento que lo respalde.</li>
        </ul>
        <p>
          Te responderemos en un máximo de <strong>20 días</strong> desde que recibamos tu solicitud. Si procede,
          la aplicaremos dentro de los <strong>15 días</strong> siguientes. Estos plazos solo pueden ampliarse una
          vez, por un periodo igual, cuando el caso lo justifique.
        </p>
      </section>

      <section className="aviso-seccion">
        <h2>7. Cookies y tecnologías similares</h2>
        <p>
          Este sitio no usa cookies propias de rastreo ni de publicidad. Guarda en tu navegador una copia de las
          fotos de la página para que cargue más rápido; esa copia no contiene datos personales. La página de
          horarios muestra un mapa de Google Maps y el sitio usa tipografías de Google Fonts, por lo que Google
          puede recibir datos técnicos como tu dirección IP, conforme a su propia política de privacidad. La página de inicio muestra publicaciones incrustadas de Instagram; al abrirla, Instagram (Meta) puede recibir datos técnicos de tu visita, como tu dirección IP, y usar sus propias cookies, conforme a su política de privacidad.
        </p>
        {PEDIDOS_ACTIVOS && (
          <p>
            Si pides a domicilio, tu navegador guarda lo que llevas en el carrito (sin datos personales) y, solo
            mientras la pestaña esté abierta, la dirección de entrega. Si marcas “Recordar mis datos”, tu nombre,
            teléfono y correo se guardan únicamente en tu dispositivo; puedes borrarlos desmarcando la casilla.
          </p>
        )}
      </section>

      <section className="aviso-seccion">
        <h2>8. Cambios a este aviso</h2>
        <p>
          Publicaremos cualquier cambio en esta misma página ({window.location.origin}{AVISO_PRIVACIDAD_RUTA}), con la fecha de la última actualización al inicio.
        </p>
      </section>

      <section className="aviso-seccion">
        <h2>9. Autoridad</h2>
        <p>
          Si consideras que tu derecho a la protección de datos personales fue vulnerado, puedes acudir a la
          Secretaría Anticorrupción y Buen Gobierno, autoridad encargada de aplicar la Ley Federal de Protección de
          Datos Personales en Posesión de los Particulares.
        </p>
      </section>
      </div>
    </>
  );
};

export default PrivacyPage;
