'use client';

import { useEffect, useState } from 'react';

/**
 * Respeta prefers-reduced-motion. Devuelve `true` también durante el primer
 * render en servidor para no arrancar animaciones antes de saberlo.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(true);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  return reduced;
}
