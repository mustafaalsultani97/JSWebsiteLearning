import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { COURSE } from '../javascript-course/lessons/index.js';
import { compileCheck, compileCourseChecks } from '../scripts/practice-checks.mjs';
import { createCheckObserver, executePracticeChecks, feedbackForResult, explainPracticeError, timeoutFeedback } from '../javascript-course/practice-feedback.js';

const prepared = compileCourseChecks(COURSE);
async function run(code, tests) {
  const logs = [];
  return executePracticeChecks({ code, tests }, { log: (...args) => logs.push(args) }, logs, createCheckObserver);
}
const fakeExercise = { hints: ['Check the calculation and the order of operations.'] };
const diagnostic = async (code, expression) => {
  const check = compileCheck({ label: 'The result meets the instructions', expression });
  const result = await run(code, [check]);
  assert.equal(result.type, 'results');
  assert.equal(result.results[0].pass, false);
  return { result: result.results[0], feedback: feedbackForResult(result.results[0], check, fakeExercise) };
};

for (const lesson of prepared.lessons) {
  test(`${lesson.id}: every worked solution still passes the actual feedback runner`, async () => {
    for (const ex of [lesson.exercise, ...lesson.extras].filter(ex => ex.kind === 'code')) {
      const result = await run(ex.solution, ex.tests);
      assert.equal(result.type, 'results', `${ex.title}: ${result.text}`);
      assert.ok(result.results.every(r => r.pass && r.issue === null && r.error === null), ex.title);
    }
  });
}
test('feedback identifies numeric mismatches and distinguishes strings from numbers', async () => {
  const { feedback } = await diagnostic('const total = "15" + 3;', 'total === 18');
  assert.equal(feedback.actual.text, '"153"');
  assert.equal(feedback.actual.type, 'string');
  assert.equal(feedback.expected.text, '18');
  assert.match(feedback.hint, /string.*text joining/);
  const mismatch = await diagnostic('let count = 4;', 'count === 5');
  assert.equal(mismatch.feedback.label, 'count');
  assert.equal(mismatch.feedback.hint, fakeExercise.hints[0]);
});
test('missing return, undefined, NaN, arrays, console output and mutation have useful feedback', async () => {
  const emptyReturn = await diagnostic('function twice(n) { console.log(n * 2); }', 'twice(4) === 8');
  assert.match(emptyReturn.feedback.hint, /returns the calculated result/);
  const undefinedItem = await diagnostic('const items = [];', 'items[0] === "Blue"');
  assert.match(undefinedItem.feedback.hint, /array index/);
  const nan = await diagnostic('const total = Number("oops");', 'total === 12');
  assert.equal(nan.feedback.actual.text, 'NaN');
  assert.match(nan.feedback.hint, /NaN means/);
  const arrays = await diagnostic('function select(values) { return []; }', 'JSON.stringify(select([1,2])) === "[1,2]"');
  assert.equal(arrays.feedback.actual.type, 'array');
  assert.match(arrays.feedback.hint, /0 items.*2/);
  const logs = await diagnostic('console.log("8");', '__logs[0]?.[0] === 8');
  assert.equal(logs.feedback.label, 'Console call 1, value 1');
  const absentLog = await diagnostic('const title = "A";', '__logs.flat().includes(title)');
  assert.equal(absentLog.feedback.actual.text, '[]');
  assert.match(absentLog.feedback.title, /console output/);
  const same = await diagnostic('function copy(v) { return v; }', '(() => { const input = [1]; const result = copy(input); return result !== input; })()');
  assert.match(same.feedback.title, /same object/);
  const mutated = await diagnostic('function change(v) { v.push(2); }', '(() => { const input = [1]; const before = JSON.stringify(input); change(input); return JSON.stringify(input) === before; })()');
  assert.equal(mutated.feedback.actual.text, '[1,2]');
  assert.equal(mutated.feedback.expected.text, '[1]');
});
test('observations do not double-call a learner function or change short-circuit behavior', async () => {
  const checks = ['next() === 1 && calls === 1', 'true || next() === 9', 'calls === 1'].map(expression => compileCheck({ label: expression, expression }));
  const result = await run('let calls = 0; function next() { return ++calls; }', checks);
  assert.ok(result.results.every(r => r.pass));
  const or = await run('const count = 2;', [compileCheck({label:'Either value',expression:'count === 1 || count === 2'})]);
  assert.equal(or.results[0].pass, true);
  assert.equal(or.results[0].issue, null);
});
test('a wrong answer remains wrong and a missing name does not look like a wrong value', async () => {
  const check = compileCheck({ label: 'A return value', expression: 'result === 3' });
  const missing = await run('// Not written yet.', [check]);
  const feedback = feedbackForResult(missing.results[0], check, fakeExercise);
  assert.match(feedback.title, /result.*could not be found/);
  assert.match(feedback.explanation, /check could not run/);
  const wrong = await run('const result = 4;', [check]);
  assert.equal(wrong.results[0].pass, false);
  assert.equal(wrong.results[0].issue.actual.text, '4');
});
test('syntax and runtime errors explain the cause without claiming a logic diagnosis', async () => {
  for (const [code, expectedName, title] of [
    ['const name = "unclosed;', 'SyntaxError', /could not read/],
    ['console.log(missing);', 'ReferenceError', /missing/],
    ['const value = 3; value = 4;', 'TypeError', /reassign/],
    ['const value = 3; value();', 'TypeError', /not a function/],
    ['const value = undefined; value.name;', 'TypeError', /missing value/],
  ]) {
    const result = await run(code, []);
    assert.equal(result.type, 'error');
    assert.equal(result.error.name, expectedName);
    assert.match(explainPracticeError(result.error).title, title);
  }
  assert.match(timeoutFeedback.explanation, /can cause this/);
  for (const code of ['throw null;', 'throw "Try again";']) {
    const result = await run(code, []);
    assert.equal(result.type, 'error');
    assert.ok(result.error.message);
  }
});
test('refactoring feedback names the missing method without showing a solution', async () => {
  const ex = prepared.lessons.find(l => l.id === 'ai-refactoring').extras[0];
  const result = await run(ex.starter, ex.tests);
  assert.equal(result.results[0].pass, false);
  const feedback = feedbackForResult(result.results[0], ex.tests[0], ex);
  assert.match(feedback.explanation, /\.filter/);
  assert.ok(!JSON.stringify(feedback).includes(ex.solution));
});
test('typeof feedback explains the underlying value and later checks use later hints', async () => {
  const typed = await diagnostic('const muted = "false";', 'typeof muted === "boolean"');
  assert.match(typed.feedback.title, /wrong type/);
  assert.match(typed.feedback.hint, /stored value/);
  const ex = prepared.lessons.find(l => l.id === 'debugging').exercise;
  const code = 'const hourlyRate=5, hoursText="3", helmetFee=2, hours=3, total=10; console.log(total);';
  const result = await run(code, ex.tests);
  assert.equal(result.results[0].pass, true);
  const feedback = feedbackForResult(result.results[1], ex.tests[1], ex);
  assert.match(feedback.hint, /Multiply.*price per hour/);
  assert.ok(!feedback.hint.includes('Convert'));
});
test('comparison instrumentation preserves starter results, including short circuits', () => {
  for (const lesson of prepared.lessons) {
    for (const ex of [lesson.exercise, ...lesson.extras].filter(ex => ex.kind === 'code')) {
      for (const check of ex.tests) {
        const outcomes = [check.expression, check.runnerExpression].map(expression => {
          const logs = [], observer = createCheckObserver();
          try {
            const result = vm.runInNewContext(`${ex.starter}\n; !!(${expression})`, {
              console: { log: (...args) => logs.push(args) }, __logs: logs,
              __observe: observer.compare, __observeBoolean: observer.boolean,
            }, { timeout: 40 });
            return { result };
          } catch (error) { return { error: error.name }; }
        });
        assert.deepEqual(outcomes[0], outcomes[1], `${lesson.id}: ${ex.title} / ${check.label}`);
      }
    }
  }
});
