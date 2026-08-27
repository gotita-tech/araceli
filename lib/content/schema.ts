import { z } from 'zod';

/** Esquemas del contenido editorial administrable. */

const linkSchema = z.object({ label: z.string(), href: z.string() });

export const siteSchema = z.object({
  version: z.string(),
  brand: z.object({
    name: z.string(),
    tagline: z.string(),
    shortDescription: z.string(),
    locale: z.string(),
    siteUrl: z.string().url(),
    practitionerRole: z.string(),
  }),
  contact: z.object({
    configured: z.boolean(),
    email: z.string(),
    phone: z.string(),
    whatsapp: z.string(),
    instagram: z.string(),
    bookingUrl: z.string(),
    city: z.string(),
    note: z.string(),
  }),
  nav: z.array(linkSchema),
  hero: z.object({
    eyebrow: z.string(),
    title: z.string(),
    subtitle: z.string(),
    primaryCta: linkSchema,
    secondaryCta: linkSchema,
    note: z.string(),
  }),
  noNeedToKnow: z.object({
    eyebrow: z.string(),
    title: z.string(),
    body: z.string(),
    cta: linkSchema,
  }),
  mapTeaser: z.object({
    eyebrow: z.string(),
    title: z.string(),
    body: z.string(),
    bullets: z.array(z.string()),
    cta: linkSchema,
  }),
  intentSelector: z.object({
    eyebrow: z.string(),
    title: z.string(),
    body: z.string(),
    intents: z.array(
      z.object({
        id: z.string(),
        label: z.string(),
        description: z.string(),
        modalities: z.array(z.string()),
      }),
    ),
  }),
  modalitiesSection: z.object({
    eyebrow: z.string(),
    title: z.string(),
    body: z.string(),
    groups: z.array(z.object({ id: z.string(), label: z.string(), description: z.string() })),
  }),
  sessionFlow: z.object({
    eyebrow: z.string(),
    title: z.string(),
    body: z.string(),
    steps: z.array(z.object({ id: z.string(), title: z.string(), body: z.string() })),
  }),
  philosophy: z.object({
    eyebrow: z.string(),
    title: z.string(),
    body: z.string(),
    quote: z.string(),
    columns: z.array(z.object({ title: z.string(), body: z.string() })),
  }),
  testimonialsSection: z.object({ eyebrow: z.string(), title: z.string(), body: z.string() }),
  faqSection: z.object({ eyebrow: z.string(), title: z.string() }),
  finalCta: z.object({
    eyebrow: z.string(),
    title: z.string(),
    body: z.string(),
    primaryCta: linkSchema,
    secondaryCta: linkSchema,
  }),
  footer: z.object({ note: z.string(), links: z.array(linkSchema), credit: z.string() }),
  floatingButton: z.object({ tooltip: z.string(), ariaLabel: z.string() }),
  privacy: z.object({
    title: z.string(),
    intro: z.string(),
    points: z.array(z.object({ title: z.string(), body: z.string() })),
  }),
});

export const modalityContentSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, 'La modalidad necesita un nombre'),
  claim: z.string().min(1, 'La modalidad necesita una frase corta'),
  category: z.enum(['Experiencia de bienestar', 'Práctica espiritual', 'Método complementario']),
  evidenceLevel: z.enum(['limitada', 'muy-limitada', 'no-concluyente']),
  blocks: z.object({
    whatItIs: z.string().min(10),
    howSessionGoes: z.string().min(10),
    whyPeopleChoose: z.string().min(10),
    whatWeKnow: z.string().min(10),
    whatItIsNot: z.string().min(10),
  }),
  practical: z.object({
    durationMinutes: z.number().int().positive(),
    formats: z.array(z.enum(['presencial', 'online'])).min(1),
    price: z.number().nullable(),
    priceNote: z.string(),
    availability: z.string(),
    sessionRange: z.object({ min: z.number().int().min(1), max: z.number().int().min(1).max(3) }),
    contraindications: z.array(z.string()),
    preparation: z.string(),
  }),
  adminNote: z.string(),
});

export const modalitiesContentSchema = z.object({
  version: z.string(),
  items: z.array(modalityContentSchema).min(1),
});

export const faqSchema = z.object({
  version: z.string(),
  items: z.array(
    z.object({ id: z.string().min(1), question: z.string().min(1), answer: z.string().min(1) }),
  ),
});

/** Un testimonio marcado como publicado nunca puede quedar vacío. */
export const testimonialsSchema = z.object({
  version: z.string(),
  note: z.string(),
  items: z.array(
    z.object({
      id: z.string(),
      status: z.enum(['pending', 'published']),
      quote: z.string(),
      author: z.string(),
      context: z.string(),
      modalityId: z.string(),
    }),
  ),
})
  .superRefine((value, ctx) => {
    value.items.forEach((item, index) => {
      if (item.status === 'published' && (!item.quote.trim() || !item.author.trim())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['items', index],
          message: 'Un testimonio publicado necesita texto y autoría reales',
        });
      }
    });
  });

export const aboutSchema = z.object({
  version: z.string(),
  headline: z.string(),
  lede: z.string(),
  paragraphs: z.array(z.string()),
  portrait: z.object({ src: z.string(), alt: z.string(), status: z.enum(['pending', 'published']) }),
  timelineNote: z.string(),
  timeline: z.array(
    z.object({
      id: z.string(),
      year: z.string(),
      practice: z.string(),
      school: z.string(),
      certification: z.string(),
      location: z.string(),
      photo: z.string(),
      status: z.enum(['pending', 'published']),
    }),
  ),
});

export type SiteContent = z.infer<typeof siteSchema>;
export type ModalityContent = z.infer<typeof modalityContentSchema>;
export type FaqContent = z.infer<typeof faqSchema>;
export type TestimonialsContent = z.infer<typeof testimonialsSchema>;
export type AboutContent = z.infer<typeof aboutSchema>;
