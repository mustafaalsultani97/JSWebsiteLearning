// Shared by the browser and the server. No passwords or auth tokens belong here.
export const MAX_PROGRESS_BYTES = 2_000_000;
export const CONSOLE_QUESTION_COUNT = 300;
export const PROBLEM_CHALLENGE_COUNT = 100;
export const copy = (value) => structuredClone(value);
export const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
export const freshProgress = () => ({
  version: 1, saved: [], done: [],
  settings: { size: 'standard', theme: 'dark', spacing: 'roomy' },
  course: { last: 'first-program', lessons: {} },
  consolePractice: freshConsoleProgress(),
  problemPractice: freshProblemProgress(),
});

export const freshProblemProgress = () => ({ current: 0, challenges: {} });
export function cleanProblemProgress(value = freshProblemProgress()) {
  requireValue(object(value) && integer(value.current, PROBLEM_CHALLENGE_COUNT - 1) && object(value.challenges)
    && Object.keys(value.challenges).length <= PROBLEM_CHALLENGE_COUNT);
  const challenges = {};
  for (const [key, state] of Object.entries(value.challenges)) {
    const number = /^problem-(\d{3})$/.exec(key)?.[1];
    requireValue(number && Number(number) >= 1 && Number(number) <= PROBLEM_CHALLENGE_COUNT && object(state)
      && typeof state.code === 'string' && state.code.length <= 20000
      && typeof state.passed === 'boolean' && integer(state.attempts, 1000000));
    challenges[key] = { code: state.code, passed: state.passed, attempts: state.attempts };
  }
  return { current: value.current, challenges };
}

export function mergeProblemProgress(base = freshProblemProgress(), local = freshProblemProgress(), remote = freshProblemProgress()) {
  const out = copy(remote);
  out.current = pick(base.current, local.current, remote.current);
  for (const key of new Set([...Object.keys(base.challenges), ...Object.keys(local.challenges)])) {
    const b = base.challenges[key], l = local.challenges[key], r = remote.challenges[key];
    if (equal(b, l)) continue;
    if (!l) { delete out.challenges[key]; continue; }
    out.challenges[key] = r ? {
      code: pick(b?.code, l.code, r.code), passed: l.passed || r.passed,
      attempts: Math.max(l.attempts, r.attempts),
    } : copy(l);
  }
  return out;
}

export const freshConsoleProgress = () => ({ current: 0, answers: {} });
export function cleanConsoleProgress(value = freshConsoleProgress()) {
  requireValue(object(value) && integer(value.current, CONSOLE_QUESTION_COUNT - 1) && object(value.answers)
    && Object.keys(value.answers).length <= CONSOLE_QUESTION_COUNT);
  const answers = {};
  for (const [key, state] of Object.entries(value.answers)) {
    const number = /^console-(\d{3})$/.exec(key)?.[1];
    requireValue(number && Number(number) >= 1 && Number(number) <= CONSOLE_QUESTION_COUNT && object(state)
      && (state.choice === null || integer(state.choice, 3))
      && typeof state.submitted === 'boolean' && typeof state.solved === 'boolean');
    answers[key] = { choice: state.choice, submitted: state.submitted && state.choice !== null, solved: state.solved };
  }
  return { current: value.current, answers };
}

export function mergeConsoleProgress(base = freshConsoleProgress(), local = freshConsoleProgress(), remote = freshConsoleProgress()) {
  const out = copy(remote);
  out.current = pick(base.current, local.current, remote.current);
  for (const key of new Set([...Object.keys(base.answers), ...Object.keys(local.answers)])) {
    const b = base.answers[key], l = local.answers[key], r = remote.answers[key];
    if (equal(b, l)) continue;
    if (!l) { delete out.answers[key]; continue; }
    const attempt = state => state ? { choice: state.choice, submitted: state.submitted } : undefined;
    out.answers[key] = r ? { ...pick(attempt(b), attempt(l), attempt(r)), solved: l.solved || r.solved } : copy(l);
  }
  return out;
}

const object = (v) => v && typeof v === 'object' && !Array.isArray(v);
const id = (v) => typeof v === 'string' && /^[a-z0-9][a-z0-9-]{0,79}$/.test(v);
const integer = (v, max) => Number.isInteger(v) && v >= 0 && v <= max;
function requireValue(valid) {
  if (!valid) throw new Error('Invalid progress data.');
}
function ids(value) {
  requireValue(Array.isArray(value) && value.length <= 1000 && value.every(id));
  return [...new Set(value)];
}

export const isExtraId = value => typeof value === 'string' && /^p(0[1-9]|10)$/.test(value);
export function cleanExtraProgress(value = {}) {
  requireValue(object(value) && Object.keys(value).length <= 10);
  const out = {};
  for (const [key, state] of Object.entries(value)) {
    requireValue(isExtraId(key) && object(state)
      && typeof state.code === 'string' && state.code.length <= 60000
      && typeof state.passed === 'boolean' && typeof state.submitted === 'boolean'
      && (state.choice === null || integer(state.choice, 9)));
    out[key] = { code: state.code, passed: state.passed, choice: state.choice,
      submitted: state.submitted && state.choice !== null };
  }
  return out;
}

// Reject malformed/oversized input and copy only recognized fields to storage.
export function cleanProgress(value) {
  requireValue(object(value) && value.version === 1);
  const out = freshProgress();
  out.consolePractice = cleanConsoleProgress(value.consolePractice);
  out.problemPractice = cleanProblemProgress(value.problemPractice);
  out.saved = ids(value.saved);
  out.done = ids(value.done);
  const s = value.settings;
  requireValue(object(s) && ['standard', 'large', 'extra'].includes(s.size)
    && ['dark', 'light'].includes(s.theme) && ['roomy', 'regular'].includes(s.spacing));
  out.settings = { size: s.size, theme: s.theme, spacing: s.spacing };
  const course = value.course;
  requireValue(object(course) && id(course.last) && object(course.lessons));
  const entries = Object.entries(course.lessons);
  requireValue(entries.length <= 64);
  out.course.last = course.last;
  for (const [key, l] of entries) {
    requireValue(id(key) && object(l) && integer(l.step, 4)
      && Array.isArray(l.read) && l.read.length <= 2 && l.read.every(n => integer(n, 1))
      && typeof l.code === 'string' && l.code.length <= 60000
      && typeof l.passed === 'boolean' && integer(l.best, 3)
      && Array.isArray(l.answers) && l.answers.length === 3
      && l.answers.every(n => n === null || integer(n, 9))
      && typeof l.submitted === 'boolean'
      && Array.isArray(l.order) && l.order.length <= 3 && l.order.every(n => integer(n, 2)));
    requireValue(l.extraSelected == null || isExtraId(l.extraSelected));
    out.course.lessons[key] = {
      step: l.step, read: [...new Set(l.read)], code: l.code, passed: l.passed,
      answers: [...l.answers], submitted: l.submitted && l.answers.every(n => n !== null),
      best: l.best, order: [...new Set(l.order)],
      extra: cleanExtraProgress(l.extra), extraSelected: l.extraSelected ?? null,
    };
  }
  return out;
}

function mergeSet(base = [], local = [], remote = []) {
  // Apply local additions/removals to the remote set, preserving remote changes.
  return [...new Set([...remote.filter(x => !base.includes(x) || local.includes(x)),
    ...local.filter(x => !base.includes(x))])];
}
function pick(base, local, remote) {
  return copy(equal(local, base) ? remote : local);
}

// Merge each optional exercise separately, even when two devices work on the
// same lesson. A newly earned completion survives a concurrent draft edit.
export function mergeExtraProgress(base = {}, local = {}, remote = {}) {
  const out = copy(remote);
  for (const key of new Set([...Object.keys(base), ...Object.keys(local)])) {
    const b = base[key], l = local[key], r = remote[key];
    if (equal(b, l)) continue;
    if (!l) { delete out[key]; continue; }
    if (!r) { out[key] = copy(l); continue; }
    const choice = state => state ? { choice: state.choice, submitted: state.submitted } : undefined;
    out[key] = { code: pick(b?.code, l.code, r.code),
      ...pick(choice(b), choice(l), choice(r)), passed: l.passed || r.passed };
  }
  return out;
}

// Three-way merge: only this device's edits override the latest cloud snapshot.
// Concurrent edits to the same draft/quiz use this device's version; achievements
// from different devices are combined. Explicit removals are kept as removals.
export function mergeProgress(base, local, remote) {
  const out = copy(remote);
  out.consolePractice = mergeConsoleProgress(base.consolePractice, local.consolePractice, remote.consolePractice);
  out.problemPractice = mergeProblemProgress(base.problemPractice, local.problemPractice, remote.problemPractice);
  out.saved = mergeSet(base.saved, local.saved, remote.saved);
  out.done = mergeSet(base.done, local.done, remote.done);
  for (const key of ['size', 'theme', 'spacing']) {
    out.settings[key] = pick(base.settings[key], local.settings[key], remote.settings[key]);
  }
  out.course.last = pick(base.course.last, local.course.last, remote.course.last);
  for (const key of new Set([...Object.keys(base.course.lessons), ...Object.keys(local.course.lessons)])) {
    const b = base.course.lessons[key], l = local.course.lessons[key], r = remote.course.lessons[key];
    if (equal(b, l)) continue;
    if (!l) { delete out.course.lessons[key]; continue; }
    if (!r || equal(b, r)) { out.course.lessons[key] = copy(l); continue; }
    const result = copy(r);
    for (const field of ['step', 'code', 'order', 'extraSelected']) result[field] = pick(b?.[field], l[field], r[field]);
    result.extra = mergeExtraProgress(b?.extra, l.extra, r.extra);
    const quiz = v => v ? { answers: v.answers, submitted: v.submitted } : undefined;
    Object.assign(result, pick(quiz(b), quiz(l), quiz(r)));
    result.read = mergeSet(b?.read, l.read, r.read);
    result.passed = equal(b?.passed, l.passed) ? r.passed : (l.passed || r.passed);
    result.best = equal(b?.best, l.best) ? r.best : Math.max(l.best, r.best);
    out.course.lessons[key] = result;
  }
  return out;
}
