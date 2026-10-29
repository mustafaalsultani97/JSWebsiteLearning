import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { cleanProgress, freshProgress } from '../shared/progress.js';
import { lesson } from './helpers.mjs';
import { COURSE, lessonProgressKeys, initialLessonCode, hasLessonWork } from '../javascript-course/lessons/index.js';

test('every existing lesson and reference bookmark fits the cloud progress schema', async () => {
  const source = await readFile(new URL('../javascript-course/script.js', import.meta.url), 'utf8');
  // Read authored content literals without running the application or its DOM code.
  const { DATA } = vm.runInNewContext(source.slice(source.indexOf('const DATA ='), source.indexOf('/* 3.')) + '\n({ DATA })');
  const progress = freshProgress();
  progress.saved = DATA.flatMap(section => section.cards.map(card => card.id));
  progress.done = [...progress.saved];
  for (const item of COURSE.lessons) {
    for (const key of lessonProgressKeys(item)) {
      progress.course.lessons[key] = { ...lesson(initialLessonCode(item, key)), read: [0, 1], passed: true, best: 3 };
    }
  }
  assert.equal(COURSE.lessons.length, 21);
  assert.equal(COURSE.lessons.reduce((n, item) => n + item.quiz.length, 0), 63);
  assert.equal(progress.saved.length, 207);
  const cleaned = cleanProgress(progress);
  assert.equal(cleaned.saved.length, 207);
  assert.equal(Object.keys(cleaned.course.lessons).length, 42);
  // Browser validation must also preserve both editions through account loads/backups.
  const validation = source.slice(source.indexOf('function freshCourse()'), source.indexOf('function lessonState('));
  const browserCourse = vm.runInNewContext(validation + '\nvalidateCourse(value)', {
    COURSE, lessonProgressKeys, initialLessonCode, value: cleaned.course,
  });
  assert.equal(Object.keys(browserCourse.lessons).length, 42);
  for (const [key, state] of Object.entries(cleaned.course.lessons)) {
    assert.equal(browserCourse.lessons[key].code, state.code, key);
    assert.equal(browserCourse.lessons[key].best, 3, key);
  }
  for (const item of COURSE.lessons) {
    for (const key of lessonProgressKeys(item)) {
      assert.equal(hasLessonWork(lesson(initialLessonCode(item, key)), initialLessonCode(item, key)), false);
    }
  }
});
