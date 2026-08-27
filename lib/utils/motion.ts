/**
 * Vocabulario de movimiento del sistema: lento, suave y siempre desactivable.
 * Nada rebota, nada gira, nada llama la atención sobre sí mismo.
 *
 * Las capas que aparecen y desaparecen (modal, menú) no usan animaciones de
 * salida de librería: se controlan con `usePresence` y transiciones CSS para que
 * el cierre sea siempre determinista.
 */
export const CALM_EASE = [0.22, 1, 0.36, 1] as const;

/** Duraciones compartidas, en segundos. */
export const DURATION = {
  step: 0.45,
  reveal: 0.75,
  panel: 0.5,
  shape: 1.1,
} as const;
