'use client';

import { useEffect, useState } from 'react';

import { useMap } from '@/components/map/map-provider';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/ui/reveal';
import { MapShape } from '@/components/visual/map-shape';
import { useReducedMotion } from '@/lib/hooks/use-reduced-motion';
import type { WellnessVector } from '@/lib/recommender/types';

type MapTeaserProps = {
  eyebrow: string;
  title: string;
  body: string;
  bullets: string[];
  ctaLabel: string;
};

/** Tres formas de ejemplo: la figura respira entre ellas para mostrar que no hay dos mapas iguales. */
const SAMPLE_SHAPES: WellnessVector[] = [
  { mentalCalm: 1, emotionalExploration: 0.3, beliefsPatterns: 0.35, innerConnection: 0.5, bodyRelaxation: 0.95, spirituality: 0.25 },
  { mentalCalm: 0.4, emotionalExploration: 0.95, beliefsPatterns: 0.8, innerConnection: 0.7, bodyRelaxation: 0.2, spirituality: 0.35 },
  { mentalCalm: 0.5, emotionalExploration: 0.35, beliefsPatterns: 0.45, innerConnection: 1, bodyRelaxation: 0.3, spirituality: 0.95 },
];

export function MapTeaser({ eyebrow, title, body, bullets, ctaLabel }: MapTeaserProps) {
  const { open } = useMap();
  const reducedMotion = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reducedMotion) return;
    const timer = setInterval(() => setIndex((value) => (value + 1) % SAMPLE_SHAPES.length), 5200);
    return () => clearInterval(timer);
  }, [reducedMotion]);

  const vector = SAMPLE_SHAPES[index] ?? SAMPLE_SHAPES[0]!;

  return (
    <section className="relative overflow-hidden bg-ink-900 py-24 text-ivory md:py-32">
      <div className="field-deep pointer-events-none absolute inset-0 opacity-70" aria-hidden />

      <div className="shell relative grid items-center gap-14 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)] lg:gap-20">
        <Reveal className="order-2 flex justify-center lg:order-1">
          <MapShape vector={vector} size={360} tone="dark" className="max-w-full" />
        </Reveal>

        <Reveal className="order-1 lg:order-2" delay={0.08}>
          <p className="eyebrow eyebrow-light">{eyebrow}</p>
          <h2 className="mt-5 font-serif text-headline font-light text-ivory">{title}</h2>
          <p className="mt-6 max-w-prose text-lede text-ivory/70">{body}</p>

          <ul className="mt-9 space-y-3.5">
            {bullets.map((bullet) => (
              <li key={bullet} className="flex items-start gap-3 text-[0.95rem] text-ivory/75">
                <span aria-hidden className="mt-[9px] block h-1 w-1 shrink-0 rounded-full bg-mist" />
                {bullet}
              </li>
            ))}
          </ul>

          <div className="mt-10 flex flex-wrap gap-3">
            <Button size="lg" variant="light" onClick={() => open('section')}>
              {ctaLabel}
            </Button>
            <Button size="lg" variant="lightOutline" href="/mapa-interior">
              Abrirlo en página completa
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
