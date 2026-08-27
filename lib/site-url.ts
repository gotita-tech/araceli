import { site } from '@/lib/content';

/**
 * URL pública del sitio.
 *
 * Prioridad:
 * 1. `NEXT_PUBLIC_SITE_URL` — el dominio propio, cuando exista.
 * 2. Dominio estable de producción en Vercel.
 * 3. URL del despliegue concreto (previsualizaciones).
 * 4. El valor de `content/site.json`, para desarrollo local.
 */
function normalize(value: string | undefined | null): string | null {
  if (!value) return null;
  const trimmed = value.trim().replace(/\/+$/, '');
  if (!trimmed) return null;
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export const siteUrl: string =
  normalize(process.env.NEXT_PUBLIC_SITE_URL) ??
  normalize(process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL) ??
  normalize(process.env.NEXT_PUBLIC_VERCEL_URL) ??
  site.brand.siteUrl;

/**
 * Sólo el despliegue de producción debe indexarse: las previsualizaciones se
 * mantienen fuera de los buscadores.
 */
export const isProductionDeployment: boolean = process.env.VERCEL_ENV
  ? process.env.VERCEL_ENV === 'production'
  : process.env.NODE_ENV === 'production';

/**
 * El estudio de contenido no se publica por defecto.
 * En un despliegue sólo aparece si se define `ENABLE_ADMIN=true`.
 */
export const adminEnabled: boolean =
  process.env.NODE_ENV !== 'production' || process.env.ENABLE_ADMIN === 'true';
