import { MODALITY_PROFILES, maxBonus, requiresTouch } from './modalities';
import { buildReasons } from './result-explainer';
import { blocksScoring, scanFreeText, structuralFlags, type SafetyLevel } from './safety-rules';
import {
  ENGINE,
  clamp,
  clampVector,
  collectTags,
  computeSignal,
  cosineSimilarity,
  buildVector,
  mapRange,
  normalizeVector,
  topDimensions,
} from './weights';
import type {
  Answers,
  Confidence,
  ModalityId,
  ModalityProfile,
  PreferenceTag,
  RecommendationResult,
  ScoredModality,
  WellnessVector,
} from './types';

/**
 * Motor determinista de orientación.
 *
 * Las mismas respuestas producen siempre exactamente el mismo resultado.
 * No interviene ningún modelo de lenguaje en el cálculo del ranking.
 */

export type RecommendationInput = {
  answers: Answers;
  /** Texto libre opcional. Se analiza localmente y sólo para seguridad. */
  freeText?: string;
  /** Preferencias que la persona añade explícitamente desde la interfaz. */
  extraTags?: PreferenceTag[];
  /** Modalidades descartadas por la persona (por ejemplo, tras una comprobación de seguridad). */
  excludedModalities?: ModalityId[];
};

type Evaluation =
  | { kind: 'excluded'; id: ModalityId; reason: string }
  | { kind: 'scored'; scored: ScoredModality; score: number };

const EMPTY_RESULT_DIMENSIONS: WellnessVector = {
  mentalCalm: 0,
  emotionalExploration: 0,
  beliefsPatterns: 0,
  innerConnection: 0,
  bodyRelaxation: 0,
  spirituality: 0,
};

/** Ajuste por preferencias declaradas, normalizado 0-1. */
export function preferenceFit(profile: ModalityProfile, tags: Set<PreferenceTag>): number {
  const total = maxBonus(profile);
  if (total <= 0) return 0.5;
  let earned = 0;
  for (const [tag, value] of Object.entries(profile.bonuses)) {
    if (tags.has(tag as PreferenceTag)) earned += value ?? 0;
  }
  return clamp(earned / total, 0, 1);
}

/**
 * Límites duros y penalizaciones. Todas las reglas son explícitas:
 * - Sin contacto declarado: no se ofrecen modalidades con contacto.
 * - Formato online: sólo modalidades disponibles online.
 * - Espiritualidad ausente: se atenúan las modalidades marcadamente espirituales.
 * - `requiresAnyTag`: la modalidad sólo aparece si la persona declaró ese interés.
 */
export function evaluateModifier(
  profile: ModalityProfile,
  tags: Set<PreferenceTag>,
): { modifier: number; excluded: string | null } {
  if (profile.requiresAnyTag && profile.requiresAnyTag.length > 0) {
    const declared = profile.requiresAnyTag.some((tag) => tags.has(tag));
    if (!declared) return { modifier: 0, excluded: 'requiere-interes-explicito' };
  }

  if (tags.has('noTouch') && requiresTouch(profile)) {
    return { modifier: 0, excluded: 'preferencia-sin-contacto' };
  }

  if (tags.has('online') && !profile.formats.includes('online')) {
    return { modifier: 0, excluded: 'no-disponible-online' };
  }

  if (tags.has('inPerson') && !profile.formats.includes('presencial')) {
    return { modifier: 0, excluded: 'no-disponible-presencial' };
  }

  let modifier = 1;

  if (tags.has('lowTouch') && requiresTouch(profile)) {
    modifier *= ENGINE.modifiers.lowTouchPenalty;
  }

  const spiritualWeight = profile.vector.spirituality;
  if (tags.has('spiritualNotPresent') && spiritualWeight >= ENGINE.modifiers.spiritualThreshold) {
    modifier *= ENGINE.modifiers.spiritualNotPresentPenalty;
  } else if (tags.has('spiritualCurious') && spiritualWeight >= 3) {
    modifier *= ENGINE.modifiers.spiritualCuriousPenalty;
  }

  return { modifier, excluded: null };
}

/** Traduce la puntuación interna a un porcentaje de afinidad presentable. */
export function toAffinity(score: number): number {
  const value = mapRange(
    clamp(score, ENGINE.scoreFloor, ENGINE.scoreCeiling),
    ENGINE.scoreFloor,
    ENGINE.scoreCeiling,
    ENGINE.affinityFloor,
    ENGINE.affinityCeiling,
  );
  return Math.round(clamp(value, ENGINE.affinityFloor, ENGINE.affinityCeiling));
}

function evaluateModality(
  profile: ModalityProfile,
  userVector: WellnessVector,
  tags: Set<PreferenceTag>,
): Evaluation {
  const { modifier, excluded } = evaluateModifier(profile, tags);
  if (excluded) {
    return { kind: 'excluded', id: profile.id, reason: excluded };
  }

  const dimensionFit = cosineSimilarity(userVector, profile.vector);
  const prefFit = preferenceFit(profile, tags);
  const score = (ENGINE.dimensionWeight * dimensionFit + ENGINE.preferenceWeight * prefFit) * modifier;

  const matchedTags = (Object.keys(profile.bonuses) as PreferenceTag[])
    .filter((tag) => tags.has(tag))
    .sort((a, b) => a.localeCompare(b));

  return {
    kind: 'scored',
    score,
    scored: {
      id: profile.id,
      name: profile.name,
      resultBlurb: profile.resultBlurb,
      affinity: toAffinity(score),
      breakdown: {
        dimensionFit: Number(dimensionFit.toFixed(4)),
        preferenceFit: Number(prefFit.toFixed(4)),
        modifier: Number(modifier.toFixed(4)),
        matchedTags,
        topDimensions: topDimensions(profile.vector, 2),
      },
    },
  };
}

function resolveConfidence(gap: number, signal: number, ranking: ScoredModality[]): Confidence {
  if (ranking.length === 0) return 'low';
  if (signal < ENGINE.confidence.mediumSignal) return 'low';
  if (ranking.length === 1) return signal >= ENGINE.confidence.highSignal ? 'medium' : 'low';
  if (gap >= ENGINE.confidence.highGap && signal >= ENGINE.confidence.highSignal) return 'high';
  if (gap >= ENGINE.confidence.mediumGap) return 'medium';
  return signal >= ENGINE.confidence.highSignal ? 'medium' : 'low';
}

/**
 * Ruta inicial sugerida. Nunca es una prescripción y nunca supera el tope duro.
 */
export function resolveInitialPath(
  profile: ModalityProfile | undefined,
  tags: Set<PreferenceTag>,
  confidence: Confidence,
): { sessions: number; requiresReassessment: boolean } {
  if (!profile) {
    return { sessions: ENGINE.sessions.firstExperience, requiresReassessment: true };
  }

  const wantsProcess = tags.has('processOpen');
  const allowance = Math.min(profile.maxInitialSessions, ENGINE.sessions.hardCap);

  if (!wantsProcess || confidence !== 'high') {
    return { sessions: 1, requiresReassessment: true };
  }

  const sessions = clamp(Math.min(ENGINE.sessions.processDefault, allowance), 1, ENGINE.sessions.hardCap);
  return { sessions, requiresReassessment: true };
}

export function recommend(input: RecommendationInput): RecommendationResult {
  const { answers, freeText, extraTags = [], excludedModalities = [] } = input;

  const scan = scanFreeText(freeText);
  const declaredTags = collectTags(answers);
  for (const tag of extraTags) declaredTags.add(tag);

  const rawDimensions = buildVector(answers);
  const normalized = normalizeVector(rawDimensions);
  const signal = computeSignal(answers);
  const safetyFlags = [...scan.flags, ...structuralFlags(declaredTags)];

  // Ante cualquier bandera de seguridad no se puntúa ninguna modalidad.
  if (blocksScoring(scan.level)) {
    return {
      dimensions: EMPTY_RESULT_DIMENSIONS,
      primaryModality: null,
      secondaryModality: null,
      affinity: 0,
      confidence: 'low',
      reasons: [],
      initialPath: { sessions: 0, requiresReassessment: true },
      safetyFlags,
      rawDimensions: EMPTY_RESULT_DIMENSIONS,
      ranking: [],
      secondaryAffinity: null,
      activeTags: [],
      openMap: false,
      twoPaths: false,
      signal,
    };
  }

  const userVector = clampVector(rawDimensions);
  const excluded = new Set(excludedModalities);

  const ranking = MODALITY_PROFILES.filter((profile) => !excluded.has(profile.id))
    .map((profile) => evaluateModality(profile, userVector, declaredTags))
    .filter((evaluation): evaluation is Extract<Evaluation, { kind: 'scored' }> => evaluation.kind === 'scored')
    .sort((a, b) => b.score - a.score || a.scored.id.localeCompare(b.scored.id))
    .map((evaluation) => evaluation.scored);

  const primary = ranking[0];
  const secondary = ranking[1];
  const gap = primary && secondary ? primary.affinity - secondary.affinity : Number.POSITIVE_INFINITY;
  const confidence = resolveConfidence(Number.isFinite(gap) ? gap : ENGINE.confidence.highGap, signal, ranking);

  const openMap = confidence === 'low' || !primary;
  const twoPaths = Boolean(primary && secondary) && !openMap && gap <= ENGINE.confidence.twoPathsGap;

  const primaryProfile = MODALITY_PROFILES.find((profile) => profile.id === primary?.id);
  const dimensionOrder = topDimensions(userVector, 2);
  const initialPath = resolveInitialPath(primaryProfile, declaredTags, confidence);

  return {
    dimensions: normalized,
    primaryModality: openMap ? null : (primary?.id ?? null),
    secondaryModality: openMap ? null : (secondary?.id ?? null),
    affinity: openMap ? 0 : (primary?.affinity ?? 0),
    confidence,
    reasons: buildReasons(dimensionOrder, declaredTags),
    initialPath: openMap ? { sessions: 0, requiresReassessment: true } : initialPath,
    safetyFlags,
    rawDimensions,
    ranking,
    secondaryAffinity: secondary?.affinity ?? null,
    activeTags: [...declaredTags].sort((a, b) => a.localeCompare(b)),
    openMap,
    twoPaths,
    signal: Number(signal.toFixed(4)),
  };
}

/** Nivel de seguridad detectado, para que la interfaz decida qué pantalla mostrar. */
export function safetyLevelOf(input: RecommendationInput): SafetyLevel {
  return scanFreeText(input.freeText).level;
}

/**
 * Vista previa del mapa mientras se responde: sólo las dimensiones, sin ranking.
 * Permite que la figura se construya gradualmente durante el cuestionario.
 */
export function previewDimensions(answers: Answers): WellnessVector {
  return normalizeVector(buildVector(answers));
}
