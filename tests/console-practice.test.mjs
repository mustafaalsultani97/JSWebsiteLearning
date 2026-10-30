import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { createHash } from 'node:crypto';
import { CONSOLE_QUESTIONS as questions, CONSOLE_LEVELS as levels } from '../javascript-course/console-questions.js';
import { chooseConsoleAnswer, checkConsoleAnswer, consoleStats, renderConsolePractice } from '../javascript-course/console-practice.js';
import { freshProgress, freshConsoleProgress, cleanProgress, cleanConsoleProgress, mergeProgress, copy, CONSOLE_QUESTION_COUNT } from '../shared/progress.js';

test('300 distinct predictions have four unique choices and thirty ordered levels', () => {
  assert.equal(questions.length, 300);
  assert.equal(questions.length, CONSOLE_QUESTION_COUNT);
  assert.equal(new Set(questions.map(q => q.id)).size, 300);
  assert.equal(new Set(questions.map(q => q.code)).size, 300);
  assert.equal(new Set(questions.map(q => q.title)).size, 300);
  assert.equal(levels.length, 30);
  for (const [index, q] of questions.entries()) {
    assert.equal(q.id, `console-${String(index + 1).padStart(3, '0')}`);
    assert.equal(q.level, Math.floor(index / 10));
    assert.equal(q.choices.length, 4);
    assert.equal(new Set(q.choices).size, 4, q.id);
    assert.ok(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < 4);
    assert.ok(q.explanation.trim().length > 20, q.id);
  }
  for (let answer = 0; answer < 4; answer++) assert.equal(questions.filter(q => q.answer === answer).length, 75);
});

test('the original 100 questions and answer positions are unchanged from the published edition', () => {
  // Snapshot of the complete published questions before adding the new set.
  const digest = createHash('sha256').update(JSON.stringify(questions.slice(0, 100))).digest('hex');
  assert.equal(digest, '1c7a1c19eed083f0a2d7973c9e95451bb6172d3350fb7aefaa88b5ab156c6aa7');
});

test('the published first 200 questions remain unchanged when expert questions are appended', () => {
  const digest = createHash('sha256').update(JSON.stringify(questions.slice(0, 200))).digest('hex');
  assert.equal(digest, 'c4d1b02b5764795b36e6bd57810442e14cde25bf5a7ee525e15c7a84e37d6da2');
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
  assert.deepEqual(consoleStats(restored.consolePractice), { answered: 300, solved: 300 });
  assert.equal(restored.consolePractice.current, 299);
});

test('console progress rejects invalid IDs, choices, indexes and unbounded records', () => {
  const answer = { choice: 0, submitted: true, solved: false };
  for (const current of [-1, 300, 1.5, '1']) assert.throws(() => cleanConsoleProgress({ current, answers: {} }));
  for (const id of ['console-000', 'console-301', 'console-999', 'console-1', 'console-0001', '__proto__']) {
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
  remote.consolePractice.current = 299;
  chooseConsoleAnswer(remote.consolePractice, questions[299].answer);
  checkConsoleAnswer(remote.consolePractice);
  remote.course.last = 'arrays';
  const merged = cleanProgress(mergeProgress(base, local, remote));
  assert.deepEqual(consoleStats(merged.consolePractice), { answered: 2, solved: 2 });
  assert.equal(merged.consolePractice.current, 299);
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

test('rendering explains both wrong and correct answers and handles the first and last questions', () => {
  const escape = s => String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
  const state = freshConsoleProgress();
  let html = renderConsolePractice(state, escape, escape, 'Saved locally.');
  assert.equal((html.match(/name="console-answer"/g) || []).length, 4);
  assert.ok(!html.includes('id="console-feedback"'));
  assert.match(html, /data-console-go="-1" disabled/);
  assert.match(html, /data-console-go="1" disabled/);
  chooseConsoleAnswer(state, (questions[0].answer + 1) % 4);
  checkConsoleAnswer(state);
  html = renderConsolePractice(state, escape, escape, 'Saved locally.');
  assert.match(html, /Not quite\. The answer is B\./);
  assert.ok(html.includes(`<pre class="console-expected-output">${escape(questions[0].choices[questions[0].answer])}</pre>`));
  assert.ok(html.includes(`<h4>Why this output?</h4><p class="console-explanation">${escape(questions[0].explanation)}</p>`));
  state.answers[questions[0].id] = { choice: null, submitted: false, solved: false };
  chooseConsoleAnswer(state, questions[0].answer);
  checkConsoleAnswer(state);
  html = renderConsolePractice(state, escape, escape, 'Saved locally.');
  assert.match(html, /✓ You got it\./);
  assert.ok(html.includes(escape(questions[0].explanation)));
  assert.match(html, /data-console-go="1" >Next/);
  for (const q of questions) {
    state.current = q.number - 1;
    chooseConsoleAnswer(state, q.answer);
    checkConsoleAnswer(state);
  }
  html = renderConsolePractice(state, escape, escape, 'Saved locally.');
  assert.ok(html.includes('All 300 predictions correct!'));
  assert.ok(!html.includes('data-console-go="300"'));
  assert.ok(html.includes('data-console-review'));
});

test('a completed original set survives restore and continues from question 100 to 101', () => {
  const previous = freshProgress();
  for (const question of questions.slice(0, 100)) {
    previous.consolePractice.current = question.number - 1;
    chooseConsoleAnswer(previous.consolePractice, question.answer);
    checkConsoleAnswer(previous.consolePractice);
  }
  const restored = cleanProgress(JSON.parse(JSON.stringify(previous)));
  assert.deepEqual(restored, previous);
  const state = restored.consolePractice;
  const html = renderConsolePractice(state, String, String, 'Saved.');
  assert.match(html, /QUESTION 100 \/ 300/);
  assert.match(html, /data-console-go="100" >Next question/);
  assert.match(html, /aria-valuemax="300" aria-valuenow="100"/);
  assert.match(html, /style="width:33\.333/);
  assert.ok(!html.includes('class="console-complete"'));
  state.current = 100;
  chooseConsoleAnswer(state, questions[100].answer);
  checkConsoleAnswer(state);
  const advancedHtml = renderConsolePractice(state, String, String, 'Saved.');
  assert.match(advancedHtml, /QUESTION 101 \/ 300/);
  assert.match(advancedHtml, /LEVEL 11 OF 30/);
  assert.match(advancedHtml, /data-console-go="99" >← Previous/);
  assert.deepEqual(consoleStats(cleanConsoleProgress(state)), { answered: 101, solved: 101 });
});

test('the completed 200-question edition restores intact and continues to question 201', () => {
  const progress = freshProgress();
  for (const question of questions.slice(0, 200)) {
    progress.consolePractice.current = question.number - 1;
    chooseConsoleAnswer(progress.consolePractice, question.answer);
    checkConsoleAnswer(progress.consolePractice);
  }
  const restored = cleanProgress(JSON.parse(JSON.stringify(progress)));
  assert.deepEqual(restored, progress);
  const state = restored.consolePractice;
  const before = renderConsolePractice(state, String, String, 'Saved.');
  assert.match(before, /QUESTION 200 \/ 300/);
  assert.match(before, /data-console-go="200" >Next question/);
  assert.match(before, /Try questions 201–300/);
  assert.match(before, /aria-valuemax="300" aria-valuenow="200"/);
  assert.match(before, /style="width:66\.666/);
  assert.ok(!before.includes('class="console-complete"'));
  state.current = 200;
  chooseConsoleAnswer(state, questions[200].answer);
  checkConsoleAnswer(state);
  const after = renderConsolePractice(state, String, String, 'Saved.');
  assert.match(after, /QUESTION 201 \/ 300/);
  assert.match(after, /LEVEL 21 OF 30/);
  assert.match(after, /data-console-go="199" >← Previous/);
  assert.deepEqual(consoleStats(cleanConsoleProgress(state)), { answered: 201, solved: 201 });
});
