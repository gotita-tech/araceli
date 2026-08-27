'use client';

import { useEffect, useState } from 'react';

export type PerfTier = 'unknown' | 'low' | 'high';

export type PerfProfile = {
  tier: PerfTier;
  /** Tope de densidad de píxeles para la capa WebGL. */
  maxDpr: number;
};

type NavigatorWithMemory = Navigator & { deviceMemory?: number };

/**
 * Decide si el dispositivo puede permitirse la capa WebGL y con qué densidad.
 *
 * Criterio: en teléfonos (puntero grueso y pantalla estrecha) se usa siempre la
 * versión estática; en el resto se activa el agua viva, con menos densidad de
 * píxeles cuando el puntero es táctil. Ante la duda, versión estática.
 */
export function usePerfProfile(): PerfProfile {
  const [profile, setProfile] = useState<PerfProfile>({ tier: 'unknown', maxDpr: 1 });

  useEffect(() => {
    const nav = navigator as NavigatorWithMemory;
    const cores = typeof nav.hardwareConcurrency === 'number' ? nav.hardwareConcurrency : 4;
    const memory = typeof nav.deviceMemory === 'number' ? nav.deviceMemory : 4;
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    const narrow = window.innerWidth < 420;
    const saveData = 'connection' in nav && Boolean((nav as { connection?: { saveData?: boolean } }).connection?.saveData);

    const capable = cores >= 4 && memory >= 4 && !saveData && !(coarse && narrow);
    setProfile({ tier: capable ? 'high' : 'low', maxDpr: coarse ? 1.25 : 1.5 });
  }, []);

  return profile;
}
