import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Pill } from '@/components/ui/pill';
import { Reveal } from '@/components/ui/reveal';
import { StaticRipples } from '@/components/visual/static-ripples';
import { EVIDENCE_LABELS, MODALITIES, getModalityContent } from '@/lib/content';
import { getModalityProfile } from '@/lib/recommender/modalities';
import { DISCLAIMERS } from '@/lib/recommender/safety-rules';

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return MODALITIES.map((modality) => ({ slug: modality.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const modality = getModalityContent(slug);
  if (!modality) return { title: 'Práctica no encontrada' };

  return {
    title: modality.name,
    description: `${modality.claim} ${modality.blocks.whatItIs}`.slice(0, 155),
  };
}

const BLOCK_ORDER = [
  { key: 'whatItIs', label: 'Qué es' },
  { key: 'howSessionGoes', label: 'Cómo es una sesión' },
  { key: 'whyPeopleChoose', label: 'Por qué algunas personas la eligen' },
  { key: 'whatWeKnow', label: 'Lo que sabemos' },
  { key: 'whatItIsNot', label: 'Lo que no es' },
] as const;

export default async function ModalityPage({ params }: PageProps) {
  const { slug } = await params;
  const modality = getModalityContent(slug);
  if (!modality) notFound();

  const profile = getModalityProfile(modality.id);
  const extraDisclaimer =
    modality.id === 'canalizacion'
      ? DISCLAIMERS.channeling
      : modality.id === 'biomagnetismo'
        ? DISCLAIMERS.biomagnetism
        : null;

  return (
    <article className="bg-ivory-paper pb-24 pt-[68px]">
      <header className="relative overflow-hidden border-b border-ink/8 bg-ivory-soft">
        <div className="pointer-events-none absolute inset-y-0 right-0 w-[55%] opacity-50" aria-hidden>
          <StaticRipples />
        </div>

        <div className="shell relative py-16 md:py-24">
          <Link href="/practicas" className="link-underline text-sm text-ink-400">
            ← Todas las prácticas
          </Link>

          <div className="mt-8 flex flex-wrap items-center gap-2">
            <Pill>{modality.category}</Pill>
            <Pill tone="neutral">{EVIDENCE_LABELS[modality.evidenceLevel]}</Pill>
          </div>

          <h1 className="mt-6 max-w-3xl font-serif text-display font-extralight leading-[1.05] text-ink-900">
            {modality.name}
          </h1>
          <p className="mt-6 max-w-2xl font-serif text-title font-light italic text-ink-600">{modality.claim}</p>
        </div>
      </header>

      <div className="shell grid gap-14 pt-16 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.7fr)] lg:gap-20">
        <div className="min-w-0">
          {BLOCK_ORDER.map((block, index) => (
            <Reveal key={block.key} delay={index * 0.04}>
              <section className="border-t border-ink/8 py-9 first:border-t-0 first:pt-0">
                <h2 className="eyebrow">{block.label}</h2>
                <p className="mt-5 max-w-prose text-[1.05rem] leading-relaxed text-ink-600">
                  {modality.blocks[block.key]}
                </p>
              </section>
            </Reveal>
          ))}

          {extraDisclaimer ? (
            <Reveal>
              <p className="mt-4 rounded-3xl border border-primary/20 bg-primary/5 p-6 text-sm leading-relaxed text-ink-600">
                {extraDisclaimer}
              </p>
            </Reveal>
          ) : null}

          <Reveal>
            <div className="mt-12 flex flex-wrap gap-3">
              <Button href="/conversar" size="lg">
                Conversar con Araceli
              </Button>
              <Button href="/mapa-interior" variant="secondary" size="lg">
                Descubrir mi Mapa Interior
              </Button>
            </div>
          </Reveal>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-[1.75rem] border border-ink/8 bg-white/70 p-7">
            <h2 className="eyebrow">La sesión</h2>

            <dl className="mt-6 space-y-4 text-sm">
              <Row label="Duración" value={`${modality.practical.durationMinutes} minutos`} />
              <Row label="Formato" value={modality.practical.formats.join(' · ')} />
              <Row
                label="Contacto físico"
                value={
                  profile?.touch === 'none'
                    ? 'Sin contacto'
                    : profile?.touch === 'head'
                      ? 'Contacto suave en la cabeza'
                      : profile?.touch === 'faceNeck'
                        ? 'Contacto suave en rostro y cuello'
                        : profile?.touch === 'body'
                          ? 'Contacto ligero sobre el cuerpo'
                          : 'Opcional, se acuerda contigo'
                }
              />
              <Row
                label="Precio"
                value={modality.practical.price !== null ? `${modality.practical.price} €` : 'Consultar'}
              />
              <Row label="Preparación" value={modality.practical.preparation} />
            </dl>

            <p className="mt-6 text-xs leading-relaxed text-ink-300">
              Una primera experiencia siempre es suficiente para empezar. Si más adelante quieres continuar, se decide
              después de revisar cómo te resultó.
            </p>
          </div>

          {modality.practical.contraindications.length > 0 ? (
            <div className="mt-4 rounded-[1.75rem] border border-amber-500/20 bg-amber-500/5 p-7">
              <h2 className="eyebrow">Cuándo no es apropiada</h2>
              <ul className="mt-5 space-y-3">
                {modality.practical.contraindications.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm leading-relaxed text-ink-600">
                    <span aria-hidden className="mt-[7px] block h-1.5 w-1.5 shrink-0 rounded-full bg-amber-600/60" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <p className="mt-6 text-xs leading-relaxed text-ink-300">{DISCLAIMERS.global}</p>
        </aside>
      </div>
    </article>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-ink/6 pb-3 last:border-b-0">
      <dt className="text-ink-400">{label}</dt>
      <dd className="text-right text-ink-700">{value}</dd>
    </div>
  );
}
