import { Reveal } from '@/components/ui/reveal';
import { StaticRipples } from '@/components/visual/static-ripples';
import { site } from '@/lib/content';

/** "Tus creencias crean tu vida": la frase que ordena el trabajo, sin dogma. */
export function Philosophy() {
  const { eyebrow, title, body, quote, columns } = site.philosophy;

  return (
    <section className="relative overflow-hidden bg-ivory-soft py-24 md:py-32">
      <div className="pointer-events-none absolute inset-y-0 right-0 w-[60%] opacity-40" aria-hidden>
        <StaticRipples />
      </div>

      <div className="shell relative">
        <Reveal className="max-w-3xl">
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="mt-5 font-serif text-display font-extralight leading-[1.05] text-ink-900">{title}</h2>
          <p className="mt-8 max-w-prose text-lede text-ink-500">{body}</p>
        </Reveal>

        <Reveal delay={0.08} className="mt-16 max-w-2xl border-l border-primary/30 pl-7 md:pl-10">
          <p className="font-serif text-title font-light italic text-ink-700">{quote}</p>
        </Reveal>

        <div className="mt-16 grid gap-10 md:grid-cols-3 md:gap-8">
          {columns.map((column, index) => (
            <Reveal key={column.title} delay={index * 0.06}>
              <h3 className="font-serif text-[1.2rem] font-light text-ink-800">{column.title}</h3>
              <div className="hairline my-4 max-w-[3rem]" />
              <p className="text-[0.95rem] leading-relaxed text-ink-500">{column.body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
