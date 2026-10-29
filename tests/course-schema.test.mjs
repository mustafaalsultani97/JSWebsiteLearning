import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { cleanProgress, freshProgress } from '../shared/progress.js';
import { lesson } from './helpers.mjs';

test('every existing lesson and reference bookmark fits the cloud progress schema', async () => {
  const source = await readFile(new URL('../javascript-course/script.js', import.meta.url), 'utf8');
  // Read authored content literals without running the application or its DOM code.
  const { COURSE, DATA } = vm.runInNewContext(source.slice(source.indexOf('const COURSE ='), source.indexOf('/* 3.')) + '\n({ COURSE, DATA })');
  const progress = freshProgress();
  progress.saved = DATA.flatMap(section => section.cards.map(card => card.id));
  progress.done = [...progress.saved];
  for (const item of COURSE.lessons) {
    progress.course.lessons[item.id] = { ...lesson(item.exercise.starter || ''), read: [0, 1], passed: true, best: 3 };
  }
  assert.equal(COURSE.lessons.length, 21);
  assert.equal(COURSE.lessons.reduce((n, item) => n + item.quiz.length, 0), 63);
  assert.equal(progress.saved.length, 207);
  const cleaned = cleanProgress(progress);
  assert.equal(cleaned.saved.length, 207);
  assert.equal(Object.keys(cleaned.course.lessons).length, 21);
});
