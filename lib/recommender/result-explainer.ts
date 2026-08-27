import { DIMENSION_LABELS, type DimensionId, type ModalityProfile, type PreferenceTag } from './types';

/**
 * Convierte el resultado estructurado en lenguaje humano.
 *
 * Nunca se dice "nuestro algoritmo detectó que tienes…": sólo se devuelve a la
 * persona aquello que ella misma nos contó.
 */

const DIMENSION_PHRASES: Record<DimensionId, string> = {
  mentalCalm: 'buscas principalmente calma',
  emotionalExploration: 'te gustaría comprender mejor tus emociones',
  beliefsPatterns: 'quieres revisar creencias y patrones que se repiten',
  innerConnection: 'te interesa conectar más contigo',
  bodyRelaxation: 'quieres darle descanso al cuerpo',
  spirituality: 'te interesa explorar tu dimensión espiritual',
};

const DIMENSION_SHORT: Record<DimensionId, string> = DIMENSION_LABELS;

const PREFERENCE_PHRASES: Partial<Record<PreferenceTag, string>> = {
  conversation: 'prefieres explorar conversando',
  silence: 'te resulta natural el silencio',
  relaxation: 'prefieres una experiencia tranquila',
  reflection: 'te gusta reflexionar',
  meditation: 'la meditación te resulta natural',
  selfCare: 'quieres regalarte un momento de cuidado',
  touchYes: 'te sientes cómodo/a con el contacto suave',
  lightTouchOk: 'te sientes cómodo/a con el contacto suave',
  headTouch: 'te sientes cómodo/a con el contacto suave en la cabeza',
  faceNeckTouch: 'te sientes cómodo/a con un cuidado suave en rostro y cuello',
  lowTouch: 'prefieres poco contacto físico',
  noTouch: 'prefieres una experiencia sin contacto físico',
  bodyExperience: 'te atrae una experiencia corporal suave',
  spiritualOpenness: 'la espiritualidad es importante para ti',
  spiritualCurious: 'la espiritualidad te genera curiosidad',
  spiritualNotPresent: 'la espiritualidad no forma parte de tu manera de ver la vida',
  energyInterest: 'te interesan las prácticas energéticas',
  magnetInterest: 'pediste explícitamente incluir experiencias con imanes',
  ritualInterest: 'los rituales te resultan significativos',
  intuitiveExperience: 'te atraen las experiencias intuitivas',
  beliefExploration: 'quieres explorar creencias',
  patternExploration: 'quieres observar patrones',
  emotionalExploration: 'quieres explorar tus emociones',
  online: 'prefieres vivirlo online',
  inPerson: 'prefieres vivirlo presencialmente',
  anyFormat: 'te sirve tanto presencial como online',
  singleSession: 'quieres empezar con una primera experiencia',
  processOpen: 'estás abierto/a a recorrer un proceso',
};

/** Orden de aparición en las explicaciones: primero el modo, después el contacto y la logística. */
const PREFERENCE_PRIORITY: PreferenceTag[] = [
  'relaxation',
  'silence',
  'conversation',
  'reflection',
  'meditation',
  'selfCare',
  'beliefExploration',
  'patternExploration',
  'emotionalExploration',
  'intuitiveExperience',
  'energyInterest',
  'ritualInterest',
  'magnetInterest',
  'spiritualOpenness',
  'spiritualCurious',
  'spiritualNotPresent',
  'headTouch',
  'faceNeckTouch',
  'touchYes',
  'lightTouchOk',
  'lowTouch',
  'noTouch',
  'online',
  'inPerson',
  'singleSession',
  'processOpen',
];

export function joinWithAnd(parts: string[]): string {
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0] ?? '';
  const head = parts.slice(0, -1).join(', ');
  const tail = parts[parts.length - 1] ?? '';
  return `${head} y ${tail}`;
}

/** Frases cortas y verificables: cada una corresponde a algo que la persona eligió. */
export function buildReasons(dimensions: DimensionId[], tags: Set<PreferenceTag>, limit = 4): string[] {
  const reasons: string[] = [];
  for (const dimension of dimensions.slice(0, 2)) {
    reasons.push(capitalize(DIMENSION_PHRASES[dimension]));
  }
  for (const tag of PREFERENCE_PRIORITY) {
    if (reasons.length >= limit) break;
    if (!tags.has(tag)) continue;
    const phrase = PREFERENCE_PHRASES[tag];
    if (!phrase) continue;
    const already = reasons.some((reason) => reason.toLowerCase() === capitalize(phrase).toLowerCase());
    if (!already) reasons.push(capitalize(phrase));
  }
  return reasons.slice(0, limit);
}

/**
 * Explicación completa que se abre desde "¿Por qué apareció esta recomendación?".
 */
export function explainChoice(
  profile: ModalityProfile | undefined,
  dimensions: DimensionId[],
  tags: Set<PreferenceTag>,
): { sentence: string; matched: string[]; dimensionLabels: string[] } {
  const dimensionParts = dimensions.slice(0, 2).map((dimension) => DIMENSION_PHRASES[dimension]);
  const matchedTags = profile ? matchedPreferences(profile, tags) : [];
  const preferenceParts = matchedTags
    .map((tag) => PREFERENCE_PHRASES[tag])
    .filter((phrase): phrase is string => Boolean(phrase))
    .slice(0, 3);

  const unique = dedupe([...dimensionParts, ...preferenceParts]);
  const sentence = unique.length
    ? `Elegimos esta opción porque nos dijiste que ${joinWithAnd(unique)}.`
    : 'Con las respuestas que compartiste, tu mapa quedó bastante abierto: cualquiera de estas experiencias podría ser un buen punto de partida.';

  return {
    sentence,
    matched: matchedTags.map((tag) => PREFERENCE_PHRASES[tag] ?? tag),
    dimensionLabels: dimensions.slice(0, 2).map((dimension) => DIMENSION_SHORT[dimension]),
  };
}

/** Preferencias declaradas que además puntúan en esta modalidad concreta. */
export function matchedPreferences(profile: ModalityProfile, tags: Set<PreferenceTag>): PreferenceTag[] {
  return PREFERENCE_PRIORITY.filter((tag) => tags.has(tag) && (profile.bonuses[tag] ?? 0) > 0);
}

/** Resumen de cabecera: "Tu mapa apunta principalmente hacia calma y exploración de patrones." */
export function summarizeMap(dimensions: DimensionId[]): string {
  if (dimensions.length === 0) {
    return 'Tu mapa quedó equilibrado, sin un área que destaque sobre las demás.';
  }
  const labels = dimensions.slice(0, 2).map((dimension) => DIMENSION_SHORT[dimension].toLowerCase());
  return `Tu mapa apunta principalmente hacia ${joinWithAnd(labels)}.`;
}

/** Texto de la ruta inicial. Nunca es una prescripción ni un paquete cerrado. */
export function describeInitialPath(sessions: number, modalityName: string): string {
  if (sessions <= 1) {
    return `1 sesión de ${modalityName}.`;
  }
  return `Comenzar con 1–${sessions} encuentros de ${modalityName} y revisar después cómo te resultó.`;
}

function dedupe(values: string[]): string[] {
  return Array.from(new Set(values));
}

function capitalize(value: string): string {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}
