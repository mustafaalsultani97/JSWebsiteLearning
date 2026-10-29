// Small content helpers keep every lesson structured in the same readable way.
export function page(title, paragraphs, code, output, walkthrough, mistake, check, takeaway, language = 'javascript') {
  return { title, paragraphs, code, output, walkthrough, mistake, check, takeaway, language };
}
export function question(prompt, choices, answer, why) {
  return { prompt, choices, answer, why };
}
export function coding(title, instructions, starter, solution, hints, solutionNotes, tests) {
  return { kind: 'code', title, instructions, starter, solution, hints, solutionNotes,
    tests: tests.map(([label, expression]) => ({ label, expression })) };
}
