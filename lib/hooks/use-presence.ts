'use client';

import { useEffect, useState } from 'react';

/**
 * Montaje controlado para capas que aparecen y desaparecen.
 *
 * Mantiene el nodo montado mientras dura la animación de salida y lo retira
 * después, sin depender de que ninguna librería avise de que terminó.
 */
export function usePresence(active: boolean, exitDuration = 280): { mounted: boolean; visible: boolean } {
  const [mounted, setMounted] = useState(active);
  const [visible, setVisible] = useState(active);

  useEffect(() => {
    if (active) {
      setMounted(true);
      // Con un temporizador y no con requestAnimationFrame: así la capa también
      // aparece cuando la pestaña estuvo en segundo plano.
      const timer = window.setTimeout(() => setVisible(true), 20);
      return () => window.clearTimeout(timer);
    }

    setVisible(false);
    const timer = window.setTimeout(() => setMounted(false), exitDuration);
    return () => window.clearTimeout(timer);
  }, [active, exitDuration]);

  return { mounted, visible };
}
