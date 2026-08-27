'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';

import { useReducedMotion } from '@/lib/hooks/use-reduced-motion';
import { usePerfProfile } from '@/lib/hooks/use-perf-tier';
import { cn } from '@/lib/utils/cn';

import { StaticRipples } from './static-ripples';

/** El WebGL se descarga sólo cuando de verdad va a usarse. */
const DropletScene = dynamic(() => import('./droplet-scene'), { ssr: false });

type WaterFieldProps = {
  className?: string;
  intensity?: number;
  tone?: 'light' | 'dark';
};

/**
 * Decide entre agua viva y agua quieta.
 *
 * Se activa la capa WebGL sólo si: no hay preferencia de menos movimiento,
 * el dispositivo tiene margen y el bloque está realmente en pantalla.
 */
export function WaterField({ className, intensity = 1, tone = 'light' }: WaterFieldProps) {
  const reducedMotion = useReducedMotion();
  const { tier, maxDpr } = usePerfProfile();
  const containerRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = containerRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry) setInView(entry.isIntersecting);
      },
      { rootMargin: '10% 0px', threshold: 0.05 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const enabled = !reducedMotion && tier === 'high' && inView;

  return (
    <div ref={containerRef} className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}>
      <StaticRipples
        tone={tone}
        className={cn('transition-opacity duration-[1200ms] ease-calm', enabled ? 'opacity-0' : 'opacity-100')}
      />
      {enabled ? <DropletScene intensity={intensity} maxDpr={maxDpr} /> : null}
    </div>
  );
}
