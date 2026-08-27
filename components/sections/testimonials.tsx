import { Reveal } from '@/components/ui/reveal';
import { publishedTestimonials, pendingTestimonials, site } from '@/lib/content';

/**
 * Testimonios.
 *
 * Sólo se publican los reales. Mientras no lleguen, el espacio se muestra
 * explícitamente vacío: nunca se inventa una persona ni una frase.
 */
export function Testimonials() {
  const { eyebrow, title, body } = site.testimonialsSection;

  return (
    <section className="bg-ivory-paper py-20 md:py-28">
      <div className="shell">
        <Reveal className="max-w-prose">
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="mt-5 font-serif text-headline font-light text-ink-800">{title}</h2>
          <p className="mt-6 text-lede text-ink-500">{body}</p>
        </Reveal>

        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {publishedTestimonials.map((testimonial, index) => (
            <Reveal key={testimonial.id} delay={index * 0.06}>
              <figure className="flex h-full flex-col rounded-[1.75rem] border border-ink/8 bg-white/70 p-7">
                <blockquote className="font-serif text-[1.15rem] font-light leading-relaxed text-ink-700">
                  {testimonial.quote}
                </blockquote>
                <figcaption className="mt-6 text-sm text-ink-400">
                  {testimonial.author}
                  {testimonial.context ? <span className="block text-ink-300">{testimonial.context}</span> : null}
                </figcaption>
              </figure>
            </Reveal>
          ))}

          {pendingTestimonials.map((testimonial, index) => (
            <Reveal key={testimonial.id} delay={(publishedTestimonials.length + index) * 0.06}>
              <div className="flex h-full min-h-[180px] flex-col items-start justify-between rounded-[1.75rem] border border-dashed border-ink/15 bg-white/40 p-7">
                <p className="text-sm text-ink-300">Testimonio pendiente</p>
                <p className="mt-6 text-xs leading-relaxed text-ink-300">
                  Se publicará cuando una persona real comparta su experiencia y autorice su uso.
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
