import { Link } from 'react-router-dom';
import { AVISO_PRIVACIDAD_RUTA, CORREO_CONTACTO, SUCURSALES, nombreResponsable } from '../config/negocio';
import { useT } from '../context/Preferencias';
import CabeceraPagina from '../components/CabeceraPagina';

// Términos y condiciones de venta de los pedidos a domicilio y para recoger (Ley Federal de Protección al Consumidor).
// BORRADOR: el dueño (y de preferencia su contador o abogado) debe revisarlo antes de encender los pedidos.
// Igual que el aviso de privacidad, va en español.
export const TERMINOS_FECHA = '20 de noviembre de 2026';

const TerminosPage = () => {
  const { t, idioma } = useT();
  const correo = <a href={`mailto:${CORREO_CONTACTO}`}>{CORREO_CONTACTO}</a>;
  const telefonos = SUCURSALES.map((s, i) => (
    <span key={s.id}>{i > 0 && ' o '}{s.nombreCorto}: <a href={s.telefonoLink}>{s.telefono}</a></span>
  ));

  return (
    <>
      <CabeceraPagina eyebrow={t('domicilio.titulo')} titulo="Términos de venta" intro={`Última actualización: ${TERMINOS_FECHA}`} divisor />
      <div className="container aviso-page">
        {idioma === 'en' && <p className="aviso-nota-idioma" lang="en">These terms are only available in Spanish. Questions? Write to {correo}.</p>}

        <section className="aviso-seccion">
          <h2>1. Quién te vende</h2>
          <p>
            Los pedidos que haces en este sitio los prepara y entrega <strong>{nombreResponsable()}</strong>, desde
            la sucursal que te atiende. Para cualquier duda sobre tu pedido llama a {telefonos}, o escribe a {correo}.
          </p>
        </section>

        <section className="aviso-seccion">
          <h2>2. Precios</h2>
          <p>
            Los precios son en pesos mexicanos e <strong>incluyen IVA</strong>. Son los mismos de la carta del
            restaurante. Antes de confirmar ves el total completo: platillos, costo de envío y, si la agregas, la propina.
            No hay cargos escondidos.
          </p>
        </section>

        <section className="aviso-seccion">
          <h2>3. Zona y tiempos de entrega</h2>
          <p>
            Entregamos dentro de la zona de cada sucursal; el sitio te dice al momento si tu dirección está dentro y
            cuánto cuesta el envío. Los tiempos que mostramos son <strong>estimados</strong> y pueden cambiar en
            horas de mucha demanda o por el clima. Los pedidos programados son solo para el mismo día y dentro del horario de servicio.
          </p>
        </section>

        <section className="aviso-seccion">
          <h2>4. Formas de pago</h2>
          <ul>
            <li><strong>Al recibir:</strong> en efectivo o con tarjeta en la terminal del repartidor (o en la sucursal, si pasas a recoger).</li>
            <li><strong>En línea</strong> (cuando esté disponible): con tarjeta en la página segura de Mercado Pago. Nosotros nunca vemos ni guardamos los datos de tu tarjeta.</li>
          </ul>
          <p>
            Para cuidar el servicio, en tus primeros pedidos con pago al recibir puede haber un monto máximo. Si lo
            superas, el sitio te lo dice y puedes llamarnos. Podemos llamarte para confirmar un pedido antes de prepararlo.
          </p>
        </section>

        <section className="aviso-seccion">
          <h2>5. Cancelaciones y cambios</h2>
          <p>
            Puedes cancelar desde el enlace de seguimiento <strong>mientras el pedido diga “Recibido”</strong>. Cuando
            ya está en cocina, llama a la sucursal: preparamos todo al momento y quizá ya no sea posible. Si pagaste en
            línea y se cancela, te devolvemos el total a la misma tarjeta; el tiempo en que se refleja depende de tu banco.
          </p>
          <p>
            Si algo llega mal o incompleto, llámanos el mismo día y lo resolvemos (reposición o devolución de lo que faltó).
          </p>
        </section>

        <section className="aviso-seccion">
          <h2>6. Si nadie recibe</h2>
          <p>
            El repartidor te llama al llegar. Si no logramos entregar después de esperar unos minutos y llamarte, el
            pedido se regresa a la sucursal. Los pedidos con pago al recibir que no se reciben pueden impedir que vuelvas
            a pedir con esa forma de pago.
          </p>
        </section>

        <section className="aviso-seccion">
          <h2>7. Sobre los alimentos</h2>
          <p>
            Varios platillos llevan <strong>mariscos crudos o curados en limón</strong>. Consumir alimentos crudos puede
            aumentar el riesgo de enfermedades transmitidas por alimentos, sobre todo en embarazo, niños, adultos mayores
            o personas con defensas bajas. Te recomendamos comerlos en cuanto lleguen. Si tienes alguna alergia, escríbelo en la nota del platillo y llámanos para confirmar.
          </p>
          <p><strong>No vendemos bebidas con alcohol a domicilio</strong> ni para recoger en línea.</p>
        </section>

        <section className="aviso-seccion">
          <h2>8. Factura</h2>
          <p>
            Si marcas “Necesito factura”, después de la entrega te pediremos tus datos fiscales para emitirla dentro del
            mismo mes de tu compra.
          </p>
        </section>

        <section className="aviso-seccion">
          <h2>9. Tus datos y quejas</h2>
          <p>
            Usamos tus datos solo para tu pedido; consulta el <Link to={AVISO_PRIVACIDAD_RUTA}>aviso de privacidad</Link>.
            Si no quedas conforme, escríbenos primero a {correo}; también puedes acudir a la Procuraduría Federal del
            Consumidor (Profeco).
          </p>
        </section>
      </div>
    </>
  );
};

export default TerminosPage;
