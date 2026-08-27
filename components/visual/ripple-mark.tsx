import { cn } from '@/lib/utils/cn';

type RippleMarkProps = {
  className?: string;
  /** Anima la respiración de las ondas (se desactiva con reduced-motion desde CSS). */
  breathing?: boolean;
  title?: string;
};

/**
 * Isotipo del sistema: una gota y sus ondas concéntricas.
 *
 * Reinterpreta la flor de la identidad como resonancia, no como decoración
 * esotérica: seis pétalos insinuados por arcos, nunca dibujados por completo.
 */
export function RippleMark({ className, breathing = false, title }: RippleMarkProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
      className={cn('h-6 w-6', className)}
    >
      {title ? <title>{title}</title> : null}
      <g className={breathing ? 'origin-center animate-breathe' : undefined}>
        <circle cx="24" cy="24" r="21" stroke="currentColor" strokeOpacity="0.18" strokeWidth="1" />
        <circle cx="24" cy="24" r="14.5" stroke="currentColor" strokeOpacity="0.34" strokeWidth="1" />
        <circle cx="24" cy="24" r="8" stroke="currentColor" strokeOpacity="0.55" strokeWidth="1.2" />
      </g>
      {/* Seis arcos insinuados: la flor aparece sólo cuando se la busca. */}
      <g stroke="currentColor" strokeOpacity="0.22" strokeWidth="1" strokeLinecap="round">
        <path d="M24 3.2a20.8 20.8 0 0 1 10.4 2.8" />
        <path d="M42.9 15.2a20.8 20.8 0 0 1 0 17.6" />
        <path d="M34.4 42a20.8 20.8 0 0 1-20.8 0" />
        <path d="M5.1 32.8a20.8 20.8 0 0 1 0-17.6" />
      </g>
      <circle cx="24" cy="24" r="3.1" fill="currentColor" />
    </svg>
  );
}

/** Versión reducida para el botón flotante: onda + punto central. */
export function RippleGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden className={cn('h-6 w-6', className)}>
      <g className="origin-center [animation-duration:6s] animate-breathe">
        <circle cx="16" cy="16" r="12.5" stroke="currentColor" strokeOpacity="0.28" strokeWidth="1.1" />
        <circle cx="16" cy="16" r="7.5" stroke="currentColor" strokeOpacity="0.5" strokeWidth="1.2" />
      </g>
      <circle cx="16" cy="16" r="2.6" fill="currentColor" />
    </svg>
  );
}
