import { recommenderConfig } from './config';
import type { ModalityId, ModalityProfile, PreferenceTag } from './types';

/**
 * Matriz de afinidad de cada modalidad. Son datos, no lógica:
 * administración puede ajustarlos sin tocar el motor.
 */
export const MODALITY_PROFILES: ModalityProfile[] = recommenderConfig.modalityProfiles.map((profile) => ({
  ...profile,
  bonuses: profile.bonuses as Partial<Record<PreferenceTag, number>>,
  ...(profile.requiresAnyTag ? { requiresAnyTag: profile.requiresAnyTag } : {}),
  ...(profile.safetyCheckId ? { safetyCheckId: profile.safetyCheckId } : {}),
}));

export const MODALITY_IDS: ModalityId[] = MODALITY_PROFILES.map((profile) => profile.id);

export function getModalityProfile(id: ModalityId | null | undefined): ModalityProfile | undefined {
  if (!id) return undefined;
  return MODALITY_PROFILES.find((profile) => profile.id === id);
}

export function getModalityName(id: ModalityId | null | undefined): string {
  return getModalityProfile(id)?.name ?? '';
}

/** Suma de todos los bonus configurados: sirve para normalizar el ajuste por preferencias. */
export function maxBonus(profile: ModalityProfile): number {
  return Object.values(profile.bonuses).reduce<number>((total, value) => total + (value ?? 0), 0);
}

/** Modalidades que implican contacto físico directo. */
export function requiresTouch(profile: ModalityProfile): boolean {
  return profile.touch === 'head' || profile.touch === 'faceNeck' || profile.touch === 'body';
}
