export function addChallenge(list, level, title, goal, body, changes, cases, hint, explanation) {
  const solution = body.trim() + '\n\nconst example = ' + JSON.stringify(cases[0][0], null, 2) + ';\nconsole.log(await solve(example));';
  let starter = solution;
  for (const [before, after] of changes) {
    if (!starter.includes(before) || before === after) throw Error('Invalid bug in ' + title);
    starter = starter.replace(before, after);
  }
  list.push({ level, title, goal, starter, solution, hint, explanation,
    kind: changes.some(([, after]) => after.includes('TODO')) ? 'Missing code' : 'Broken code',
    cases: cases.map(([input, expected, label], index) => ({ input, expected, label: label || `Example ${index + 1}` })),
    tests: cases.map(([input, expected, label], index) => {
      const call = `await solve(${JSON.stringify(input)})`;
      // Compare object properties independently of insertion order; array order matters.
      const normalize = `(_, value) => value && typeof value === 'object' && !Array.isArray(value) ? Object.fromEntries(Object.entries(value).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0)) : value`;
      const actual = `JSON.stringify(${call}, ${normalize})`;
      const target = `JSON.stringify(${JSON.stringify(expected)}, ${normalize})`;
      return { label: label || `Example ${index + 1}`, hint,
        expression: `${actual} === ${target}`,
        runnerExpression: `__observe(${JSON.stringify({ label: 'solve(input)', json: true, functionCall: true })}, ${actual}, "===", ${target})` };
    }),
  });
}
