'use client';

import { motion, useSpring, useTransform, type MotionValue } from 'framer-motion';
import { useEffect, useId } from 'react';

import { useReducedMotion } from '@/lib/hooks/use-reduced-motion';
import { DIMENSION_IDS, DIMENSION_LABELS, type WellnessVector } from '@/lib/recommender/types';
import { cn } from '@/lib/utils/cn';

type MapShapeProps = {
  /** Valores normalizados 0-1 por dimensión. */
  vector: WellnessVector;
  size?: number;
  className?: string;
  /** Muestra las etiquetas de las seis dimensiones alrededor de la figura. */
  labels?: boolean;
  /** Intensidad general: la figura se abre a medida que avanza el cuestionario. */
  progress?: number;
  tone?: 'light' | 'dark';
};

const CENTER = 100;
const BASE_RADIUS = 26;
const AMPLITUDE = 56;

type Point = { x: number; y: number };

function polar(angle: number, radius: number): Point {
  return {
    x: CENTER + Math.cos(angle) * radius,
    y: CENTER + Math.sin(angle) * radius,
  };
}

/** Curva cerrada y suave (Catmull-Rom convertida a Bézier) para que nada tenga esquinas. */
function smoothClosedPath(points: Point[]): string {
  const count = points.length;
  if (count === 0) return '';
  const at = (index: number): Point => points[((index % count) + count) % count] as Point;

  let path = `M ${at(0).x.toFixed(2)} ${at(0).y.toFixed(2)}`;
  for (let index = 0; index < count; index += 1) {
    const p0 = at(index - 1);
    const p1 = at(index);
    const p2 = at(index + 1);
    const p3 = at(index + 2);

    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };

    path += ` C ${c1.x.toFixed(2)} ${c1.y.toFixed(2)}, ${c2.x.toFixed(2)} ${c2.y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }
  return `${path} Z`;
}

/** Construye el contorno a partir de los seis valores ya suavizados. */
function pathFromValues(values: number[], scale: number, progress: number): string {
  const points = values.map((value, index) => {
    const angle = (Math.PI * 2 * index) / values.length - Math.PI / 2;
    const clamped = Math.max(0, Math.min(1, value));
    return polar(angle, (BASE_RADIUS + clamped * AMPLITUDE * progress) * scale);
  });
  return smoothClosedPath(points);
}

const SPRING = { stiffness: 55, damping: 18, mass: 1.1 } as const;

/**
 * Figura orgánica del Mapa Interior.
 *
 * No es un radar chart: es una superficie líquida de seis lóbulos que se ensancha
 * donde la persona puso más peso. Cada dimensión tiene su propio muelle, así que
 * la forma se reacomoda como agua, nunca con saltos.
 */
export function MapShape({
  vector,
  size = 320,
  className,
  labels = false,
  progress = 1,
  tone = 'light',
}: MapShapeProps) {
  const gradientId = useId();
  const glowId = useId();
  const reducedMotion = useReducedMotion();

  // Un muelle por dimensión (el número de dimensiones es constante).
  const mentalCalm = useSpring(vector.mentalCalm, SPRING);
  const emotionalExploration = useSpring(vector.emotionalExploration, SPRING);
  const beliefsPatterns = useSpring(vector.beliefsPatterns, SPRING);
  const innerConnection = useSpring(vector.innerConnection, SPRING);
  const bodyRelaxation = useSpring(vector.bodyRelaxation, SPRING);
  const spirituality = useSpring(vector.spirituality, SPRING);
  const openness = useSpring(progress, SPRING);

  const springs: MotionValue<number>[] = [
    mentalCalm,
    emotionalExploration,
    beliefsPatterns,
    innerConnection,
    bodyRelaxation,
    spirituality,
    openness,
  ];

  useEffect(() => {
    const next = [
      vector.mentalCalm,
      vector.emotionalExploration,
      vector.beliefsPatterns,
      vector.innerConnection,
      vector.bodyRelaxation,
      vector.spirituality,
      progress,
    ];

    springs.forEach((spring, index) => {
      const value = next[index] ?? 0;
      if (reducedMotion) {
        spring.jump(value);
      } else {
        spring.set(value);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vector, progress, reducedMotion]);

  // El transformador recibe los valores como `unknown[]`: se normalizan a números.
  const contour = (scale: number) => (values: unknown[]) => {
    const numbers = values.map((value) => Number(value) || 0);
    return pathFromValues(numbers.slice(0, 6), scale, numbers[6] ?? 1);
  };

  const core = useTransform(springs, contour(1));
  const echoInner = useTransform(springs, contour(0.72));
  const echoOuter = useTransform(springs, contour(1.22));
  const halo = useTransform(springs, contour(1.44));

  const stroke = tone === 'dark' ? 'rgb(240 242 219 / 0.55)' : 'rgb(67 107 222 / 0.55)';
  const softStroke = tone === 'dark' ? 'rgb(240 242 219 / 0.22)' : 'rgb(67 107 222 / 0.22)';
  const faintStroke = tone === 'dark' ? 'rgb(240 242 219 / 0.12)' : 'rgb(67 107 222 / 0.12)';
  const labelColor = tone === 'dark' ? 'rgb(240 242 219 / 0.66)' : 'rgb(12 20 48 / 0.55)';

  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={cn('overflow-visible', className)}
      aria-hidden
      focusable="false"
    >
      <defs>
        <radialGradient id={gradientId} cx="50%" cy="45%" r="62%">
          <stop
            offset="0%"
            stopColor={tone === 'dark' ? '#98ACDB' : '#6E8BD9'}
            stopOpacity={tone === 'dark' ? 0.5 : 0.34}
          />
          <stop offset="60%" stopColor="#436BDE" stopOpacity={tone === 'dark' ? 0.28 : 0.18} />
          <stop offset="100%" stopColor="#436BDE" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={glowId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#F0F2DB" stopOpacity={tone === 'dark' ? 0.28 : 0.9} />
          <stop offset="100%" stopColor="#F0F2DB" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx={CENTER} cy={CENTER} r="86" fill={`url(#${glowId})`} />

      <motion.path d={halo} fill="none" stroke={faintStroke} strokeWidth="0.75" />
      <motion.path d={echoOuter} fill="none" stroke={softStroke} strokeWidth="0.9" />
      <motion.path d={core} fill={`url(#${gradientId})`} stroke={stroke} strokeWidth="1.4" />
      <motion.path d={echoInner} fill="none" stroke={softStroke} strokeWidth="0.85" />

      <circle cx={CENTER} cy={CENTER} r="2.4" fill={tone === 'dark' ? '#F0F2DB' : '#436BDE'} />

      {labels
        ? DIMENSION_IDS.map((dimension, index) => {
            const angle = (Math.PI * 2 * index) / DIMENSION_IDS.length - Math.PI / 2;
            const point = polar(angle, 96);
            const anchor = Math.abs(Math.cos(angle)) < 0.3 ? 'middle' : Math.cos(angle) > 0 ? 'start' : 'end';
            return (
              <text
                key={dimension}
                x={point.x}
                y={point.y}
                textAnchor={anchor}
                dominantBaseline="middle"
                fill={labelColor}
                style={{ fontSize: '7px', letterSpacing: '0.04em' }}
              >
                {DIMENSION_LABELS[dimension]}
              </text>
            );
          })
        : null}
    </svg>
  );
}

/**
 * Equivalente textual de la figura. La visualización nunca es la única forma
 * de acceder a la información (WCAG 2.2 AA, criterio 1.1.1).
 */
export function MapShapeDescription({ vector, className }: { vector: WellnessVector; className?: string }) {
  const rows = DIMENSION_IDS.map((dimension) => ({
    id: dimension,
    label: DIMENSION_LABELS[dimension],
    value: Math.round(Math.max(0, Math.min(1, vector[dimension])) * 100),
  })).sort((a, b) => b.value - a.value || a.label.localeCompare(b.label));

  return (
    <dl className={cn('space-y-2.5', className)}>
      {rows.map((row) => (
        <div key={row.id} className="flex items-center gap-3">
          <dt className="w-40 shrink-0 text-sm text-ink-500">{row.label}</dt>
          <dd className="flex flex-1 items-center gap-3">
            <span className="relative h-[3px] flex-1 overflow-hidden rounded-full bg-ink/10">
              <span
                className="absolute inset-y-0 left-0 rounded-full bg-primary/70"
                style={{ width: `${Math.max(row.value, 2)}%` }}
              />
            </span>
            <span className="tabular w-10 text-right text-xs text-ink-400">{row.value}%</span>
          </dd>
        </div>
      ))}
    </dl>
  );
}
