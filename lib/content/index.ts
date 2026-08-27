import rawAbout from '@/content/about.json';
import rawFaq from '@/content/faq.json';
import rawModalities from '@/content/modalities.json';
import rawSite from '@/content/site.json';
import rawTestimonials from '@/content/testimonials.json';

import { MODALITY_PROFILES } from '@/lib/recommender/modalities';

import { aboutSchema, faqSchema, modalitiesContentSchema, siteSchema, testimonialsSchema, type ModalityContent } from './schema';

/**
 * Contenido editorial. Todo lo que Araceli puede cambiar vive en /content
 * y se valida aquí: si falta un bloque obligatorio, el build falla.
 */
export const site = siteSchema.parse(rawSite);
export const modalitiesContent = modalitiesContentSchema.parse(rawModalities);
export const faq = faqSchema.parse(rawFaq);
export const testimonials = testimonialsSchema.parse(rawTestimonials);
export const about = aboutSchema.parse(rawAbout);

export const MODALITIES: ModalityContent[] = modalitiesContent.items;

export function getModalityContent(id: string): ModalityContent | undefined {
  return MODALITIES.find((item) => item.id === id);
}

export function modalityGroup(id: string): string {
  return MODALITY_PROFILES.find((profile) => profile.id === id)?.group ?? '';
}

export function modalitiesByGroup(groupId: string): ModalityContent[] {
  return MODALITIES.filter((item) => modalityGroup(item.id) === groupId);
}

export const publishedTestimonials = testimonials.items.filter((item) => item.status === 'published');
export const pendingTestimonials = testimonials.items.filter((item) => item.status === 'pending');

export const EVIDENCE_LABELS: Record<ModalityContent['evidenceLevel'], string> = {
  limitada: 'Evidencia limitada',
  'muy-limitada': 'Evidencia muy limitada',
  'no-concluyente': 'Sin evidencia concluyente',
};

/**
 * Comprobación de coherencia entre el contenido editorial y el motor:
 * cada modalidad puntuable debe tener su ficha, y viceversa.
 */
const profileIds = new Set(MODALITY_PROFILES.map((profile) => profile.id));
const contentIds = new Set(MODALITIES.map((item) => item.id));

for (const id of profileIds) {
  if (!contentIds.has(id)) {
    throw new Error(`La modalidad "${id}" puntúa en el recomendador pero no tiene ficha de contenido.`);
  }
}
for (const id of contentIds) {
  if (!profileIds.has(id)) {
    throw new Error(`La modalidad "${id}" tiene ficha de contenido pero no perfil de afinidad.`);
  }
}

export type { ModalityContent, SiteContent } from './schema';
