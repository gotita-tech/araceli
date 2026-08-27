import { z } from 'zod';

import { DIMENSION_IDS, PREFERENCE_TAGS } from './types';

/**
 * Esquemas Zod del contenido administrable del recomendador.
 * Si administración escribe algo inválido, el error aparece en build y no en producción.
 */

export const wellnessVectorSchema = z.object({
  mentalCalm: z.number(),
  emotionalExploration: z.number(),
  beliefsPatterns: z.number(),
  innerConnection: z.number(),
  bodyRelaxation: z.number(),
  spirituality: z.number(),
});

export const partialVectorSchema = wellnessVectorSchema.partial();

export const preferenceTagSchema = z.enum(PREFERENCE_TAGS);

/**
 * Diccionario de bonus por preferencia. Se valida por clave en vez de usar
 * `z.record(enum, ...)` para no depender del comportamiento exhaustivo de la librería.
 */
const bonusesSchema = z.record(z.string(), z.number()).superRefine((value, ctx) => {
  const valid = new Set<string>(PREFERENCE_TAGS);
  for (const key of Object.keys(value)) {
    if (!valid.has(key)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Preferencia desconocida en bonuses: ${key}` });
    }
  }
});

/** Se conserva para futuras validaciones cruzadas de dimensiones. */
export const DIMENSION_KEYS = DIMENSION_IDS;

export const questionOptionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  helper: z.string().optional(),
  vector: partialVectorSchema,
  tags: z.array(preferenceTagSchema),
  lowSignal: z.boolean().optional(),
});

export const questionSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  helper: z.string().optional(),
  note: z.string().optional(),
  kind: z.enum(['single', 'multi', 'cards', 'scale']),
  maxChoices: z.number().int().min(1).max(3),
  options: z.array(questionOptionSchema).min(2),
});

export const modalityProfileSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  resultBlurb: z.string().min(1),
  group: z.string().min(1),
  vector: wellnessVectorSchema,
  bonuses: bonusesSchema,
  touch: z.enum(['none', 'head', 'faceNeck', 'body', 'optional']),
  formats: z.array(z.enum(['presencial', 'online'])).min(1),
  /** Tope duro del producto: nunca se sugieren más de tres encuentros iniciales. */
  maxInitialSessions: z.number().int().min(1).max(3),
  requiresAnyTag: z.array(preferenceTagSchema).optional(),
  safetyCheckId: z.string().optional(),
});

export const engineConfigSchema = z.object({
  dimensionWeight: z.number().min(0).max(1),
  preferenceWeight: z.number().min(0).max(1),
  scoreFloor: z.number().min(0).max(1),
  scoreCeiling: z.number().min(0).max(1),
  affinityFloor: z.number().int().min(0).max(100),
  affinityCeiling: z.number().int().min(0).max(100),
  confidence: z.object({
    highGap: z.number().min(0),
    mediumGap: z.number().min(0),
    twoPathsGap: z.number().min(0),
    highSignal: z.number().min(0).max(1),
    mediumSignal: z.number().min(0).max(1),
  }),
  modifiers: z.object({
    lowTouchPenalty: z.number().min(0).max(1),
    spiritualNotPresentPenalty: z.number().min(0).max(1),
    spiritualCuriousPenalty: z.number().min(0).max(1),
    spiritualThreshold: z.number().min(0),
  }),
  sessions: z.object({
    hardCap: z.number().int().min(1).max(3),
    processDefault: z.number().int().min(1).max(3),
    firstExperience: z.literal(1),
  }),
});

export const recommenderFileSchema = z
  .object({
    version: z.string(),
    updatedAt: z.string(),
    engine: engineConfigSchema,
    questions: z.array(questionSchema).min(1).max(10),
    modalityProfiles: z.array(modalityProfileSchema).min(1),
  })
  .superRefine((value, ctx) => {
    const ids = new Set<string>();
    for (const profile of value.modalityProfiles) {
      if (ids.has(profile.id)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Modalidad duplicada: ${profile.id}` });
      }
      ids.add(profile.id);
    }
    const questionIds = new Set<string>();
    for (const question of value.questions) {
      if (questionIds.has(question.id)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Pregunta duplicada: ${question.id}` });
      }
      questionIds.add(question.id);
      if (question.kind === 'multi' && question.maxChoices < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `La pregunta ${question.id} es de selección múltiple pero sólo admite una opción`,
        });
      }
    }
    const total = value.engine.dimensionWeight + value.engine.preferenceWeight;
    if (Math.abs(total - 1) > 0.001) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'dimensionWeight + preferenceWeight debe sumar 1',
      });
    }
  });

export const safetyCheckSchema = z.object({
  id: z.string(),
  title: z.string(),
  intro: z.string(),
  items: z.array(z.string()).min(1),
  confirmLabel: z.string(),
  declineLabel: z.string(),
  declineMessage: z.string(),
  footnote: z.string().optional(),
});

export const safetyFileSchema = z.object({
  version: z.string(),
  routing: z.object({
    clinicalTitle: z.string(),
    clinicalMessage: z.string(),
    clinicalSecondary: z.string(),
    urgentTitle: z.string(),
    urgentMessage: z.string(),
    urgentSecondary: z.string(),
    restartLabel: z.string(),
    homeLabel: z.string(),
    patterns: z.object({
      urgent: z.array(z.string()),
      clinical: z.array(z.string()),
    }),
  }),
  checks: z.array(safetyCheckSchema),
  disclaimers: z.object({
    global: z.string(),
    map: z.string(),
    channeling: z.string(),
    biomagnetism: z.string(),
    evidence: z.string(),
  }),
});

export type RecommenderFile = z.infer<typeof recommenderFileSchema>;
export type SafetyFile = z.infer<typeof safetyFileSchema>;
export type SafetyCheck = z.infer<typeof safetyCheckSchema>;
export type EngineConfig = z.infer<typeof engineConfigSchema>;

/** Esquema de las respuestas del cuestionario (validación en frontera). */
export const answersSchema = z.record(z.string(), z.array(z.string()));
