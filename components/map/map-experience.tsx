'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { MapShape } from '@/components/visual/map-shape';
import { RippleMark } from '@/components/visual/ripple-mark';
import { track } from '@/lib/analytics';
import { useReducedMotion } from '@/lib/hooks/use-reduced-motion';
import { QUESTIONS, TOTAL_QUESTIONS, formatProgress } from '@/lib/recommender/questions';
import { DISCLAIMERS } from '@/lib/recommender/safety-rules';
import { hasStoredMap, loadMap } from '@/lib/storage';
import { cn } from '@/lib/utils/cn';
import { CALM_EASE } from '@/lib/utils/motion';

import { useMap } from './map-provider';
import { NoteStep } from './note-step';
import { QuestionStep } from './question-step';
import { ResultScreen } from './result-screen';
import { SafetyScreen } from './safety-screen';

type MapExperienceProps = {
  /** En el modal el alto es limitado; en la página propia hay más aire. */
  variant?: 'modal' | 'page';
};

/**
 * Orquesta la experiencia completa: introducción, nueve preguntas, paso opcional
 * de contexto y resultado. La figura se construye mientras se responde.
 */
export function MapExperience({ variant = 'page' }: MapExperienceProps) {
  const { state, dispatch, preview, result, progress } = useMap();
  const reducedMotion = useReducedMotion();
  const [canResume, setCanResume] = useState(false);

  useEffect(() => {
    setCanResume(hasStoredMap());
  }, []);

  useEffect(() => {
    if (state.phase === 'wizard') track({ name: 'map_step', step: state.step + 1 });
  }, [state.phase, state.step]);

  useEffect(() => {
    if (state.phase === 'safety') {
      track({ name: 'map_safety_routed', level: state.safetyLevel === 'urgent' ? 'urgent' : 'clinical' });
    }
  }, [state.phase, state.safetyLevel]);

  const question = QUESTIONS[state.step];
  const selected = question ? (state.answers[question.id] ?? []) : [];
  const canContinue = selected.length > 0;
  const isLastQuestion = state.step === TOTAL_QUESTIONS - 1;

  if (state.phase === 'safety' && state.safetyLevel !== 'none') {
    return (
      <div className={cn('px-1 py-6', variant === 'page' && 'py-10')}>
        <SafetyScreen level={state.safetyLevel} onRestart={() => dispatch({ type: 'restart' })} />
      </div>
    );
  }

  if (state.phase === 'result') {
    return (
      <div className={cn('px-1 py-4', variant === 'page' && 'py-8')}>
        <ResultScreen
          result={result}
          answers={state.answers}
          compact={variant === 'modal'}
          onRestart={() => dispatch({ type: 'restart' })}
          onExclude={(id) => dispatch({ type: 'exclude', id })}
          onToggleTag={(tag) => dispatch({ type: 'toggleTag', tag })}
          extraTags={state.extraTags}
        />
      </div>
    );
  }

  if (state.phase === 'intro') {
    return (
      <div className="grid items-center gap-10 px-1 py-4 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] lg:gap-16">
        <div className="order-2 flex justify-center lg:order-1">
          <MapShape vector={preview} size={variant === 'modal' ? 240 : 300} progress={0.35} />
        </div>

        <div className="order-1 min-w-0 lg:order-2">
          <p className="eyebrow">Tu Mapa Interior</p>
          <h2 className="mt-4 font-serif text-headline font-light text-ink-800">
            Nueve preguntas para ordenar aquello que hoy quieres explorar.
          </h2>
          <p className="mt-5 max-w-prose text-lede text-ink-500">
            Mientras respondes, una figura se irá formando con tus respuestas. Al terminar verás qué modalidades tienen
            mayor afinidad con tus preferencias, y por qué.
          </p>

          <ul className="mt-8 space-y-3">
            {[
              'Entre 90 y 150 segundos.',
              'Sin nombre, sin datos personales, sin historia clínica.',
              'El cálculo ocurre en tu navegador y puedes terminar sin guardar nada.',
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-[0.95rem] text-ink-500">
                <RippleMark className="mt-[2px] h-4 w-4 shrink-0 text-primary/70" />
                {item}
              </li>
            ))}
          </ul>

          <div className="mt-9 flex flex-wrap gap-3">
            <Button size="lg" onClick={() => dispatch({ type: 'start' })} data-autofocus>
              Comenzar
            </Button>
            {canResume ? (
              <Button
                size="lg"
                variant="secondary"
                onClick={() => {
                  const stored = loadMap();
                  dispatch({ type: 'start', ...(stored ? { answers: stored.answers } : {}) });
                }}
              >
                Retomar mi mapa guardado
              </Button>
            ) : null}
          </div>

          <p className="mt-8 text-xs leading-relaxed text-ink-300">{DISCLAIMERS.map}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-8 px-1 py-4 lg:grid-cols-[minmax(0,0.68fr)_minmax(0,1fr)] lg:gap-14">
      {/* Columna de la figura: en móvil se convierte en una cabecera compacta. */}
      <div className="flex items-center gap-5 lg:sticky lg:top-6 lg:flex-col lg:items-start lg:gap-8">
        <div className="relative shrink-0">
          <MapShape
            vector={preview}
            size={variant === 'modal' ? 108 : 132}
            progress={0.45 + progress * 0.55}
            className="lg:hidden"
          />
          <MapShape
            vector={preview}
            size={300}
            progress={0.45 + progress * 0.55}
            className="hidden lg:block"
            labels
          />
        </div>

        <div className="min-w-0 flex-1 lg:w-full">
          <p className="tabular text-sm text-ink-400" aria-hidden>
            {state.phase === 'note' ? `${String(TOTAL_QUESTIONS).padStart(2, '0')} / ${String(TOTAL_QUESTIONS).padStart(2, '0')}` : formatProgress(state.step)}
          </p>
          <div className="mt-3 hidden h-px w-full bg-ink/8 lg:block">
            <div
              className="h-px bg-primary/50 transition-[width] duration-700 ease-calm"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>
          <p className="mt-3 hidden max-w-[26ch] text-sm text-ink-400 lg:block">
            Tu figura se dibuja con cada respuesta. No hay respuestas correctas.
          </p>
        </div>
      </div>

      <div className="min-w-0">
        {/* Anuncio para lectores de pantalla al cambiar de paso. */}
        <p className="sr-only" role="status" aria-live="polite">
          {state.phase === 'note'
            ? 'Último paso, opcional'
            : `Pregunta ${state.step + 1} de ${TOTAL_QUESTIONS}`}
        </p>

        {/* Cada paso se remonta por su key y entra con su propia animación:
            sin salidas pendientes, el avance nunca se queda bloqueado. */}
        <motion.div
          key={state.phase === 'note' ? 'note' : (question?.id ?? 'question')}
          initial={reducedMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.45, ease: CALM_EASE }}
        >
          {state.phase === 'note' ? (
            <NoteStep value={state.note} onChange={(note) => dispatch({ type: 'setNote', note })} />
          ) : question ? (
            <QuestionStep
              question={question}
              selected={selected}
              autoAdvance={question.kind !== 'multi' && !isLastQuestion}
              onChange={(optionIds) => dispatch({ type: 'answer', questionId: question.id, optionIds })}
              onAdvance={() => dispatch({ type: 'next', from: state.step })}
            />
          ) : null}
        </motion.div>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <Button variant="ghost" onClick={() => dispatch({ type: 'back' })}>
            Atrás
          </Button>

          {state.phase === 'note' ? (
            <Button size="lg" onClick={() => dispatch({ type: 'finish' })}>
              Ver mi Mapa Interior
            </Button>
          ) : (
            <Button size="lg" onClick={() => dispatch({ type: 'next', from: state.step })} disabled={!canContinue}>
              {isLastQuestion ? 'Casi terminamos' : 'Continuar'}
            </Button>
          )}

          {state.phase !== 'note' && !canContinue ? (
            <span className="text-sm text-ink-300">Elige una opción para continuar.</span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
