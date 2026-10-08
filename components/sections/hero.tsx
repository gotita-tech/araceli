'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

import { useMap } from '@/components/map/map-provider';
import { Button } from '@/components/ui/button';
import { EditorialImage } from '@/components/visual/editorial-image';
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
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(152,172,219,0.15),transparent_65%)]" />

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

        <motion.div className="relative mx-auto w-full max-w-lg pb-8 lg:pl-6" data-reveal {...appear(0.3)}>
          <EditorialImage id="hero" priority className="h-[360px] sm:h-[470px] lg:h-[530px]" sizes="(max-width: 768px) 100vw, 45vw" />
          <div className="relative mx-5 -mt-14 rounded-2xl border border-white/80 bg-ivory-paper/95 p-6 shadow-soft backdrop-blur">
            <p className="eyebrow">Tu momento, tu punto de partida</p>
            <p className="mt-3 font-serif text-title font-light text-ink-800">No necesitas tenerlo todo claro.</p>
            <Link href={primaryCta.href} className="link-underline mt-4 inline-block text-sm text-primary">Nueve preguntas para empezar ↗</Link>
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
