import type { Metadata } from 'next';

import { Reveal } from '@/components/ui/reveal';
import { site } from '@/lib/content';
import { DISCLAIMERS } from '@/lib/recommender/safety-rules';

export const metadata: Metadata = {
  title: 'Privacidad',
  description:
    'Cómo se procesan las respuestas del Mapa Interior: en tu navegador, sin datos personales y sin publicidad comportamental.',
};

export default function PrivacyPage() {
  return (
    <div className="bg-ivory-paper pb-24 pt-[68px]">
      <div className="shell py-16 md:py-24">
        <div className="max-w-2xl">
          <p className="eyebrow">Privacidad</p>
          <h1 className="mt-5 font-serif text-display font-extralight leading-[1.05] text-ink-900">
            {site.privacy.title}
          </h1>
          <p className="mt-7 text-lede text-ink-500">{site.privacy.intro}</p>
        </div>

        <div className="mt-16 max-w-3xl divide-y divide-ink/8 border-y border-ink/8">
          {site.privacy.points.map((point, index) => (
            <Reveal key={point.title} delay={index * 0.04}>
              <section className="py-7">
                <h2 className="font-serif text-title font-light text-ink-800">{point.title}</h2>
                <p className="mt-3 max-w-prose text-[0.975rem] leading-relaxed text-ink-500">{point.body}</p>
              </section>
            </Reveal>
          ))}
        </div>

        <div className="mt-14 max-w-3xl rounded-[1.75rem] border border-ink/8 bg-white/60 p-7">
          <h2 className="eyebrow">Qué no preguntamos</h2>
          <p className="mt-4 text-[0.975rem] leading-relaxed text-ink-500">
            El cuestionario no solicita nombre completo, documento de identidad, historia clínica, diagnósticos,
            medicación, dirección ni ningún dato íntimo innecesario. El campo de texto opcional del último paso se
            analiza en tu navegador únicamente para comprobar que las experiencias de este sitio son apropiadas para tu
            momento, y no se almacena.
          </p>
        </div>

        <p className="mt-10 max-w-3xl text-xs leading-relaxed text-ink-300">{DISCLAIMERS.global}</p>
      </div>
    </div>
  );
}
