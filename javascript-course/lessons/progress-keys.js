import { legacyStarters } from './legacy-starters.js';

// Stable routes and progress keys preserve learners' existing work.
export const lessonProgressKey = lesson => `${lesson.id}-v2`;
export const lessonProgressKeys = lesson => [lesson.id, lessonProgressKey(lesson)];
export const initialLessonCode = (lesson, key) => key === lesson.id ? legacyStarters[lesson.id] : (lesson.exercise.starter || '');
export const hasLessonWork = (state, starter) => !!state && (
  state.step > 0 || state.read.length > 0 || state.passed || state.best > 0 || state.submitted ||
  state.answers.some(answer => answer !== null) || state.order.length > 0 || state.code !== starter ||
  Object.keys(state.extra || {}).length > 0
);
