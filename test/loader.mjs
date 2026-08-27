import { registerHooks } from 'node:module';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

/**
 * Permite ejecutar los módulos del motor con el runner nativo de Node:
 * - resuelve el alias "@/" igual que Next.js,
 * - completa la extensión .ts de los imports relativos,
 * - carga los JSON de contenido sin necesidad de import attributes.
 */
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

registerHooks({
  resolve(specifier, context, nextResolve) {
    let target = specifier;

    if (target.startsWith('@/')) {
      target = pathToFileURL(path.join(root, target.slice(2))).href;
    }

    const isRelative = target.startsWith('./') || target.startsWith('../');
    const isFileUrl = target.startsWith('file:');
    if ((isRelative || isFileUrl) && !path.extname(target)) {
      try {
        return nextResolve(`${target}.ts`, context);
      } catch {
        // sigue con el especificador original
      }
    }

    return nextResolve(target, context);
  },
  load(url, context, nextLoad) {
    if (url.endsWith('.json')) {
      return nextLoad(url, { ...context, importAttributes: { ...context.importAttributes, type: 'json' } });
    }
    return nextLoad(url, context);
  },
});
