import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { createHash } from 'node:crypto';
import { PROBLEM_CHALLENGES as challenges, PROBLEM_LEVELS as levels } from '../javascript-course/problem-challenges/index.js';
import { executePracticeChecks, createCheckObserver } from '../javascript-course/practice-feedback.js';
import { freshProgress, freshProblemProgress, cleanProgress, cleanProblemProgress, mergeProgress, copy } from '../shared/progress.js';
import { renderProblemPractice, problemSolvedCount, problemDraftCode } from '../javascript-course/problem-practice.js';
import { LEGACY_PROBLEM_STARTERS } from '../javascript-course/problem-challenges/legacy-starters.js';

function execute(challenge, code) {
  const context = vm.createContext({ data: { code, tests: challenge.tests }, logs: [], output: { log() {} } });
  return vm.runInContext(`(${executePracticeChecks.toString()})(data, output, logs, ${createCheckObserver.toString()})`, context, { timeout: 200 });
}
test('100 distinct repair challenges keep increasing topic levels within a 25-line limit', () => {
  assert.equal(challenges.length, 100);
  assert.equal(levels.length, 10);
  assert.equal(new Set(challenges.map(q => q.title)).size, 100);
  assert.equal(new Set(challenges.map(q => q.starter)).size, 100);
  for (const [index, challenge] of challenges.entries()) {
    assert.equal(challenge.id, `problem-${String(index + 1).padStart(3, '0')}`);
    assert.equal(challenge.level, Math.floor(index / 10));
    assert.ok(challenge.starter.split('\n').filter(line => line.trim()).length > 4);
    assert.ok(challenge.starter.split('\n').length <= 25, challenge.id);
    assert.ok(challenge.solution.split('\n').length <= 25, challenge.id);
    assert.ok(challenge.tests.length >= 3);
    assert.ok(challenge.hint.length > 20);
    assert.ok(challenge.explanation.length > 50);
  }
  const average = list => list.reduce((sum, q) => sum + q.starter.split('\n').length, 0) / list.length;
  assert.ok(average(challenges.slice(90)) > average(challenges.slice(0, 10)));
  const contract = challenges.map(({id,title,level,cases}) => ({id,title,level,cases}));
  assert.equal(createHash('sha256').update(JSON.stringify(contract)).digest('hex'), '1648b06c24a45901fade9824b9e81a28ef414d05e9c41e38a93b5cb51a447a2c');
});
for (const challenge of challenges) {
  test(`${challenge.id}: starter fails and solution passes — ${challenge.title}`, async () => {
    const fixed = await execute(challenge, challenge.solution);
    assert.equal(fixed.type, 'results', JSON.stringify(fixed));
    assert.equal(fixed.results.length, challenge.tests.length);
    assert.ok(fixed.results.every(result => result.pass), JSON.stringify(fixed));
    let broken;
    try { broken = await execute(challenge, challenge.starter); }
    catch (error) {
      assert.match(error.message, /Script execution timed out/);
      return;
    }
    assert.ok(broken.type === 'error' || broken.results.some(result => !result.pass), 'Unchanged starter must not pass');
  });
}

test('old saves default safely and all repair drafts survive a backup round trip', () => {
  const legacy = freshProgress();
  delete legacy.problemPractice;
  assert.deepEqual(cleanProgress(legacy).problemPractice, freshProblemProgress());
  const progress = freshProgress();
  for (const q of challenges) progress.problemPractice.challenges[q.id] = { code: q.solution, passed: true, attempts: 2 };
  progress.problemPractice.current = 99;
  const restored = cleanProgress(JSON.parse(JSON.stringify(progress)));
  assert.deepEqual(restored, progress);
  assert.equal(problemSolvedCount(restored.problemPractice), 100);
});
test('shorter starters replace untouched legacy code while personal drafts and completion remain intact', () => {
  const q = challenges[99];
  const state = { code: LEGACY_PROBLEM_STARTERS[q.id], passed: true, attempts: 2 };
  assert.equal(problemDraftCode(q, state), q.starter);
  assert.equal(state.passed, true);
  const personal = { ...state, code: state.code + '\n// My working notes' };
  assert.equal(problemDraftCode(q, personal), personal.code);
  const progress = freshProblemProgress();
  progress.current = 99;
  progress.challenges[q.id] = personal;
  assert.match(renderProblemPractice(progress, String, String, 'Saved.'), /Use shorter starter/);
});
test('behavioral checks accept a valid repair with a different object property order', async () => {
  const challenge = challenges.find(q => q.title === 'Memoize square calculations');
  const alternative = challenge.solution.replace('values,\n    calculations', 'calculations,\n    values');
  assert.notEqual(alternative, challenge.solution);
  const result = await execute(challenge, alternative);
  assert.ok(result.results.every(check => check.pass));
});
test('repair progress rejects invalid IDs, oversized code and malformed counters', () => {
  const state = { code: 'draft', passed: false, attempts: 0 };
  for (const current of [-1, 100, 1.5, '1']) assert.throws(() => cleanProblemProgress({ current, challenges: {} }));
  for (const id of ['problem-000', 'problem-101', 'problem-1', '__proto__']) {
    assert.throws(() => cleanProblemProgress({ current: 0, challenges: { [id]: state } }));
  }
  for (const change of [{ code: 'x'.repeat(20001) }, { passed: 'true' }, { attempts: -1 }, { attempts: Infinity }]) {
    assert.throws(() => cleanProblemProgress({ current: 0, challenges: { 'problem-001': { ...state, ...change } } }));
  }
});
test('a concurrent repair draft retains another device completion and independent work', () => {
  const base = freshProgress();
  base.problemPractice.challenges['problem-001'] = { code: 'original', passed: false, attempts: 1 };
  const local = copy(base), remote = copy(base);
  local.problemPractice.challenges['problem-001'].code = 'edited locally';
  remote.problemPractice.challenges['problem-001'] = { code: 'remote solution', passed: true, attempts: 3 };
  remote.problemPractice.challenges['problem-100'] = { code: 'last draft', passed: false, attempts: 1 };
  const merged = cleanProgress(mergeProgress(base, local, remote));
  assert.deepEqual(merged.problemPractice.challenges['problem-001'], { code: 'edited locally', passed: true, attempts: 3 });
  assert.equal(merged.problemPractice.challenges['problem-100'].code, 'last draft');
});
test('repair navigation unlocks on a checked solution, keeps drafts escaped, and completes at 100', () => {
  const state = freshProblemProgress();
  const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
  let html = renderProblemPractice(state, escape, escape, 'Saved.');
  assert.match(html, /data-problem-go="1" disabled/);
  assert.ok(!html.includes('class="problem-solution"'));
  assert.deepEqual(state.challenges, {}, 'Viewing a problem must not create an untouched draft');
  state.challenges['problem-001'] = { code: '</textarea><script>bad()</script>', passed: true, attempts: 2 };
  html = renderProblemPractice(state, escape, escape, 'Saved.');
  assert.ok(!html.includes('<script>bad()'));
  assert.match(html, /data-problem-go="1" >Next problem/);
  assert.match(html, /View an explained solution/);
  for (const q of challenges) state.challenges[q.id] = { code: q.solution, passed: true, attempts: 1 };
  state.current = 99;
  html = renderProblemPractice(state, escape, escape, 'Saved.');
  assert.match(html, /All 100 problems solved!/);
  assert.ok(!html.includes('data-problem-go="100"'));
});
