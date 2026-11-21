import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import CabeceraPagina from '../components/CabeceraPagina';
import Galeria from '../components/Galeria';
import { useImagenes } from '../hooks/useImagenes';
import { SUCURSALES } from '../config/negocio';
import { useT } from '../context/Preferencias';
import { traductorMenu, indiceDia } from '../i18n/menu';
import { useMenu } from '../hooks/useMenu';
import { indiceHoy, textoHorario } from '../utils/horario';


// Mismo trazo que los sellos de "Del mar a tu mesa" en el Inicio.
const trazo = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' };
const IconoPin = () => (<svg viewBox="0 0 32 32" width="30" height="30" aria-hidden="true"><path d="M16 28s9-8.2 9-15a9 9 0 0 0-18 0c0 6.8 9 15 9 15z" {...trazo} /><circle cx="16" cy="13" r="3.2" {...trazo} /></svg>);
const IconoReloj = () => (<svg viewBox="0 0 32 32" width="30" height="30" aria-hidden="true"><circle cx="16" cy="16" r="11" {...trazo} /><path d="M16 9.5V16l4.5 3" {...trazo} /></svg>);
const IconoTel = () => (<svg viewBox="0 0 32 32" width="30" height="30" aria-hidden="true"><path d="M8 5h5l2 6-3 2a15 15 0 0 0 7 7l2-3 6 2v5a2 2 0 0 1-2 2C14.5 26 6 17.5 6 7a2 2 0 0 1 2-2z" {...trazo} /></svg>);
const IconoBolsa = () => (<svg viewBox="0 0 32 32" width="30" height="30" aria-hidden="true"><path d="M7 11h18l-1.5 15h-15z" {...trazo} /><path d="M12 11V9a4 4 0 0 1 8 0v2" {...trazo} /></svg>);
const Flecha = () => <span aria-hidden="true">→</span>;

const LocationDetailPage = ({ sucursal: s, onReservationClick }) => {
  const fotos = useImagenes(s.seccionImagenes, s.imagenes);
  // Galería de 3: la selección de la sucursal (puede abrir con un video); si no hay, sus primeras fotos
  const medios = (s.galeria || fotos).slice(0, 3);
  // Promos del panel (mismo pedido que el Menú); respaldo local si el servidor no responde
  const promos = useMenu().promos.find(p => p.location === s.nombreCorto)?.rows ?? [];
  const otra = SUCURSALES.find(x => x.id !== s.id);
  const esPrimera = SUCURSALES[0].id === s.id;
  const hoy = indiceHoy(); // día de la semana en Durango (Dom = 0)
  const { t, idioma } = useT();
  const tr = traductorMenu(idioma);
  // El mapa aparece con un fundido cuando termina de cargar (o a los 4 s, por si no avisa)
  const [mapaListo, setMapaListo] = useState(false);
  useEffect(() => { const id = setTimeout(() => setMapaListo(true), 4000); return () => clearTimeout(id); }, []);

  return (
    <main className="container">
      <CabeceraPagina
        eyebrow={t('sucursales.detalleEyebrow')}
        titulo={s.nombre}
        divisor
        siguiente={{ to: `/horarios/${otra.id}`, nombre: otra.nombreCorto, lado: esPrimera ? 'der' : 'izq' }}
      />

      <section className="home-seccion home-nosotros suc-principal">
        <div className="nosotros-texto reveal reveal-up">
          <p className="eyebrow">{t('sucursales.teEsperamos')}</p>
          <h2 className="titulo-seccion">{t('sucursales.venAVernos')}</h2>
          <ul className="sellos suc-datos">
            <li>
              <IconoPin />
              <span>
                <strong>{t('sucursales.direccion')}</strong>
                {s.direccion[0]}, {s.direccion[1]}
              </span>
            </li>
            <li>
              <IconoReloj />
              <span><strong>{t('comun.horario')}</strong>{textoHorario(t, idioma)}</span>
            </li>
            <li>
              <IconoTel />
              <span><strong>{t('sucursales.telefono')}</strong><a href={s.telefonoLink}>{s.telefono}</a></span>
            </li>
            <li>
              <IconoBolsa />
              <span>
                <strong>{t('sucursales.domicilio')}</strong>
                <span className="suc-dato-apps">
                  {s.delivery.map(d => (
                    <a key={d.app} className="suc-dato-enlace" href={d.url} target="_blank" rel="noopener noreferrer">{d.app} <Flecha /></a>
                  ))}
                </span>
              </span>
            </li>
          </ul>
          <div>
            <button type="button" className="btn-principal" onClick={() => onReservationClick(s.id)}>{t('sucursales.reservarAqui')}</button>
          </div>
        </div>

        {/* En celular las fotos van primero (antes de "Ven a vernos") */}
        <div className="suc-fotos reveal reveal-up delay-2">
          <Galeria fotos={medios} etiqueta={t('comun.fotosDe', { nombre: s.nombre })} altBase={t('comun.fotoN', { nombre: s.nombre, n: '' }).trim()} />
        </div>
      </section>

      <section className="home-seccion suc-bloque reveal reveal-up" aria-label={t('sucursales.comoLlegarEyebrow')}>
        <div className="seccion-cabecera suc-cabecera">
          <div>
            <p className="eyebrow">{t('sucursales.comoLlegarEyebrow')}</p>
            <h2 className="titulo-seccion">{t('sucursales.encuentranos')}</h2>
          </div>
          <a className="link-flecha" href={s.comoLlegar} target="_blank" rel="noopener noreferrer">{t('sucursales.abrirMaps')} <Flecha /></a>
        </div>
        <div className={`suc-mapa-ancho${mapaListo ? ' listo' : ''}`}>
          <iframe onLoad={() => setMapaListo(true)} src={s.mapaEmbed} loading="lazy" allowFullScreen referrerPolicy="no-referrer-when-downgrade" title={t('sucursales.mapaDe', { nombre: s.nombre })}></iframe>
          {/* Celular: el mapa no atrapa el dedo; al tocarlo se abre Google Maps (en escritorio no se muestra) */}
          <a className="suc-mapa-toque" href={s.comoLlegar} target="_blank" rel="noopener noreferrer" aria-label={t('sucursales.abrirMaps')} tabIndex={-1} />
        </div>
      </section>

      {/* Promociones: debajo del mapa, a la vista pero con menos peso que "Encuéntranos" */}
      {promos.length > 0 && (
        <section className="suc-bloque suc-promos reveal reveal-up" aria-labelledby="suc-promos-titulo">
          <div className="suc-subcabecera">
            <h2 id="suc-promos-titulo" className="suc-subtitulo">{t('sucursales.promosTitulo')}</h2>
            <Link to="/menu" className="link-flecha">{t('comun.verMenu')} <Flecha /></Link>
          </div>
          <div className="suc-semana" style={{ gridTemplateColumns: `repeat(${promos.length}, minmax(0, 1fr))` }}>
            {promos.map(p => (
              <div className={`suc-dia${indiceDia(p.day) === hoy ? ' es-hoy' : ''}`} key={p.day}>
                <span className="suc-dia-nombre">
                  {tr.dia(p.day)}
                  {indiceDia(p.day) === hoy && <span className="promo-hoy">{t('comun.hoy')}</span>}
                </span>
                <span className="suc-dia-platillo">{tr.promo(p)}</span>
                {p.price > 0 && <span className="suc-dia-precio">${p.price}</span>}
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
};

export default LocationDetailPage;
