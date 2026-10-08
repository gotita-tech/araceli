import Image from 'next/image';

const descriptions: Record<string, string> = {
  reiki: 'Lino y luz natural en un espacio de descanso',
  'barras-de-access': 'Una almohada de lino en un ambiente tranquilo',
  thetahealing: 'Un cuaderno junto a un sillón para la introspección',
  'metodo-yuen': 'Piedras de río sobre una superficie de piedra clara',
  'liberacion-emociones': 'Dos sillas preparadas para una conversación',
  'access-facelift': 'Una toalla y un cuenco de agua para el autocuidado',
  biomagnetismo: 'Dos imanes sobre un paño de lino',
  canalizacion: 'Una vela junto a un cuaderno en un ambiente sereno',
  'limpieza-energetica': 'Una ventana abierta y hojas de salvia bajo luz natural',
  hero: 'Ondas de agua en un cuenco de piedra bajo la luz del sol',
};

/** Escenas conceptuales generadas; nunca representan a Araceli ni sus sesiones. */
export function EditorialImage({ id, className = '', priority = false, sizes = '(max-width: 768px) 100vw, 50vw', caption = false }: {
  id: string; className?: string; priority?: boolean; sizes?: string; caption?: boolean;
}) {
  return (
    <figure className={className}>
      <div className="relative h-full min-h-[180px] overflow-hidden rounded-[1.5rem]">
        <Image src={`/images/${id}.webp`} alt={descriptions[id] ?? 'Ambiente de bienestar'} fill sizes={sizes} priority={priority} className="object-cover transition-transform duration-700 group-hover:scale-[1.035]" />
      </div>
      {caption ? <figcaption className="mt-3 text-xs text-ink-400">Imagen de ambiente · ilustración generada</figcaption> : null}
    </figure>
  );
}
