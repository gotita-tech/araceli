import Link from 'next/link';

import { Reveal } from '@/components/ui/reveal';
import { about } from '@/lib/content';

/** Trayectoria, no autobiografía: años de formación en prácticas distintas entre sí. */
export function AboutTeaser() {
  return (
    <section className="bg-ivory-paper py-20 md:py-28">
      <div className="shell grid gap-14 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.9fr)] lg:gap-20">
        <Reveal>
          <p className="eyebrow">Sobre Araceli</p>
          <h2 className="mt-5 font-serif text-headline font-light text-ink-800">{about.headline}</h2>
          <p className="mt-6 max-w-prose text-lede text-ink-500">{about.lede}</p>
          <Link href="/sobre-araceli" className="link-underline mt-8 inline-block text-sm text-primary">
            Conocer su trayectoria
          </Link>
        </Reveal>

        <Reveal delay={0.08}>
          <ul className="space-y-0 border-t border-ink/8">
            {about.timeline.slice(0, 5).map((entry) => (
              <li key={entry.id} className="flex items-baseline gap-6 border-b border-ink/8 py-4">
                <span className="tabular w-20 shrink-0 text-xs text-ink-300">
                  {entry.year || 'Año por confirmar'}
                </span>
                <span className="text-[0.98rem] text-ink-600">{entry.practice}</span>
              </li>
            ))}
          </ul>
          <p className="mt-5 text-xs leading-relaxed text-ink-300">{about.timelineNote}</p>
        </Reveal>
      </div>
    </section>
  );
}
