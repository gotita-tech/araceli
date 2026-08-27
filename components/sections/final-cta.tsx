'use client';

import { useMap } from '@/components/map/map-provider';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/ui/reveal';
import { WaterField } from '@/components/visual/water-field';

type FinalCtaProps = {
  eyebrow: string;
  title: string;
  body: string;
  primaryLabel: string;
  secondary: { label: string; href: string };
};

export function FinalCta({ eyebrow, title, body, primaryLabel, secondary }: FinalCtaProps) {
  const { open } = useMap();

  return (
    <section className="relative overflow-hidden bg-ink-900 py-28 text-ivory md:py-36">
      <WaterField tone="dark" intensity={0.6} className="opacity-60" />
      <div className="field-deep pointer-events-none absolute inset-0 opacity-60" aria-hidden />

      <div className="shell relative">
        <Reveal className="max-w-2xl">
          <p className="eyebrow eyebrow-light">{eyebrow}</p>
          <h2 className="mt-5 font-serif text-display font-extralight leading-[1.05] text-ivory">{title}</h2>
          <p className="mt-7 max-w-prose text-lede text-ivory/70">{body}</p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" variant="light" onClick={() => open('section')}>
              {primaryLabel}
            </Button>
            <Button size="lg" variant="lightOutline" href={secondary.href}>
              {secondary.label}
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
