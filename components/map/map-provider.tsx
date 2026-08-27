'use client';

import { createContext, useCallback, useContext, useMemo, useReducer, useState, type ReactNode } from 'react';

import { track } from '@/lib/analytics';
import { QUESTIONS, TOTAL_QUESTIONS, sanitizeAnswers } from '@/lib/recommender/questions';
import { previewDimensions, recommend } from '@/lib/recommender/recommendation-engine';
import { scanFreeText, type SafetyLevel } from '@/lib/recommender/safety-rules';
import type { Answers, ModalityId, PreferenceTag, RecommendationResult, WellnessVector } from '@/lib/recommender/types';

export type MapPhase = 'intro' | 'wizard' | 'note' | 'result' | 'safety';

type MapState = {
  phase: MapPhase;
  step: number;
  answers: Answers;
  note: string;
  excluded: ModalityId[];
  /** Preferencias que la persona declara explícitamente después del cuestionario. */
  extraTags: PreferenceTag[];
  safetyLevel: SafetyLevel;
};

type MapAction =
  | { type: 'start'; answers?: Answers }
  | { type: 'answer'; questionId: string; optionIds: string[] }
  | { type: 'next'; from?: number }
  | { type: 'back' }
  | { type: 'goTo'; step: number }
  | { type: 'setNote'; note: string }
  | { type: 'finish' }
  | { type: 'exclude'; id: ModalityId }
  | { type: 'toggleTag'; tag: PreferenceTag }
  | { type: 'restart' };

const initialState: MapState = {
  phase: 'intro',
  step: 0,
  answers: {},
  note: '',
  excluded: [],
  extraTags: [],
  safetyLevel: 'none',
};

function reducer(state: MapState, action: MapAction): MapState {
  switch (action.type) {
    case 'start':
      return {
        ...initialState,
        phase: 'wizard',
        answers: action.answers ? sanitizeAnswers(action.answers) : {},
      };

    case 'answer': {
      const question = QUESTIONS.find((item) => item.id === action.questionId);
      if (!question) return state;
      const limited = action.optionIds.slice(-question.maxChoices);
      return { ...state, answers: { ...state.answers, [action.questionId]: limited } };
    }

    case 'next': {
      // Avance idempotente: si la acción se creó para otro paso (por ejemplo, el
      // avance automático y un clic en "Continuar" a la vez) se ignora.
      if (typeof action.from === 'number' && action.from !== state.step) return state;
      if (state.step >= TOTAL_QUESTIONS - 1) {
        return { ...state, phase: 'note' };
      }
      return { ...state, step: state.step + 1 };
    }

    case 'back': {
      if (state.phase === 'note') return { ...state, phase: 'wizard', step: TOTAL_QUESTIONS - 1 };
      if (state.step === 0) return { ...state, phase: 'intro' };
      return { ...state, step: state.step - 1 };
    }

    case 'goTo':
      return { ...state, phase: 'wizard', step: Math.max(0, Math.min(action.step, TOTAL_QUESTIONS - 1)) };

    case 'setNote':
      return { ...state, note: action.note };

    case 'finish': {
      const level = scanFreeText(state.note).level;
      return { ...state, safetyLevel: level, phase: level === 'none' ? 'result' : 'safety' };
    }

    case 'exclude':
      return state.excluded.includes(action.id) ? state : { ...state, excluded: [...state.excluded, action.id] };

    case 'toggleTag': {
      const active = state.extraTags.includes(action.tag);
      return {
        ...state,
        extraTags: active ? state.extraTags.filter((tag) => tag !== action.tag) : [...state.extraTags, action.tag],
      };
    }

    case 'restart':
      return { ...initialState, phase: 'wizard' };

    default:
      return state;
  }
}

type MapContextValue = {
  /** Estado del modal flotante. */
  isOpen: boolean;
  open: (source: 'hero' | 'floating' | 'section' | 'page') => void;
  close: () => void;
  state: MapState;
  dispatch: (action: MapAction) => void;
  /** Figura en construcción mientras se responde. */
  preview: WellnessVector;
  /** Resultado calculado localmente, sin llamadas de red. */
  result: RecommendationResult;
  progress: number;
  answeredCount: number;
};

const MapContext = createContext<MapContextValue | null>(null);

export function MapProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback((source: 'hero' | 'floating' | 'section' | 'page') => {
    setIsOpen(true);
    track({ name: 'map_opened', source });
  }, []);

  const close = useCallback(() => setIsOpen(false), []);

  const preview = useMemo(() => previewDimensions(state.answers), [state.answers]);

  const result = useMemo(
    () =>
      recommend({
        answers: state.answers,
        freeText: state.note,
        excludedModalities: state.excluded,
        extraTags: state.extraTags,
      }),
    [state.answers, state.note, state.excluded, state.extraTags],
  );

  const answeredCount = useMemo(
    () => QUESTIONS.filter((question) => (state.answers[question.id] ?? []).length > 0).length,
    [state.answers],
  );

  const value = useMemo<MapContextValue>(
    () => ({
      isOpen,
      open,
      close,
      state,
      dispatch,
      preview,
      result,
      progress: answeredCount / TOTAL_QUESTIONS,
      answeredCount,
    }),
    [isOpen, open, close, state, preview, result, answeredCount],
  );

  return <MapContext.Provider value={value}>{children}</MapContext.Provider>;
}

export function useMap(): MapContextValue {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error('useMap debe usarse dentro de <MapProvider>.');
  }
  return context;
}
