import type { ReactNode } from 'react';

import { cn } from '@/lib/utils/cn';

type PillProps = {
  children: ReactNode;
  className?: string;
  tone?: 'neutral' | 'primary' | 'light' | 'warn';
};

const tones = {
  neutral: 'border-ink/12 bg-white/70 text-ink-500',
  primary: 'border-primary/25 bg-primary/8 text-primary-700',
  light: 'border-ivory/25 bg-ivory/10 text-ivory/80',
  warn: 'border-amber-500/25 bg-amber-500/10 text-amber-700',
};

/** Etiqueta pequeña: categoría, estado de evidencia, formato. */
export function Pill({ children, className, tone = 'neutral' }: PillProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[0.6875rem] leading-none tracking-wide',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
