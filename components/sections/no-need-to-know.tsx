'use client';

import { motion } from 'framer-motion';

import { useMap } from '@/components/map/map-provider';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/ui/reveal';
import { useReducedMotion } from '@/lib/hooks/use-reduced-motion';
import { DIMENSION_IDS, DIMENSION_LABELS } from '@/lib/recommender/types';
import { CALM_EASE } from '@/lib/utils/motion';

type NoNeedToKnowProps = {
  eyebrow: string;
  title: string;
  body: string;
  ctaLabel: string;
};

/**
 * Seis conceptos orbitando una onda central: las dimensiones del mapa como
 * sistema gráfico, no como iconografía esotérica.
 */
export function NoNeedToKnow({ eyebrow, title, body, ctaLabel }: NoNeedToKnowProps) {
  const { open } = useMap();
  const reducedMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden bg-ivory-soft py-20 md:py-28">
      <div className="shell grid items-center gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] lg:gap-20">
        <Reveal>
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="mt-5 font-serif text-headline font-light text-ink-800">{title}</h2>
          <p className="mt-6 max-w-prose text-lede text-ink-500">{body}</p>
          <div className="mt-9">
            <Button size="lg" onClick={() => open('section')}>
              {ctaLabel}
            </Button>
          </div>
        </Reveal>

        <div className="relative">
          {/* Órbita: en pantallas grandes los conceptos rodean la onda central. */}
          <div className="relative mx-auto hidden aspect-square w-full max-w-[440px] md:block">
            <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden>
              {[46, 36, 26, 16].map((radius, index) => (
                <circle
                  key={radius}
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="none"
                  stroke="rgb(67 107 222)"
                  strokeOpacity={0.06 + index * 0.035}
                  strokeWidth="0.35"
                />
              ))}
              <circle cx="50" cy="50" r="2" fill="#436BDE" fillOpacity="0.8" />
            </svg>

            {DIMENSION_IDS.map((dimension, index) => {
              const angle = (Math.PI * 2 * index) / DIMENSION_IDS.length - Math.PI / 2;
              const left = 50 + Math.cos(angle) * 43;
              const top = 50 + Math.sin(angle) * 43;

              return (
                <motion.span
                  key={dimension}
                  className="absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border border-ink/8 bg-ivory-paper/90 px-3.5 py-2 text-[0.8rem] text-ink-600 shadow-soft backdrop-blur-sm"
                  style={{ left: `${left}%`, top: `${top}%` }}
                  {...(reducedMotion
                    ? {}
                    : {
                        animate: { y: [0, -5, 0] },
                        transition: {
                          duration: 7 + index * 0.6,
                          repeat: Infinity,
                          ease: 'easeInOut',
                          delay: index * 0.4,
                        },
                      })}
                >
                  {DIMENSION_LABELS[dimension]}
                </motion.span>
              );
            })}
          </div>

          {/* En móvil la órbita se convierte en una lista legible. */}
          <ul className="grid grid-cols-2 gap-2.5 md:hidden">
            {DIMENSION_IDS.map((dimension, index) => (
              <motion.li
                key={dimension}
                initial={reducedMotion ? false : { opacity: 0, y: 10 }}
                whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: CALM_EASE, delay: index * 0.05 }}
                className="flex items-center gap-2.5 rounded-2xl border border-ink/8 bg-ivory-paper/80 px-3.5 py-3 text-[0.82rem] text-ink-600"
              >
                <span aria-hidden className="block h-1.5 w-1.5 shrink-0 rounded-full bg-primary/50" />
                {DIMENSION_LABELS[dimension]}
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
