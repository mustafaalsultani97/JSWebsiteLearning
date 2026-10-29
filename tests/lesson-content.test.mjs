import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { COURSE } from '../javascript-course/lessons/index.js';

// Independently stated expected values catch mistakes in displayed examples.
// Each entry contains the console calls on that explanation page.
const expected = {
  'first-program': [null, [['Library open'], [13], ['18 - 5']]],
  variables: [[['Studio B', 9]], [['boolean'], [15], ['123'], ['string']]],
  arrays: [[['Museum'], ['Harbor'], [3]], [[['Museum', 'Garden', 'Station']], [3]]],
  objects: [[['Scout'], [80]], [[4], [6, true]]],
  debugging: [[[10]], [['string'], [20]]],
  git: [null, null],
  conditions: [[['Take a short trip']], [[true], [false]]],
  switch: [[['Split the group']], [['brush']]],
  'for-loop': [[['Check shelf', 1], ['Check shelf', 2], ['Check shelf', 3], ['Inspection complete']], [[10]]],
  'while-loop': [[[4], [6], [8]], [[3, -2]]],
  'for-of': [[['Sketching', 0], ['Pottery', 3]], [['sound', true], ['subtitles', false]]],
  'function-forms': [[[180], [300]], [[12, 12, 12]]],
  parameters: [[[24], [15], [0]], [[12]]],
  scope: [[[9]], [['Inside'], ['Outside']]],
  averages: [[[7]], [[0], [9]]],
  'vip-project': [[[[{ title: 'Tides', minutes: 8 }]]], [['Clouds'], ['Cloud notes']]],
  callbacks: [[[12]], [[12]]],
  'array-filter': [[[[18, 22]], [[12, 18, 15, 22]]], [['South'], [true]]],
  'array-map-pipeline': [[[[1000, 2500, 4000]], [[1, 2.5, 4]]], [[[6, 4, 9]], [[360, 240, 540]]]],
  'modular-helpers': [[[true], ['Drawing (4 seats)']], [[['Drawing (4 seats)']]]],
  'ai-refactoring': [[[[2000, 4000]]], [[[4000, 2000, 4000]], [[]]]],
};

function execute(source) {
  const logs = [];
  const context = vm.createContext({ __logs: logs, console: { log: (...args) => logs.push(args) } });
  vm.runInContext(source, context, { timeout: 1000 });
  return { logs, context };
}

for (const lesson of COURSE.lessons) {
  test(`${lesson.id}: explanations and examples are complete and executable`, () => {
    assert.equal(lesson.steps.length, 2);
    assert.equal(lesson.objectives.length, 3);
    assert.equal(lesson.quiz.length, 3);
    for (const [index, step] of lesson.steps.entries()) {
      assert.ok(step.paragraphs.join(' ').split(/\s+/).length >= 85, 'Explain the concept before the code');
      assert.ok(step.walkthrough.length >= 3);
      assert.ok(step.check.prompt && step.check.answer && step.check.why && step.mistake);
      if (step.language !== 'javascript') continue;
      const { logs } = execute(step.code);
      assert.deepEqual(JSON.parse(JSON.stringify(logs)), expected[lesson.id][index]);
    }
    for (const question of lesson.quiz) {
      assert.ok(question.choices[question.answer]);
      assert.ok(question.why.length > 35);
    }
  });

  test(`${lesson.id}: worked solution passes and starter requires learner work`, () => {
    const exercise = lesson.exercise;
    assert.equal(exercise.hints.length, 3);
    assert.ok(exercise.solutionNotes.length >= 3);
    if (exercise.kind === 'order') {
      assert.deepEqual(exercise.answer.map(i => exercise.commands[i]), exercise.solution.split('\n'));
      return;
    }
    const { context } = execute(exercise.solution);
    for (const check of exercise.tests) {
      assert.equal(vm.runInContext(check.expression, context, { timeout: 1000 }), true, check.label);
    }
    let starterPasses = false;
    try {
      const starter = execute(exercise.starter);
      starterPasses = exercise.tests.every(check => vm.runInContext(check.expression, starter.context, { timeout: 1000 }));
    } catch { /* An unfinished starter may reference a not-yet-defined name. */ }
    assert.equal(starterPasses, false, 'The initial scaffold must not complete the exercise');
  });
}
