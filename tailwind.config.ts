import type { Config } from 'tailwindcss';

/**
 * Sistema de diseño "Resonancia".
 * Toda la paleta deriva del azul primario de la identidad de Araceli (#436BDE):
 * mismo tono (≈224°), distintas saturaciones y luminosidades.
 */
const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
    './content/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#436BDE',
          50: '#F2F5FD',
          100: '#E3EAFB',
          200: '#C7D3F5',
          300: '#98ACDB',
          400: '#6E8BD9',
          500: '#436BDE',
          600: '#3556B4',
          700: '#28418A',
          800: '#1C2E62',
          900: '#131E44',
        },
        mist: '#98ACDB',
        secondary: '#6E8BD9',
        ivory: {
          DEFAULT: '#F0F2DB',
          soft: '#F6F7E8',
          paper: '#FBFBF4',
        },
        ink: {
          DEFAULT: '#0C1430',
          900: '#070C20',
          800: '#0C1430',
          700: '#131E44',
          600: '#22315F',
          500: '#3B4A7A',
          400: '#5B6889',
          300: '#8791A8',
        },
        line: {
          DEFAULT: 'rgba(12, 20, 48, 0.10)',
          soft: 'rgba(12, 20, 48, 0.06)',
          dark: 'rgba(240, 242, 219, 0.14)',
        },
      },
      fontFamily: {
        serif: ['var(--font-display)', 'Georgia', 'Cambria', 'Times New Roman', 'serif'],
        sans: ['var(--font-ui)', 'system-ui', '-apple-system', 'Segoe UI', 'Helvetica', 'Arial', 'sans-serif'],
      },
      fontSize: {
        display: ['clamp(2.75rem, 7vw, 5.25rem)', { lineHeight: '1.02', letterSpacing: '-0.025em' }],
        headline: ['clamp(2rem, 4.4vw, 3.5rem)', { lineHeight: '1.08', letterSpacing: '-0.02em' }],
        title: ['clamp(1.5rem, 2.6vw, 2.125rem)', { lineHeight: '1.16', letterSpacing: '-0.015em' }],
        lede: ['clamp(1.0625rem, 1.5vw, 1.3125rem)', { lineHeight: '1.6' }],
        micro: ['0.6875rem', { lineHeight: '1.4', letterSpacing: '0.14em' }],
      },
      borderRadius: {
        xl2: '1.125rem',
        '4xl': '2rem',
        '5xl': '2.75rem',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(12,20,48,0.04), 0 8px 24px -12px rgba(12,20,48,0.14)',
        lift: '0 2px 4px rgba(12,20,48,0.04), 0 24px 60px -28px rgba(12,20,48,0.28)',
        glass: '0 1px 1px rgba(255,255,255,0.6) inset, 0 12px 32px -14px rgba(12,20,48,0.35)',
        focus: '0 0 0 2px #FBFBF4, 0 0 0 4px #436BDE',
      },
      transitionTimingFunction: {
        calm: 'cubic-bezier(0.22, 1, 0.36, 1)',
        breath: 'cubic-bezier(0.45, 0, 0.25, 1)',
      },
      maxWidth: {
        prose: '68ch',
        shell: '78rem',
      },
      keyframes: {
        breathe: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.72' },
          '50%': { transform: 'scale(1.06)', opacity: '1' },
        },
        ripple: {
          '0%': { transform: 'scale(0.6)', opacity: '0.55' },
          '80%': { opacity: '0' },
          '100%': { transform: 'scale(1.9)', opacity: '0' },
        },
        rise: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        drift: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      animation: {
        breathe: 'breathe 6s cubic-bezier(0.45, 0, 0.25, 1) infinite',
        ripple: 'ripple 6s cubic-bezier(0.22, 1, 0.36, 1) infinite',
        rise: 'rise 0.7s cubic-bezier(0.22, 1, 0.36, 1) both',
        drift: 'drift 9s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
