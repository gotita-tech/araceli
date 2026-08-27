'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import { RippleGlyph } from '@/components/visual/ripple-mark';
import { useReducedMotion } from '@/lib/hooks/use-reduced-motion';
import { CALM_EASE } from '@/lib/utils/motion';

import { useMap } from './map-provider';

/**
 * Acceso permanente al Mapa Interior.
 *
 * Cuadrado redondeado de 54 px con cristal muy sutil: deliberadamente distinto
 * de la burbuja circular de un chatbot, porque lo que abre no es un chat.
 */
export function FloatingMapButton() {
  const { open, isOpen } = useMap();
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();
  const [hovered, setHovered] = useState(false);

  // En la página dedicada la experiencia ya está en pantalla.
  if (pathname?.startsWith('/mapa-interior')) return null;

  return (
    <div className="pointer-events-none fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-[max(1.25rem,env(safe-area-inset-right))] z-50 flex items-center gap-3">
      <AnimatePresence>
        {hovered && !isOpen ? (
          <motion.span
            initial={reducedMotion ? false : { opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            transition={{ duration: 0.3, ease: CALM_EASE }}
            className="pointer-events-none hidden rounded-full border border-ink/8 bg-ivory-paper/95 px-4 py-2 text-sm text-ink-600 shadow-soft backdrop-blur-sm sm:block"
            role="tooltip"
            id="map-button-tooltip"
          >
            Descubre tu Mapa Interior
          </motion.span>
        ) : null}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => open('floating')}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
        aria-label="Abrir la experiencia Tu Mapa Interior"
        aria-describedby={hovered ? 'map-button-tooltip' : undefined}
        aria-expanded={isOpen}
        className="glass pointer-events-auto flex h-[54px] w-[54px] items-center justify-center rounded-[17px] text-primary shadow-glass transition-[transform,box-shadow,border-color] duration-500 ease-calm hover:-translate-y-[2px] hover:border-primary/30 focus-visible:-translate-y-[2px]"
      >
        <RippleGlyph className="h-7 w-7" />
      </button>
    </div>
  );
}
