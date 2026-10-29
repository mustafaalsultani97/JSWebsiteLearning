import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';
import { COURSE, lessonProgressKey, lessonProgressKeys, initialLessonCode, hasLessonWork } from '../javascript-course/lessons/index.js';
import { cleanProgress, freshProgress, cleanExtraProgress, isExtraId, mergeProgress, copy } from '../shared/progress.js';
import { lesson as initialState } from './helpers.mjs';

const extra = (code = '', passed = false) => ({ code, passed, choice: null, submitted: false });
function execute(code) {
  const logs = [];
  const context = vm.createContext({ __logs: logs, console: { log: (...args) => logs.push(args) } });
  vm.runInContext(code, context, { timeout: 1000 });
  return context;
}
test('every lesson has ten independently selectable, stable extra exercise IDs', () => {
  assert.equal(COURSE.lessons.flatMap(l => l.extras).length, 210);
  for (const lesson of COURSE.lessons) {
    assert.deepEqual(lesson.extras.map(ex => ex.id), Array.from({ length: 10 }, (_, i) => `p${String(i + 1).padStart(2, '0')}`));
    assert.equal(new Set(lesson.extras.map(ex => ex.title)).size, 10);
  }
});
for (const lesson of COURSE.lessons) {
  test(`${lesson.id}: all ten extra solutions pass; all starters require learner work`, () => {
    for (const ex of lesson.extras) {
      const name = `${lesson.id}/${ex.id}: ${ex.title}`;
      assert.ok(ex.instructions.every(text => text.length > 20), name);
      if (ex.kind === 'choice') {
        assert.ok(Number.isInteger(ex.answer) && ex.answer >= 0 && ex.answer < ex.choices.length, name);
        assert.ok(ex.reasoning.length > 50, name);
        continue;
      }
      assert.ok(ex.hints.length > 0 && ex.solutionNotes.every(note => note.trim().length > 20), name);
      const context = execute(ex.solution);
      for (const check of ex.tests) {
        assert.equal(vm.runInContext(check.expression, context, { timeout: 1000 }), true, `${name}: ${check.label}`);
      }
      let passes = false;
      try {
        const starter = execute(ex.starter);
        passes = ex.tests.every(check => vm.runInContext(check.expression, starter, { timeout: 1000 }) === true);
      } catch { /* Scaffolds and repair tasks can intentionally be incomplete. */ }
      assert.equal(passes, false, `${name}: starter should not already pass`);
    }
  });
}
test('extra progress survives server/browser normalization without changing required achievements', async () => {
  const progress = freshProgress();
  for (const lesson of COURSE.lessons) {
    progress.course.lessons[lessonProgressKey(lesson)] = { ...initialState(lesson.exercise.starter || ''),
      step: 4, extraSelected: 'p07', extra: Object.fromEntries(lesson.extras.map(ex => [ex.id,
        { code: ex.solution || '', passed: true, choice: ex.kind === 'choice' ? ex.answer : null, submitted: ex.kind === 'choice' }])) };
  }
  const cleaned = cleanProgress(progress);
  const source = await readFile(new URL('../javascript-course/script.js', import.meta.url), 'utf8');
  const validation = source.slice(source.indexOf('function freshCourse()'), source.indexOf('function lessonState('));
  const course = vm.runInNewContext(validation + '\nvalidateCourse(value)', {
    COURSE, lessonProgressKeys, initialLessonCode, cleanExtraProgress, isExtraId, value: cleaned.course,
  });
  for (const lesson of COURSE.lessons) {
    const state = course.lessons[lessonProgressKey(lesson)];
    assert.equal(state.step, 4);
    assert.equal(state.extraSelected, 'p07');
    assert.equal(Object.keys(state.extra).length, 10);
    assert.equal(state.extra.p10.passed, true);
    assert.equal(state.passed, false);
    assert.equal(state.best, 0);
    assert.equal(state.read.length, 0);
    assert.equal(hasLessonWork(state, lesson.exercise.starter), true);
  }
  const core = source.slice(source.indexOf('function lessonComplete('), source.indexOf('function previousLessonState('));
  const lesson = COURSE.lessons[0], state = course.lessons[lessonProgressKey(lesson)];
  const complete = () => vm.runInNewContext(core + '\nlessonComplete(lesson)', { lesson, lessonState: () => state });
  assert.equal(complete(), false, 'Completing all extras cannot complete the required lesson');
  Object.assign(state, { read: [0,1], passed: true, best: 3, extra: {} });
  assert.equal(complete(), true, 'No extras are required for lesson completion');
});
test('old progress remains valid; invalid extra IDs and oversized drafts are rejected', () => {
  const value = freshProgress(); value.course.lessons.variables = initialState();
  assert.deepEqual(cleanProgress(value).course.lessons.variables.extra, {});
  assert.equal(cleanProgress(value).course.lessons.variables.extraSelected, null);
  for (const state of [{ p11: extra() }, { p01: extra('x'.repeat(60001)) }, { p01: { ...extra(), choice: 10 } }, { p01: { ...extra(), passed: 'yes' } }]) {
    value.course.lessons.variables.extra = state;
    assert.throws(() => cleanProgress(value));
  }
  value.course.lessons.variables.extra = {};
  value.course.lessons.variables.extraSelected = 'p00';
  assert.throws(() => cleanProgress(value));
});
test('concurrent devices preserve different extra drafts in the same lesson', () => {
  const base = freshProgress(); base.course.lessons.variables = { ...initialState(), extra: {}, extraSelected: null };
  const left = copy(base), right = copy(base);
  left.course.lessons.variables.extra.p02 = extra('left draft', true);
  left.course.lessons.variables.extraSelected = 'p02';
  right.course.lessons.variables.extra.p07 = extra('right draft');
  right.course.lessons.variables.passed = true;
  const merged = mergeProgress(base, left, right).course.lessons.variables;
  assert.equal(merged.extra.p02.code, 'left draft');
  assert.equal(merged.extra.p02.passed, true);
  assert.equal(merged.extra.p07.code, 'right draft');
  assert.equal(merged.extraSelected, 'p02');
  assert.equal(merged.passed, true);
});
test('same-exercise conflicts keep completion and merge draft and choice independently', () => {
  const base = freshProgress(); base.course.lessons.git = { ...initialState(), extra: { p01: extra('original') } };
  const left = copy(base), right = copy(base);
  left.course.lessons.git.extra.p01.code = 'edited draft';
  right.course.lessons.git.extra.p01 = { ...extra('original', true), choice: 2, submitted: true };
  const merged = mergeProgress(base, left, right).course.lessons.git.extra.p01;
  assert.deepEqual(merged, { code: 'edited draft', passed: true, choice: 2, submitted: true });
});
