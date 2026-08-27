'use client';

import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Pill } from '@/components/ui/pill';
import { MapShape, MapShapeDescription } from '@/components/visual/map-shape';
import { track } from '@/lib/analytics';
import { useReducedMotion } from '@/lib/hooks/use-reduced-motion';
import { getModalityProfile } from '@/lib/recommender/modalities';
import { describeInitialPath, explainChoice, summarizeMap } from '@/lib/recommender/result-explainer';
import { DISCLAIMERS, getSafetyCheck } from '@/lib/recommender/safety-rules';
import { topDimensions } from '@/lib/recommender/weights';
import type { ModalityId, PreferenceTag, RecommendationResult, ScoredModality } from '@/lib/recommender/types';
import { clearMap, hasStoredMap, saveMap } from '@/lib/storage';
import type { Answers } from '@/lib/recommender/types';
import { cn } from '@/lib/utils/cn';
import { CALM_EASE } from '@/lib/utils/motion';

import { SafetyCheckDialog } from './safety-check-dialog';
import { WhyPanel } from './why-panel';

type ResultScreenProps = {
  result: RecommendationResult;
  answers: Answers;
  onRestart: () => void;
  onExclude: (id: ModalityId) => void;
  onToggleTag: (tag: PreferenceTag) => void;
  extraTags: PreferenceTag[];
  compact?: boolean;
};

export function ResultScreen({
  result,
  answers,
  onRestart,
  onExclude,
  onToggleTag,
  extraTags,
  compact = false,
}: ResultScreenProps) {
  const reducedMotion = useReducedMotion();
  const [saved, setSaved] = useState(false);
  const [savingDeclined, setSavingDeclined] = useState(false);
  const [checkedModalities, setCheckedModalities] = useState<ModalityId[]>([]);

  useEffect(() => {
    setSaved(hasStoredMap());
  }, []);

  useEffect(() => {
    track({ name: 'map_completed', confidence: result.confidence });
  }, [result.confidence]);

  const primaryProfile = getModalityProfile(result.primaryModality);
  const secondaryProfile = getModalityProfile(result.secondaryModality);
  const tags = useMemo(() => new Set(result.activeTags as PreferenceTag[]), [result.activeTags]);
  const dimensions = useMemo(() => topDimensions(result.rawDimensions, 2), [result.rawDimensions]);
  const explanation = useMemo(
    () => explainChoice(primaryProfile, dimensions, tags),
    [primaryProfile, dimensions, tags],
  );

  // Ninguna modalidad con contraindicaciones se muestra antes de resolver su
  // comprobación de seguridad, ni como principal ni como alternativa.
  const gatedProfile = [primaryProfile, secondaryProfile].find(
    (profile) => profile?.safetyCheckId && !checkedModalities.includes(profile.id),
  );
  const pendingCheck = gatedProfile ? getSafetyCheck(gatedProfile.safetyCheckId) : undefined;

  if (pendingCheck && gatedProfile) {
    return (
      <SafetyCheckDialog
        check={pendingCheck}
        modalityName={gatedProfile.name}
        onConfirm={() => setCheckedModalities((current) => [...current, gatedProfile.id])}
        onDecline={() => onExclude(gatedProfile.id)}
      />
    );
  }

  const confidenceLabel = result.openMap
    ? 'Mapa abierto'
    : result.twoPaths
      ? 'Dos caminos compatibles'
      : result.confidence === 'high'
        ? 'Afinidad alta'
        : 'Afinidad media';

  return (
    <div className={cn('grid gap-10', compact ? '' : 'lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start lg:gap-16')}>
      <motion.div
        initial={reducedMotion ? false : { opacity: 0, scale: 0.94 }}
        animate={reducedMotion ? undefined : { opacity: 1, scale: 1 }}
        transition={{ duration: 1.1, ease: CALM_EASE }}
        className="flex flex-col items-center"
      >
        <div className="relative flex w-full items-center justify-center">
          <MapShape vector={result.dimensions} size={compact ? 260 : 340} labels className="max-w-full" />
        </div>

        <details className="group mt-6 w-full max-w-sm">
          <summary className="cursor-pointer list-none text-center text-sm text-ink-400 transition-colors hover:text-primary">
            <span className="link-underline">Ver el mapa en palabras</span>
          </summary>
          <div className="mt-5 rounded-3xl border border-ink/8 bg-white/70 p-5">
            <MapShapeDescription vector={result.dimensions} />
          </div>
        </details>
      </motion.div>

      <div className="min-w-0">
        <p className="eyebrow">Tu Mapa Interior</p>
        <h2 className="mt-4 font-serif text-headline font-light text-ink-800">{summarizeMap(dimensions)}</h2>

        {result.openMap ? (
          <div className="mt-8 rounded-3xl border border-primary/20 bg-primary/5 p-6">
            <p className="text-lede text-ink-700">
              Tu mapa todavía es bastante abierto. Una conversación inicial con Araceli puede ayudarte a descubrir qué
              experiencia te resulta más adecuada.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button href="/conversar">Conversar con Araceli</Button>
              <Button href="/practicas" variant="secondary">
                Ver todas las prácticas
              </Button>
            </div>
          </div>
        ) : (
          <>
            <p className="mt-5 text-lede text-ink-500">
              Según lo que nos contaste, hoy parecen destacar dos áreas: {explanation.dimensionLabels.join(' y ')}.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-2">
              <Pill tone="primary">{confidenceLabel}</Pill>
              {result.twoPaths ? (
                <span className="text-sm text-ink-400">Dos caminos podrían resultarte compatibles.</span>
              ) : null}
            </div>

            {primaryProfile ? (
              <ModalityResultCard
                eyebrow="Tu mayor afinidad"
                name={primaryProfile.name}
                affinity={result.affinity}
                blurb={primaryProfile.resultBlurb}
                id={primaryProfile.id}
                emphasis
              />
            ) : null}

            {secondaryProfile && result.secondaryAffinity !== null ? (
              <ModalityResultCard
                eyebrow="También podría interesarte"
                name={secondaryProfile.name}
                affinity={result.secondaryAffinity}
                blurb={secondaryProfile.resultBlurb}
                id={secondaryProfile.id}
              />
            ) : null}

            <div className="mt-8 rounded-3xl border border-ink/8 bg-ivory-soft/70 p-6">
              <p className="eyebrow">Ruta inicial sugerida</p>
              <p className="mt-3 text-[1.05rem] text-ink-700">
                {describeInitialPath(result.initialPath.sessions, primaryProfile?.name ?? '')}
              </p>
              <p className="mt-3 text-sm text-ink-400">
                Después de tus primeros encuentros, lo más importante es revisar cómo te ha resultado la experiencia antes
                de decidir cómo continuar.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="/conversar" size="lg">
                Conversar con Araceli
              </Button>
              {primaryProfile ? (
                <Button href={`/practicas/${primaryProfile.id}`} variant="secondary" size="lg">
                  Conocer esta práctica
                </Button>
              ) : null}
            </div>

            <WhyPanel sentence={explanation.sentence} reasons={result.reasons} affinity={result.affinity} />

            <OtherModalities
              ranking={result.ranking}
              highlighted={[result.primaryModality, result.secondaryModality]}
              energyInterest={tags.has('energyInterest')}
              magnetsSelected={extraTags.includes('magnetInterest')}
              onToggleMagnets={() => onToggleTag('magnetInterest')}
            />
          </>
        )}

        <div className="mt-10 rounded-3xl border border-ink/8 bg-white/60 p-6">
          <p className="text-sm font-medium text-ink-700">Tus respuestas</p>
          <p className="mt-2 text-sm text-ink-400">
            Todo el cálculo ocurrió en tu navegador. Guardar tu mapa crea una copia local en este dispositivo y puedes
            borrarla cuando quieras.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            {saved ? (
              <>
                <Pill tone="primary">Guardado en este dispositivo</Pill>
                <button
                  type="button"
                  onClick={() => {
                    clearMap();
                    setSaved(false);
                  }}
                  className="text-sm text-ink-400 underline underline-offset-4 transition-colors hover:text-primary"
                >
                  Borrar la copia guardada
                </button>
              </>
            ) : (
              <>
                <Button
                  variant="secondary"
                  onClick={() => {
                    if (saveMap(answers)) setSaved(true);
                  }}
                >
                  Guardar mi mapa aquí
                </Button>
                <button
                  type="button"
                  onClick={() => setSavingDeclined(true)}
                  className={cn(
                    'text-sm underline underline-offset-4 transition-colors hover:text-primary',
                    savingDeclined ? 'text-primary' : 'text-ink-400',
                  )}
                >
                  {savingDeclined ? 'Nada se ha guardado' : 'Continuar sin guardar mis respuestas'}
                </button>
              </>
            )}
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={onRestart}
            className="text-sm text-ink-400 underline underline-offset-4 transition-colors hover:text-primary"
          >
            Volver a empezar el mapa
          </button>
        </div>

        <p className="mt-8 text-xs leading-relaxed text-ink-300">{DISCLAIMERS.map}</p>
      </div>
    </div>
  );
}

/**
 * Ranking completo y preferencias que la persona puede declarar después.
 *
 * El biomagnetismo sólo puede llegar hasta aquí si alguien pide explícitamente
 * incluir experiencias con imanes, y aun así pasa antes por su comprobación.
 */
function OtherModalities({
  ranking,
  highlighted,
  energyInterest,
  magnetsSelected,
  onToggleMagnets,
}: {
  ranking: ScoredModality[];
  highlighted: (ModalityId | null)[];
  energyInterest: boolean;
  magnetsSelected: boolean;
  onToggleMagnets: () => void;
}) {
  const rest = ranking.filter((item) => !highlighted.includes(item.id));
  if (rest.length === 0 && !energyInterest) return null;

  return (
    <div className="mt-8">
      <details className="group rounded-3xl border border-ink/8 bg-white/60 p-6">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm text-ink-600">
          Ver el resto de modalidades y su afinidad
          <span aria-hidden className="text-ink-300 transition-transform duration-300 ease-calm group-open:rotate-45">
            +
          </span>
        </summary>

        <ul className="mt-6 space-y-3">
          {rest.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-4 border-b border-ink/6 pb-3 last:border-b-0">
              <a href={`/practicas/${item.id}`} className="link-underline text-[0.95rem] text-ink-700">
                {item.name}
              </a>
              <span className="tabular text-sm text-ink-400">{item.affinity}%</span>
            </li>
          ))}
        </ul>

        {energyInterest ? (
          <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-2xl border border-ink/10 bg-ivory-soft/70 px-4 py-3.5">
            <input
              type="checkbox"
              checked={magnetsSelected}
              onChange={onToggleMagnets}
              className="mt-[3px] h-4 w-4 shrink-0 accent-primary"
            />
            <span className="text-sm leading-relaxed text-ink-600">
              Me interesan también las experiencias con imanes.
              <span className="mt-1 block text-xs text-ink-400">
                Sólo si lo marcas aparecerá el biomagnetismo, y antes te mostraremos una comprobación de seguridad.
              </span>
            </span>
          </label>
        ) : null}

        <p className="mt-5 text-xs leading-relaxed text-ink-300">
          La afinidad describe compatibilidad con tus preferencias. No ordena las prácticas por eficacia.
        </p>
      </details>
    </div>
  );
}

function ModalityResultCard({
  eyebrow,
  name,
  affinity,
  blurb,
  id,
  emphasis = false,
}: {
  eyebrow: string;
  name: string;
  affinity: number;
  blurb: string;
  id: string;
  emphasis?: boolean;
}) {
  return (
    <div
      className={cn(
        'mt-6 rounded-3xl border p-6 transition-colors',
        emphasis ? 'border-primary/25 bg-white shadow-soft' : 'border-ink/8 bg-white/60',
      )}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <p className="eyebrow">{eyebrow}</p>
        <p className="tabular text-sm text-primary-700">{affinity}% afinidad</p>
      </div>
      <h3 className="mt-3 font-serif text-title font-light text-ink-800">
        <a href={`/practicas/${id}`} className="link-underline">
          {name}
        </a>
      </h3>
      <p className="mt-3 text-[0.975rem] leading-relaxed text-ink-500">{blurb}</p>
      <div className="mt-5 h-[3px] w-full overflow-hidden rounded-full bg-ink/8">
        <div className="h-full rounded-full bg-primary/60" style={{ width: `${affinity}%` }} />
      </div>
    </div>
  );
}
