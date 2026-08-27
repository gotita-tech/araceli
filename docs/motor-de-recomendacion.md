# Motor de orientación

Cómo se calcula un Mapa Interior, por qué es reproducible y qué límites tiene.

## Contrato

```ts
type RecommendationResult = {
  dimensions: WellnessVector        // normalizadas 0-1, listas para visualizar
  primaryModality: ModalityId | null
  secondaryModality: ModalityId | null
  affinity: number                  // 0-100, afinidad declarada
  confidence: 'low' | 'medium' | 'high'
  reasons: string[]
  initialPath: { sessions: number; requiresReassessment: boolean }
  safetyFlags: string[]
  // información adicional para la interfaz
  rawDimensions: WellnessVector
  ranking: ScoredModality[]
  secondaryAffinity: number | null
  activeTags: PreferenceTag[]
  openMap: boolean
  twoPaths: boolean
  signal: number
}
```

## Pasos del cálculo

1. **Seguridad primero.** Se analiza el texto opcional. Si hay bandera clínica o
   de urgencia, el motor devuelve un resultado vacío con `safetyFlags` y **no
   puntúa nada**. No se propone ninguna modalidad alternativa.
2. **Vector de la persona.** Cada opción elegida suma sus deltas sobre las seis
   dimensiones. «No forma parte de mi vida» resta en espiritualidad.
3. **Preferencias.** Se recogen las declaradas y se derivan unas pocas con reglas
   explícitas:
   - `headTouch`: acepta contacto suave **y** pidió pausa, silencio o autocuidado.
   - `faceNeckTouch`: lo anterior **y** pidió expresamente una experiencia corporal.
   - `ritualInterest`: cercanía declarada con lo espiritual **y** interés
     energético o intuitivo.
   - `magnetInterest`: **nunca se deriva**; requiere petición explícita.
4. **Ajuste por dimensiones.** Similitud de coseno entre el vector de la persona
   (recortado a cero) y el de cada modalidad → 0-1.
5. **Ajuste por preferencias.** Bonus obtenidos ÷ bonus máximos de esa modalidad → 0-1.
6. **Límites y atenuaciones.**
   - «Sin contacto» excluye toda modalidad con contacto.
   - «Poco contacto» las atenúa (×0,72).
   - «Online» excluye lo no disponible online.
   - Espiritualidad ausente atenúa las modalidades marcadamente espirituales (×0,55).
   - `requiresAnyTag` excluye la modalidad si no hay interés declarado.
7. **Puntuación.** `score = (0,62 × dimensiones + 0,38 × preferencias) × atenuación`.
8. **Afinidad.** El rango útil de `score` se proyecta a 38–96 %. Es una escala de
   compatibilidad, no de eficacia.
9. **Orden.** Por afinidad y, en empate, por identificador: mismas respuestas →
   mismo orden, siempre.

## Confianza

`signal` mide cuántas de las seis preguntas con carga informativa se respondieron
con algo distinto de «todavía no lo sé».

| Situación | Resultado |
| --- | --- |
| `signal` < 0,45 | `low` → **mapa abierto**, sin modalidad destacada |
| diferencia ≥ 8 puntos y `signal` ≥ 0,6 | `high` → «Afinidad alta» |
| diferencia ≥ 4 puntos | `medium` |
| diferencia ≤ 5 puntos | además `twoPaths` → «Dos caminos compatibles» |

Con mapa abierto no se inventa una recomendación: se propone conversar.

## Ruta inicial

Nunca es una prescripción y nunca supera **tres** encuentros (tope duro en
código, no sólo en configuración).

| Respuesta a la pregunta 9 | Confianza | Sugerencia |
| --- | --- | --- |
| «Una primera experiencia» | cualquiera | 1 sesión |
| «Un proceso» | `high` | 1–2 encuentros, según `maxInitialSessions` |
| «Un proceso» | `medium` / `low` | 1 sesión |

Siempre con `requiresReassessment: true`: después de los primeros encuentros toca
revisar la experiencia antes de decidir cómo continuar.

## Explicabilidad

`result-explainer.ts` construye la frase con las dos dimensiones más altas y las
preferencias que además puntúan en esa modalidad concreta:

> Elegimos esta opción porque nos dijiste que buscas principalmente calma,
> prefieres una experiencia tranquila y te sientes cómodo/a con el contacto suave.

Nunca se afirma que un algoritmo detectó algo sobre la persona.

## Ajustar el motor

Todo lo tocable vive en `content/recommender.json` (y se edita desde `/admin`):

- `engine.dimensionWeight` / `preferenceWeight` — deben sumar 1.
- `engine.confidence` — umbrales de confianza y de «dos caminos».
- `engine.modifiers` — atenuaciones.
- `modalityProfiles[].vector` — afinidad 0-3 por dimensión.
- `modalityProfiles[].bonuses` — bonus por preferencia.
- `modalityProfiles[].maxInitialSessions` — máximo 3.

Tras cualquier ajuste: `npm test` comprueba reproducibilidad, límites de contacto
y formato, tope de sesiones, enrutamiento de seguridad y coherencia del ranking.

## Lo que el motor no hace

- No diagnostica ni infiere estados de salud.
- No interpreta las respuestas como síntomas.
- No recomienda biomagnetismo por dolor, enfermedad o síntoma alguno.
- No usa un modelo de lenguaje para decidir.
- No guarda nada: el cálculo ocurre en el navegador de la persona.
