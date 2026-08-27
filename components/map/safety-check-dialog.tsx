'use client';

import { Button } from '@/components/ui/button';
import type { SafetyCheck } from '@/lib/recommender/schema';

type SafetyCheckDialogProps = {
  check: SafetyCheck;
  modalityName: string;
  onConfirm: () => void;
  onDecline: () => void;
};

/**
 * Comprobación previa a mostrar una modalidad con contraindicaciones.
 * Ante la duda, la respuesta correcta siempre es no continuar.
 */
export function SafetyCheckDialog({ check, modalityName, onConfirm, onDecline }: SafetyCheckDialogProps) {
  return (
    <div className="mx-auto max-w-2xl">
      <p className="eyebrow">Antes de continuar</p>
      <h2 className="mt-4 font-serif text-headline font-light text-ink-800">{check.title}</h2>
      <p className="mt-5 text-lede text-ink-500">{check.intro}</p>

      <ul className="mt-8 space-y-3">
        {check.items.map((item) => (
          <li key={item} className="flex items-start gap-3 rounded-2xl border border-ink/8 bg-white/70 px-4 py-3.5 text-[0.95rem] text-ink-600">
            <span aria-hidden className="mt-[7px] block h-1.5 w-1.5 shrink-0 rounded-full bg-primary/50" />
            {item}
          </li>
        ))}
      </ul>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button onClick={onConfirm}>{check.confirmLabel}</Button>
        <Button onClick={onDecline} variant="secondary">
          {check.declineLabel}
        </Button>
      </div>

      <p className="mt-6 text-xs leading-relaxed text-ink-300">
        {check.footnote} Esta comprobación aparece porque {modalityName} implica el uso de imanes sobre el cuerpo.
      </p>
    </div>
  );
}
