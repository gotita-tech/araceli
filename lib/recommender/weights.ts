import { recommenderConfig } from './config';
import { QUESTIONS, SIGNAL_QUESTION_IDS, getOption, getQuestion } from './questions';
import { DIMENSION_IDS, type Answers, type DimensionId, type PreferenceTag, type WellnessVector } from './types';

/** Pesos y umbrales del motor. Administrables, con validación de esquema. */
export const ENGINE = recommenderConfig.engine;

export const EMPTY_VECTOR: WellnessVector = {
  mentalCalm: 0,
  emotionalExploration: 0,
  beliefsPatterns: 0,
  innerConnection: 0,
  bodyRelaxation: 0,
  spirituality: 0,
};

export function createVector(): WellnessVector {
  return { ...EMPTY_VECTOR };
}

/** Suma de los deltas de cada opción elegida. Determinista y sin efectos colaterales. */
export function buildVector(answers: Answers): WellnessVector {
  const vector = createVector();
  for (const question of QUESTIONS) {
    const chosen = answers[question.id] ?? [];
    for (const optionId of chosen) {
      const option = getOption(question, optionId);
      if (!option) continue;
      for (const dimension of DIMENSION_IDS) {
        const delta = option.vector[dimension];
        if (typeof delta === 'number') {
          vector[dimension] += delta;
        }
      }
    }
  }
  return vector;
}

/** Preferencias declaradas explícitamente en las respuestas. */
export function collectDeclaredTags(answers: Answers): Set<PreferenceTag> {
  const tags = new Set<PreferenceTag>();
  for (const question of QUESTIONS) {
    const chosen = answers[question.id] ?? [];
    for (const optionId of chosen) {
      const option = getOption(question, optionId);
      if (!option) continue;
      for (const tag of option.tags) tags.add(tag);
    }
  }
  return tags;
}

/**
 * Preferencias derivadas. Todas las reglas son explícitas y explicables:
 * ninguna infiere estados internos, sólo combina preferencias declaradas.
 *
 * - headTouch: sólo si aceptó el contacto suave y además pidió pausa, silencio o autocuidado.
 * - faceNeckTouch: además de lo anterior, exige haber pedido explícitamente una
 *   experiencia corporal suave; así un cuidado facial no aparece por una petición genérica de calma.
 * - ritualInterest: cercanía declarada con lo espiritual + interés energético o intuitivo.
 * - magnetInterest: nunca se deriva; requiere una petición explícita de la persona.
 */
export function deriveTags(declared: Set<PreferenceTag>): Set<PreferenceTag> {
  const tags = new Set(declared);

  if (tags.has('noTouch')) {
    tags.delete('lightTouchOk');
    tags.delete('bodyExperience');
    tags.delete('touchYes');
    tags.delete('touchNeutral');
  }

  const touchAccepted = !tags.has('noTouch') && !tags.has('lowTouch') && tags.has('lightTouchOk');
  const wantsPause = tags.has('relaxation') || tags.has('silence') || tags.has('selfCare') || tags.has('bodyExperience');

  if (touchAccepted && wantsPause) {
    tags.add('headTouch');
  }
  if (touchAccepted && tags.has('selfCare') && tags.has('bodyExperience')) {
    tags.add('faceNeckTouch');
  }
  if (tags.has('spiritualOpenness') && (tags.has('energyInterest') || tags.has('intuitiveExperience'))) {
    tags.add('ritualInterest');
  }

  return tags;
}

export function collectTags(answers: Answers): Set<PreferenceTag> {
  return deriveTags(collectDeclaredTags(answers));
}

/**
 * Cuán concluyentes son las respuestas: proporción de preguntas con señal en las
 * que la persona eligió algo distinto de "todavía no lo sé".
 */
export function computeSignal(answers: Answers): number {
  if (SIGNAL_QUESTION_IDS.length === 0) return 0;
  let informative = 0;
  for (const questionId of SIGNAL_QUESTION_IDS) {
    const question = getQuestion(questionId);
    if (!question) continue;
    const chosen = answers[questionId] ?? [];
    const hasSignal = chosen.some((optionId) => {
      const option = getOption(question, optionId);
      return Boolean(option) && option?.lowSignal !== true;
    });
    if (hasSignal) informative += 1;
  }
  return informative / SIGNAL_QUESTION_IDS.length;
}

/** Recorta a cero los valores negativos antes de comparar vectores. */
export function clampVector(vector: WellnessVector): WellnessVector {
  const clamped = createVector();
  for (const dimension of DIMENSION_IDS) {
    clamped[dimension] = Math.max(0, vector[dimension]);
  }
  return clamped;
}

/** Normaliza a 0-1 respecto de la dimensión más alta, para visualizar el mapa. */
export function normalizeVector(vector: WellnessVector): WellnessVector {
  const clamped = clampVector(vector);
  const max = Math.max(...DIMENSION_IDS.map((dimension) => clamped[dimension]));
  const normalized = createVector();
  if (max <= 0) return normalized;
  for (const dimension of DIMENSION_IDS) {
    normalized[dimension] = Number((clamped[dimension] / max).toFixed(4));
  }
  return normalized;
}

export function vectorMagnitude(vector: WellnessVector): number {
  return Math.sqrt(DIMENSION_IDS.reduce((total, dimension) => total + vector[dimension] ** 2, 0));
}

/** Similitud de coseno entre el vector de la persona y el de la modalidad (0-1). */
export function cosineSimilarity(a: WellnessVector, b: WellnessVector): number {
  const magnitudeA = vectorMagnitude(a);
  const magnitudeB = vectorMagnitude(b);
  if (magnitudeA === 0 || magnitudeB === 0) return 0;
  const dot = DIMENSION_IDS.reduce((total, dimension) => total + a[dimension] * b[dimension], 0);
  return dot / (magnitudeA * magnitudeB);
}

/** Dimensiones ordenadas de mayor a menor, con desempate estable por nombre. */
export function topDimensions(vector: WellnessVector, count = 2): DimensionId[] {
  return [...DIMENSION_IDS]
    .filter((dimension) => vector[dimension] > 0)
    .sort((a, b) => (vector[b] - vector[a]) || a.localeCompare(b))
    .slice(0, count);
}

export function mapRange(value: number, inMin: number, inMax: number, outMin: number, outMax: number): number {
  if (inMax === inMin) return outMin;
  const ratio = (value - inMin) / (inMax - inMin);
  return outMin + ratio * (outMax - outMin);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
