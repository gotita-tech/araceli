import type { MetadataRoute } from 'next';

import { isProductionDeployment, siteUrl } from '@/lib/site-url';

export default function robots(): MetadataRoute.Robots {
  const base = siteUrl.replace(/\/$/, '');

  // Fuera de producción no se indexa nada: las previsualizaciones son internas.
  if (!isProductionDeployment) {
    return { rules: [{ userAgent: '*', disallow: '/' }] };
  }

  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin'] }],
    sitemap: `${base}/sitemap.xml`,
  };
}
