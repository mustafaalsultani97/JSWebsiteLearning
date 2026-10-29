import { parse } from 'acorn';
import { mainCheckHints } from '../javascript-course/lessons/check-hints.js';

// Parse only our authored checks, during the build. Learner code is never sent
// here or to a server. Instrument comparisons without running either side twice.
export function compileCheck(check) {
  const source = `(${check.expression})`;
  const root = parse(source, { ecmaVersion: 'latest' }).body[0].expression;
  const text = node => source.slice(node.start, node.end);
  const stringify = node => node?.type === 'CallExpression' &&
    node.callee.type === 'MemberExpression' && node.callee.object.name === 'JSON' &&
    node.callee.property.name === 'stringify';
  function context(node) {
    const shown = stringify(node) ? node.arguments[0] : node;
    const expression = text(shown);
    let label = expression;
    const logged = /^__logs\[(\d+)\](?:\?\.)?\[(\d+)\]$/.exec(expression);
    if (logged) label = `Console call ${Number(logged[1]) + 1}, value ${Number(logged[2]) + 1}`;
    else if (expression === '__logs.length') label = 'Number of console.log calls';
    else if (expression.startsWith('__logs')) label = 'Console output (each inner list is one call)';
    return { label: label.slice(0, 240), json: stringify(node),
      functionCall: shown.type === 'CallExpression' && shown.callee.type === 'Identifier',
      typeCheck: shown.type === 'UnaryExpression' && shown.operator === 'typeof' };
  }
  function instrument(node) {
    if (node.type === 'LogicalExpression') {
      return `(${instrument(node.left)} ${node.operator} ${instrument(node.right)})`;
    }
    if (node.type === 'BinaryExpression' && ['===', '!==', '==', '!=', '<', '<=', '>', '>='].includes(node.operator)) {
      return `__observe(${JSON.stringify(context(node.left))}, (${text(node.left)}), ${JSON.stringify(node.operator)}, (${text(node.right)}))`;
    }
    // Mutation/identity checks use local fixtures inside an immediately invoked
    // function. Observe only its returned assertions, not learner callbacks.
    if (node.type === 'CallExpression' && ['ArrowFunctionExpression', 'FunctionExpression'].includes(node.callee.type)) {
      const fn = node.callee;
      if (fn.body.type === 'BlockStatement') {
        const changes = [];
        const visit = statement => {
          if (statement.type === 'ReturnStatement' && statement.argument) changes.push(statement.argument);
          else if (statement.type === 'BlockStatement') statement.body.forEach(visit);
          else if (statement.type === 'IfStatement') { visit(statement.consequent); if (statement.alternate) visit(statement.alternate); }
        };
        fn.body.body.forEach(visit);
        let result = text(node);
        for (const value of changes.sort((a,b) => b.start - a.start)) {
          result = result.slice(0, value.start - node.start) + instrument(value) + result.slice(value.end - node.start);
        }
        return result;
      }
    }
    const expression = text(node);
    const method = /(?:\.includes\("\.(filter|map)"\)|\[\.\](filter|map))/.exec(expression);
    const info = { label: check.label, kind: method ? 'method' : expression.includes('__logs') ? 'output' : 'requirement',
      method: method?.[1] || method?.[2] };
    return `__observeBoolean(${JSON.stringify(info)}, !!(${expression})${info.kind === 'output' ? ', __logs' : ''})`;
  }
  return { ...check, runnerExpression: instrument(root) };
}

export function compileCourseChecks(course) {
  const result = structuredClone(course);
  for (const lesson of result.lessons) {
    for (const exercise of [lesson.exercise, ...lesson.extras]) {
      if (exercise.kind !== 'code') continue;
      const hints = exercise === lesson.exercise ? mainCheckHints[lesson.id] : null;
      if (exercise === lesson.exercise && hints?.length !== exercise.tests.length) throw new Error(`Check hints need updating for ${lesson.id}.`);
      exercise.tests = exercise.tests.map((check, index) => compileCheck({ ...check, hint: hints?.[index] || exercise.hints[0] }));
    }
  }
  return result;
}
