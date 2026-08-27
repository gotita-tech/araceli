'use client';

import { useId } from 'react';

import { cn } from '@/lib/utils/cn';

type NoteStepProps = {
  value: string;
  onChange: (value: string) => void;
};

const MAX_LENGTH = 400;

/**
 * Paso opcional de texto libre.
 *
 * Existe por una única razón: detectar situaciones que necesitan atención
 * sanitaria antes de mostrar cualquier recomendación. No se usa para puntuar,
 * no viaja a ningún servidor y no se guarda nunca.
 */
export function NoteStep({ value, onChange }: NoteStepProps) {
  const id = useId();

  return (
    <div className="min-w-0">
      <p className="eyebrow">Último paso · opcional</p>
      <h2 className="mt-4 font-serif text-title font-light text-ink-800">
        ¿Hay algo que te gustaría que Araceli tuviera en cuenta?
      </h2>
      <p className="mt-4 max-w-prose text-[0.975rem] leading-relaxed text-ink-500">
        Puedes dejarlo en blanco. Si escribes algo, se procesa en tu propio navegador y no se guarda: sólo sirve para
        comprobar que las experiencias de este sitio son apropiadas para tu momento.
      </p>

      <label htmlFor={id} className="sr-only">
        Comentario opcional para Araceli
      </label>
      <textarea
        id={id}
        value={value}
        maxLength={MAX_LENGTH}
        onChange={(event) => onChange(event.target.value)}
        rows={4}
        placeholder="Por ejemplo: prefiero sesiones cortas, o me gustaría empezar con algo muy tranquilo."
        className={cn(
          'mt-6 w-full resize-none rounded-2xl border border-ink/12 bg-white/70 px-4 py-3.5 text-[0.95rem] text-ink-700 placeholder:text-ink-300',
          'transition-colors duration-300 ease-calm focus:border-primary/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
        )}
      />

      <div className="mt-2 flex items-center justify-between text-xs text-ink-300">
        <span>No incluyas datos personales ni información médica.</span>
        <span className="tabular">
          {value.length}/{MAX_LENGTH}
        </span>
      </div>
    </div>
  );
}
