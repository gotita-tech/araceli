import { recommenderConfig } from './config';
import type { Answers, Question, QuestionOption } from './types';

/** Las preguntas del cuestionario, en orden. Editables desde administración. */
export const QUESTIONS: Question[] = recommenderConfig.questions;

export const TOTAL_QUESTIONS = QUESTIONS.length;

export function getQuestion(id: string): Question | undefined {
  return QUESTIONS.find((question) => question.id === id);
}

export function getQuestionAt(index: number): Question | undefined {
  return QUESTIONS[index];
}

export function getOption(question: Question, optionId: string): QuestionOption | undefined {
  return question.options.find((option) => option.id === optionId);
}

/** Número mostrado en el indicador de progreso: "03 / 09". */
export function formatProgress(index: number, total: number = TOTAL_QUESTIONS): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${pad(Math.min(index + 1, total))} / ${pad(total)}`;
}

/**
 * Una pregunta aporta señal al mapa cuando al menos dos de sus opciones mueven
 * las dimensiones. Las preguntas de preferencia y logística (contacto, formato,
 * ritmo) no cuentan para medir cuán concluyentes son las respuestas.
 */
export function isSignalQuestion(question: Question): boolean {
  const withVector = question.options.filter((option) => Object.keys(option.vector).length > 0);
  return withVector.length >= 2;
}

export const SIGNAL_QUESTION_IDS: string[] = QUESTIONS.filter(isSignalQuestion).map((q) => q.id);

export function isQuestionAnswered(answers: Answers, questionId: string): boolean {
  const value = answers[questionId];
  return Array.isArray(value) && value.length > 0;
}

export function areAllQuestionsAnswered(answers: Answers): boolean {
  return QUESTIONS.every((question) => isQuestionAnswered(answers, question.id));
}

/** Elimina respuestas que ya no existen en la configuración vigente. */
export function sanitizeAnswers(answers: Answers): Answers {
  const clean: Answers = {};
  for (const question of QUESTIONS) {
    const chosen = answers[question.id];
    if (!Array.isArray(chosen)) continue;
    const validIds = chosen.filter((optionId) => question.options.some((option) => option.id === optionId));
    if (validIds.length > 0) {
      clean[question.id] = validIds.slice(0, question.maxChoices);
    }
  }
  return clean;
}
