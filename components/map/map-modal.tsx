'use client';

import { useCallback, useRef } from 'react';

import { RippleMark } from '@/components/visual/ripple-mark';
import { useFocusTrap } from '@/lib/hooks/use-focus-trap';
import { useLockScroll } from '@/lib/hooks/use-lock-scroll';
import { usePresence } from '@/lib/hooks/use-presence';
import { useReducedMotion } from '@/lib/hooks/use-reduced-motion';
import { cn } from '@/lib/utils/cn';

import { MapExperience } from './map-experience';
import { useMap } from './map-provider';

/**
 * Capa inmersiva del Mapa Interior.
 *
 * No es un chat: es una experiencia amplia, con su propio aire, que puede
 * cerrarse en cualquier momento sin perder lo respondido.
 *
 * La entrada y la salida se controlan con transiciones CSS y montaje explícito.
 * Es deliberado: dentro de esta capa hay animaciones anidadas y no queremos que
 * el cierre dependa de que todas ellas informen de que han terminado.
 */
export function MapModal() {
  const { isOpen, close } = useMap();
  const panelRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const { mounted, visible } = usePresence(isOpen, reducedMotion ? 0 : 300);

  const handleClose = useCallback(() => close(), [close]);

  useLockScroll(isOpen);
  // El foco sólo puede atraparse cuando el panel ya existe en el DOM.
  useFocusTrap(panelRef, mounted && isOpen, handleClose);

  if (!mounted) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto p-0 transition-opacity duration-300 ease-calm sm:items-center sm:p-6',
        visible ? 'opacity-100' : 'pointer-events-none opacity-0',
      )}
    >
      <div className="fixed inset-0 bg-ink-900/45 backdrop-blur-[3px]" onClick={handleClose} aria-hidden />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="map-modal-title"
        tabIndex={-1}
        className={cn(
          'relative z-10 flex min-h-[100dvh] w-full max-w-6xl flex-col bg-ivory-paper shadow-lift transition-all duration-500 ease-calm sm:min-h-0 sm:rounded-[2rem]',
          visible ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0',
        )}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-ink/6 bg-ivory-paper/92 px-5 py-4 backdrop-blur-md sm:rounded-t-[2rem] sm:px-8">
          <div className="flex items-center gap-3">
            <RippleMark className="h-5 w-5 text-primary" />
            <h2 id="map-modal-title" className="font-serif text-lg font-light text-ink-800">
              Tu Mapa Interior
            </h2>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="flex h-11 w-11 items-center justify-center rounded-full text-ink-400 transition-colors duration-300 hover:bg-ink/5 hover:text-ink-700"
          >
            <span className="sr-only">Cerrar la experiencia</span>
            <svg
              viewBox="0 0 20 20"
              className="h-4 w-4"
              aria-hidden
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
            >
              <path d="M4 4l12 12M16 4L4 16" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-10 pt-2 sm:px-8">
          <MapExperience variant="modal" />
        </div>
      </div>
    </div>
  );
}
