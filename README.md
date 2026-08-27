# Araceli · Tu Mapa Interior

Plataforma de orientación de bienestar. No es una landing de terapeuta: el
elemento central es **Tu Mapa Interior**, una experiencia de nueve preguntas que
dibuja una figura con las respuestas de la persona y muestra qué modalidades
tienen mayor **afinidad** con aquello que hoy quiere explorar.

Todo lo que aparece aquí son experiencias de bienestar, prácticas espirituales o
métodos complementarios. No hay intervenciones médicas ni psicológicas, no se
diagnostica y nada sustituye a la atención sanitaria.

## Empezar

```bash
npm install
npm run dev
```

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript en modo estricto |
| `npm test` | Pruebas del motor de orientación |
| `npm run check` | Lint + typecheck + pruebas |

Las pruebas se ejecutan con el runner nativo de Node y un pequeño cargador
(`test/loader.mjs`) que resuelve el alias `@/` y los JSON de contenido.

## Rutas

| Ruta | Contenido |
| --- | --- |
| `/` | Portada |
| `/mapa-interior` | La experiencia en página completa |
| `/practicas` | Todas las prácticas |
| `/practicas/[slug]` | Ficha con los cinco bloques obligatorios |
| `/sobre-araceli` | Trayectoria y formación |
| `/conversar` | Canales de contacto |
| `/privacidad` | Cómo se tratan las respuestas |
| `/admin` | Estudio de contenido (sin indexar) |

El Mapa Interior también se abre desde el botón flotante, presente en todo el
sitio.

## Editar contenido sin tocar código

Todo lo administrable vive en `/content` como JSON validado con Zod:

```
content/
├── site.json           Titulares, secciones, contacto, textos legales
├── modalities.json     Ficha de cada práctica: los cinco bloques y los datos comerciales
├── recommender.json    Preguntas, pesos del motor y matriz de afinidad
├── safety.json         Enrutamiento de seguridad y comprobaciones previas
├── faq.json            Preguntas frecuentes
├── testimonials.json   Testimonios (sólo reales)
└── about.json          Trayectoria y formación
```

En `/admin` hay un estudio que edita estos archivos con validación en vivo,
formularios para prácticas y para la matriz de afinidad, y descarga del JSON
resultante. Si un dato obligatorio falta o es incoherente, **el build falla**: no
llega a producción.

### Pendiente de completar con datos reales

- Nombre exacto del método de «Liberación de emociones» (no se asume que sea EFT).
- Años, escuelas, certificaciones y ubicaciones de cada formación.
- Testimonios con consentimiento de cada persona.
- Precios, disponibilidad y canales de contacto.
- Fotografías.

Hasta entonces el sitio lo dice de forma explícita: «Testimonio pendiente», «Año
por confirmar», «Consultar». Nada está inventado.

## Estructura

```
app/           Rutas (App Router)
components/    layout · sections · map · visual · admin · ui
lib/
├── recommender/   Motor determinista y reglas de seguridad
├── content/       Carga y validación del contenido
├── hooks/         reduced-motion, rendimiento, foco, montaje, scroll
├── storage.ts     Guardado local opcional del mapa
└── analytics.ts   Analítica respetuosa (desactivada por defecto)
content/       Contenido administrable
docs/          Auditoría, arquitectura y motor
test/          Pruebas del motor
```

## Reglas del producto

Estas no son preferencias de estilo: son restricciones del producto.

1. **Sin diagnóstico.** Ni el copy ni el motor infieren estados de salud.
   Lenguaje permitido: «Según lo que nos contaste…», «podría resultarte
   compatible», «afinidad alta», «ruta sugerida».
2. **Sin promesas de eficacia.** La afinidad mide compatibilidad con las
   preferencias declaradas, nunca probabilidad de funcionar.
3. **Seguridad antes que recomendación.** Si el texto opcional sugiere una
   situación que requiere atención sanitaria, no se puntúa nada y se acompaña
   hacia un profesional cualificado.
4. **Nunca más de tres encuentros.** Y sólo más de uno si la persona pidió un
   proceso y la afinidad es alta. Siempre con pausa de revisión.
5. **El biomagnetismo no se ofrece por síntomas.** Requiere interés declarado y
   pasa por una comprobación de dispositivos implantados.
6. **Privacidad por defecto.** Sin nombre, sin documento, sin historia clínica.
   El cálculo ocurre en el navegador y guardar es opcional.
7. **Nada inventado.** Ni testimonios, ni fechas, ni certificaciones.

## Decisiones técnicas

- **Next.js 15 (App Router) + React 19 + TypeScript estricto.** Rutas estáticas,
  Server Components donde es posible.
- **Tailwind 3.4** con el sistema de diseño en `tailwind.config.ts`.
- **Framer Motion 13.** La versión importa: en 12.43 las salidas de
  `AnimatePresence` no se completaban con React 19.2. El modal, además, usa
  montaje controlado (`usePresence`) porque su interior tiene animaciones
  anidadas y el cierre debe ser determinista.
- **React Three Fiber + Three.js** sólo en el agua del hero y del cierre: un
  plano con shader, cargado dinámicamente y sólo si el dispositivo lo justifica.
- **Zod** valida todo el contenido en build.
- **El recomendador no usa modelos de lenguaje.** Un LLM podría, más adelante,
  redactar el resultado ya calculado, pero nunca modificar puntuaciones ni
  saltarse las reglas de seguridad.

`npm run lint` usa `next lint`, que Next 16 retirará; la migración a la CLI de
ESLint está pendiente y no afecta al resultado actual.

## Despliegue en Vercel

El proyecto está preparado para desplegarse tal cual. Vercel detecta Next.js,
instala con el `package-lock.json` y ejecuta `npm run build`.

**Con la CLI, desde esta carpeta y sin necesidad de repositorio:**

```bash
npx vercel
```

Para publicar en producción:

```bash
npx vercel --prod
```

**Desde un repositorio Git:** el repositorio debe tener su raíz en esta carpeta
(`araceli-mapa-interior`), o bien indicar esa ruta en *Root Directory* al
importar el proyecto en Vercel.

### Variables de entorno

| Variable | Necesaria | Para qué sirve |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Recomendada | Dominio propio. Fija las URL canónicas, el sitemap y las etiquetas Open Graph. Sin ella se usa el dominio de Vercel y, en local, `content/site.json` |
| `ENABLE_ADMIN` | Opcional | `true` publica el estudio de contenido en `/admin`. Sin ella la ruta responde 404 en producción |

`.env.example` recoge ambas. Para desarrollo local, cópialo a `.env.local`.

### Comportamiento por entorno

- **Producción.** Se indexa, `robots.txt` apunta al sitemap y excluye `/admin`.
- **Previsualizaciones.** `robots.txt` responde `Disallow: /` y los metadatos
  llevan `noindex`: ningún despliegue de prueba acaba en un buscador.
- **`/admin`.** Se evalúa en cada petición, así que activar o desactivar
  `ENABLE_ADMIN` no exige volver a desplegar. Conviene mantenerlo cerrado:
  contiene notas internas de trabajo que no son contenido publicable. Si Araceli
  necesita acceso permanente, lo razonable es activarlo y añadir además la
  protección por contraseña de Vercel.

Todo el sitio es estático salvo `/admin`, así que el despliegue se sirve desde
CDN sin funciones de servidor en las rutas públicas.

## Documentación

- [Auditoría y arquitectura](./docs/auditoria-y-arquitectura.md) — decisiones de
  producto, UX, sistema visual, componentes, responsive, animación,
  accesibilidad y rendimiento.
- [Motor de orientación](./docs/motor-de-recomendacion.md) — cálculo,
  explicabilidad, seguridad y cómo ajustarlo.
