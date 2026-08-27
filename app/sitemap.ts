import type { MetadataRoute } from 'next';

import { MODALITIES } from '@/lib/content';
import { siteUrl } from '@/lib/site-url';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl.replace(/\/$/, '');
  const now = new Date();
  const staticRoutes = ['', '/mapa-interior', '/practicas', '/sobre-araceli', '/conversar', '/privacidad'];

  return [
    ...staticRoutes.map((route) => ({
      url: `${base}${route}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: route === '' ? 1 : 0.8,
    })),
    ...MODALITIES.map((modality) => ({
      url: `${base}/practicas/${modality.id}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ];
}
