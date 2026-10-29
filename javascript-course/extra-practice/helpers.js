// Every task is independently selectable. IDs follow the authored order; keep
// that order stable so saved drafts continue to belong to the same exercise.
export function task(title, instructions, solution, checks, hint, reasoning, starter) {
  return { kind: 'code', title, instructions: Array.isArray(instructions) ? instructions : [instructions],
    starter: starter ?? `// ${title}\n// Write your solution below.\n`, solution,
    tests: typeof checks === 'string' ? [{ label: 'The result meets the instructions', expression: checks }]
      : checks.map(([label, expression]) => ({ label, expression })),
    hints: [hint], solutionNotes: Array.isArray(reasoning) ? reasoning : [reasoning] };
}
export function decision(title, instructions, choices, answer, reasoning) {
  return { kind: 'choice', title, instructions: [instructions], choices, answer, reasoning };
}
export function collection(tasks) {
  return tasks.map((exercise, index) => ({ ...exercise, id: `p${String(index + 1).padStart(2, '0')}`,
    level: index < 3 ? 'Warm up' : index < 7 ? 'Apply the idea' : 'Stretch your skills' }));
}
