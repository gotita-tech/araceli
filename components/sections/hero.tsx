'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

import { useMap } from '@/components/map/map-provider';
import { Button } from '@/components/ui/button';
import { WaterField } from '@/components/visual/water-field';
import { useReducedMotion } from '@/lib/hooks/use-reduced-motion';
import { CALM_EASE } from '@/lib/utils/motion';

type HeroProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  note: string;
};

export function Hero({ eyebrow, title, subtitle, primaryCta, secondaryCta, note }: HeroProps) {
  const { open } = useMap();
  const reducedMotion = useReducedMotion();

  const appear = (delay: number) =>
    reducedMotion
      ? {}
      : {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 1, ease: CALM_EASE, delay },
        };

  return (
    <section className="relative flex min-h-[92svh] items-center overflow-hidden bg-ivory-paper pt-[68px]">
      <WaterField className="mask-fade-b" intensity={1} />

      <div className="shell relative z-10 grid w-full items-center gap-12 py-16 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.75fr)] lg:py-24">
        <div className="max-w-2xl">
          <motion.p className="eyebrow" data-reveal {...appear(0.05)}>
            {eyebrow}
          </motion.p>

          <motion.h1
            className="mt-6 font-serif text-display font-extralight text-ink-900"
            data-reveal
            {...appear(0.14)}
          >
            {title}
          </motion.h1>

          <motion.p className="mt-7 max-w-xl text-lede text-ink-500" data-reveal {...appear(0.24)}>
            {subtitle}
          </motion.p>

          <motion.div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center" data-reveal {...appear(0.34)}>
            <Button size="lg" onClick={() => open('hero')}>
              {primaryCta.label}
            </Button>
            <Button size="lg" variant="secondary" href={secondaryCta.href}>
              {secondaryCta.label}
            </Button>
          </motion.div>

          <motion.p className="mt-10 max-w-md text-xs leading-relaxed text-ink-300" data-reveal {...appear(0.44)}>
            {note}
          </motion.p>
        </div>

        <motion.div className="hidden lg:block" data-reveal {...appear(0.3)}>
          <div className="ml-auto max-w-xs border-l border-ink/10 pl-7">
            <p className="text-sm leading-relaxed text-ink-500">
              Nueve preguntas sencillas dibujan una figura con aquello que hoy te interesa explorar.
            </p>
            <Link
              href={primaryCta.href}
              className="link-underline mt-4 inline-block text-sm text-primary"
            >
              Ver cómo funciona
            </Link>
          </div>
        </motion.div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-8 z-10 flex justify-center">
        <motion.span
          aria-hidden
          className="block h-10 w-px bg-gradient-to-b from-transparent via-ink/25 to-transparent"
          {...(reducedMotion
            ? {}
            : {
                animate: { opacity: [0.3, 0.9, 0.3] },
                transition: { duration: 5.5, repeat: Infinity, ease: 'easeInOut' },
              })}
        />
      </div>
    </section>
  );
}
