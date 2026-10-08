import type { Metadata } from 'next';

import { ModalitiesBento } from '@/components/sections/modalities-bento';
import { Button } from '@/components/ui/button';
import { StaticRipples } from '@/components/visual/static-ripples';
import { DISCLAIMERS } from '@/lib/recommender/safety-rules';

export const metadata: Metadata = {
  alternates: { canonical: '/practicas' },
  title: 'Prácticas',
  description:
    'Experiencias de bienestar, prácticas espirituales y métodos complementarios que acompaña Araceli, explicados con sus límites y su estado de evidencia.',
};

export default function PracticesPage() {
  return (
    <div className="bg-ivory-paper pt-[68px]">
      <header className="relative overflow-hidden border-b border-ink/8 bg-ivory-paper">
        <div className="pointer-events-none absolute inset-y-0 right-0 w-[60%] opacity-45" aria-hidden>
          <StaticRipples />
        </div>

        <div className="shell relative py-20 md:py-28">
          <p className="eyebrow">Prácticas</p>
          <h1 className="mt-5 max-w-3xl font-serif text-display font-extralight leading-[1.05] text-ink-900">
            Cada práctica, explicada con sus límites.
          </h1>
          <p className="mt-7 max-w-prose text-lede text-ink-500">
            Conoce cómo transcurre cada experiencia, qué puedes esperar y qué límites tiene. Si todavía no sabes
            cuál elegir, puedes empezar por tus preferencias en el Mapa Interior.
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <Button href="/mapa-interior" size="lg">
              Descubrir mi Mapa Interior
            </Button>
            <Button href="/conversar" variant="secondary" size="lg">
              Conversar con Araceli
            </Button>
          </div>
        </div>
      </header>

      <ModalitiesBento />

      <div className="shell pb-20">
        <p className="max-w-3xl text-xs leading-relaxed text-ink-300">{DISCLAIMERS.evidence}</p>
      </div>
    </div>
  );
}
