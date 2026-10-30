import { CONSOLE_QUESTIONS as questions, CONSOLE_LEVELS as levels } from './console-questions.js';
export const consoleQuestionCount = questions.length;

export function consoleStats(progress) {
  return questions.reduce((stats, question) => {
    const state = progress.answers[question.id];
    if (state?.submitted || state?.solved) stats.answered++;
    if (state?.solved) stats.solved++;
    return stats;
  }, { answered: 0, solved: 0 });
}

export function chooseConsoleAnswer(progress, choice) {
  const question = questions[progress.current];
  if (!Number.isInteger(choice) || choice < 0 || choice > 3 || progress.answers[question.id]?.submitted) return false;
  progress.answers[question.id] = { choice, submitted: false, solved: progress.answers[question.id]?.solved || false };
  return true;
}

export function checkConsoleAnswer(progress) {
  const question = questions[progress.current];
  const state = progress.answers[question.id];
  if (!state || state.choice === null || state.submitted) return false;
  state.submitted = true;
  state.solved ||= state.choice === question.answer;
  return true;
}

export function consolePracticeCard(progress) {
  const stats = consoleStats(progress);
  return `<section class="console-invite" aria-label="Another way to learn">
    <div><span class="welcome-label">ANOTHER WAY TO LEARN</span><h2>Predict the console</h2>
    <p>Read the code. Think it through. Choose A, B, C or D. Build your understanding with ${questions.length} increasingly challenging JavaScript examples.</p>
    <span class="subtle">${stats.answered ? `${stats.answered}/${questions.length} answered · ${stats.solved} correct` : `${levels.length} levels · Beginner to expert · Explained answers`}</span></div>
    <button class="btn course-primary" data-view="console">${stats.answered || Object.keys(progress.answers).length ? 'Continue predicting' : 'Try a prediction'} <span aria-hidden="true">→</span></button>
  </section>`;
}

export function renderConsolePractice(progress, escape, highlight, storageNote) {
  const question = questions[progress.current];
  const state = progress.answers[question.id];
  const submitted = !!state?.submitted;
  const correct = submitted && state.choice === question.answer;
  const stats = consoleStats(progress);
  const total = questions.length;
  const letter = index => 'ABCD'[index];
  return `<section class="console-practice" aria-labelledby="console-heading">
    <header class="console-heading"><span class="course-kicker">Read · Predict · Understand</span>
      <h1 id="console-heading" tabindex="-1">Predict the console</h1>
      <p class="lead">${total} pieces of JavaScript. Four possible outputs. How far can you trace the code?</p>
    </header>
    <div class="console-overview"><div><strong>${stats.answered}<span> / ${total} answered</span></strong><p>${stats.solved} correct · ${stats.answered - stats.solved} to revisit</p></div>
      <div class="console-level"><span>LEVEL ${question.level + 1} OF ${levels.length}</span><strong>${escape(levels[question.level])}</strong></div>
      <div class="progress-track" role="progressbar" aria-label="Console questions answered" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${stats.answered}"><div style="width:${stats.answered / total * 100}%"></div></div>
    </div>
    ${progress.current < 200 ? `<div class="course-actions">${progress.current < 100 ? '<button class="btn" data-console-go="100">Try questions 101–200 →</button>' : ''}<button class="btn" data-console-go="200">Try questions 201–300 →</button></div>` : ''}
    ${stats.answered === total ? `<section class="console-complete"><h2>${stats.solved === total ? `All ${total} predictions correct!` : `You reached the end of all ${total} examples.`}</h2><p>${stats.solved === total ? 'From your first message to async code and shared state. Revisit any question to keep practising.' : `${stats.solved} correct, with ${total - stats.solved} to revisit. Review the explanations and try those questions again.`}</p>${stats.solved < total ? '<button class="btn" data-console-review>Review a missed question →</button>' : ''}</section>` : ''}
    <div class="console-question-nav"><label for="console-jump">Jump to a question</label><select id="console-jump">${levels.map((level, index) => `<optgroup label="Level ${index + 1} · ${escape(level)}">${questions.filter(q => q.level === index).map(q => {
      const saved = progress.answers[q.id];
      return `<option value="${q.number - 1}" ${q === question ? 'selected' : ''}>${q.number}. ${escape(q.title)}${saved?.solved ? ' · Correct' : saved?.submitted ? ' · Revisit' : ''}</option>`;
    }).join('')}</optgroup>`).join('')}</select></div>
    <article class="console-challenge">
      <div class="console-question-title"><span class="welcome-label">QUESTION ${question.number} / ${total}</span><h2 id="console-question-heading" tabindex="-1">${escape(question.title)}</h2></div>
      <p class="console-instructions">What will this code print? Read the whole snippet, then choose one output.</p>
      <div class="console-code"><div class="code-tab"><strong>predict.js</strong><span>JavaScript</span></div><pre tabindex="0" aria-label="JavaScript code to predict"><code>${highlight(question.code)}</code></pre></div>
      <p class="console-format">Each output line represents one console.log call. Multiple values on one line are separated by spaces. String quotes are not printed.</p>
      <form id="console-answer-form"><fieldset class="console-choices"><legend>Choose the console output</legend>${question.choices.map((choice, index) => `<label class="console-choice ${submitted && index === question.answer ? 'is-correct' : submitted && state.choice === index ? 'is-wrong' : ''}">
        <input type="radio" name="console-answer" value="${index}" ${state?.choice === index ? 'checked' : ''} ${submitted ? 'disabled' : ''}>
        <span class="console-letter">${letter(index)}</span><pre>${escape(choice)}</pre>
        ${submitted && index === question.answer ? '<span class="console-choice-result">✓ Correct answer</span>' : submitted && state.choice === index ? '<span class="console-choice-result">Your answer</span>' : ''}
      </label>`).join('')}</fieldset>
      <div class="console-check-actions"><button class="btn course-primary" id="console-check" type="submit" ${submitted ? 'disabled' : ''}>Check answer</button>${submitted ? '<button class="btn" type="button" data-console-retry>Try this question again</button>' : ''}<span id="console-notice" role="status"></span></div></form>
      ${submitted ? `<section class="console-feedback ${correct ? 'is-correct' : 'is-wrong'}" id="console-feedback" tabindex="-1" aria-labelledby="console-feedback-title"><h3 id="console-feedback-title">${correct ? '✓ You got it.' : `Not quite. The answer is ${letter(question.answer)}.`}</h3><p>${escape(question.explanation)}</p></section>` : ''}
      <nav class="console-bottom" aria-label="Console question navigation"><button class="btn" data-console-go="${question.number - 2}" ${question.number === 1 ? 'disabled' : ''}>← Previous</button><span class="subtle">${question.number} of ${total}</span>${question.number < total ? `<button class="btn course-primary" data-console-go="${question.number}" ${!submitted && !state?.solved ? 'disabled' : ''}>Next question →</button>` : '<button class="btn" data-console-review>Review questions →</button>'}</nav>
    </article><p class="course-storage">${escape(storageNote)} Your lesson progress is tracked separately.</p>
  </section>`;
}

export function bindConsolePractice({ getProgress, active, persist, render }) {
  function redraw(target = '#console-question-heading') {
    persist();
    render();
    document.querySelector(target)?.focus({ preventScroll: true });
  }
  function go(index) {
    if (!Number.isInteger(index) || index < 0 || index >= questions.length) return;
    getProgress().current = index;
    redraw();
    document.querySelector('#console-question-heading')?.scrollIntoView({ block: 'start', behavior: 'instant' });
  }
  document.addEventListener('change', event => {
    if (!active()) return;
    if (event.target.id === 'console-jump') go(Number(event.target.value));
    if (event.target.name === 'console-answer') {
      chooseConsoleAnswer(getProgress(), Number(event.target.value));
      document.querySelector('#console-notice').textContent = '';
      persist();
    }
  });
  document.addEventListener('submit', event => {
    if (!active() || event.target.id !== 'console-answer-form') return;
    event.preventDefault();
    if (checkConsoleAnswer(getProgress())) redraw('#console-feedback');
    else if (!getProgress().answers[questions[getProgress().current].id]?.submitted) {
      document.querySelector('#console-notice').textContent = 'Choose A, B, C or D before checking.';
      document.querySelector('[name="console-answer"]')?.focus();
    }
  });
  document.addEventListener('click', event => {
    if (!active()) return;
    const button = event.target.closest('button');
    if (!button || button.disabled) return;
    if (button.hasAttribute('data-console-go')) go(Number(button.dataset.consoleGo));
    if (button.hasAttribute('data-console-retry')) {
      const progress = getProgress();
      const id = questions[progress.current].id;
      progress.answers[id] = { choice: null, submitted: false, solved: progress.answers[id]?.solved || false };
      redraw('[name="console-answer"]');
    }
    if (button.hasAttribute('data-console-review')) {
      const progress = getProgress();
      let index = questions.findIndex(q => progress.answers[q.id]?.submitted && !progress.answers[q.id].solved);
      if (index < 0) index = questions.findIndex(q => !progress.answers[q.id]?.solved);
      go(index < 0 ? 0 : index);
    }
  });
}
