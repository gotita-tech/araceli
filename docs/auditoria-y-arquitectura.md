# Tu Mapa Interior — auditoría y arquitectura

Documento de trabajo previo y posterior a la implementación. Recoge las decisiones
tomadas, sus motivos y los puntos que quedan abiertos.

---

## 1. Auditoría conceptual de los requisitos

### 1.1 La frontera que ordena todo el producto

El encargo separa cuatro categorías y sólo permite tres en el sitio:

| Categoría | En el sitio | Cómo se trata |
| --- | --- | --- |
| Experiencias de bienestar | Sí | Reiki, Barras de Access, Access Facelift |
| Prácticas espirituales | Sí | ThetaHealing, Canalización, Limpieza energética |
| Métodos complementarios | Sí | Método Yuen, Liberación de emociones, Biomagnetismo |
| Intervención médica o psicológica | **No** | Enrutamiento de seguridad hacia profesionales cualificados |

Esta frontera no es un aviso legal al pie: es una regla de arquitectura. El motor
no puntúa cuando detecta una situación sanitaria, las fichas incluyen un bloque
obligatorio «Lo que no es», y ninguna afirmación de eficacia aparece en el copy.

### 1.2 Tensiones detectadas y cómo se resolvieron

**a) «Afinidad» sin sonar a diagnóstico.** Un porcentaje grande junto al nombre
de una terapia se lee como eficacia. Se resolvió con tres decisiones: la palabra
siempre es *afinidad*, el panel de explicabilidad explica en una frase que mide
compatibilidad con preferencias, y el ranking completo lleva una nota que repite
que no ordena por eficacia.

**b) El biomagnetismo era irrecomendable por diseño.** El encargo prohíbe
recomendarlo a partir de síntomas y sólo permite subir su afinidad si la persona
declara interés explícito en imanes o prácticas energéticas corporales. Como
ninguna de las nueve preguntas menciona imanes, la modalidad quedaba inalcanzable
—y su comprobación de seguridad, muerta—. Solución: el interés energético abre su
entrada en el ranking, y en el resultado hay una casilla explícita («me interesan
también las experiencias con imanes») que es la única vía para que suba. Antes de
mostrarla siempre aparece la comprobación de dispositivos implantados.

**c) El enrutamiento de seguridad necesitaba una entrada de texto.** El
cuestionario es de opción múltiple y no puede detectar una crisis. Se añadió un
último paso **opcional** de texto libre cuya única función es la seguridad: se
analiza en el navegador, no puntúa, no se guarda y no viaja a ningún servidor.

**d) Auto-avance contra control.** El avance automático tras elegir opción hace
que el cuestionario fluya, pero puede saltarse una pregunta si la persona pulsa
«Continuar» a la vez. El avance es idempotente: la acción lleva el paso desde el
que se generó y el reductor ignora las que no corresponden.

**e) Testimonios y formación.** No se inventa nada. Los testimonios pendientes se
muestran como espacios vacíos identificados y la cronología de formación indica
«Año por confirmar» hasta que Araceli entregue los datos reales.

### 1.3 Lo que queda pendiente de Araceli

- Nombre exacto del método de «Liberación de emociones» (no se asume que sea EFT).
- Años, escuelas, certificaciones y ubicación de cada formación.
- Testimonios reales con consentimiento.
- Precios, disponibilidad y canales de contacto.
- Fotografías (retrato y, si procede, de las formaciones).

Todo ello está modelado en `/content` y editable desde `/admin` sin tocar código.

---

## 2. Arquitectura UX

### 2.1 Principio rector

La persona no tiene por qué saber qué terapia quiere. El sitio invierte el orden
habitual: primero **cómo te gustaría sentirte**, después la modalidad.

### 2.2 Recorridos

```
Portada ──► Mapa Interior (modal)          ──► Resultado ──► Conversar
   │                 ▲                                  └─► Ficha de práctica
   │                 │
   ├── Botón flotante permanente
   ├── /mapa-interior (misma experiencia en página completa)
   ├── /practicas ──► /practicas/[slug]
   └── /sobre-araceli, /privacidad, /conversar
```

La experiencia vive en un único componente (`MapExperience`) que se monta tanto
en el modal como en la página dedicada: una sola lógica, dos envolturas.

### 2.3 Arquitectura de la portada

1. Hero (90–100 vh) con agua viva.
2. **No necesitas saber qué terapia elegir** — seis conceptos orbitando una onda.
3. Teaser del Mapa Interior (banda oscura, figura que respira entre ejemplos).
4. Selector de intención.
5. Modalidades en composición bento por grupos.
6. Cómo funciona una sesión.
7. Trayectoria de Araceli.
8. Filosofía «Tus creencias crean tu vida».
9. Testimonios.
10. Preguntas frecuentes.
11. CTA final.
12. Pie con el marco legal.

### 2.4 El cuestionario

Nueve preguntas, 90–150 segundos, indicador `03 / 09`. Preguntas 1 y 7 admiten
dos respuestas; la 6 es una escala semántica de tres estados sin números; la 4 y
la 9 usan tarjetas. Después, un paso opcional de contexto y el resultado.

---

## 3. Arquitectura visual

**Concepto: Resonancia.** Una gota cae sobre agua inmóvil y genera ondas
concéntricas. De ahí sale todo: el isotipo (gota + tres anillos + cuatro arcos
que insinúan la flor de la identidad), los fondos, la figura del mapa y la
microinteracción del botón flotante.

Lo que se evitó deliberadamente: galaxias, estrellas, dorados, chakras de
colores, lunas, tarot, glow morado y cristales flotantes.

Referencias de tono: Apple, Calm, Linear, Aesop, minimalismo japonés.

---

## 4. Sistema de diseño

### 4.1 Color

Todo deriva del azul primario (#436BDE): mismo tono (≈224°), distintas
saturaciones y luminosidades.

| Token | Valor | Uso |
| --- | --- | --- |
| `primary` | `#436BDE` | Acento, foco, trazos de la figura |
| `secondary` | `#6E8BD9` | Degradados, agua |
| `mist` | `#98ACDB` | Superficies del agua, estados suaves |
| `ivory` | `#F0F2DB` | Texto sobre oscuro, secciones cálidas |
| `ivory-paper` | `#FBFBF4` | Fondo general |
| `ink-900 … ink-300` | `#070C20` → `#8791A8` | Texto y secciones oscuras |

### 4.2 Tipografía

Dos familias, ni una más. **Newsreader** (serif editorial, pesos 200–400) para
titulares y citas; **Inter** (300–600) para la interfaz. Escala fluida con
`clamp()` en `display`, `headline`, `title` y `lede`.

### 4.3 Espacio y forma

Mucho espacio negativo (`py-20` a `py-36` por sección), radios generosos
(1,75–2 rem), líneas de 1 px al 6–10 % de opacidad y sombras muy difusas. El
cristal del botón flotante es sutil, nunca un efecto llamativo.

---

## 5. Estructura del recomendador

```
lib/recommender/
├── types.ts                  Vector, preferencias, contrato del resultado
├── schema.ts                 Validación Zod del contenido administrable
├── config.ts                 Punto único de lectura y validación
├── questions.ts              Preguntas, progreso y señal
├── modalities.ts             Matriz de afinidad
├── weights.ts                Pesos, vectores, preferencias derivadas
├── safety-rules.ts           Enrutamiento de seguridad y comprobaciones
├── result-explainer.ts       Del resultado estructurado al lenguaje humano
└── recommendation-engine.ts  Cálculo determinista
```

Ningún modelo de lenguaje interviene en el ranking. Un LLM podría, más adelante,
redactar el resultado ya calculado, pero nunca modificar puntuaciones ni saltarse
las reglas de seguridad.

Detalle completo del cálculo: [`motor-de-recomendacion.md`](./motor-de-recomendacion.md).

---

## 6. Modelo de datos

Todo el contenido administrable vive en `/content` como JSON validado con Zod en
tiempo de build. Si un dato obligatorio falta o es incoherente, el build falla.

| Archivo | Contiene |
| --- | --- |
| `site.json` | Marca, navegación, textos de todas las secciones, contacto, privacidad |
| `modalities.json` | Ficha editorial y comercial de cada práctica (cinco bloques obligatorios) |
| `recommender.json` | Preguntas, pesos del motor y matriz de afinidad |
| `safety.json` | Enrutamiento de seguridad, comprobaciones y avisos |
| `faq.json`, `testimonials.json`, `about.json` | Preguntas frecuentes, testimonios, trayectoria |

`lib/content/index.ts` además cruza ambos mundos: toda modalidad puntuable debe
tener ficha, y toda ficha debe tener perfil de afinidad.

---

## 7. Componentes

```
components/
├── layout/     Header, Footer, SkipLink
├── sections/   Hero, NoNeedToKnow, MapTeaser, IntentSelector, ModalitiesBento,
│               SessionFlow, AboutTeaser, Philosophy, Testimonials, Faq, FinalCta
├── map/        MapProvider, MapExperience, MapModal, MapPage, QuestionStep,
│               NoteStep, ResultScreen, WhyPanel, SafetyScreen,
│               SafetyCheckDialog, FloatingMapButton
├── visual/     RippleMark, StaticRipples, WaterField, DropletScene, MapShape
├── admin/      AdminStudio
└── ui/         Button, Reveal, Section, Pill
```

Las secciones son Server Components salvo cuando necesitan interacción; el WebGL
se carga con `dynamic(..., { ssr: false })` sólo cuando va a usarse.

---

## 8. Estados responsive

- **Móvil (< 640 px).** Una columna. El cuestionario ocupa el alto completo con
  la figura reducida en cabecera; opciones a ancho completo con 52 px de alto.
  El agua es siempre estática. Objetivos táctiles ≥ 44 px.
- **Tablet (640–1024 px).** Dos columnas en bento; WebGL activo con densidad de
  píxeles reducida.
- **Escritorio (> 1024 px).** Figura fija en columna lateral durante el
  cuestionario, con etiquetas de las seis dimensiones; bento asimétrico.

---

## 9. Animaciones

| Elemento | Técnica | Duración |
| --- | --- | --- |
| Aparición de secciones | Framer Motion `whileInView` | 0,75 s |
| Pasos del cuestionario | Remontaje por `key` + entrada | 0,45 s |
| Figura del mapa | Un muelle por dimensión | continuo |
| Modal | Montaje controlado + transición CSS | 0,3–0,5 s |
| Botón flotante | Respiración de la onda | 6 s |
| Agua del hero | Shader de ondas amortiguadas | 60 fps |

Decisión relevante: el modal **no** depende de `AnimatePresence`. Su subárbol
contiene animaciones anidadas y la salida debe ser siempre determinista, así que
se controla con montaje explícito y transiciones CSS.

---

## 10. Accesibilidad y rendimiento

**Accesibilidad (WCAG 2.2 AA).**

- Controles nativos (`radio`/`checkbox`) bajo la apariencia de tarjetas: teclado
  y lectores de pantalla funcionan sin reimplementar nada.
- Diálogo con `role="dialog"`, `aria-modal`, foco atrapado y devuelto, y cierre
  con `Escape`.
- Cambios de paso anunciados por región `aria-live`.
- La figura tiene equivalente textual («Ver el mapa en palabras») con los
  porcentajes de cada dimensión.
- Enlace de salto al contenido, foco visible en todo el sitio y áreas táctiles
  ampliadas en enlaces de texto.
- `prefers-reduced-motion` respetado en CSS y en JavaScript; sin JavaScript, el
  contenido animado se muestra igualmente.

**Rendimiento.**

- 21 rutas estáticas; ~103 kB de JS compartido y ~191 kB en la portada.
- Three.js sólo se descarga si el dispositivo lo justifica y el bloque está en
  pantalla; en teléfonos se sirve la versión estática.
- Un único plano con shader: sin partículas ni geometría pesada.
