import { AboutTeaser } from '@/components/sections/about-teaser';
import { FaqSection } from '@/components/sections/faq-section';
import { FinalCta } from '@/components/sections/final-cta';
import { Hero } from '@/components/sections/hero';
import { IntentSelector } from '@/components/sections/intent-selector';
import { MapTeaser } from '@/components/sections/map-teaser';
import { ModalitiesBento } from '@/components/sections/modalities-bento';
import { NoNeedToKnow } from '@/components/sections/no-need-to-know';
import { Philosophy } from '@/components/sections/philosophy';
import { SessionFlow } from '@/components/sections/session-flow';
import { Testimonials } from '@/components/sections/testimonials';
import { MODALITIES, site } from '@/lib/content';

export default function HomePage() {
  const modalitySummaries = MODALITIES.map((modality) => ({
    id: modality.id,
    name: modality.name,
    claim: modality.claim,
    category: modality.category,
  }));

  return (
    <>
      <Hero
        eyebrow={site.hero.eyebrow}
        title={site.hero.title}
        subtitle={site.hero.subtitle}
        primaryCta={site.hero.primaryCta}
        secondaryCta={site.hero.secondaryCta}
        note={site.hero.note}
      />

      <NoNeedToKnow
        eyebrow={site.noNeedToKnow.eyebrow}
        title={site.noNeedToKnow.title}
        body={site.noNeedToKnow.body}
        ctaLabel={site.noNeedToKnow.cta.label}
      />

      <MapTeaser
        eyebrow={site.mapTeaser.eyebrow}
        title={site.mapTeaser.title}
        body={site.mapTeaser.body}
        bullets={site.mapTeaser.bullets}
        ctaLabel={site.mapTeaser.cta.label}
      />

      <IntentSelector
        eyebrow={site.intentSelector.eyebrow}
        title={site.intentSelector.title}
        body={site.intentSelector.body}
        intents={site.intentSelector.intents}
        modalities={modalitySummaries}
      />

      <ModalitiesBento />
      <SessionFlow />
      <AboutTeaser />
      <Philosophy />
      <Testimonials />
      <FaqSection />

      <FinalCta
        eyebrow={site.finalCta.eyebrow}
        title={site.finalCta.title}
        body={site.finalCta.body}
        primaryLabel={site.finalCta.primaryCta.label}
        secondary={site.finalCta.secondaryCta}
      />
    </>
  );
}
