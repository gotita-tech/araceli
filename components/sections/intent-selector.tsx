'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';

import { useMap } from '@/components/map/map-provider';
import { Reveal } from '@/components/ui/reveal';
import { useReducedMotion } from '@/lib/hooks/use-reduced-motion';
import { cn } from '@/lib/utils/cn';
import { CALM_EASE } from '@/lib/utils/motion';

type Intent = {
  id: string;
  label: string;
  description: string;
  modalities: string[];
};

type ModalitySummary = { id: string; name: string; claim: string; category: string };

type IntentSelectorProps = {
  eyebrow: string;
  title: string;
  body: string;
  intents: Intent[];
  modalities: ModalitySummary[];
};

/**
 * Selector de intención: se entra por cómo quieres sentirte, no por el nombre
 * de una técnica que quizá no conoces.
 */
export function IntentSelector({ eyebrow, title, body, intents, modalities }: IntentSelectorProps) {
  const [activeId, setActiveId] = useState(intents[0]?.id ?? '');
  const reducedMotion = useReducedMotion();
  const { open } = useMap();

  const active = intents.find((intent) => intent.id === activeId) ?? intents[0];
  const suggested = (active?.modalities ?? [])
    .map((id) => modalities.find((modality) => modality.id === id))
    .filter((modality): modality is ModalitySummary => Boolean(modality));

  return (
    <section className="bg-ivory-paper py-20 md:py-28">
      <div className="shell">
        <Reveal className="max-w-prose">
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="mt-5 font-serif text-headline font-light text-ink-800">{title}</h2>
          <p className="mt-6 text-lede text-ink-500">{body}</p>
        </Reveal>

        <Reveal delay={0.06}>
          <div className="mt-12 flex flex-wrap gap-2.5" role="tablist" aria-label="Intenciones">
            {intents.map((intent) => {
              const selected = intent.id === activeId;
              return (
                <button
                  key={intent.id}
                  type="button"
                  role="tab"
                  id={`intent-tab-${intent.id}`}
                  aria-selected={selected}
                  aria-controls={`intent-panel-${intent.id}`}
                  onClick={() => setActiveId(intent.id)}
                  className={cn(
                    'min-h-[44px] rounded-full border px-5 text-sm transition-all duration-300 ease-calm',
                    selected
                      ? 'border-primary/40 bg-white text-ink-800 shadow-soft'
                      : 'border-ink/10 bg-white/50 text-ink-500 hover:border-primary/25 hover:text-ink-700',
                  )}
                >
                  {intent.label}
                </button>
              );
            })}
          </div>
        </Reveal>

        <AnimatePresence mode="wait">
          <motion.div
            key={active?.id ?? 'intent'}
            id={`intent-panel-${active?.id ?? ''}`}
            role="tabpanel"
            aria-labelledby={`intent-tab-${active?.id ?? ''}`}
            initial={reducedMotion ? false : { opacity: 0, y: 12 }}
            animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
            exit={reducedMotion ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.4, ease: CALM_EASE }}
            className="mt-10"
          >
            <p className="max-w-prose text-[1.05rem] leading-relaxed text-ink-600">{active?.description}</p>

            {suggested.length > 0 ? (
              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:max-w-4xl">
                {suggested.map((modality) => (
                  <Link
                    key={modality.id}
                    href={`/practicas/${modality.id}`}
                    className="group rounded-3xl border border-ink/8 bg-white/70 p-6 transition-all duration-400 ease-calm hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-soft"
                  >
                    <p className="eyebrow">{modality.category}</p>
                    <h3 className="mt-3 font-serif text-title font-light text-ink-800">{modality.name}</h3>
                    <p className="mt-3 text-[0.95rem] leading-relaxed text-ink-500">{modality.claim}</p>
                    <span className="mt-5 inline-block text-sm text-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      Conocer esta práctica
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="mt-8 max-w-2xl rounded-3xl border border-primary/20 bg-primary/5 p-7">
                <p className="text-[1.05rem] leading-relaxed text-ink-600">
                  No hace falta llegar con una idea clara. El Mapa Interior está pensado exactamente para este punto de
                  partida.
                </p>
                <button
                  type="button"
                  onClick={() => open('section')}
                  className="link-underline mt-5 inline-block text-sm text-primary"
                >
                  Crear mi mapa
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
