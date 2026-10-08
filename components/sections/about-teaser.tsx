import Link from 'next/link';
import { Reveal } from '@/components/ui/reveal';
import { AuthenticPortrait } from '@/components/visual/authentic-portrait';
import { about } from '@/lib/content';

export function AboutTeaser() {
  return (
    <section className="bg-ivory-paper py-20 md:py-28">
      <div className="shell grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <Reveal><AuthenticPortrait /></Reveal>
        <Reveal delay={0.08}>
          <p className="eyebrow">Sobre Araceli</p>
          <h2 className="mt-5 font-serif text-headline font-light text-ink-800">{about.headline}</h2>
          <p className="mt-6 max-w-prose text-lede text-ink-500">{about.lede}</p>
          <p className="mt-6 text-sm leading-relaxed text-ink-500">Escucha, respeto por tus preferencias y libertad para decidir cómo continuar.</p>
          <Link href="/sobre-araceli" className="link-underline mt-8 inline-block text-sm text-primary">Conocer el acompañamiento ↗</Link>
        </Reveal>
      </div>
    </section>
  );
}
