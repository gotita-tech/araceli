/**
 * Tipos del motor de orientación "Tu Mapa Interior".
 *
 * Principios que este módulo debe respetar siempre:
 * - No diagnostica, no infiere enfermedades y no habla de eficacia.
 * - Trabaja con "afinidad" declarada por la persona, nunca con síntomas.
 * - Es determinista: las mismas respuestas producen exactamente el mismo resultado.
 */

/** Las seis dimensiones de bienestar subjetivo que describe el mapa. */
export type WellnessVector = {
  mentalCalm: number;
  emotionalExploration: number;
  beliefsPatterns: number;
  innerConnection: number;
  bodyRelaxation: number;
  spirituality: number;
};

export type DimensionId = keyof WellnessVector;

export const DIMENSION_IDS = [
  'mentalCalm',
  'emotionalExploration',
  'beliefsPatterns',
  'innerConnection',
  'bodyRelaxation',
  'spirituality',
] as const satisfies readonly DimensionId[];

export const DIMENSION_LABELS: Record<DimensionId, string> = {
  mentalCalm: 'Calma mental',
  emotionalExploration: 'Mundo emocional',
  beliefsPatterns: 'Creencias y patrones',
  innerConnection: 'Conexión interior',
  bodyRelaxation: 'Cuerpo y relajación',
  spirituality: 'Exploración espiritual',
};

/**
 * Preferencias de experiencia. Son tan importantes como las dimensiones:
 * la orientación no puede depender solo de "aquello que la persona cree que le pasa".
 */
export const PREFERENCE_TAGS = [
  // modo de estar
  'conversation',
  'silence',
  'relaxation',
  'reflection',
  'meditation',
  'selfCare',
  // contacto
  'touchYes',
  'touchNeutral',
  'lightTouchOk',
  'lowTouch',
  'noTouch',
  'headTouch',
  'faceNeckTouch',
  'bodyExperience',
  // intereses declarados
  'spiritualOpenness',
  'spiritualCurious',
  'spiritualNotPresent',
  'energyInterest',
  'magnetInterest',
  'ritualInterest',
  'intuitiveExperience',
  'beliefExploration',
  'patternExploration',
  'emotionalExploration',
  // logística y ritmo
  'online',
  'inPerson',
  'anyFormat',
  'singleSession',
  'processOpen',
  // señal
  'undecided',
] as const;

export type PreferenceTag = (typeof PREFERENCE_TAGS)[number];

/** Ids de las modalidades que se entregan de fábrica. El CMS puede añadir otras. */
export const BUILT_IN_MODALITY_IDS = [
  'barras-de-access',
  'thetahealing',
  'reiki',
  'access-facelift',
  'canalizacion',
  'biomagnetismo',
  'metodo-yuen',
  'liberacion-emociones',
  'limpieza-energetica',
] as const;

export type BuiltInModalityId = (typeof BUILT_IN_MODALITY_IDS)[number];

/** Se permiten ids nuevos desde administración sin perder el autocompletado. */
export type ModalityId = BuiltInModalityId | (string & {});

export type TouchProfile = 'none' | 'head' | 'faceNeck' | 'body' | 'optional';

export type SessionFormat = 'presencial' | 'online';

/** Perfil de afinidad de una modalidad: sólo datos, editable desde administración. */
export type ModalityProfile = {
  id: ModalityId;
  name: string;
  /** Frase corta y honesta para la tarjeta de resultado. */
  resultBlurb: string;
  group: string;
  vector: WellnessVector;
  bonuses: Partial<Record<PreferenceTag, number>>;
  touch: TouchProfile;
  formats: SessionFormat[];
  /** Máximo de encuentros que administración permite sugerir de inicio (tope duro: 3). */
  maxInitialSessions: number;
  /** Sólo aparece si la persona declara explícitamente alguno de estos intereses. */
  requiresAnyTag?: PreferenceTag[];
  /** Antes de mostrarla se presenta una comprobación de seguridad. */
  safetyCheckId?: string;
};

export type QuestionKind = 'single' | 'multi' | 'cards' | 'scale';

export type QuestionOption = {
  id: string;
  label: string;
  helper?: string;
  vector: Partial<WellnessVector>;
  tags: PreferenceTag[];
  /** "Todavía no lo sé": cuenta como respuesta válida, pero no aporta señal. */
  lowSignal?: boolean;
};

export type Question = {
  id: string;
  title: string;
  helper?: string;
  note?: string;
  kind: QuestionKind;
  maxChoices: number;
  options: QuestionOption[];
};

/** Respuestas del cuestionario: id de pregunta -> ids de opción elegidos. */
export type Answers = Record<string, string[]>;

export type ScoredModality = {
  id: ModalityId;
  name: string;
  resultBlurb: string;
  /** 0-100. Es afinidad declarada, nunca probabilidad de funcionar. */
  affinity: number;
  /** Traza interna para explicabilidad y depuración. */
  breakdown: {
    dimensionFit: number;
    preferenceFit: number;
    modifier: number;
    matchedTags: PreferenceTag[];
    topDimensions: DimensionId[];
  };
};

export type Confidence = 'low' | 'medium' | 'high';

export type RecommendationResult = {
  /** Valores normalizados 0-1 por dimensión, listos para visualizar. */
  dimensions: WellnessVector;
  primaryModality: ModalityId | null;
  secondaryModality: ModalityId | null;
  affinity: number;
  confidence: Confidence;
  reasons: string[];
  initialPath: {
    sessions: number;
    requiresReassessment: boolean;
  };
  safetyFlags: string[];
  // --- información adicional para la interfaz (no altera el contrato anterior) ---
  rawDimensions: WellnessVector;
  ranking: ScoredModality[];
  secondaryAffinity: number | null;
  activeTags: PreferenceTag[];
  /** El mapa quedó demasiado abierto para destacar una modalidad. */
  openMap: boolean;
  /** Dos caminos con puntuaciones muy parecidas. */
  twoPaths: boolean;
  /** Proporción de respuestas que aportaron señal (0-1). */
  signal: number;
};
