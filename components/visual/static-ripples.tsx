import { cn } from '@/lib/utils/cn';

/**
 * Versión estática del campo de agua.
 *
 * Es lo que ve quien pidió menos movimiento o llega con un dispositivo modesto:
 * la misma imagen, detenida en el instante posterior a la gota.
 */
export function StaticRipples({ className, tone = 'light' }: { className?: string; tone?: 'light' | 'dark' }) {
  const ring = tone === 'dark' ? 'rgb(240 242 219 / 0.16)' : 'rgb(67 107 222 / 0.16)';
  const ringSoft = tone === 'dark' ? 'rgb(240 242 219 / 0.08)' : 'rgb(67 107 222 / 0.08)';

  return (
    <svg
      viewBox="0 0 800 600"
      preserveAspectRatio="xMidYMid slice"
      className={cn('h-full w-full', className)}
      aria-hidden
      focusable="false"
    >
      <defs>
        <radialGradient id="water-core" cx="50%" cy="52%" r="46%">
          <stop offset="0%" stopColor={tone === 'dark' ? '#436BDE' : '#98ACDB'} stopOpacity={tone === 'dark' ? 0.5 : 0.34} />
          <stop offset="55%" stopColor={tone === 'dark' ? '#6E8BD9' : '#F0F2DB'} stopOpacity={tone === 'dark' ? 0.2 : 0.55} />
          <stop offset="100%" stopColor="#FBFBF4" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="800" height="600" fill="url(#water-core)" />

      <g fill="none" strokeWidth="1">
        {Array.from({ length: 13 }).map((_, index) => {
          const radius = 26 + index * 27;
          return (
            <ellipse
              key={radius}
              cx="400"
              cy="312"
              rx={radius}
              ry={radius * 0.78}
              stroke={index % 3 === 0 ? ring : ringSoft}
            />
          );
        })}
      </g>

      <g fill="none" strokeWidth="1" opacity="0.7">
        {Array.from({ length: 6 }).map((_, index) => {
          const radius = 18 + index * 21;
          return <ellipse key={`echo-${radius}`} cx="556" cy="214" rx={radius} ry={radius * 0.74} stroke={ringSoft} />;
        })}
      </g>

      <circle cx="400" cy="312" r="3.5" fill={tone === 'dark' ? '#F0F2DB' : '#436BDE'} opacity="0.75" />
    </svg>
  );
}
