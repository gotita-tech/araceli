import assert from 'node:assert/strict';
import test from 'node:test';

import { MODALITY_PROFILES, requiresTouch } from '../lib/recommender/modalities.ts';
import { QUESTIONS, TOTAL_QUESTIONS, formatProgress } from '../lib/recommender/questions.ts';
import { recommend } from '../lib/recommender/recommendation-engine.ts';
import { auditQuestionText, scanFreeText } from '../lib/recommender/safety-rules.ts';
import type { Answers } from '../lib/recommender/types.ts';
import { ENGINE } from '../lib/recommender/weights.ts';

const calmSeeker: Answers = {
  intention: ['calm', 'gift'],
  disconnect: ['breathe'],
  space: ['tiredness'],
  experience: ['deep-relax'],
  touch: ['yes'],
  spirituality: ['curious'],
  expectation: ['relax'],
  format: ['in-person'],
  rhythm: ['single'],
};

const beliefsSeeker: Answers = {
  intention: ['patterns', 'connection'],
  disconnect: ['talk'],
  space: ['decisions'],
  experience: ['beliefs-talk'],
  touch: ['none'],
  spirituality: ['important'],
  expectation: ['patterns', 'spiritual'],
  format: ['online'],
  rhythm: ['process'],
};

const undecided: Answers = {
  intention: ['unknown'],
  disconnect: ['unsure'],
  space: ['none'],
  experience: ['no-preference'],
  touch: ['neutral'],
  spirituality: ['curious'],
  expectation: ['discovering'],
  format: ['any'],
  rhythm: ['single'],
};

test('el cuestionario respeta el máximo de nueve preguntas', () => {
  assert.ok(TOTAL_QUESTIONS <= 9, `hay ${TOTAL_QUESTIONS} preguntas`);
  assert.equal(formatProgress(2), `03 / ${String(TOTAL_QUESTIONS).padStart(2, '0')}`);
});

test('ninguna pregunta solicita datos personales o clínicos', () => {
  for (const question of QUESTIONS) {
    const texts = [question.title, question.helper ?? '', question.note ?? '', ...question.options.map((o) => o.label)];
    for (const text of texts) {
      assert.deepEqual(auditQuestionText(text), [], `texto sensible en ${question.id}: ${text}`);
    }
  }
});

test('el resultado es reproducible con las mismas respuestas', () => {
  const first = recommend({ answers: calmSeeker });
  const second = recommend({ answers: calmSeeker });
  assert.deepEqual(first, second);
});

test('quien busca calma y acepta contacto suave recibe una práctica de pausa', () => {
  const result = recommend({ answers: calmSeeker });
  assert.ok(result.primaryModality, 'debería existir una modalidad principal');
  assert.ok(
    ['barras-de-access', 'reiki', 'access-facelift'].includes(String(result.primaryModality)),
    `principal inesperada: ${result.primaryModality}`,
  );
  assert.equal(result.initialPath.sessions, 1, 'pidió una primera experiencia');
  assert.equal(result.initialPath.requiresReassessment, true);
  assert.ok(result.reasons.length > 0);
});

test('quien quiere mirar patrones y elige online recibe una práctica conversada disponible online', () => {
  const result = recommend({ answers: beliefsSeeker });
  assert.ok(['thetahealing', 'metodo-yuen', 'liberacion-emociones'].includes(String(result.primaryModality)));
  for (const item of result.ranking) {
    const profile = MODALITY_PROFILES.find((candidate) => candidate.id === item.id);
    assert.ok(profile?.formats.includes('online'), `${item.id} no está disponible online`);
  }
});

test('la preferencia "sin contacto" excluye cualquier modalidad con contacto', () => {
  const result = recommend({ answers: beliefsSeeker });
  for (const item of result.ranking) {
    const profile = MODALITY_PROFILES.find((candidate) => candidate.id === item.id);
    assert.ok(profile && !requiresTouch(profile), `${item.id} implica contacto físico`);
  }
  assert.ok(result.safetyFlags.includes('constraint:no-touch'));
});

test('el biomagnetismo nunca aparece sin interés explícito en prácticas energéticas', () => {
  const withoutInterest = recommend({ answers: calmSeeker });
  assert.ok(!withoutInterest.ranking.some((item) => item.id === 'biomagnetismo'));

  const energyInterested: Answers = {
    ...calmSeeker,
    experience: ['energy-space'],
    expectation: ['energy'],
  };
  const withInterest = recommend({ answers: energyInterested });
  assert.ok(withInterest.ranking.some((item) => item.id === 'biomagnetismo'));
});

test('quien puede excluir una modalidad tras la comprobación de seguridad no vuelve a verla', () => {
  const energyInterested: Answers = { ...calmSeeker, experience: ['energy-space'], expectation: ['energy'] };
  const result = recommend({ answers: energyInterested, excludedModalities: ['biomagnetismo'] });
  assert.ok(!result.ranking.some((item) => item.id === 'biomagnetismo'));
});

test('respuestas poco concluyentes dejan el mapa abierto en lugar de inventar una recomendación', () => {
  const result = recommend({ answers: undecided });
  assert.equal(result.openMap, true);
  assert.equal(result.primaryModality, null);
  assert.equal(result.confidence, 'low');
  assert.equal(result.affinity, 0);
});

test('el mapa vacío no propone nada', () => {
  const result = recommend({ answers: {} });
  assert.equal(result.primaryModality, null);
  assert.equal(result.openMap, true);
  assert.equal(result.signal, 0);
});

test('una situación que requiere atención sanitaria detiene cualquier puntuación', () => {
  const result = recommend({ answers: calmSeeker, freeText: 'Estoy en tratamiento psiquiátrico y tomo medicación.' });
  assert.deepEqual(result.ranking, []);
  assert.equal(result.primaryModality, null);
  assert.ok(result.safetyFlags.includes('safety:clinical'));
});

test('una situación de riesgo inmediato se marca como urgente', () => {
  const scan = scanFreeText('a veces pienso en quitarme la vida');
  assert.equal(scan.level, 'urgent');
  const result = recommend({ answers: calmSeeker, freeText: 'a veces pienso en quitarme la vida' });
  assert.ok(result.safetyFlags.includes('safety:urgent'));
  assert.equal(result.primaryModality, null);
});

test('no confunde palabras corrientes con banderas de seguridad', () => {
  assert.equal(scanFreeText('quiero cancelar el ruido mental y descansar').level, 'none');
  assert.equal(scanFreeText('me gusta el contacto suave').level, 'none');
});

test('la ruta inicial nunca supera el tope duro de encuentros', () => {
  const processAnswers: Answers = { ...beliefsSeeker, rhythm: ['process'] };
  const result = recommend({ answers: processAnswers });
  assert.ok(result.initialPath.sessions <= ENGINE.sessions.hardCap);
  assert.ok(result.initialPath.sessions <= 3);
  assert.equal(result.initialPath.requiresReassessment, true);
});

test('la afinidad siempre se mantiene dentro del rango presentable', () => {
  for (const answers of [calmSeeker, beliefsSeeker, undecided]) {
    const result = recommend({ answers });
    for (const item of result.ranking) {
      assert.ok(item.affinity >= ENGINE.affinityFloor && item.affinity <= ENGINE.affinityCeiling, `${item.id}: ${item.affinity}`);
    }
  }
});

test('quien declara que la espiritualidad no forma parte de su vida ve atenuadas las prácticas espirituales', () => {
  const base: Answers = { ...calmSeeker, spirituality: ['important'], experience: ['spiritual'] };
  const secular: Answers = { ...base, spirituality: ['absent'] };

  const openResult = recommend({ answers: base });
  const secularResult = recommend({ answers: secular });

  const affinityOf = (result: ReturnType<typeof recommend>, id: string) =>
    result.ranking.find((item) => item.id === id)?.affinity ?? 0;

  assert.ok(affinityOf(secularResult, 'canalizacion') < affinityOf(openResult, 'canalizacion'));
  assert.ok(affinityOf(secularResult, 'limpieza-energetica') < affinityOf(openResult, 'limpieza-energetica'));
});

test('dos caminos parecidos se señalan como tales', () => {
  const results = [calmSeeker, beliefsSeeker].map((answers) => recommend({ answers }));
  for (const result of results) {
    if (result.twoPaths) {
      assert.ok(result.secondaryModality, 'si hay dos caminos debe existir una segunda modalidad');
      assert.ok(Math.abs(result.affinity - (result.secondaryAffinity ?? 0)) <= ENGINE.confidence.twoPathsGap);
    }
  }
});

test('las dimensiones se normalizan entre 0 y 1', () => {
  const result = recommend({ answers: calmSeeker });
  for (const value of Object.values(result.dimensions)) {
    assert.ok(value >= 0 && value <= 1, `valor fuera de rango: ${value}`);
  }
});

test('cada modalidad declara un máximo administrable de encuentros iniciales dentro del tope', () => {
  for (const profile of MODALITY_PROFILES) {
    assert.ok(profile.maxInitialSessions >= 1 && profile.maxInitialSessions <= 3, profile.id);
  }
});

test('declarar interés explícito en imanes es la única vía que eleva el biomagnetismo', () => {
  const energyInterested: Answers = {
    ...calmSeeker,
    experience: ['energy-space'],
    expectation: ['energy'],
  };

  const base = recommend({ answers: energyInterested });
  const withMagnets = recommend({ answers: energyInterested, extraTags: ['magnetInterest'] });

  const affinityOf = (result: ReturnType<typeof recommend>) =>
    result.ranking.find((item) => item.id === 'biomagnetismo')?.affinity ?? 0;

  assert.ok(affinityOf(withMagnets) > affinityOf(base));
  assert.ok(withMagnets.activeTags.includes('magnetInterest'));
});

test('las preferencias declaradas después del cuestionario siguen siendo reproducibles', () => {
  const input = { answers: calmSeeker, extraTags: ['magnetInterest'] as const };
  const first = recommend({ answers: input.answers, extraTags: [...input.extraTags] });
  const second = recommend({ answers: input.answers, extraTags: [...input.extraTags] });
  assert.deepEqual(first, second);
});

test('toda modalidad con contraindicaciones declara su comprobación de seguridad', () => {
  const biomagnetismo = MODALITY_PROFILES.find((profile) => profile.id === 'biomagnetismo');
  assert.ok(biomagnetismo?.safetyCheckId, 'el biomagnetismo debe exigir comprobación previa');
  assert.deepEqual(biomagnetismo?.requiresAnyTag, ['energyInterest', 'magnetInterest']);
});
