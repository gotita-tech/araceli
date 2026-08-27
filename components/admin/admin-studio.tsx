'use client';

import { useMemo, useState } from 'react';
import type { ZodTypeAny } from 'zod';

import { Button } from '@/components/ui/button';
import { Pill } from '@/components/ui/pill';
import rawAbout from '@/content/about.json';
import rawFaq from '@/content/faq.json';
import rawModalities from '@/content/modalities.json';
import rawRecommender from '@/content/recommender.json';
import rawSite from '@/content/site.json';
import rawTestimonials from '@/content/testimonials.json';
import { aboutSchema, faqSchema, modalitiesContentSchema, siteSchema, testimonialsSchema } from '@/lib/content/schema';
import { recommenderFileSchema } from '@/lib/recommender/schema';
import { DIMENSION_IDS, DIMENSION_LABELS } from '@/lib/recommender/types';
import { cn } from '@/lib/utils/cn';

/**
 * Estudio de contenido.
 *
 * Todo lo administrable vive en /content como JSON validado por esquema. Aquí se
 * edita con validación en vivo y se exporta el archivo listo para reemplazar,
 * de modo que conectar un CMS más adelante no obliga a tocar el motor.
 */

type FileId = 'modalities' | 'recommender' | 'testimonials' | 'about' | 'site' | 'faq';

type FileConfig = {
  id: FileId;
  label: string;
  path: string;
  schema: ZodTypeAny;
  data: unknown;
  hint: string;
};

const FILES: FileConfig[] = [
  {
    id: 'modalities',
    label: 'Prácticas',
    path: 'content/modalities.json',
    schema: modalitiesContentSchema,
    data: rawModalities,
    hint: 'Nombre, descripción, duración, precio, formato, disponibilidad, contraindicaciones y los cinco bloques obligatorios.',
  },
  {
    id: 'recommender',
    label: 'Recomendador',
    path: 'content/recommender.json',
    schema: recommenderFileSchema,
    data: rawRecommender,
    hint: 'Preguntas, pesos del motor, matriz de afinidad y rango inicial de encuentros por modalidad.',
  },
  {
    id: 'testimonials',
    label: 'Testimonios',
    path: 'content/testimonials.json',
    schema: testimonialsSchema,
    data: rawTestimonials,
    hint: 'Sólo testimonios reales. Los pendientes se muestran como espacios vacíos, nunca como texto ficticio.',
  },
  {
    id: 'about',
    label: 'Formación',
    path: 'content/about.json',
    schema: aboutSchema,
    data: rawAbout,
    hint: 'Año, formación, escuela, certificación, ubicación y fotografía. Nada se publica sin confirmar.',
  },
  {
    id: 'site',
    label: 'Textos del sitio',
    path: 'content/site.json',
    schema: siteSchema,
    data: rawSite,
    hint: 'Titulares, secciones, datos de contacto y textos legales.',
  },
  {
    id: 'faq',
    label: 'Preguntas frecuentes',
    path: 'content/faq.json',
    schema: faqSchema,
    data: rawFaq,
    hint: 'Preguntas y respuestas de la portada.',
  },
];

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function AdminStudio() {
  const [activeId, setActiveId] = useState<FileId>('modalities');
  const [drafts, setDrafts] = useState<Record<FileId, unknown>>(() => ({
    modalities: clone(rawModalities),
    recommender: clone(rawRecommender),
    testimonials: clone(rawTestimonials),
    about: clone(rawAbout),
    site: clone(rawSite),
    faq: clone(rawFaq),
  }));

  const active = FILES.find((file) => file.id === activeId) ?? FILES[0]!;
  const draft = drafts[active.id];

  const validation = useMemo(() => {
    const result = active.schema.safeParse(draft);
    if (result.success) return { ok: true as const, issues: [] as string[] };
    return {
      ok: false as const,
      issues: result.error.issues.map((issue) => `${issue.path.join('.') || 'raíz'}: ${issue.message}`),
    };
  }, [active, draft]);

  const json = useMemo(() => JSON.stringify(draft, null, 2), [draft]);

  const update = (next: unknown) => setDrafts((current) => ({ ...current, [active.id]: next }));

  const download = () => {
    const blob = new Blob([`${json}\n`], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = active.path.split('/').pop() ?? 'contenido.json';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-ivory-paper pb-24 pt-[68px]">
      <div className="shell py-12">
        <p className="eyebrow">Administración</p>
        <h1 className="mt-4 font-serif text-headline font-light text-ink-900">Estudio de contenido</h1>
        <p className="mt-5 max-w-prose text-[1.02rem] leading-relaxed text-ink-500">
          Edita aquí lo que cambia con el tiempo. Cada archivo se valida contra su esquema mientras escribes; al
          terminar, descarga el JSON y reemplaza el archivo correspondiente del proyecto.
        </p>

        <div className="mt-10 flex flex-wrap gap-2">
          {FILES.map((file) => (
            <button
              key={file.id}
              type="button"
              onClick={() => setActiveId(file.id)}
              className={cn(
                'min-h-[44px] rounded-full border px-5 text-sm transition-all duration-300 ease-calm',
                file.id === activeId
                  ? 'border-primary/40 bg-white text-ink-800 shadow-soft'
                  : 'border-ink/10 bg-white/50 text-ink-500 hover:border-primary/25',
              )}
            >
              {file.label}
            </button>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Pill tone={validation.ok ? 'primary' : 'warn'}>
            {validation.ok ? 'Contenido válido' : `${validation.issues.length} problema(s)`}
          </Pill>
          <code className="text-xs text-ink-300">{active.path}</code>
        </div>

        <p className="mt-4 max-w-prose text-sm text-ink-400">{active.hint}</p>

        {!validation.ok ? (
          <ul className="mt-5 space-y-1.5 rounded-2xl border border-amber-500/25 bg-amber-500/5 p-5 text-sm text-amber-800">
            {validation.issues.slice(0, 8).map((issue) => (
              <li key={issue}>{issue}</li>
            ))}
          </ul>
        ) : null}

        <div className="mt-10">
          {active.id === 'modalities' ? (
            <ModalitiesEditor value={draft as ModalitiesDraft} onChange={update} />
          ) : active.id === 'recommender' ? (
            <RecommenderEditor value={draft as RecommenderDraft} onChange={update} />
          ) : (
            <JsonEditor value={json} onChange={(next) => update(next)} />
          )}
        </div>

        <div className="sticky bottom-0 mt-10 flex flex-wrap items-center gap-3 border-t border-ink/8 bg-ivory-paper/95 py-5 backdrop-blur-md">
          <Button onClick={download} disabled={!validation.ok}>
            Descargar {active.path.split('/').pop()}
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              void navigator.clipboard?.writeText(json);
            }}
          >
            Copiar JSON
          </Button>
          <Button variant="ghost" onClick={() => update(clone(active.data))}>
            Descartar cambios
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Editores                                                            */
/* ------------------------------------------------------------------ */

type ModalitiesDraft = { version: string; items: ModalityDraft[] };
type ModalityDraft = {
  id: string;
  name: string;
  claim: string;
  category: string;
  evidenceLevel: string;
  blocks: Record<string, string>;
  practical: {
    durationMinutes: number;
    formats: string[];
    price: number | null;
    priceNote: string;
    availability: string;
    sessionRange: { min: number; max: number };
    contraindications: string[];
    preparation: string;
  };
  adminNote: string;
};

const BLOCK_LABELS: Record<string, string> = {
  whatItIs: 'Qué es',
  howSessionGoes: 'Cómo es una sesión',
  whyPeopleChoose: 'Por qué algunas personas la eligen',
  whatWeKnow: 'Lo que sabemos',
  whatItIsNot: 'Lo que no es',
};

function ModalitiesEditor({ value, onChange }: { value: ModalitiesDraft; onChange: (next: ModalitiesDraft) => void }) {
  const setItem = (index: number, item: ModalityDraft) => {
    const items = [...value.items];
    items[index] = item;
    onChange({ ...value, items });
  };

  return (
    <div className="space-y-4">
      {value.items.map((item, index) => (
        <details key={item.id} className="group rounded-[1.5rem] border border-ink/8 bg-white/70 p-6">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
            <span className="font-serif text-title font-light text-ink-800">{item.name}</span>
            <span aria-hidden className="text-ink-300 transition-transform duration-300 group-open:rotate-45">
              +
            </span>
          </summary>

          <div className="mt-7 grid gap-5 md:grid-cols-2">
            <Field label="Nombre" value={item.name} onChange={(name) => setItem(index, { ...item, name })} />
            <Field label="Frase corta" value={item.claim} onChange={(claim) => setItem(index, { ...item, claim })} />
            <Field
              label="Duración (minutos)"
              type="number"
              value={String(item.practical.durationMinutes)}
              onChange={(next) =>
                setItem(index, {
                  ...item,
                  practical: { ...item.practical, durationMinutes: Number(next) || 0 },
                })
              }
            />
            <Field
              label="Precio (vacío = consultar)"
              type="number"
              value={item.practical.price === null ? '' : String(item.practical.price)}
              onChange={(next) =>
                setItem(index, {
                  ...item,
                  practical: { ...item.practical, price: next === '' ? null : Number(next) },
                })
              }
            />
            <Field
              label="Disponibilidad"
              value={item.practical.availability}
              onChange={(availability) => setItem(index, { ...item, practical: { ...item.practical, availability } })}
            />
            <Field
              label="Máximo de encuentros iniciales (1-3)"
              type="number"
              value={String(item.practical.sessionRange.max)}
              onChange={(next) =>
                setItem(index, {
                  ...item,
                  practical: {
                    ...item.practical,
                    sessionRange: { ...item.practical.sessionRange, max: Math.min(3, Math.max(1, Number(next) || 1)) },
                  },
                })
              }
            />
          </div>

          <div className="mt-6 grid gap-5">
            {Object.entries(item.blocks).map(([key, text]) => (
              <Field
                key={key}
                label={BLOCK_LABELS[key] ?? key}
                value={text}
                multiline
                onChange={(next) => setItem(index, { ...item, blocks: { ...item.blocks, [key]: next } })}
              />
            ))}

            <Field
              label="Nota interna (no se publica)"
              value={item.adminNote}
              multiline
              onChange={(adminNote) => setItem(index, { ...item, adminNote })}
            />
          </div>
        </details>
      ))}
    </div>
  );
}

type RecommenderDraft = {
  engine: { sessions: { hardCap: number } };
  modalityProfiles: Array<{
    id: string;
    name: string;
    vector: Record<string, number>;
    bonuses: Record<string, number>;
    maxInitialSessions: number;
  }>;
};

function RecommenderEditor({ value, onChange }: { value: RecommenderDraft; onChange: (next: RecommenderDraft) => void }) {
  const setProfile = (index: number, profile: RecommenderDraft['modalityProfiles'][number]) => {
    const modalityProfiles = [...value.modalityProfiles];
    modalityProfiles[index] = profile;
    onChange({ ...value, modalityProfiles });
  };

  return (
    <div className="space-y-4">
      <p className="max-w-prose text-sm text-ink-400">
        La afinidad de cada dimensión se expresa de 0 a 3. El tope de encuentros iniciales nunca puede superar 3, y el
        motor sólo sugiere más de uno cuando la persona pidió explícitamente un proceso y la afinidad es alta.
      </p>

      {value.modalityProfiles.map((profile, index) => (
        <details key={profile.id} className="group rounded-[1.5rem] border border-ink/8 bg-white/70 p-6">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
            <span className="font-serif text-title font-light text-ink-800">{profile.name}</span>
            <span aria-hidden className="text-ink-300 transition-transform duration-300 group-open:rotate-45">
              +
            </span>
          </summary>

          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {DIMENSION_IDS.map((dimension) => (
              <label key={dimension} className="block">
                <span className="text-sm text-ink-500">{DIMENSION_LABELS[dimension]}</span>
                <input
                  type="range"
                  min={0}
                  max={3}
                  step={1}
                  value={profile.vector[dimension] ?? 0}
                  onChange={(event) =>
                    setProfile(index, {
                      ...profile,
                      vector: { ...profile.vector, [dimension]: Number(event.target.value) },
                    })
                  }
                  className="mt-2 w-full accent-primary"
                />
                <span className="tabular text-xs text-ink-300">{profile.vector[dimension] ?? 0}</span>
              </label>
            ))}
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Field
              label="Máximo de encuentros iniciales (1-3)"
              type="number"
              value={String(profile.maxInitialSessions)}
              onChange={(next) =>
                setProfile(index, { ...profile, maxInitialSessions: Math.min(3, Math.max(1, Number(next) || 1)) })
              }
            />
            <div>
              <span className="text-sm text-ink-500">Bonus por preferencia</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {Object.entries(profile.bonuses).map(([tag, bonus]) => (
                  <label key={tag} className="flex items-center gap-2 rounded-full border border-ink/10 px-3 py-1.5 text-xs">
                    <span className="text-ink-500">{tag}</span>
                    <input
                      type="number"
                      min={0}
                      max={5}
                      value={bonus}
                      onChange={(event) =>
                        setProfile(index, {
                          ...profile,
                          bonuses: { ...profile.bonuses, [tag]: Number(event.target.value) || 0 },
                        })
                      }
                      className="tabular w-12 rounded-md border border-ink/10 bg-white px-1.5 py-1 text-right"
                    />
                  </label>
                ))}
              </div>
            </div>
          </div>
        </details>
      ))}
    </div>
  );
}

function JsonEditor({ value, onChange }: { value: string; onChange: (next: unknown) => void }) {
  const [text, setText] = useState(value);
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <textarea
        value={text}
        spellCheck={false}
        rows={26}
        onChange={(event) => {
          const next = event.target.value;
          setText(next);
          try {
            onChange(JSON.parse(next));
            setError(null);
          } catch (parseError) {
            setError(parseError instanceof Error ? parseError.message : 'JSON inválido');
          }
        }}
        className="w-full rounded-2xl border border-ink/10 bg-white/80 p-5 font-mono text-xs leading-relaxed text-ink-700 focus:border-primary/40 focus:outline-none"
      />
      {error ? <p className="mt-3 text-sm text-amber-700">{error}</p> : null}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  multiline = false,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
  multiline?: boolean;
  type?: 'text' | 'number';
}) {
  const shared =
    'mt-2 w-full rounded-xl border border-ink/10 bg-white px-3.5 py-2.5 text-sm text-ink-700 focus:border-primary/40 focus:outline-none';

  return (
    <label className="block">
      <span className="text-sm text-ink-500">{label}</span>
      {multiline ? (
        <textarea value={value} rows={3} onChange={(event) => onChange(event.target.value)} className={shared} />
      ) : (
        <input type={type} value={value} onChange={(event) => onChange(event.target.value)} className={shared} />
      )}
    </label>
  );
}
