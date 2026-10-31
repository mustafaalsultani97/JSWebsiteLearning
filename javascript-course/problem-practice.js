import { PROBLEM_CHALLENGES as challenges, PROBLEM_LEVELS as levels } from './problem-challenges/index.js';
import { LEGACY_PROBLEM_STARTERS } from './problem-challenges/legacy-starters.js';
import { explainPracticeError, feedbackForResult, timeoutFeedback } from './practice-feedback.js';

export const problemChallengeCount = challenges.length;
export const problemSolvedCount = progress => challenges.filter(q => progress.challenges[q.id]?.passed).length;
export function problemDraftCode(challenge, state) {
  return state?.code === undefined || state.code === LEGACY_PROBLEM_STARTERS[challenge.id]
    ? challenge.starter : state.code;
}
export function problemPracticeCard(progress) {
  const solved = problemSolvedCount(progress);
  return `<section class="console-invite problem-invite" aria-label="Learn by debugging"><div><span class="welcome-label">LEARN BY DEBUGGING</span><h2>Solve the problem</h2><p>Find what is missing or wrong, edit the code, and test your fix. Work through 100 programs, from everyday bugs to async systems.</p><span class="subtle">10 levels · 25 lines or fewer · Hints and explained solutions${solved ? ` · ${solved}/100 solved` : ''}</span></div><button class="btn course-primary" data-view="problems">${Object.keys(progress.challenges).length ? 'Continue solving' : 'Solve a problem'} →</button></section>`;
}
export function renderProblemPractice(progress, escape, highlight, storageNote, feedback = null, canUndo = false) {
  const challenge = challenges[progress.current];
  const state = progress.challenges[challenge.id];
  const code = problemDraftCode(challenge, state);
  const solved = problemSolvedCount(progress);
  const currentFeedback = feedback?.id === challenge.id && feedback.code === code ? feedback : null;
  const results = currentFeedback?.results ?? [];
  const detail = currentFeedback?.detail;
  return `<section class="problem-practice" aria-labelledby="problem-heading">
    <header class="console-heading"><span class="course-kicker">Read · Debug · Repair</span><h1 id="problem-heading" tabindex="-1">Solve the problem</h1><p class="lead">100 broken programs, each 25 lines or fewer. The ideas get harder as you progress. Find the mistake or fill the gap, then test your fix.</p></header>
    <div class="console-overview"><div><strong>${solved}<span> / 100 solved</span></strong><p>Your edits and solved challenges are saved.</p></div><div class="console-level"><span>LEVEL ${challenge.level + 1} OF 10</span><strong>${escape(levels[challenge.level])}</strong></div><div class="progress-track" role="progressbar" aria-label="Problems solved" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${solved}"><div style="width:${solved}%"></div></div></div>
    ${solved === challenges.length ? '<section class="console-complete"><h2>All 100 problems solved!</h2><p>You have repaired programs from simple calculations to shared asynchronous dependencies. Revisit any challenge to practise a different solution.</p></section>' : ''}
    <div class="console-question-nav"><label for="problem-jump">Jump to a problem</label><select id="problem-jump">${levels.map((level, index) => `<optgroup label="Level ${index + 1} · ${escape(level)}">${challenges.filter(q => q.level === index).map(q => `<option value="${q.number - 1}" ${q.id === challenge.id ? 'selected' : ''}>${q.number}. ${escape(q.title)}${progress.challenges[q.id]?.passed ? ' · Solved' : ''}</option>`).join('')}</optgroup>`).join('')}</select></div>
    <article><div class="console-question-title"><span class="welcome-label">PROBLEM ${challenge.number} / 100 · ${challenge.kind} · ${challenge.starter.split('\n').length} lines</span><h2 id="problem-question-heading" tabindex="-1">${escape(challenge.title)}</h2></div>
      <p class="problem-goal">${escape(challenge.goal)}</p><p class="console-format">Edit the program below. Keep the <code>solve</code> function so Run &amp; check can call it with different inputs. Sample inputs and expected results are listed here.</p>
      <details class="problem-examples"><summary>Inputs and expected results</summary><div class="problem-example-list">${challenge.cases.map(example => `<section><h3>${escape(example.label)}</h3><p>Input</p><pre>${escape(JSON.stringify(example.input, null, 2))}</pre><p>Expected return value</p><pre>${escape(JSON.stringify(example.expected, null, 2))}</pre></section>`).join('')}</div></details>
      ${code.split('\n').length > 25 ? '<p class="console-format">Your saved draft is longer than the revised starter. <button class="btn" data-problem-reset>Use shorter starter</button> You can undo this change with Undo reset.</p>' : ''}
      <div class="problem-workbench"><div class="code-tab"><label for="problem-editor"><strong>repair.js</strong></label><div class="console-code-actions"><span>JavaScript</span><button class="btn" data-problem-copy>Copy code</button></div></div><textarea id="problem-editor" class="course-editor problem-editor" aria-label="Edit the broken JavaScript" spellcheck="false" autocapitalize="off" autocorrect="off" maxlength="20000" rows="${Math.min(28, Math.max(12, code.split('\n').length))}">${escape(code)}</textarea><div class="course-code-actions"><button class="btn course-primary" data-problem-run>▶ Run & check</button><button class="btn" data-problem-stop disabled>Stop</button><button class="btn" data-problem-reset>Reset code</button>${canUndo ? '<button class="btn" data-problem-undo>Undo reset</button>' : ''}<span class="subtle">Ctrl / ⌘ + Enter</span></div></div>
      <details class="problem-hint"><summary>Need a hint?</summary><p>${escape(challenge.hint)}</p></details>
      <p id="problem-status" role="status">${currentFeedback ? currentFeedback.passed ? '✓ All checks passed.' : 'Your fix needs another look. Read the feedback below.' : state?.passed ? '✓ Solved previously. You can keep experimenting.' : 'Ready to debug. Run the starter to see what happens, then make your fix.'}</p>
      <div class="problem-checks"><h3>Checks for your fix</h3><ul id="problem-check-list">${challenge.tests.map((check, index) => { const result = results.find(r => r.index === index); return `<li class="${result ? result.pass ? 'pass' : 'fail' : ''}">${result ? result.pass ? '✓' : '↺' : '○'} ${escape(check.label)}</li>`; }).join('')}</ul></div>
      <details class="problem-output" ${currentFeedback?.logs ? 'open' : ''}><summary>Console output</summary><pre id="problem-output">${escape(currentFeedback ? currentFeedback.logs || 'No console output. The checks test the values returned by solve.' : 'Run your code to see its output here.')}</pre></details>
      ${currentFeedback ? `<section class="console-feedback ${currentFeedback.passed ? 'is-correct' : 'is-wrong'}" id="problem-feedback" tabindex="-1" aria-labelledby="problem-feedback-title"><h3 id="problem-feedback-title">${currentFeedback.passed ? '✓ Problem solved' : escape(detail?.title || 'Keep debugging')}</h3>${currentFeedback.passed ? `<h4>Why this works</h4><p>${escape(challenge.explanation)}</p>` : `<p>${escape(detail?.explanation || '')}</p>${detail?.actual ? `<p class="console-output-label">Your result</p><pre class="console-expected-output">${escape(detail.actual.text)}</pre>` : ''}${detail?.expected ? `<p class="console-output-label">Expected result</p><pre class="console-expected-output">${escape(detail.expected.text)}</pre>` : ''}${detail?.technical ? `<pre class="console-expected-output">${escape(detail.technical)}</pre>` : ''}<h4>Try this next</h4><p>${escape(detail?.hint || challenge.hint)}</p>`}</section>` : ''}
      ${state?.attempts ? `<details class="problem-solution"><summary>View an explained solution</summary><p>${escape(challenge.explanation)}</p><p class="subtle">Reading a solution does not mark the problem solved. Edit your code and run the checks when you are ready.</p><pre><code>${highlight(challenge.solution)}</code></pre></details>` : ''}
      <nav class="console-bottom" aria-label="Problem navigation"><button class="btn" data-problem-go="${progress.current - 1}" ${progress.current === 0 ? 'disabled' : ''}>← Previous</button><span class="subtle">${challenge.number} of 100</span>${progress.current < challenges.length - 1 ? `<button class="btn course-primary" data-problem-go="${progress.current + 1}" ${state?.passed ? '' : 'disabled'}>Next problem →</button>` : '<button class="btn" data-problem-review>Review problems →</button>'}</nav>
    </article><p class="course-storage">${escape(storageNote)} Lesson and console-prediction progress are tracked separately.</p></section>`;
}

export function bindProblemPractice({ getProgress, active, persist, render, copyText, runnerHTML }) {
  let run = null, timer, feedback = null, undo = null;
  const $ = selector => document.querySelector(selector);
  function stateFor(challenge) {
    const state = getProgress().challenges[challenge.id] ??= { code: challenge.starter, passed: false, attempts: 0 };
    state.code = problemDraftCode(challenge, state);
    return state;
  }
  function stop(message) {
    clearTimeout(timer);
    run?.frame.remove();
    run = null;
    if ($('[data-problem-run]')) $('[data-problem-run]').disabled = false;
    if ($('[data-problem-stop]')) $('[data-problem-stop]').disabled = true;
    if (message && $('#problem-status')) $('#problem-status').textContent = message;
  }
  function reset() { stop(); feedback = null; undo = null; }
  function redraw(target) {
    persist(); render();
    if (target) {
      $(target)?.focus({ preventScroll: true });
      $(target)?.scrollIntoView({ block: 'start', behavior: 'instant' });
    }
  }
  function go(index) {
    if (!Number.isInteger(index) || index < 0 || index >= challenges.length) return;
    reset(); getProgress().current = index; redraw('#problem-question-heading');
  }
  function finish(result) {
    if (!run) return;
    const current = run;
    stop();
    if (!active() || getProgress().current !== current.challenge.number - 1) return;
    const state = getProgress().challenges[current.challenge.id];
    if (!state || state.code !== current.code) return;
    const results = result.results ?? [];
    const passed = result.type === 'results' && current.challenge.tests.every((_, index) => results.some(r => r.index === index && r.pass === true));
    let detail = result.detail;
    if (result.type === 'error' && !detail) detail = { ...explainPracticeError(result.error), technical: result.text, hint: current.challenge.hint };
    if (result.type === 'results' && !passed) {
      const index = current.challenge.tests.findIndex((_, index) => !results.some(r => r.index === index && r.pass));
      detail = feedbackForResult(results.find(r => r.index === index), current.challenge.tests[index], current.challenge);
    }
    feedback = { id: current.challenge.id, code: current.code, passed, results, detail, logs: current.logs.join('\n') };
    if (passed) state.passed = true;
    redraw('#problem-feedback');
  }
  function start() {
    if (!active() || !$('#problem-editor')) return;
    stop();
    const challenge = challenges[getProgress().current];
    const state = stateFor(challenge);
    state.code = $('#problem-editor').value;
    state.attempts = Math.min(1000000, state.attempts + 1);
    feedback = null;
    redraw();
    $('#problem-status').textContent = 'Running your fix and checking the examples…';
    $('[data-problem-run]').disabled = true;
    $('[data-problem-stop]').disabled = false;
    const frame = document.createElement('iframe');
    frame.hidden = true;
    frame.setAttribute('sandbox', 'allow-scripts');
    frame.title = 'Isolated debugging practice';
    run = { frame, token: crypto.randomUUID(), challenge, code: state.code, logs: [] };
    frame.srcdoc = runnerHTML;
    document.body.append(frame);
    timer = setTimeout(() => finish({ type: 'error', detail: { ...timeoutFeedback, hint: challenge.hint + ' ' + timeoutFeedback.hint } }), 3000);
  }
  window.addEventListener('message', event => {
    if (!run || event.source !== run.frame.contentWindow || !event.data) return;
    const data = event.data;
    if (data.type === 'ready') {
      run.frame.contentWindow.postMessage({ type: 'run', token: run.token, code: run.code, tests: run.challenge.tests }, '*');
      return;
    }
    if (data.token !== run.token) return;
    if (data.type === 'log') {
      if (run.logs.length < 60) run.logs.push(String(data.text).slice(0, 4000));
      if ($('#problem-output')) $('#problem-output').textContent = run.logs.join('\n');
    } else if (data.type === 'error' || data.type === 'results') finish(data);
  });
  document.addEventListener('input', event => {
    if (!active() || event.target.id !== 'problem-editor') return;
    stop('Draft changed. Run the checks again when you are ready.');
    feedback = null;
    $('#problem-feedback')?.remove();
    const challenge = challenges[getProgress().current];
    stateFor(challenge).code = event.target.value;
    $('#problem-check-list').innerHTML = '';
    for (const test of challenge.tests) {
      const item = document.createElement('li'); item.textContent = '○ ' + test.label;
      $('#problem-check-list').append(item);
    }
    // Queue the latest draft immediately; account sync already debounces requests.
    // A remote merge must see these keystrokes even while an earlier save is in flight.
    persist();
  });
  document.addEventListener('change', event => {
    if (active() && event.target.id === 'problem-jump') go(Number(event.target.value));
  });
  document.addEventListener('keydown', event => {
    if (active() && event.target.id === 'problem-editor' && (event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault(); start();
    }
  });
  document.addEventListener('click', event => {
    if (!active()) return;
    const button = event.target.closest('button');
    if (!button || button.disabled) return;
    const challenge = challenges[getProgress().current];
    if (button.hasAttribute('data-problem-run')) start();
    if (button.hasAttribute('data-problem-stop')) stop('Stopped. Your draft is saved; revise it and try again.');
    if (button.hasAttribute('data-problem-copy')) copyText($('#problem-editor').value);
    if (button.hasAttribute('data-problem-go')) go(Number(button.dataset.problemGo));
    if (button.hasAttribute('data-problem-reset')) {
      stop(); feedback = null;
      const state = stateFor(challenge);
      undo = { id: challenge.id, code: state.code };
      state.code = challenge.starter;
      redraw('#problem-editor');
    }
    if (button.hasAttribute('data-problem-undo') && undo?.id === challenge.id) {
      stop(); feedback = null; stateFor(challenge).code = undo.code; undo = null;
      redraw('#problem-editor');
    }
    if (button.hasAttribute('data-problem-review')) {
      const next = challenges.findIndex(q => !getProgress().challenges[q.id]?.passed);
      go(next < 0 ? 0 : next);
    }
  });
  window.addEventListener('pagehide', () => { persist(); stop(); });
  return { stop, reset, feedback: () => feedback, canUndo: () => undo?.id === challenges[getProgress().current].id };
}
