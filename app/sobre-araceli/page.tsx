import type { Metadata } from 'next';

import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/ui/reveal';
import { StaticRipples } from '@/components/visual/static-ripples';
import { about } from '@/lib/content';
import { DISCLAIMERS } from '@/lib/recommender/safety-rules';

export const metadata: Metadata = {
  title: 'Sobre Araceli',
  description:
    'Años explorando distintas maneras de acompañar procesos personales: trayectoria, formación y el marco de trabajo de Araceli.',
};

export default function AboutPage() {
  return (
    <div className="bg-ivory-paper pt-[68px]">
      <header className="relative overflow-hidden border-b border-ink/8 bg-ivory-soft">
        <div className="pointer-events-none absolute inset-y-0 right-0 w-[55%] opacity-50" aria-hidden>
          <StaticRipples />
        </div>

        <div className="shell relative py-20 md:py-28">
          <p className="eyebrow">Trayectoria</p>
          <h1 className="mt-5 max-w-3xl font-serif text-display font-extralight leading-[1.05] text-ink-900">
            {about.headline}
          </h1>
          <p className="mt-7 max-w-prose text-lede text-ink-500">{about.lede}</p>
        </div>
      </header>

      <section className="shell grid gap-14 py-16 md:py-24 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.8fr)] lg:gap-20">
        <div className="min-w-0 space-y-6">
          {about.paragraphs.map((paragraph, index) => (
            <Reveal key={paragraph.slice(0, 24)} delay={index * 0.05}>
              <p className="max-w-prose text-[1.05rem] leading-relaxed text-ink-600">{paragraph}</p>
            </Reveal>
          ))}

          <Reveal delay={0.2}>
            <div className="mt-10 flex flex-wrap gap-3">
              <Button href="/mapa-interior" size="lg">
                Descubrir mi Mapa Interior
              </Button>
              <Button href="/conversar" variant="secondary" size="lg">
                Conversar con Araceli
              </Button>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.1}>
          <div className="rounded-[1.75rem] border border-ink/8 bg-white/60 p-7">
            <h2 className="eyebrow">Formación</h2>

            <ol className="mt-6 border-t border-ink/8">
              {about.timeline.map((entry) => (
                <li key={entry.id} className="border-b border-ink/8 py-4">
                  <div className="flex items-baseline gap-5">
                    <span className="tabular w-24 shrink-0 text-xs text-ink-300">
                      {entry.year || 'Por confirmar'}
                    </span>
                    <div className="min-w-0">
                      <p className="text-[0.98rem] text-ink-700">{entry.practice}</p>
                      {entry.school || entry.certification ? (
                        <p className="mt-1 text-sm text-ink-400">
                          {[entry.school, entry.certification, entry.location].filter(Boolean).join(' · ')}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </li>
              ))}
            </ol>

            <p className="mt-6 text-xs leading-relaxed text-ink-300">{about.timelineNote}</p>
          </div>

          <p className="mt-6 text-xs leading-relaxed text-ink-300">{DISCLAIMERS.global}</p>
        </Reveal>
      </section>
    </div>
  );
}
