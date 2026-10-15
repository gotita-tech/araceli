import Image from 'next/image';

const descriptions: Record<string, string> = {
  'barras-de-access': 'Ilustración de referencia: contacto suave en la cabeza de una persona vestida y recostada',
  thetahealing: 'Ilustración de referencia: dos personas en un momento de meditación y escucha',
  'metodo-one': 'Ilustración conceptual: atención y gesto de manos en una práctica de enfoque energético',
  'metodo-rsame': 'Ilustración simbólica: una persona en actitud contemplativa rodeada de formas azules',
  'liberacion-emociones': 'Ilustración simbólica de exploración emocional, con una persona y trazos que se desenredan',
  'regresion-vidas-pasadas': 'Ilustración simbólica: una persona con los ojos cerrados y arcos que evocan relatos e imaginación',
  'limpieza-energetica': 'Ilustración simbólica de una persona y un espacio luminoso como referencia de una práctica espiritual',
  hero: 'Ondas de agua en un cuenco de piedra bajo la luz del sol',
};

// Cada práctica tiene una ilustración propia. No representa a Araceli ni una sesión real.
const imageSources: Record<string, string> = {
  'barras-de-access': 'barras-de-access-referencia',
  thetahealing: 'thetahealing-referencia',
  'metodo-one': 'metodo-one-referencia',
  'metodo-rsame': 'metodo-rsame-referencia',
  'liberacion-emociones': 'liberacion-emociones-referencia',
  'limpieza-energetica': 'limpieza-energetica-referencia',
  'regresion-vidas-pasadas': 'regresion-vidas-pasadas-referencia',
};

/** Escenas conceptuales generadas; nunca representan a Araceli ni sus sesiones. */
export function EditorialImage({ id, className = '', priority = false, sizes = '(max-width: 768px) 100vw, 50vw', caption = false }: {
  id: string; className?: string; priority?: boolean; sizes?: string; caption?: boolean;
}) {
  return (
    <figure className={className}>
      <div className="relative h-full min-h-[180px] overflow-hidden rounded-[1.5rem]">
        <Image src={`/images/${imageSources[id] ?? id}.webp`} alt={descriptions[id] ?? 'Ambiente de bienestar'} fill sizes={sizes} priority={priority} className="object-cover transition-transform duration-700 group-hover:scale-[1.035]" />
      </div>
      {caption ? <figcaption className="mt-3 text-xs text-ink-400">{imageSources[id] ? 'Ilustración de referencia creada con IA · no representa una sesión real' : 'Imagen de ambiente · ilustración generada'}</figcaption> : null}
    </figure>
  );
}
