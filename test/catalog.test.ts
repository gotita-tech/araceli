import assert from 'node:assert/strict';
import test from 'node:test';

import { MODALITIES, modalitiesByGroup, site } from '../lib/content/index.ts';
import { MODALITY_PROFILES } from '../lib/recommender/modalities.ts';

test('las siete prácticas vigentes aparecen una sola vez en los grupos del catálogo', () => {
  const ids = ['thetahealing', 'barras-de-access', 'metodo-one', 'metodo-rsame', 'liberacion-emociones', 'limpieza-energetica', 'regresion-vidas-pasadas'];
  const rendered = site.modalitiesSection.groups.flatMap((group) => modalitiesByGroup(group.id));
  assert.deepEqual(rendered.map((item) => item.id).sort(), [...ids].sort());
  assert.equal(new Set(rendered.map((item) => item.id)).size, ids.length);
});

test('todos los accesos por intención y resultados del mapa llevan a una ficha vigente', () => {
  const ids = new Set(MODALITIES.map((item) => item.id));
  for (const intent of site.intentSelector.intents) {
    for (const id of intent.modalities) assert.ok(ids.has(id), `${intent.id} enlaza a ${id}`);
  }
  for (const profile of MODALITY_PROFILES) assert.ok(ids.has(profile.id), profile.id);
});

test('las propuestas nuevas no inventan duración, formato ni afinidad', () => {
  for (const id of ['metodo-one', 'metodo-rsame', 'regresion-vidas-pasadas']) {
    const item = MODALITIES.find((entry) => entry.id === id);
    assert.ok(item);
    assert.equal(item.practical.durationMinutes, null);
    assert.deepEqual(item.practical.formats, []);
    assert.equal(item.mapEnabled, false);
  }
});
