'use client';

import { WaterField } from '@/components/visual/water-field';
import { DISCLAIMERS } from '@/lib/recommender/safety-rules';

import { MapExperience } from './map-experience';

/** Versión en página completa de la experiencia: misma lógica, más aire. */
export function MapPage() {
  return (
    <div className="relative overflow-hidden bg-ivory-paper pb-24 pt-[68px]">
      <WaterField className="h-[420px] opacity-70 mask-fade-b" intensity={0.55} />

      <div className="shell relative pt-14">
        <div className="max-w-2xl">
          <p className="eyebrow">Experiencia interactiva</p>
          <h1 className="mt-5 font-serif text-headline font-light text-ink-900">Tu Mapa Interior</h1>
          <p className="mt-5 text-lede text-ink-500">
            Una orientación construida sólo con aquello que decides contarnos. Puedes detenerte cuando quieras.
          </p>
        </div>

        <div className="mt-14 rounded-[2rem] border border-ink/8 bg-ivory-paper/80 p-5 shadow-soft backdrop-blur-sm md:p-10">
          <MapExperience variant="page" />
        </div>

        <p className="mt-8 max-w-3xl text-xs leading-relaxed text-ink-300">{DISCLAIMERS.global}</p>
      </div>
    </div>
  );
}
