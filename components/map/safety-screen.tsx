'use client';

import { Button } from '@/components/ui/button';
import { SAFETY_ROUTING } from '@/lib/recommender/safety-rules';
import type { SafetyLevel } from '@/lib/recommender/safety-rules';

type SafetyScreenProps = {
  level: Exclude<SafetyLevel, 'none'>;
  onRestart: () => void;
};

/**
 * Enrutamiento de seguridad.
 *
 * Cuando aparece esta pantalla no se ha calculado ninguna recomendación y no se
 * ofrece ninguna modalidad alternativa: sólo acompañamiento hacia ayuda adecuada.
 */
export function SafetyScreen({ level, onRestart }: SafetyScreenProps) {
  const urgent = level === 'urgent';

  return (
    <div className="mx-auto max-w-2xl">
      <span aria-hidden className="mb-8 block h-px w-16 bg-primary/40" />
      <h2 className="font-serif text-headline font-light text-ink-800">
        {urgent ? SAFETY_ROUTING.urgentTitle : SAFETY_ROUTING.clinicalTitle}
      </h2>

      <p className="mt-6 text-lede leading-relaxed text-ink-600">
        {urgent ? SAFETY_ROUTING.urgentMessage : SAFETY_ROUTING.clinicalMessage}
      </p>
      <p className="mt-4 text-[0.975rem] leading-relaxed text-ink-400">
        {urgent ? SAFETY_ROUTING.urgentSecondary : SAFETY_ROUTING.clinicalSecondary}
      </p>

      <div className="mt-10 flex flex-wrap gap-3">
        <Button href="/" variant={urgent ? 'primary' : 'secondary'}>
          {SAFETY_ROUTING.homeLabel}
        </Button>
        <Button onClick={onRestart} variant="ghost">
          {SAFETY_ROUTING.restartLabel}
        </Button>
      </div>
    </div>
  );
}
