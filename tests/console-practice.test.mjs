import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { CONSOLE_QUESTIONS as questions, CONSOLE_LEVELS as levels } from '../javascript-course/console-questions.js';
import { chooseConsoleAnswer, checkConsoleAnswer, consoleStats, renderConsolePractice } from '../javascript-course/console-practice.js';
import { freshProgress, freshConsoleProgress, cleanProgress, cleanConsoleProgress, mergeProgress, copy } from '../shared/progress.js';

test('100 distinct predictions have four unique choices and ten ordered levels', () => {
  assert.equal(questions.length, 100);
  assert.equal(new Set(questions.map(q => q.id)).size, 100);
  assert.equal(new Set(questions.map(q => q.code)).size, 100);
  assert.equal(new Set(questions.map(q => q.title)).size, 100);
  assert.equal(levels.length, 10);
  for (const [index, q] of questions.entries()) {
    assert.equal(q.id, `console-${String(index + 1).padStart(3, '0')}`);
    assert.equal(q.level, Math.floor(index / 10));
    assert.equal(q.choices.length, 4);
    assert.equal(new Set(q.choices).size, 4, q.id);
    assert.ok(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < 4);
    assert.ok(q.explanation.trim().length > 20, q.id);
  }
  for (let answer = 0; answer < 4; answer++) assert.equal(questions.filter(q => q.answer === answer).length, 25);
});

for (const q of questions) {
  test(`${q.id}: actual JavaScript output matches the answer — ${q.title}`, async () => {
    const lines = [];
    const context = vm.createContext({ console: { log: (...args) => {
      assert.ok(args.every(arg => arg === null || !['object', 'function'].includes(typeof arg)), 'Avoid browser-specific object formatting');
      lines.push(args.map(String).join(' '));
    } } });
    await vm.runInContext(`"use strict";\n${q.code}`, context, { timeout: 500 });
    // Drain chained promise microtasks even when the script returns undefined.
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(lines.join('\n'), q.choices[q.answer]);
  });
}

test('checking requires a choice, locks the submitted answer, and retries retain earned credit', () => {
  const state = freshConsoleProgress();
  const question = questions[0];
  assert.equal(checkConsoleAnswer(state), false);
  assert.equal(chooseConsoleAnswer(state, 4), false);
  assert.equal(chooseConsoleAnswer(state, (question.answer + 1) % 4), true);
  assert.equal(checkConsoleAnswer(state), true);
  assert.deepEqual(consoleStats(state), { answered: 1, solved: 0 });
  assert.equal(chooseConsoleAnswer(state, question.answer), false);
  assert.equal(checkConsoleAnswer(state), false);
  state.answers[question.id].submitted = false;
  assert.equal(chooseConsoleAnswer(state, question.answer), true);
  checkConsoleAnswer(state);
  assert.deepEqual(consoleStats(state), { answered: 1, solved: 1 });
  state.answers[question.id] = { choice: null, submitted: false, solved: true };
  chooseConsoleAnswer(state, (question.answer + 1) % 4);
  checkConsoleAnswer(state);
  assert.deepEqual(consoleStats(state), { answered: 1, solved: 1 });
});

test('old progress defaults safely and full console progress survives serialization', () => {
  const old = freshProgress();
  delete old.consolePractice;
  assert.deepEqual(cleanProgress(old).consolePractice, freshConsoleProgress());
  const progress = freshProgress();
  for (const q of questions) {
    progress.consolePractice.current = q.number - 1;
    chooseConsoleAnswer(progress.consolePractice, q.answer);
    checkConsoleAnswer(progress.consolePractice);
  }
  const restored = cleanProgress(JSON.parse(JSON.stringify(progress)));
  assert.deepEqual(restored, progress);
  assert.deepEqual(consoleStats(restored.consolePractice), { answered: 100, solved: 100 });
  assert.equal(restored.consolePractice.current, 99);
});

test('console progress rejects invalid IDs, choices, indexes and unbounded records', () => {
  const answer = { choice: 0, submitted: true, solved: false };
  for (const current of [-1, 100, 1.5, '1']) assert.throws(() => cleanConsoleProgress({ current, answers: {} }));
  for (const id of ['console-000', 'console-101', 'console-1', '__proto__']) {
    assert.throws(() => cleanConsoleProgress({ current: 0, answers: { [id]: answer } }));
  }
  for (const choice of [-1, 4, '0', undefined]) {
    assert.throws(() => cleanConsoleProgress({ current: 0, answers: { 'console-001': { ...answer, choice } } }));
  }
  assert.throws(() => cleanConsoleProgress({ current: 0, answers: [] }));
  assert.equal(cleanConsoleProgress({ current: 0, answers: { 'console-001': { ...answer, choice: null } } }).answers['console-001'].submitted, false);
});

test('independent question attempts merge across devices without losing lesson progress', () => {
  const base = freshProgress(), local = copy(base), remote = copy(base);
  chooseConsoleAnswer(local.consolePractice, questions[0].answer);
  checkConsoleAnswer(local.consolePractice);
  remote.consolePractice.current = 99;
  chooseConsoleAnswer(remote.consolePractice, questions[99].answer);
  checkConsoleAnswer(remote.consolePractice);
  remote.course.last = 'arrays';
  const merged = cleanProgress(mergeProgress(base, local, remote));
  assert.deepEqual(consoleStats(merged.consolePractice), { answered: 2, solved: 2 });
  assert.equal(merged.consolePractice.current, 99);
  assert.equal(merged.course.last, 'arrays');
});

test('a concurrent retry keeps the earned correct result and the draft as one attempt', () => {
  const base = freshProgress();
  chooseConsoleAnswer(base.consolePractice, 0);
  const local = copy(base), remote = copy(base);
  chooseConsoleAnswer(local.consolePractice, 2);
  chooseConsoleAnswer(remote.consolePractice, questions[0].answer);
  checkConsoleAnswer(remote.consolePractice);
  const merged = mergeProgress(base, local, remote);
  assert.deepEqual(merged.consolePractice.answers['console-001'], { choice: 2, submitted: false, solved: true });
});

test('rendering hides explanations until checked and handles the first and last questions', () => {
  const escape = s => String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
  const state = freshConsoleProgress();
  let html = renderConsolePractice(state, escape, escape, 'Saved locally.');
  assert.equal((html.match(/name="console-answer"/g) || []).length, 4);
  assert.ok(!html.includes('id="console-feedback"'));
  assert.match(html, /data-console-go="-1" disabled/);
  assert.match(html, /data-console-go="1" disabled/);
  chooseConsoleAnswer(state, questions[0].answer);
  checkConsoleAnswer(state);
  html = renderConsolePractice(state, escape, escape, 'Saved locally.');
  assert.ok(html.includes(escape(questions[0].explanation)));
  assert.match(html, /data-console-go="1" >Next/);
  for (const q of questions) {
    state.current = q.number - 1;
    chooseConsoleAnswer(state, q.answer);
    checkConsoleAnswer(state);
  }
  html = renderConsolePractice(state, escape, escape, 'Saved locally.');
  assert.ok(html.includes('All 100 predictions correct!'));
  assert.ok(!html.includes('data-console-go="100"'));
  assert.ok(html.includes('data-console-review'));
});
