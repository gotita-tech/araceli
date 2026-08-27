import { Reveal } from '@/components/ui/reveal';
import { faq, site } from '@/lib/content';

/** Preguntas frecuentes con <details>: accesible por teclado sin JavaScript. */
export function FaqSection() {
  return (
    <section id="preguntas" className="bg-ivory-soft py-20 md:py-28">
      <div className="shell grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-20">
        <Reveal>
          <p className="eyebrow">{site.faqSection.eyebrow}</p>
          <h2 className="mt-5 font-serif text-headline font-light text-ink-800">{site.faqSection.title}</h2>
        </Reveal>

        <div className="divide-y divide-ink/8 border-y border-ink/8">
          {faq.items.map((item, index) => (
            <Reveal key={item.id} delay={index * 0.03}>
              <details className="group py-5">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-6 text-[1.05rem] text-ink-700 transition-colors hover:text-primary">
                  {item.question}
                  <span
                    aria-hidden
                    className="mt-1 shrink-0 text-ink-300 transition-transform duration-300 ease-calm group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-4 max-w-prose text-[0.95rem] leading-relaxed text-ink-500">{item.answer}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
