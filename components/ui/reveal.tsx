'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

import { useReducedMotion } from '@/lib/hooks/use-reduced-motion';
import { CALM_EASE } from '@/lib/utils/motion';

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** Distancia del desplazamiento inicial en píxeles. */
  distance?: number;
};

/** Aparición serena al entrar en pantalla. Con reduced-motion no hay movimiento. */
export function Reveal({ children, className, delay = 0, distance = 18 }: RevealProps) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      data-reveal
      initial={{ opacity: 0, y: distance }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-8% 0px -8% 0px' }}
      transition={{ duration: 0.75, ease: CALM_EASE, delay }}
    >
      {children}
    </motion.div>
  );
}
