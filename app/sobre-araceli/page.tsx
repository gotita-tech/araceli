import type { Metadata } from 'next';
import { AuthenticPortrait } from '@/components/visual/authentic-portrait';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/ui/reveal';

import { about, site } from '@/lib/content';
import { DISCLAIMERS } from '@/lib/recommender/safety-rules';

export const metadata: Metadata = {
  alternates: { canonical: '/sobre-araceli' },
  title: 'Sobre Araceli',
  description: 'Conoce el enfoque de Araceli: escucha, bienestar, autoconocimiento y respeto por tus preferencias.',
};

export default function AboutPage() {
  const formation = about.timeline.filter(entry => entry.status === 'published');
  return (
    <div className="bg-ivory-paper pt-[68px]">
      <header className="shell grid items-center gap-12 py-16 md:py-24 lg:grid-cols-2">
        <div>
          <p className="eyebrow">Sobre Araceli</p>
          <h1 className="mt-5 font-serif text-display font-extralight text-ink-900">{about.headline}</h1>
          <p className="mt-7 text-lede text-ink-500">{about.lede}</p>
        </div>
        <AuthenticPortrait priority />
      </header>
      <section className="shell grid gap-12 border-t border-ink/8 py-16 md:py-20 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          {about.paragraphs.map((paragraph, index) => <Reveal key={paragraph.slice(0, 24)} delay={index * 0.05}><p className="text-[1.05rem] leading-relaxed text-ink-600">{paragraph}</p></Reveal>)}
          <div className="flex flex-wrap gap-3 pt-6"><Button href="/conversar" size="lg">Conversar con Araceli</Button><Button href="/mapa-interior" variant="secondary" size="lg">Crear mi mapa</Button></div>
        </div>
        <aside className="self-start rounded-3xl border border-ink/8 bg-ivory-soft p-8">
          <p className="eyebrow">El punto de partida eres tú</p>
          <h2 className="mt-5 font-serif text-title font-light">Una experiencia a tu ritmo.</h2>
          <ul className="mt-6 space-y-4 text-sm leading-relaxed text-ink-500"><li>Explicas qué te gustaría explorar.</li><li>Conoces el enfoque y los límites de cada práctica.</li><li>Decides tus preferencias sobre contacto físico.</li><li>Puedes pedir una pausa en cualquier momento.</li></ul>
          <a className="link-underline mt-7 inline-block text-sm text-primary" href={`https://instagram.com/${site.contact.instagram.replace('@', '')}`}>Conoce a Araceli en Instagram ↗</a>
        </aside>
      </section>
      {formation.length > 0 ? <section className="shell pb-16"><h2 className="eyebrow">Formación</h2><ol className="mt-6 grid gap-4 md:grid-cols-2">{formation.map(entry => <li key={entry.id} className="rounded-3xl border border-ink/8 p-6"><p className="text-xs text-ink-400">{entry.year}</p><h3 className="mt-2 font-serif text-title">{entry.practice}</h3><p className="mt-3 text-sm text-ink-500">{[entry.school, entry.certification, entry.location].filter(Boolean).join(' · ')}</p></li>)}</ol></section> : null}
      <div className="shell pb-16"><p className="max-w-3xl text-xs leading-relaxed text-ink-400">{DISCLAIMERS.global}</p></div>
    </div>
  );
}
