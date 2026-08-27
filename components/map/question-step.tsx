'use client';

import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';

import { useReducedMotion } from '@/lib/hooks/use-reduced-motion';
import type { Question } from '@/lib/recommender/types';
import { cn } from '@/lib/utils/cn';
import { CALM_EASE } from '@/lib/utils/motion';

type QuestionStepProps = {
  question: Question;
  selected: string[];
  onChange: (optionIds: string[]) => void;
  onAdvance: () => void;
  autoAdvance: boolean;
};

/**
 * Una pregunta del Mapa Interior.
 *
 * Usa controles nativos (radio/checkbox) ocultos visualmente: el teclado, los
 * lectores de pantalla y los estados de foco funcionan sin reimplementar nada.
 */
export function QuestionStep({ question, selected, onChange, onAdvance, autoAdvance }: QuestionStepProps) {
  const reducedMotion = useReducedMotion();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMulti = question.kind === 'multi';

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const handleSelect = (optionId: string) => {
    if (isMulti) {
      const already = selected.includes(optionId);
      const next = already
        ? selected.filter((id) => id !== optionId)
        : [...selected, optionId].slice(-question.maxChoices);
      onChange(next);
      return;
    }

    onChange([optionId]);

    if (autoAdvance && !reducedMotion) {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(onAdvance, 520);
    }
  };

  const layout =
    question.kind === 'cards'
      ? 'grid gap-3 sm:grid-cols-2'
      : question.kind === 'scale'
        ? 'flex flex-col gap-0'
        : 'grid gap-2.5 sm:grid-cols-2';

  return (
    <fieldset className="min-w-0 border-0 p-0">
      <legend className="font-serif text-title font-light text-ink-800">{question.title}</legend>

      {question.helper ? <p className="mt-3 max-w-prose text-sm text-ink-400">{question.helper}</p> : null}

      <div className={cn('mt-7', layout)}>
        {question.options.map((option, index) => {
          const isSelected = selected.includes(option.id);
          const inputId = `${question.id}-${option.id}`;

          if (question.kind === 'scale') {
            return (
              <ScaleOption
                key={option.id}
                id={inputId}
                name={question.id}
                label={option.label}
                checked={isSelected}
                position={index}
                total={question.options.length}
                onSelect={() => handleSelect(option.id)}
              />
            );
          }

          return (
            <motion.div
              key={option.id}
              initial={reducedMotion ? false : { opacity: 0, y: 10 }}
              animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: CALM_EASE, delay: reducedMotion ? 0 : 0.05 + index * 0.035 }}
            >
              <label
                className={cn(
                  'group flex h-full min-h-[52px] cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3.5 transition-all duration-300 ease-calm',
                  'hover:border-primary/40 hover:bg-white',
                  isSelected
                    ? 'border-primary/55 bg-white shadow-soft'
                    : 'border-ink/10 bg-white/55',
                  question.kind === 'cards' && 'min-h-[92px] flex-col justify-between gap-2 px-5 py-5',
                )}
              >
                <input
                  id={inputId}
                  type={isMulti ? 'checkbox' : 'radio'}
                  name={question.id}
                  value={option.id}
                  checked={isSelected}
                  onChange={() => handleSelect(option.id)}
                  className="peer sr-only"
                />

                <span className="flex w-full items-start gap-3">
                  <Indicator selected={isSelected} rounded={isMulti} />
                  <span className="min-w-0 flex-1">
                    <span className={cn('block text-[0.95rem] leading-snug', isSelected ? 'text-ink-800' : 'text-ink-600')}>
                      {option.label}
                    </span>
                    {option.helper ? <span className="mt-1.5 block text-sm text-ink-400">{option.helper}</span> : null}
                  </span>
                </span>
              </label>
            </motion.div>
          );
        })}
      </div>

      {question.note ? (
        <p className="mt-6 flex items-start gap-2.5 rounded-2xl border border-primary/15 bg-primary/5 px-4 py-3 text-sm text-ink-500">
          <span aria-hidden className="mt-[2px] block h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
          {question.note}
        </p>
      ) : null}
    </fieldset>
  );
}

function Indicator({ selected, rounded }: { selected: boolean; rounded: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        'mt-[3px] flex h-[18px] w-[18px] shrink-0 items-center justify-center border transition-all duration-300 ease-calm',
        rounded ? 'rounded-md' : 'rounded-full',
        selected ? 'border-primary bg-primary' : 'border-ink/25 bg-white/60 group-hover:border-primary/50',
        'peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-2',
      )}
    >
      <span
        className={cn(
          'block bg-ivory transition-transform duration-300 ease-calm',
          rounded ? 'h-[7px] w-[7px] rounded-[2px]' : 'h-[6px] w-[6px] rounded-full',
          selected ? 'scale-100' : 'scale-0',
        )}
      />
    </span>
  );
}

/** Escala semántica: tres estados con palabras, nunca un número. */
function ScaleOption({
  id,
  name,
  label,
  checked,
  position,
  total,
  onSelect,
}: {
  id: string;
  name: string;
  label: string;
  checked: boolean;
  position: number;
  total: number;
  onSelect: () => void;
}) {
  const isFirst = position === 0;
  const isLast = position === total - 1;

  return (
    <label className="group relative grid cursor-pointer grid-cols-[28px_1fr] items-center gap-4 py-1.5">
      <input id={id} type="radio" name={name} checked={checked} onChange={onSelect} className="peer sr-only" />

      <span aria-hidden className="relative flex h-14 w-7 items-center justify-center">
        {!isFirst ? <span className="absolute top-0 h-1/2 w-px bg-ink/12" /> : null}
        {!isLast ? <span className="absolute bottom-0 h-1/2 w-px bg-ink/12" /> : null}
        <span
          className={cn(
            'relative z-10 flex h-[18px] w-[18px] items-center justify-center rounded-full border bg-ivory-paper transition-all duration-300 ease-calm',
            checked ? 'border-primary' : 'border-ink/25 group-hover:border-primary/50',
            'peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-2',
          )}
        >
          <span
            className={cn(
              'block h-[7px] w-[7px] rounded-full bg-primary transition-transform duration-300 ease-calm',
              checked ? 'scale-100' : 'scale-0',
            )}
          />
        </span>
      </span>

      <span
        className={cn(
          'rounded-2xl border px-4 py-3 text-[0.95rem] transition-all duration-300 ease-calm',
          checked ? 'border-primary/50 bg-white text-ink-800 shadow-soft' : 'border-transparent text-ink-500 group-hover:border-ink/10 group-hover:bg-white/60',
        )}
      >
        {label}
      </span>
    </label>
  );
}
