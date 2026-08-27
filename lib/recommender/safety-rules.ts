import { safetyConfig } from './config';
import type { SafetyCheck } from './schema';
import type { PreferenceTag } from './types';

/**
 * Reglas de seguridad del Mapa Interior.
 *
 * Regla de oro: si algo sugiere que la situación necesita atención sanitaria,
 * el sistema NO puntúa modalidades y no propone alternativas terapéuticas.
 * Sólo acompaña con calma hacia un profesional cualificado.
 */

export type SafetyLevel = 'none' | 'clinical' | 'urgent';

export type SafetyScan = {
  level: SafetyLevel;
  /** Identificadores genéricos, nunca el texto de la persona. */
  flags: string[];
};

export const SAFETY_ROUTING = safetyConfig.routing;
export const DISCLAIMERS = safetyConfig.disclaimers;

/** Minúsculas y sin acentos, para comparar de forma estable. */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Coincidencia por raíz de palabra: "suicid" encuentra "suicidio" o "suicidarme",
 * pero "cancer" no encuentra "cancelar".
 */
function matchesPattern(haystack: string, pattern: string): boolean {
  const normalizedPattern = normalizeText(pattern);
  if (!normalizedPattern) return false;
  if (normalizedPattern.includes(' ')) {
    return haystack.includes(normalizedPattern);
  }
  const regex = new RegExp(`(^|[^a-z0-9])${escapeRegExp(normalizedPattern)}`, 'i');
  return regex.test(haystack);
}

/**
 * Analiza el texto libre opcional. Se ejecuta en el navegador de la persona
 * y nunca se envía a ningún servidor.
 */
export function scanFreeText(text: string | undefined | null): SafetyScan {
  if (!text || !text.trim()) return { level: 'none', flags: [] };
  const haystack = normalizeText(text);

  const urgent = SAFETY_ROUTING.patterns.urgent.some((pattern) => matchesPattern(haystack, pattern));
  if (urgent) {
    return { level: 'urgent', flags: ['safety:urgent'] };
  }

  const clinical = SAFETY_ROUTING.patterns.clinical.some((pattern) => matchesPattern(haystack, pattern));
  if (clinical) {
    return { level: 'clinical', flags: ['safety:clinical'] };
  }

  return { level: 'none', flags: [] };
}

/** Cuando hay bandera de seguridad no se calcula ninguna recomendación. */
export function blocksScoring(level: SafetyLevel): boolean {
  return level !== 'none';
}

/** Restricciones declaradas que el motor debe respetar como límites duros. */
export function structuralFlags(tags: Set<PreferenceTag>): string[] {
  const flags: string[] = [];
  if (tags.has('noTouch')) flags.push('constraint:no-touch');
  if (tags.has('lowTouch')) flags.push('constraint:low-touch');
  if (tags.has('online')) flags.push('constraint:online-only');
  if (tags.has('inPerson')) flags.push('constraint:in-person');
  return flags;
}

export function getSafetyCheck(id: string | undefined): SafetyCheck | undefined {
  if (!id) return undefined;
  return safetyConfig.checks.find((check) => check.id === id);
}

/**
 * El cuestionario no debe pedir datos sensibles. Esta comprobación existe para que
 * cualquier pregunta añadida desde administración se revise antes de publicar.
 */
const FORBIDDEN_FIELD_HINTS = [
  'nombre completo',
  'apellido',
  'rut',
  'dni',
  'pasaporte',
  'direccion',
  'historia clinica',
  'diagnostico',
  'medicamento',
  'medicacion',
  'tarjeta',
  'telefono',
];

export function auditQuestionText(text: string): string[] {
  const haystack = normalizeText(text);
  return FORBIDDEN_FIELD_HINTS.filter((hint) => haystack.includes(hint));
}
