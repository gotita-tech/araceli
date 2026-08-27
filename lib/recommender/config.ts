import rawRecommender from '@/content/recommender.json';
import rawSafety from '@/content/safety.json';

import { recommenderFileSchema, safetyFileSchema } from './schema';

/**
 * Punto único de lectura del contenido administrable del recomendador.
 * Si el JSON editado desde administración no cumple el esquema, el fallo aparece
 * en tiempo de build y nunca llega a producción con datos incoherentes.
 */
export const recommenderConfig = recommenderFileSchema.parse(rawRecommender);
export const safetyConfig = safetyFileSchema.parse(rawSafety);
