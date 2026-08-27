'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';

import { useReducedMotion } from '@/lib/hooks/use-reduced-motion';
import { CALM_EASE } from '@/lib/utils/motion';

type WhyPanelProps = {
  sentence: string;
  reasons: string[];
  affinity: number;
};

/**
 * Explicabilidad del resultado.
 *
 * Devuelve a la persona sus propias respuestas. Nunca dice que un algoritmo
 * detectó nada sobre ella.
 */
export function WhyPanel({ sentence, reasons, affinity }: WhyPanelProps) {
  const [open, setOpen] = useState(false);
  const reducedMotion = useReducedMotion();

  return (
    <div className="mt-8">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="why-panel"
        className="inline-flex items-center gap-2 text-sm text-ink-500 underline underline-offset-4 transition-colors hover:text-primary"
      >
        ¿Por qué apareció esta recomendación?
        <span aria-hidden className={`transition-transform duration-300 ease-calm ${open ? 'rotate-45' : ''}`}>
          +
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            id="why-panel"
            initial={reducedMotion ? false : { opacity: 0, height: 0 }}
            animate={reducedMotion ? undefined : { opacity: 1, height: 'auto' }}
            exit={reducedMotion ? undefined : { opacity: 0, height: 0 }}
            transition={{ duration: 0.42, ease: CALM_EASE }}
            className="overflow-hidden"
          >
            <div className="mt-4 rounded-3xl border border-ink/8 bg-white/70 p-6">
              <p className="text-[1.02rem] leading-relaxed text-ink-700">{sentence}</p>

              {reasons.length > 0 ? (
                <ul className="mt-5 space-y-2.5">
                  {reasons.map((reason) => (
                    <li key={reason} className="flex items-start gap-3 text-sm text-ink-500">
                      <span aria-hidden className="mt-[7px] block h-1 w-1 shrink-0 rounded-full bg-primary/60" />
                      {reason}
                    </li>
                  ))}
                </ul>
              ) : null}

              <p className="mt-5 text-xs leading-relaxed text-ink-300">
                La afinidad ({affinity}%) compara aquello que nos contaste con el perfil de cada modalidad. Es una medida
                de compatibilidad con tus preferencias, no una probabilidad de que algo funcione ni una medida de eficacia.
              </p>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
