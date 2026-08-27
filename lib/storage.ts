'use client';

import type { Answers } from '@/lib/recommender/types';

/**
 * Persistencia local del Mapa Interior.
 *
 * Sólo se escribe si la persona da su consentimiento explícito, sólo en su propio
 * dispositivo y sólo con respuestas de opción múltiple: nunca texto libre.
 */
const KEY = 'mapa-interior:v1';

export type StoredMap = {
  answers: Answers;
  savedAt: string;
};

function available(): boolean {
  try {
    return typeof window !== 'undefined' && 'localStorage' in window;
  } catch {
    return false;
  }
}

export function saveMap(answers: Answers): boolean {
  if (!available()) return false;
  try {
    const payload: StoredMap = { answers, savedAt: new Date().toISOString() };
    window.localStorage.setItem(KEY, JSON.stringify(payload));
    return true;
  } catch {
    return false;
  }
}

export function loadMap(): StoredMap | null {
  if (!available()) return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredMap;
    if (!parsed || typeof parsed !== 'object' || !parsed.answers) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearMap(): void {
  if (!available()) return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // sin espacio o sin permisos: no hay nada que limpiar
  }
}

export function hasStoredMap(): boolean {
  return loadMap() !== null;
}
