// These observations are collected inside the isolated worker. Values are
// formatted immediately so a later check cannot change an earlier observation.
export function createCheckObserver() {
  let first = null;
  const snapshot = value => {
    const type = value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value;
    let text;
    try {
      if (type === 'undefined') text = 'undefined (no value)';
      else if (type === 'number' && !Number.isFinite(value)) text = String(value);
      else if (type === 'function') text = 'a function';
      else text = JSON.stringify(value, (_, v) => typeof v === 'bigint' ? String(v) + 'n' : v) ?? String(value);
    } catch { text = `[${type}: cannot display this value]`; }
    return { type, text: text.slice(0, 1200), length: type === 'array' ? value.length : undefined };
  };
  const record = issue => { first ||= issue; };
  return {
    begin() { first = null; },
    issue() { return first; },
    compare(context, actual, operator, expected) {
      let pass;
      switch (operator) {
        case '===': pass = actual === expected; break;
        case '!==': pass = actual !== expected; break;
        case '==': pass = actual == expected; break;
        case '!=': pass = actual != expected; break;
        case '>': pass = actual > expected; break;
        case '>=': pass = actual >= expected; break;
        case '<': pass = actual < expected; break;
        case '<=': pass = actual <= expected; break;
      }
      if (!pass) {
        const sharedObject = ['!==', '!='].includes(operator) && actual !== null && typeof actual === 'object' && actual === expected;
        if (context.json) {
          try { actual = JSON.parse(actual); } catch { /* undefined or a non-JSON value stays as-is. */ }
          try { expected = JSON.parse(expected); } catch { /* Preserve the raw comparison value. */ }
        }
        record({ ...context, kind: sharedObject ? 'identity' : 'comparison', operator,
          actual: snapshot(actual), expected: snapshot(expected) });
      }
      return pass;
    },
    boolean(context, pass, output) {
      if (!pass) record({ ...context, actual: output ? snapshot(output) : undefined });
      return pass;
    },
  };
}

// Self-contained because this exact function is serialized into the worker.
export async function executePracticeChecks(data, output, logs, observerFactory) {
  const observer = observerFactory();
  const results = [];
  try {
    const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
    const tail = '\n;' + data.tests.map((test, index) =>
      `__startCheck(); try { __check(${index}, !!(${test.runnerExpression || test.expression})); } catch (__err) { __check(${index}, false, { name: __err?.name || "Error", message: __err?.message || String(__err) }); }`
    ).join('\n');
    await new AsyncFunction('console', '__logs', '__startCheck', '__observe', '__observeBoolean', '__check',
      '"use strict";\n' + data.code + tail)(output, logs, observer.begin, observer.compare, observer.boolean,
      (index, pass, error) => results.push({ index, pass: pass === true,
        issue: pass ? null : observer.issue(),
        error: error ? { name: String(error.name).slice(0, 80), message: String(error.message).slice(0, 400) } : null }));
    return { type: 'results', results };
  } catch (error) {
    const name = String(error?.name || 'Error').slice(0, 80);
    const message = String(error?.message || error).slice(0, 400);
    return { type: 'error', text: name + ': ' + message, error: { name, message } };
  }
}

export function explainPracticeError(error, { duringCheck = false } = {}) {
  const name = error?.name || '', message = error?.message || '';
  const missing = /^(.+?) is not defined/.exec(message);
  if (name === 'ReferenceError' && missing) return {
    title: `The name “${missing[1]}” could not be found`,
    explanation: duringCheck ? 'This check could not run because it needs that variable or function.' : 'Your program stopped when it tried to use a name that was not available.',
    hint: 'Compare its spelling and capital letters with the instructions. Declare it before using it, and check whether it was created inside a different function or block.',
  };
  if (name === 'ReferenceError') return {
    title: 'A value was used before it was available', explanation: 'Execution stopped while looking up a variable.',
    hint: 'Check the order of your declarations and the scope of the variable. Move the use after its declaration, or pass the value into the function that needs it.',
  };
  if (name === 'SyntaxError') return {
    title: 'JavaScript could not read this code', explanation: 'The program could not start, so the result checks have not run yet.',
    hint: /end of input|unterminated/i.test(message)
      ? 'Look for an opening quote, parenthesis, bracket, or brace that never closes. Check the end of the code and the lines just before it.'
      : 'Check matching quotes, brackets and braces, then look for a missing comma, an extra symbol, or a name declared twice. Fix one syntax issue and run again.',
  };
  if (/constant variable|read.only/i.test(message)) return {
    title: 'The code tried to reassign a fixed value', explanation: 'A const binding cannot be assigned a different value after it is declared.',
    hint: 'If this value should change, check whether its declaration should use let. For arrays and objects, you can update their contents without reassigning the name.',
  };
  if (/is not a function/i.test(message)) return {
    title: 'Something was called that is not a function', explanation: 'The value before a pair of call parentheses was not callable.',
    hint: 'Check the spelling and type of the value before (). A callback should be passed as a function, and properties such as length are read without ().',
  };
  if (/Cannot read propert|Cannot set propert/i.test(message)) return {
    title: 'A property was accessed on a missing value', explanation: 'The object or array item being used was undefined or null.',
    hint: 'Inspect the value before the dot or brackets. Check the index, property name, and whether a function forgot to return its result.',
  };
  if (name === 'RangeError' && /stack/i.test(message)) return {
    title: 'The function kept calling itself', explanation: 'The call stack ran out of room before the program finished.',
    hint: 'Check the stopping case and whether each recursive call moves closer to it.',
  };
  return { title: duringCheck ? 'This check could not finish' : 'The program stopped before the checks finished',
    explanation: 'Read the JavaScript message below, then work on one cause at a time.',
    hint: 'Look at the value used by the failing operation. Add a temporary console.log before it to check what that value actually contains.' };
}

export function feedbackForResult(result, test, exercise) {
  if (result?.error) return { ...explainPracticeError(result.error, { duringCheck: true }), technical: result.error.message };
  const issue = result?.issue;
  const hintIndex = Math.max(0, exercise.tests?.indexOf(test) ?? 0);
  const exerciseHint = test.hint || exercise.hints?.[Math.min(hintIndex, exercise.hints.length - 1)] || 'Compare the result with the instructions, one requirement at a time.';
  const fallback = { title: 'One requirement still needs attention',
    explanation: test.label === 'The result meets the instructions'
      ? 'The result did not meet every requirement. Start with the exercise-specific hint below.' : `The check “${test.label}” did not pass.`, hint: exerciseHint };
  if (!issue) return fallback;
  if (issue.kind === 'method') return { title: 'The requested approach is still missing',
    explanation: `The check did not find a call to .${issue.method} in the function being refactored.`,
    hint: `Review which step .${issue.method} should handle. Keep the same behavior while replacing that part of the loop.` };
  if (issue.kind === 'output') return { title: 'The console output did not match',
    explanation: test.label === 'The result meets the instructions' ? 'Check the values, their order, and how many times you print them.' : `Still needed: ${test.label}.`,
    actual: issue.actual, expected: { text: 'The output requested in the instructions', type: 'requirement' },
    hint: exerciseHint };
  if (issue.kind === 'identity') return { title: 'The same object was returned or reused',
    explanation: 'This check expected a different array or object, but received the original reference.',
    hint: 'Build a new result. If the array contains objects, creating a new outer array alone does not create new objects inside it.' };
  if (issue.kind !== 'comparison') return fallback;
  const { actual, expected } = issue;
  let hint = exerciseHint;
  if (issue.typeCheck) hint = 'typeof reports the type of the stored value. Check the value itself: quotes create strings, while numbers and the booleans true and false can be written without quotes. Do not replace the type check with a hard-coded answer.';
  else if (actual.type === 'undefined') hint = issue.functionCall
    ? 'This function call produced no value. Check that the function returns the calculated result; console.log displays a value but does not return it to the caller.'
    : 'This lookup produced no value. Check the variable, property spelling, or array index. If the value comes from a function, check its return statement too.';
  else if (actual.type !== expected.type) {
    const typeName = type => ['array', 'object'].includes(type) ? 'an ' + type : 'a ' + type;
    hint = `The check needs ${typeName(expected.type)}, but received ${typeName(actual.type)}. Check the value you store or return.`;
    if (actual.type === 'string' && expected.type === 'number') hint += ' Check quotes and number conversions. With +, a string can turn addition into text joining.';
    if (actual.type === 'string' && expected.type === 'boolean') hint += ' The booleans true and false are written without quotes.';
    if (actual.type === 'number' && expected.type === 'array') hint += ' Methods such as push return a length, not the array. Check whether you accidentally replaced the array with that return value.';
  }
  else if (actual.type === 'array' && actual.length !== expected.length) hint = `Your result contains ${actual.length} items; this check expects ${expected.length}. Check the loop boundary or selection condition, and whether a callback returns a value.`;
  else if (actual.text === 'NaN') hint = 'NaN means a calculation did not produce a usable number. Check the inputs with typeof and look for missing values or text that cannot be converted to a number.';
  else if (actual.type === 'string') hint = 'Compare capitalization, spaces, punctuation and value order. Text comparisons must match exactly.';
  const relation = { '!==': 'a value different from', '!=': 'a value different from', '>': 'a value greater than', '>=': 'a value at least', '<': 'a value less than', '<=': 'a value at most' }[issue.operator];
  return { title: issue.functionCall && actual.type === 'undefined' ? 'This function did not return a value' : issue.typeCheck || actual.type !== expected.type ? 'The value has the wrong type' : 'The result is different from what this check expects',
    explanation: `Look at ${issue.label}.`, label: issue.label, actual,
    expected: relation ? { ...expected, text: `${relation} ${expected.text}` } : expected,
    hint, exerciseHint: hint === exerciseHint ? null : exerciseHint };
}

export const timeoutFeedback = {
  title: 'The run did not finish within 3 seconds',
  explanation: 'No completion result is available. A loop that never stops, repeated recursive calls, or a very large amount of work can cause this.',
  hint: 'Trace the changing value through two or three repetitions. Does it move toward making the condition false? Check that the update happens inside the loop.',
};
