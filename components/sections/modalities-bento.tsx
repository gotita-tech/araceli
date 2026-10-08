import Link from 'next/link';

import { Pill } from '@/components/ui/pill';
import { Reveal } from '@/components/ui/reveal';
import { EditorialImage } from '@/components/visual/editorial-image';
import { EVIDENCE_LABELS, modalitiesByGroup, site, type ModalityContent } from '@/lib/content';
import { cn } from '@/lib/utils/cn';

/**
 * Composición editorial tipo bento.
 *
 * Los tamaños son una decisión de composición, no una jerarquía de eficacia:
 * la agrupación describe el enfoque del sitio, no equivalencias científicas.
 */
const SPANS: Record<string, string[]> = {
  'pausa-relajacion': ['md:col-span-4', 'md:col-span-2'],
  'creencias-autoconocimiento': ['md:col-span-2', 'md:col-span-2', 'md:col-span-2'],
  'experiencias-corporales': ['md:col-span-2', 'md:col-span-4'],
  'exploracion-espiritual': ['md:col-span-3', 'md:col-span-3'],
};

export function ModalitiesBento() {
  const { eyebrow, title, body, groups } = site.modalitiesSection;

  return (
    <section id="practicas" className="bg-ivory-soft py-20 md:py-28">
      <div className="shell">
        <Reveal className="max-w-prose">
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="mt-5 font-serif text-headline font-light text-ink-800">{title}</h2>
          <p className="mt-6 text-lede text-ink-500">{body}</p>
        </Reveal>

        <div className="mt-16 space-y-14">
          {groups.map((group) => {
            const items = modalitiesByGroup(group.id);
            if (items.length === 0) return null;
            const spans = SPANS[group.id] ?? [];

            return (
              <div key={group.id}>
                <Reveal className="flex flex-wrap items-baseline justify-between gap-3 border-b border-ink/8 pb-4">
                  <h3 className="font-serif text-[1.35rem] font-light text-ink-800">{group.label}</h3>
                  <p className="max-w-sm text-sm text-ink-400">{group.description}</p>
                </Reveal>

                <div className="mt-6 grid gap-4 md:grid-cols-6">
                  {items.map((modality, index) => (
                    <Reveal
                      key={modality.id}
                      delay={index * 0.05}
                      className={cn('h-full', spans[index] ?? 'md:col-span-2')}
                    >
                      <ModalityCard modality={modality} large={(spans[index] ?? '').includes('col-span-4')} />
                    </Reveal>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-14 max-w-2xl text-xs leading-relaxed text-ink-300">
          Esta agrupación describe el tipo de experiencia que ofrece cada práctica dentro de este sitio. No supone
          equivalencias científicas entre modalidades ni afirma efectos comparables.
        </p>
      </div>
    </section>
  );
}

function ModalityCard({ modality, large = false }: { modality: ModalityContent; large?: boolean }) {
  return (
    <Link
      href={`/practicas/${modality.id}`}
      className={cn(
        'group relative flex h-full flex-col justify-between overflow-hidden rounded-[1.75rem] border border-ink/8 bg-white/75 p-7 transition-all duration-500 ease-calm',
        'hover:-translate-y-1 hover:border-primary/25 hover:bg-white hover:shadow-lift',
        large && 'md:p-7',
      )}
    >
      <EditorialImage id={modality.id} className="-mx-7 -mt-7 mb-7 h-[230px] " sizes="(max-width: 768px) 100vw, 50vw" />


      <div className="relative">
        <Pill>{modality.category}</Pill>
        <h4 className={cn('mt-5 font-serif font-light text-ink-800', large ? 'text-headline' : 'text-title')}>
          {modality.name}
        </h4>
        <p className={cn('mt-3 max-w-md leading-relaxed text-ink-500', large ? 'text-lede' : 'text-[0.95rem]')}>
          {modality.claim}
        </p>
      </div>

      <div className="relative mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-ink-300">
        <span>{modality.practical.durationMinutes} min</span>
        <span aria-hidden>·</span>
        <span>{modality.practical.formats.join(' · ')}</span>
        <span aria-hidden>·</span>
        <span>{EVIDENCE_LABELS[modality.evidenceLevel]}</span>
      </div>
    </Link>
  );
}
