import { foundations } from './foundations.js';
import { controlFlow } from './control-flow.js';
import { functionsLessons } from './functions.js';
import { advanced } from './advanced.js';
import { legacyStarters } from './legacy-starters.js';

// Routes stay stable. Separate progress keys keep earlier drafts and quiz answers
// from being mistaken for attempts at these newly authored exercises.
export const lessonProgressKey = (lesson) => `${lesson.id}-v2`;
export const lessonProgressKeys = (lesson) => [lesson.id, lessonProgressKey(lesson)];
export const initialLessonCode = (lesson, key) => key === lesson.id ? legacyStarters[lesson.id] : (lesson.exercise.starter || '');
export const hasLessonWork = (state, starter) => !!state && (
  state.step > 0 || state.read.length > 0 || state.passed || state.best > 0 || state.submitted ||
  state.answers.some(answer => answer !== null) || state.order.length > 0 || state.code !== starter
);
export const COURSE = {
  modules: [
    { id:'foundations', label:'01', title:'Build your foundations', subtitle:'Variables, collections, debugging & Git', swedish:'Grunder, felsökning & versionshantering', source:'https://magical-naiad-bf501b.netlify.app/', sourceTitle:'JavaScript, Git & Felsökning · Week 43' },
    { id:'control', label:'02', title:'Make decisions. Repeat actions.', subtitle:'Conditions, logic, switches & loops', swedish:'Villkor, logik & loopar', source:'https://polite-licorice-1e8c5c.netlify.app/', sourceTitle:'Kontrollflöde & Logik · Week 43' },
    { id:'functions', label:'03', title:'Bring it together with functions', subtitle:'Reusable code, scope & small projects', swedish:'Funktioner, räckvidd & returvärden', source:'https://beamish-mermaid-cd1bc7.netlify.app/', sourceTitle:'Funktioner på Djupet · Week 44' },
    { id:'higher-order', label:'04', title:'Write flexible, focused functions', subtitle:'Callbacks, filter, map & AI-assisted refactoring', swedish:'Högre ordningens funktioner & AI-refaktorisering', source:'https://stalwart-gaufre-a22d54.netlify.app/', sourceTitle:'Högre Ordningens Funktioner & AI-Refaktorisering · Week 44' }
  ],
  lessons: [...foundations, ...controlFlow, ...functionsLessons, ...advanced]
};
