import { Reveal } from '@/components/ui/reveal';
import { site } from '@/lib/content';
import { EditorialImage } from '@/components/visual/editorial-image';

/** Cómo funciona una sesión: cuatro momentos, sin promesas sobre lo que ocurrirá. */
export function SessionFlow() {
  const { eyebrow, title, body, steps } = site.sessionFlow;

  return (
    <section className="bg-ivory-paper py-20 md:py-28">
      <div className="shell">
        <Reveal className="max-w-prose">
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="mt-5 font-serif text-headline font-light text-ink-800">{title}</h2>
          <p className="mt-6 text-lede text-ink-500">{body}</p>
        </Reveal>

        <EditorialImage id="liberacion-emociones" className="mt-12 h-[260px] md:h-[380px]" sizes="100vw" caption />
        <ol className="mt-10 grid gap-px overflow-hidden rounded-[1.75rem] border border-ink/8 bg-ink/8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <li key={step.id} className="bg-ivory-paper">
              <Reveal delay={index * 0.06} className="flex h-full flex-col p-7 md:p-8">
                <span className="tabular text-xs text-primary/70">{String(index + 1).padStart(2, '0')}</span>
                <h3 className="mt-5 font-serif text-[1.3rem] font-light text-ink-800">{step.title}</h3>
                <p className="mt-3 text-[0.95rem] leading-relaxed text-ink-500">{step.body}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
