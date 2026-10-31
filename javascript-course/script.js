/*
  SCRIPT.JS — content and behavior

  Reading guide: search (Ctrl+F) for a numbered section below.
  Start with sections 1 and 9 to see how lesson data becomes HTML.
  Sections 8 and 11 handle progress and button clicks.
  Sections 3, 6 and 10 are the more advanced code runners.

  This is plain JavaScript with no UI framework. npm run build bundles the
  account SDK and these modules for Netlify. index.html loads the built file.
  accounts.js handles sign-in; progress-sync.js handles private cloud saves.
*/

import { createAccounts } from './accounts.js';
import { cleanExtraProgress, isExtraId, mergeExtraProgress, freshConsoleProgress, cleanConsoleProgress, mergeConsoleProgress, freshProblemProgress, cleanProblemProgress, mergeProblemProgress, MAX_PROGRESS_BYTES } from '../shared/progress.js';
import { renderConsolePractice, consolePracticeCard, consoleStats, bindConsolePractice, consoleQuestionCount } from './console-practice.js';
import { renderProblemPractice, problemPracticeCard, problemSolvedCount, bindProblemPractice, problemChallengeCount } from './problem-practice.js';
import { createCheckObserver, executePracticeChecks, explainPracticeError, feedbackForResult, timeoutFeedback } from './practice-feedback.js';
/* 1. COURSE CONTENT — authored lessons live in lessons/, grouped by topic. */
import { COURSE, lessonProgressKey, lessonProgressKeys, initialLessonCode, hasLessonWork } from "./lessons/index.js";

/* 2. REFERENCE LIBRARY — the original searchable JavaScript topic cards. */
import { REFERENCE_DATA as DATA, referenceStats, searchReference, referencePage, referenceCatalogCardHTML, referenceOverviewHTML } from "./reference/index.js";
/* 3. REFERENCE PLAYGROUND SANDBOX
  Advanced infrastructure: this HTML string creates an isolated frame and worker.
  The worker runs practice code separately so a loop cannot freeze the study page.
*/
const RUNNER_HTML =
  "\u003c!doctype html>\u003cmeta charset=\"utf-8\">\u003cmeta http-equiv=\"Content-Security-Policy\" content=\"default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval' blob:; worker-src blob:; connect-src 'none';\">\u003cscript>\nlet worker=null, token=null, timer=null;\nfunction stop(){if(worker){worker.terminate();worker=null;}clearTimeout(timer);}\nfunction reply(message){parent.postMessage({...message,token},'*');}\naddEventListener('message',event=>{\n  if(event.source!==parent||!event.data)return;\n  if(event.data.type==='stop'){stop();return;}\n  if(event.data.type!=='run')return;\n  stop();token=event.data.token;\n  try {\n    const url=URL.createObjectURL(new Blob([\"'use strict';\\nfunction format(value,seen=new WeakSet(),depth=0){\\n  if(value===undefined)return 'undefined';if(value===null)return 'null';\\n  if(typeof value==='string')return value;if(typeof value==='bigint')return value+'n';if(typeof value==='symbol')return String(value);if(typeof value==='function')return '[Function'+(value.name?': '+value.name:'')+']';if(typeof value!=='object')return String(value);\\n  if(value instanceof Error)return value.name+': '+value.message;\\n  if(seen.has(value))return '[Circular]';if(depth>4)return '[\\u2026]';seen.add(value);\\n  const fmt=v=>typeof v==='string'?JSON.stringify(v):format(v,seen,depth+1);\\n  if(value instanceof Date)return Number.isNaN(value.getTime())?'Invalid Date':value.toISOString();if(value instanceof RegExp)return String(value);\\n  if(value instanceof Map)return 'Map { '+[...value].slice(0,50).map(([k,v])=>fmt(k)+' => '+fmt(v)).join(', ')+' }';\\n  if(value instanceof Set)return 'Set { '+[...value].slice(0,50).map(fmt).join(', ')+' }';\\n  if(ArrayBuffer.isView(value)&&!(value instanceof DataView))return value.constructor.name+' ['+Array.from(value).slice(0,80).map(fmt).join(', ')+']';\\n  if(value instanceof ArrayBuffer)return 'ArrayBuffer('+value.byteLength+')';\\n  if(Array.isArray(value)){const parts=[];for(let i=0;i\\u003cMath.min(value.length,80);i++)parts.push(i in value?fmt(value[i]):'\\u003cempty>');return '['+parts.join(', ')+(value.length>80?', \\u2026':'')+']';}\\n  return '{ '+Object.keys(value).slice(0,50).map(k=>k+': '+fmt(value[k])).join(', ')+' }';\\n}\\nself.onmessage=async ({data})=>{\\n  let lines=0;const times=new Map();const log=(...args)=>{if(lines++\\u003c100)self.postMessage({type:'log',text:args.map(v=>format(v)).join(' ').slice(0,12000)});};\\n  const output={log,info:log,warn:(...a)=>log('Warning:',...a),error:(...a)=>log('Error:',...a),dir:log,table:log,assert:(condition,...a)=>{if(!condition)log('Assertion failed:',...a);},clear:()=>log('\\u2014 console cleared \\u2014'),time:(name='default')=>times.set(name,performance.now()),timeEnd:(name='default')=>log(name+': '+(performance.now()-(times.get(name)||performance.now())).toFixed(2)+'ms')};\\n  try{const AsyncFunction=Object.getPrototypeOf(async function(){}).constructor;await new AsyncFunction('console','\\\"use strict\\\";\\\\n'+data.code)(output);await new Promise(resolve=>setTimeout(resolve,35));self.postMessage({type:'done'});}catch(error){self.postMessage({type:'error',text:error.name+': '+error.message});}\\n};\\nself.addEventListener('unhandledrejection',event=>{self.postMessage({type:'error',text:'Unhandled rejection: '+format(event.reason)});event.preventDefault();});\\n\"],{type:'text/javascript'}));\n    worker=new Worker(url);URL.revokeObjectURL(url);\n    worker.onmessage=({data})=>{reply(data);if(data.type==='done'||data.type==='error')stop();};\n    worker.onerror=event=>{reply({type:'error',text:'Runner error: '+event.message});stop();};\n    worker.postMessage({code:event.data.code});\n    timer=setTimeout(()=>{reply({type:'error',text:'Stopped: the example exceeded the 3-second limit.'});stop();},2850);\n  } catch(error){reply({type:'error',text:'Runner unavailable: '+error.message});stop();}\n});\nparent.postMessage({type:'ready'},'*');\n\u003c/script>";
/* 4. SHARED HELPERS, SETTINGS AND SAVED PROGRESS */
const $ = (s) => document.querySelector(s);
const allCards = DATA.flatMap((section) =>
  section.cards.map((card) => ({
    ...card,
    section: section.id,
    sectionTitle: section.title,
    group: section.group,
  })),
);
const cardsById = new Map(allCards.map((c) => [c.id, c]));
const groups = [
  "Keywords",
  "Core concepts",
  "Standard library",
  "Browser & tools",
];
const escapeHTML = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const KEY = "javascript-study-companion-v1"; // Original guest storage stays intact.
let accounts;
let problemPractice;
let storageOK = true;
let progress = {
  version: 1,
  saved: [],
  done: [],
  settings: { size: "standard", theme: "dark", spacing: "roomy" },
  course: freshCourse(),
  consolePractice: freshConsoleProgress(),
  problemPractice: freshProblemProgress(),
};
try {
  const existing = JSON.parse(localStorage.getItem(KEY));
  if (existing) progress = validateProgress(existing);
  localStorage.setItem(KEY, JSON.stringify(progress));
} catch {
  storageOK = false;
}
function validateProgress(value) {
  if (
    !value ||
    typeof value !== "object" ||
    value.version !== 1 ||
    !Array.isArray(value.saved) ||
    !Array.isArray(value.done)
  )
    throw Error("That is not a study progress backup.");
  const settings = value.settings || {};
  return {
    version: 1,
    course: validateCourse(value.course),
    consolePractice: (() => { try { return cleanConsoleProgress(value.consolePractice); } catch { return freshConsoleProgress(); } })(),
    problemPractice: (() => { try { return cleanProblemProgress(value.problemPractice); } catch { return freshProblemProgress(); } })(),
    saved: [
      ...new Set(
        value.saved.filter((x) => typeof x === "string" && cardsById.has(x)),
      ),
    ],
    done: [
      ...new Set(
        value.done.filter((x) => typeof x === "string" && cardsById.has(x)),
      ),
    ],
    settings: {
      size: ["standard", "large", "extra"].includes(settings.size)
        ? settings.size
        : "standard",
      theme: settings.theme === "light" ? "light" : "dark",
      spacing: settings.spacing === "regular" ? "regular" : "roomy",
    },
  };
}
function persist() {
  if (!accounts?.loading) {
    if (accounts?.signedIn) {
      accounts.save(progress);
      storageOK = accounts.localOK;
    }
    else {
      try {
        localStorage.setItem(KEY, JSON.stringify(progress));
        storageOK = true;
      } catch {
        storageOK = false;
      }
    }
  }
  updateProgress();
  updateCourseBadge();
}
let toastTimer;
function toast(message) {
  $("#toast").textContent = message;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => ($("#toast").textContent = ""), 3200);
}
function applySettings() {
  document.body.classList.toggle("light", progress.settings.theme === "light");
  document.body.classList.toggle(
    "large-text",
    progress.settings.size === "large",
  );
  document.body.classList.toggle(
    "extra-text",
    progress.settings.size === "extra",
  );
  document.body.classList.toggle(
    "roomy",
    progress.settings.spacing === "roomy",
  );
  $("#text-size").value = progress.settings.size;
  $("#theme").value = progress.settings.theme;
  $("#spacing").value = progress.settings.spacing;
}
function updateProgress() {
  const n = progress.done.length;
  $("#progress-count").textContent = n;
  $("#progress-caption").textContent =
    n +
    " / " +
    allCards.length +
    " topics · " +
    Math.round((n / allCards.length) * 100) +
    "%";
  $("#progress-fill").style.width = (n / allCards.length) * 100 + "%";
  $(".progress-track").setAttribute(
    "aria-valuenow",
    Math.round((n / allCards.length) * 100),
  );
  $("#bookmark-count").textContent = progress.saved.length;
  $("#all-count").textContent = allCards.length;
  if (!storageOK)
    $("#storage-note").textContent =
      "Browser storage is unavailable. Your progress works for this session; download a backup before closing the file.";
}
const bookIcon =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h12v18l-6-4-6 4z"/></svg>';
const chevron =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg>';
function highlight(code) {
  const pattern =
    /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)|\b(if|else|switch|case|default|for|while|do|break|continue|let|const|var|function|return|try|catch|finally|throw|class|extends|super|this|new|delete|typeof|instanceof|in|void|import|export|async|await|yield|debugger|with|of|static|get|set|using|true|false|null|undefined)\b|\b(\d+(?:\.\d+)?n?)\b/g;
  let out = "",
    last = 0;
  for (const m of code.matchAll(pattern)) {
    out += escapeHTML(code.slice(last, m.index));
    out +=
      '<span class="' +
      (m[1]
        ? "tok-comment"
        : m[2]
          ? "tok-string"
          : m[3]
            ? "tok-key"
            : "tok-num") +
      '">' +
      escapeHTML(m[0]) +
      "</span>";
    last = m.index + m[0].length;
  }
  return out + escapeHTML(code.slice(last));
}
const modes = {
  run: "Runnable",
  modern: "Check support",
  module: "Module files",
  browser: "Browser API",
  node: "Node.js",
  read: "Reference",
};
const modeNotes = {
  modern:
    "This newer feature needs engine support. You can try it here; an older browser may report a syntax error or missing method. Check the reference for compatibility.",
  module:
    "Module example: use the indicated files in a module-enabled project. Static imports and exports cannot run inside this playground.",
  browser:
    "Browser example: read the setup comments, then use it in a page you control. DOM, network and permission-dependent APIs are not available in this playground.",
  node: "Node.js example: run this in the Node.js environment, following the setup comments. Node APIs do not run in this browser playground.",
  read: "Reference example. Follow the setup and environment notes before using it in a project.",
};
/* 5. REFERENCE DISPLAY — build cards, navigation and search results. */
function cardHTML(card) {
  const saved = progress.saved.includes(card.id),
    done = progress.done.includes(card.id),
    runnable = card.mode === "run" || card.mode === "modern";
  if (card.catalog) return referenceCatalogCardHTML(card, saved, done, escapeHTML, bookIcon);
  return `<article class="topic-card${done ? " card-complete" : ""}" data-card="${card.id}"><div class="card-meta"><span class="level">${escapeHTML(card.level)}</span><span class="mode-label${card.mode === "run" ? "" : " read"}">${modes[card.mode] || "Reference"}</span><button class="icon-btn save-button" data-save="${card.id}" aria-pressed="${saved}" aria-label="${saved ? "Remove bookmark for" : "Bookmark"} ${escapeHTML(card.title)}">${bookIcon}</button></div><details><summary><span class="card-title">${escapeHTML(card.title)}<span class="plus" aria-hidden="true">+</span></span><span class="card-summary">${escapeHTML(card.summary)}</span></summary><div class="card-body">${card.explanation.map((p) => "<p>" + escapeHTML(p) + "</p>").join("")}${card.code && card.mode !== "run" ? '<div class="env-note">' + escapeHTML(modeNotes[card.mode] || modeNotes.read) + "</div>" : ""}${card.code ? `<div class="codebox"><div class="code-toolbar"><span>${escapeHTML(card.language || (card.mode === "node" ? "Node.js" : card.mode === "module" ? "Module example" : "JavaScript"))}</span><button data-copy="${card.id}" aria-label="Copy example for ${escapeHTML(card.title)}">Copy code</button></div><pre class="code"><code>${highlight(card.code)}</code></pre></div>` : ""}${card.output ? '<div class="output-example">Expected result<pre>' + escapeHTML(card.output) + "</pre></div>" : ""}${card.pitfall ? '<div class="tip"><strong>Keep in mind</strong>' + escapeHTML(card.pitfall) + "</div>" : ""}<div class="card-actions">${runnable ? '<button class="btn primary" data-run="' + card.id + '">Try this example</button>' : ""}<a class="btn" href="${escapeHTML(card.source)}" target="_blank" rel="noopener noreferrer">Reference ↗</a></div><label class="done-control"><input type="checkbox" data-done="${card.id}" ${done ? "checked" : ""}>I have studied this topic</label></div></details></article>`;
}
let currentView = "start",
  query = "",
  level = "all",
  completion = "all";
let referenceCurrentPage = 1, referenceType = 'all', referenceGroup = 'all', referenceStatus = 'all';
function navHTML() {
  return groups
    .map(
      (group, index) =>
        '<div class="nav-group" style="color:var(--' +
        ["accent", "mint", "gold", "pink"][index] +
        ')">' +
        group +
        "</div>" +
        DATA.filter((s) => s.group === group)
          .map(
            (s) =>
              '<button class="nav-button" data-view="' +
              s.id +
              '"><span>' +
              escapeHTML(s.title) +
              '</span><span class="nav-count">' +
              s.cards.length +
              "</span></button>",
          )
          .join(""),
    )
    .join("");
}
$("#navigation").innerHTML = navHTML();
function selected(cards) {
  const studied = new Set(progress.done);
  return cards.filter(
    (c) =>
      (level === "all" || c.level === level) &&
      (referenceType === 'all' || (referenceType === 'catalog') === Boolean(c.catalog)) &&
      (referenceGroup === 'all' || c.group === referenceGroup) &&
      (referenceStatus === 'all' || (c.flags || []).includes(referenceStatus)) &&
      (completion === "all" ||
        (completion === "done") === studied.has(c.id)),
  );
}
function toolbarHTML() {
  return `<div class="toolbar"><label class="subtle" for="level-filter">Show</label><select id="level-filter" aria-label="Filter by learning level"><option value="all">Every level</option><option value="Start here" ${level === "Start here" ? "selected" : ""}>Start here</option><option value="Everyday" ${level === "Everyday" ? "selected" : ""}>Everyday</option><option value="Deeper" ${level === "Deeper" ? "selected" : ""}>Deeper</option><option value="Reference" ${level === "Reference" ? "selected" : ""}>Reference index</option></select><select id="completion-filter" aria-label="Filter by study progress"><option value="all">All progress</option><option value="todo" ${completion === "todo" ? "selected" : ""}>Not studied yet</option><option value="done" ${completion === "done" ? "selected" : ""}>Studied</option></select><span class="spacer"></span><button class="btn" data-expand="open">Expand notes</button><button class="btn" data-expand="close">Collapse notes</button><button class="btn" data-print>Print view</button></div>`;
}
function referenceFiltersHTML() {
  const select = (id, label, value, options) => `<label>${label}<select id="${id}" aria-label="${label}">${options.map(([key, text]) => `<option value="${key}" ${value === key ? 'selected' : ''}>${text}</option>`).join('')}</select></label>`;
  return `<div class="reference-filters">${select('reference-type', 'Entry type', referenceType, [['all', 'Examples and reference'], ['examples', 'Guides and worked examples'], ['catalog', 'Quick reference']])}${select('reference-group', 'Reference area', referenceGroup, [['all', 'All four areas'], ...groups.map(group => [group, group])])}${select('reference-status', 'Feature status', referenceStatus, [['all', 'Every status'], ['experimental', 'Experimental'], ['deprecated', 'Deprecated'], ['discouraged', 'Discouraged'], ['nonstandard', 'Non-standard'], ['limited', 'Limited availability'], ['secure', 'HTTPS required']])}</div>`;
}
const emptyHTML = (title, desc) =>
  '<div class="empty"><h2>' + title + "</h2><p>" + desc + "</p></div>";
function renderHome() {
  const starts = groups.map((g) => DATA.find((s) => s.group === g));
  const pathText = [
    [
      "Start with keywords",
      "Decisions, loops, variables, functions and the original 37 terms.",
    ],
    [
      "Understand the language",
      "Types, operators, closures, prototypes, modules and execution.",
    ],
    [
      "Use the standard library",
      "Strings, arrays, collections, dates, regular expressions and Promises.",
    ],
    [
      "Work with the platform",
      "The DOM, events, browser APIs, Node.js and practical habits.",
    ],
  ];
  return `<section class="hero"><div class="eyebrow">Your offline study companion</div><h1>JavaScript,<br><span class="soft">one topic at a time.</span></h1><p class="lead">Clear notes. Small examples. Room to experiment.<br>Keep the language close while you learn to build with it.</p><div class="hero-stats"><div><strong>${allCards.length}</strong>searchable topics</div><div><strong>${DATA.length}</strong>organized sections</div><div><strong>${allCards.filter((c) => c.mode === "run").length}</strong>runnable examples</div><div><strong>4</strong>reference areas</div></div></section>${referenceOverviewHTML(escapeHTML)}<div class="section-label"><h2>Choose where to begin</h2><span class="subtle">A suggested learning order</span></div><div class="paths">${starts.map((s, i) => '<button class="path" data-view="' + s.id + '"><div class="path-top"><span class="path-number">0' + (i + 1) + "</span>" + chevron + "</div><h3>" + pathText[i][0] + "</h3><p>" + pathText[i][1] + "</p></button>").join("")}</div><section class="comparison"><h2>Stop, skip or return</h2><div class="compare-grid"><div><code>break</code><p>Stop the loop.</p><small>Also exits a switch.</small></div><div><code>continue</code><p>Skip to the next iteration.</p><small>Stays inside the loop.</small></div><div><code>return</code><p>Exit the function, optionally with a value.</p><small>No value supplied? Returns undefined in a normal function.</small></div></div></section><div class="section-label"><h2>Six useful first steps</h2><button class="btn" data-view="all">Explore all topics</button></div><div class="topic-grid">${["kw-let", "kw-const", "kw-if", "kw-for", "kw-function", "kw-return"].map((id) => cardHTML(cardsById.get(id))).join("")}</div>`;
}
function render() {
  problemPractice?.stop();
  const view = $("#view");
  const showCourse = isCourseView() && !query;
  document.body.classList.toggle("course-mode", showCourse);
  document.body.classList.toggle("start-mode", currentView === "start" && !query);
  document.body.classList.toggle("console-mode", currentView === "console" && !query);
  document.body.classList.toggle("problem-mode", currentView === "problems" && !query);
  updateCourseBadge();
  document.querySelectorAll("[data-view]").forEach((b) => {
    if (
      (b.dataset.view === currentView ||
        (b.dataset.view === "course" && showCourse)) &&
      !query
    )
      b.setAttribute("aria-current", "page");
    else b.removeAttribute("aria-current");
  });
  if (currentView === "start" && !query) {
    view.innerHTML = renderStart();
    return;
  }
  if (currentView === "console" && !query) {
    const storageNote = !storageOK ? 'Storage is unavailable. Download a backup in Settings before leaving.'
      : accounts?.signedIn ? 'Your predictions are saved with your account. Check the toolbar for sync status.'
      : 'Your predictions are saved in this browser. Sign in to save across devices.';
    view.innerHTML = renderConsolePractice(progress.consolePractice, escapeHTML, highlight, storageNote);
    return;
  }
  if (currentView === 'problems' && !query) {
    const storageNote = !storageOK ? 'Storage is unavailable. Download a backup in Settings before leaving.'
      : accounts?.signedIn ? 'Your debugging drafts and solved problems are saved with your account. Check the toolbar for sync status.'
      : 'Your debugging drafts are saved in this browser. Sign in to save across devices.';
    view.innerHTML = renderProblemPractice(progress.problemPractice, escapeHTML, highlight, storageNote, problemPractice?.feedback(), problemPractice?.canUndo());
    return;
  }
  if (showCourse) {
    view.innerHTML =
      currentView === "course"
        ? courseDashboard()
        : renderLesson(activeLesson());
    return;
  }
  if (currentView === "home" && !query) {
    view.innerHTML = renderHome();
    return;
  }
  let cards, title, desc, breadcrumb;
  if (query) {
    cards = searchReference(allCards, query);
    title = "Search your guide";
    desc =
      "Results across all sections. Search matches names, explanations and example code.";
    breadcrumb = "Search";
  } else if (currentView === "saved") {
    cards = allCards.filter((c) => progress.saved.includes(c.id));
    title = "Your bookmarks";
    desc = "A short list of the topics you want to keep close.";
    breadcrumb = "Study desk / Bookmarks";
  } else if (currentView === "all") {
    cards = allCards;
    title = "All JavaScript topics";
    desc =
      "Explore the full study guide or narrow it by learning level and progress.";
    breadcrumb = "Study desk / All topics";
  } else {
    const section = DATA.find((s) => s.id === currentView);
    if (!section) {
      navigate("home");
      return;
    }
    cards = allCards.filter((c) => c.section === currentView);
    title = section.title;
    desc = section.description;
    breadcrumb = section.group + " / " + section.cards.length + " topics";
  }
  const shown = selected(cards);
  const page = referencePage(shown, referenceCurrentPage);
  referenceCurrentPage = page.page;
  const pagination = `<nav class="reference-pagination" aria-label="Reference pages"><button class="btn" data-reference-page="${page.page - 1}" ${page.page === 1 ? 'disabled' : ''}>← Previous page</button><span>Showing ${page.start}–${page.end} of ${shown.length.toLocaleString('en')} · Page ${page.page} of ${page.pages}</span><button class="btn" data-reference-page="${page.page + 1}" ${page.page === page.pages ? 'disabled' : ''}>Next page →</button></nav>`;
  view.innerHTML =
    '<div class="view-heading"><div class="breadcrumbs">' +
    escapeHTML(breadcrumb) +
    '</div><h1 id="reference-heading" tabindex="-1">' +
    escapeHTML(title) +
    "</h1><p>" +
    escapeHTML(desc) +
    "</p></div>" +
    toolbarHTML() + referenceFiltersHTML() + pagination +
    '<p class="subtle" style="margin-bottom:22px" role="status">' +
    shown.length +
    " topic" +
    (shown.length === 1 ? "" : "s") +
    (query ? " matching “" + escapeHTML(query) + "”" : "") +
    "</p>" +
    (shown.length
      ? currentView === "all" || query || currentView === "saved"
        ? DATA.map((s) => {
            const group = page.cards.filter((c) => c.section === s.id);
            return group.length
              ? '<section class="result-group"><h2>' +
                  escapeHTML(s.title) +
                  '</h2><div class="topic-grid">' +
                  group.map(cardHTML).join("") +
                  "</div></section>"
              : "";
          }).join("")
        : '<div class="topic-grid">' + page.cards.map(cardHTML).join("") + "</div>"
      : emptyHTML(
          currentView === "saved" && !query
            ? "Your bookmarks start here."
            : "No matching topics.",
          "Try another search or change the filters. Use the bookmark button on any topic to save it.",
        )) + (page.pages > 1 ? pagination : '');
  if (!query && DATA.some((s) => s.id === currentView)) {
    const i = DATA.findIndex((s) => s.id === currentView);
    view.insertAdjacentHTML(
      "beforeend",
      '<div class="section-end">' +
        (i > 0
          ? '<button class="btn" data-view="' +
            DATA[i - 1].id +
            '">← Previous section</button>'
          : "<span></span>") +
        (i < DATA.length - 1
          ? '<button class="btn" data-view="' +
            DATA[i + 1].id +
            '">Next section →</button>'
          : '<button class="btn" data-view="home">Back to study desk</button>') +
        "</div>",
    );
  }
}
const mobileView = matchMedia("(max-width:760px)");
function setMenu(open) {
  document.body.classList.toggle("nav-open", open);
  $("#menu-button").setAttribute("aria-expanded", open);
  $("#menu-button").setAttribute(
    "aria-label",
    open ? "Close topic navigation" : "Open topic navigation",
  );
  $("#study-sidebar").inert = document.body.classList.contains("account-loading") || (mobileView.matches && !open);
}
mobileView.addEventListener("change", () => setMenu(false));
function navigate(id, hash = true) {
  stopCourseRun();
  problemPractice?.stop();
  clearTimeout(courseDraftTimer);
  persist();
  currentView = validView(id) ? id : "start";
  if (currentView.startsWith("lesson-")) {
    progress.course.last = currentView.slice(7);
    persist();
  }
  query = "";
  $("#search").value = "";
  level = "all";
  completion = "all";
  referenceCurrentPage = 1;
  referenceType = referenceGroup = referenceStatus = 'all';
  setMenu(false);
  if (hash) {
    try {
      history.replaceState(null, "", "#" + encodeURIComponent(id));
    } catch {
      /* Navigation also works when history is unavailable. */
    }
  }
  render();
  if (currentView === "start") $("#welcome-heading")?.focus({ preventScroll: true });
  if (currentView === "console") $("#console-heading")?.focus({ preventScroll: true });
  if (currentView === 'problems') $('#problem-heading')?.focus({ preventScroll: true });
  window.scrollTo({ top: 0, behavior: "instant" });
}
let searchTimer;
$("#search").addEventListener("input", () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    stopCourseRun();
    query = $("#search").value.trim();
    level = "all";
    completion = "all";
    referenceCurrentPage = 1;
    render();
  }, 140);
});
async function copyText(value) {
  try {
    await navigator.clipboard.writeText(value);
  } catch {
    const el = document.createElement("textarea");
    el.value = value;
    el.style.cssText = "position:fixed;top:0;left:-9999px";
    document.body.append(el);
    el.select();
    const ok = document.execCommand("copy");
    el.remove();
    if (!ok) {
      toast("Copy is unavailable here. Select the code and copy it manually.");
      return;
    }
  }
  toast("Code copied.");
}
/* 6. REFERENCE PLAYGROUND — run, stop and reset example code. */
let originalCode = 'console.log("Hello, JavaScript!");',
  activeFrame = null,
  runTimer = null,
  runToken = null,
  logCount = 0;
function stopRun(message) {
  if (activeFrame) {
    activeFrame.contentWindow?.postMessage(
      { type: "stop", token: runToken },
      "*",
    );
    activeFrame.remove();
    activeFrame = null;
  }
  clearTimeout(runTimer);
  runToken = null;
  $("#run-button").disabled = false;
  $("#stop-button").disabled = true;
  if (message) $("#run-state").textContent = message;
}
function openRunner(card) {
  stopRun();
  originalCode = card
    ? card.code
    : 'const name = "JavaScript";\nconsole.log("Hello, " + name + "!");';
  $("#editor").value = originalCode;
  $("#runner-title").textContent = card
    ? "Try it: " + card.title
    : "JavaScript playground";
  $("#console").textContent = "Your output will appear here.";
  $("#console").classList.remove("error");
  $("#run-state").textContent = "Ready";
  $("#runner-dialog").showModal();
  if (card) runCode();
}
function runCode() {
  stopRun();
  const code = $("#editor").value;
  if (code.length > 60000) {
    toast("Please keep playground examples under 60,000 characters.");
    return;
  }
  $("#console").textContent = "";
  $("#console").classList.remove("error");
  $("#run-state").textContent = "Running…";
  $("#run-button").disabled = true;
  $("#stop-button").disabled = false;
  logCount = 0;
  runToken = String(Date.now()) + "-" + Math.random().toString(36).slice(2);
  activeFrame = document.createElement("iframe");
  activeFrame.hidden = true;
  activeFrame.setAttribute("sandbox", "allow-scripts");
  activeFrame.setAttribute("aria-hidden", "true");
  activeFrame.srcdoc = RUNNER_HTML;
  document.body.append(activeFrame);
  runTimer = setTimeout(() => {
    if (!activeFrame) return;
    $("#console").textContent +=
      "\nStopped: the example exceeded the 3-second limit.";
    $("#console").classList.add("error");
    stopRun("Time limit reached");
  }, 3000);
}
window.addEventListener("message", (e) => {
  if (
    !activeFrame ||
    e.source !== activeFrame.contentWindow ||
    !e.data ||
    typeof e.data !== "object"
  )
    return;
  const msg = e.data;
  if (msg.type === "ready") {
    activeFrame.contentWindow.postMessage(
      { type: "run", token: runToken, code: $("#editor").value },
      "*",
    );
    return;
  }
  if (msg.token !== runToken) return;
  if (msg.type === "log") {
    if (logCount++ < 100) {
      $("#console").textContent +=
        (logCount > 1 ? "\n" : "") + String(msg.text).slice(0, 12000);
      $("#console").scrollTop = $("#console").scrollHeight;
    }
  } else if (msg.type === "error") {
    $("#console").textContent +=
      ($("#console").textContent ? "\n" : "") + String(msg.text);
    $("#console").classList.add("error");
    stopRun("Finished with an error");
  } else if (msg.type === "done") {
    if (!$("#console").textContent)
      $("#console").textContent =
        "Finished. No console output. Try console.log(value).";
    stopRun("Finished");
  }
});
$("#run-button").onclick = runCode;
$("#stop-button").onclick = () => {
  stopRun("Stopped");
  $("#console").textContent += "\nStopped by you.";
};
$("#reset-button").onclick = () => {
  stopRun("Ready");
  $("#editor").value = originalCode;
  $("#console").textContent = "Example reset. Press Run code to try it.";
  $("#console").classList.remove("error");
};
$("#copy-editor").onclick = () => copyText($("#editor").value);
$("#runner-dialog").addEventListener("close", () => stopRun());
$("#editor").addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
    e.preventDefault();
    runCode();
  } else if (e.key === "Tab") {
    e.preventDefault();
    const a = e.target.selectionStart,
      b = e.target.selectionEnd;
    e.target.setRangeText("  ", a, b, "end");
  }
});
/* 7. REFERENCE BUTTONS, BOOKMARKS, BACKUPS AND KEYBOARD SHORTCUTS */
function updateCardState(id) {
  document.querySelectorAll('[data-card="' + id + '"]').forEach((el) => {
    const saved = progress.saved.includes(id),
      done = progress.done.includes(id);
    el.classList.toggle("card-complete", done);
    const b = el.querySelector("[data-save]");
    b.setAttribute("aria-pressed", saved);
    b.setAttribute(
      "aria-label",
      (saved ? "Remove bookmark for " : "Bookmark ") + cardsById.get(id).title,
    );
    el.querySelector("[data-done]").checked = done;
  });
}
document.addEventListener("click", (e) => {
  const b = e.target.closest("button");
  if (!b) return;
  if (b.dataset.referencePage) {
    referenceCurrentPage = Number(b.dataset.referencePage);
    render();
    window.scrollTo({ top: 0, behavior: 'instant' });
    $('#reference-heading')?.focus({ preventScroll: true });
    return;
  }
  if (b.dataset.view) {
    navigate(b.dataset.view);
    return;
  }
  if (b.dataset.save) {
    const id = b.dataset.save;
    progress.saved = progress.saved.includes(id)
      ? progress.saved.filter((x) => x !== id)
      : [...progress.saved, id];
    persist();
    updateCardState(id);
    if (currentView === "saved" && !query && !progress.saved.includes(id))
      render();
    return;
  }
  if (b.dataset.copy) {
    copyText(cardsById.get(b.dataset.copy).code);
    return;
  }
  if (b.dataset.run) {
    openRunner(cardsById.get(b.dataset.run));
    return;
  }
  if (b.dataset.close) {
    document.getElementById(b.dataset.close).close();
    return;
  }
  if (b.dataset.expand) {
    $("#view")
      .querySelectorAll("details")
      .forEach((d) => (d.open = b.dataset.expand === "open"));
    return;
  }
  if (b.hasAttribute("data-print")) {
    const states = [...$("#view").querySelectorAll("details")].map((d) => [
      d,
      d.open,
    ]);
    states.forEach(([d]) => (d.open = true));
    window.addEventListener(
      "afterprint",
      () => states.forEach(([d, open]) => (d.open = open)),
      { once: true },
    );
    window.print();
  }
});
document.addEventListener("change", (e) => {
  if (['reference-type', 'reference-group', 'reference-status'].includes(e.target.id)) {
    const control = e.target.id;
    if (e.target.id === 'reference-type') referenceType = e.target.value;
    if (e.target.id === 'reference-group') referenceGroup = e.target.value;
    if (e.target.id === 'reference-status') referenceStatus = e.target.value;
    referenceCurrentPage = 1;
    render();
    document.getElementById(control)?.focus();
    return;
  }
  if (e.target.dataset.done) {
    const id = e.target.dataset.done;
    progress.done = e.target.checked
      ? [...new Set([...progress.done, id])]
      : progress.done.filter((x) => x !== id);
    persist();
    updateCardState(id);
    if (completion !== "all") render();
  }
  if (e.target.id === "level-filter") {
    level = e.target.value;
    referenceCurrentPage = 1;
    render();
  }
  if (e.target.id === "completion-filter") {
    completion = e.target.value;
    referenceCurrentPage = 1;
    render();
  }
});
$("#menu-button").onclick = () =>
  setMenu(!document.body.classList.contains("nav-open"));
$("#shade").onclick = () => setMenu(false);
$("#home-link").addEventListener("click", (event) => {
  if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  navigate("start");
});
$("#playground-button").onclick = () => openRunner();
$("#settings-button").onclick = () => {
  $("#settings-dialog").showModal();
};
$("#help-button").onclick = $("#footer-help").onclick = () =>
  $("#help-dialog").showModal();
for (const [id, key] of [
  ["text-size", "size"],
  ["theme", "theme"],
  ["spacing", "spacing"],
])
  $("#" + id).addEventListener("change", (e) => {
    progress.settings[key] = e.target.value;
    applySettings();
    persist();
  });
$("#export-progress").onclick = () => {
  const blob = new Blob([JSON.stringify(progress, null, 2)], {
      type: "application/json",
    }),
    url = URL.createObjectURL(blob),
    a = document.createElement("a");
  a.href = url;
  a.download = "javascript-study-progress.json";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast("Progress backup downloaded.");
};
$("#import-progress").onclick = () => $("#import-file").click();
$("#import-file").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    if (file.size > MAX_PROGRESS_BYTES)
      throw Error("That file is too large for a progress backup.");
    const incoming = validateProgress(JSON.parse(await file.text()));
    progress.saved = [...new Set([...progress.saved, ...incoming.saved])];
    progress.done = [...new Set([...progress.done, ...incoming.done])];
    progress.settings = incoming.settings;
    progress.course = mergeCourse(incoming.course);
    progress.consolePractice = mergeConsoleProgress(freshConsoleProgress(), incoming.consolePractice, progress.consolePractice);
    progress.problemPractice = mergeProblemProgress(freshProblemProgress(), incoming.problemPractice, progress.problemPractice);
    problemPractice?.reset();
    persist();
    applySettings();
    render();
    toast(
      "Progress restored. Bookmarks, studied topics, and lesson achievements were kept.",
    );
  } catch (err) {
    toast(err.message || "Could not read the progress backup.");
  }
  e.target.value = "";
});
document.addEventListener("keydown", (e) => {
  if (
    e.key === "/" &&
    !e.ctrlKey &&
    !e.metaKey &&
    !e.altKey &&
    !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName) &&
    !document.querySelector("dialog[open]")
  ) {
    e.preventDefault();
    $("#search").focus();
  }
  if (e.key === "Escape") setMenu(false);
});
function readHash() {
  try {
    return decodeURIComponent(location.hash.slice(1));
  } catch {
    return "start";
  }
}
window.addEventListener("hashchange", () => {
  const id = readHash();
  if (id === "main") return;
  navigate(validView(id) ? id : "start", false);
});
/* 8. COURSE PROGRESS — load, validate and merge lesson achievements. */
// Course state lives in the same backup as the original reference progress.
function freshCourse() {
  return { last: "first-program", lessons: {} };
}
function validateCourse(value) {
  const out = freshCourse();
  if (!value || typeof value !== "object") return out;
  if (COURSE.lessons.some((l) => l.id === value.last)) out.last = value.last;
  for (const lesson of COURSE.lessons) {
    for (const key of lessonProgressKeys(lesson)) {
    const v = value.lessons?.[key];
    if (!v || typeof v !== "object") continue;
    const answers = Array.isArray(v.answers)
      ? lesson.quiz.map((q, i) =>
          Number.isInteger(v.answers[i]) &&
          v.answers[i] >= 0 &&
          v.answers[i] < q.choices.length
            ? v.answers[i]
            : null,
        )
      : [null, null, null];
    out.lessons[key] = {
      step: Number.isInteger(v.step) && v.step >= 0 && v.step <= 4 ? v.step : 0,
      extra: (() => { try { return cleanExtraProgress(v.extra); } catch { return {}; } })(),
      extraSelected: isExtraId(v.extraSelected) ? v.extraSelected : null,
      read: Array.isArray(v.read)
        ? [...new Set(v.read.filter((n) => n === 0 || n === 1))]
        : [],
      code:
        typeof v.code === "string"
          ? v.code.slice(0, 60000)
          : initialLessonCode(lesson, key),
      passed: v.passed === true,
      answers,
      submitted: v.submitted === true && answers.every((a) => a !== null),
      best: Number.isInteger(v.best) && v.best >= 0 && v.best <= 3 ? v.best : 0,
      order: Array.isArray(v.order)
        ? [
            ...new Set(
              v.order.filter((n) => Number.isInteger(n) && n >= 0 && n < 3),
            ),
          ]
        : [],
    };
    }
  }
  return out;
}
function lessonState(lesson) {
  if (!progress.course) progress.course = freshCourse();
  return (progress.course.lessons[lessonProgressKey(lesson)] ||= {
    step: 0,
    read: [],
    code: lesson.exercise.starter || "",
    passed: false,
    answers: [null, null, null],
    submitted: false,
    best: 0,
    order: [],
    extra: {},
    extraSelected: null,
  });
}
function extraState(lesson, exercise) {
  const s = lessonState(lesson);
  s.extra ||= {};
  return (s.extra[exercise.id] ||= { code: exercise.starter || '', passed: false, choice: null, submitted: false });
}
function activePractice(lesson) {
  const s = lessonState(lesson);
  if (s.step !== 4) return { exercise: lesson.exercise, state: s, extraId: null };
  const exercise = lesson.extras.find(ex => ex.id === s.extraSelected);
  return exercise ? { exercise, state: extraState(lesson, exercise), extraId: exercise.id } : null;
}
function lessonComplete(lesson) {
  const s = lessonState(lesson);
  return s.read.length === 2 && s.passed && s.best === 3;
}
function previousLessonState(lesson) {
  const previous = progress.course.lessons[lesson.id];
  return hasLessonWork(previous, initialLessonCode(lesson, lesson.id)) ? previous : null;
}
function previousCourseNotice() {
  return COURSE.lessons.some(previousLessonState)
    ? '<aside class="course-update"><strong>More explanation. Fresh practice.</strong><p>These lessons now include detailed walkthroughs and new exercises. Progress here tracks the new version. Your earlier code and results are kept inside each lesson under “Your earlier work”.</p></aside>'
    : '';
}
function earlierWork(lesson) {
  const previous = previousLessonState(lesson);
  if (!previous) return '';
  return `<details class="earlier-work"><summary>Your earlier work is saved</summary><p>This lesson has new exercises and quiz questions. Your previous attempt stays separate, so its answers are not applied to the new questions.</p><p>Earlier version: ${previous.read.length}/2 reading pages · Practice ${previous.passed ? 'passed' : 'not passed'} · Best quiz ${previous.best}/3</p>${previous.code ? `<h3>Your earlier code</h3><pre><code>${escapeHTML(previous.code)}</code></pre>` : '<p>No earlier code draft.</p>'}</details>`;
}
function courseCount() {
  return COURSE.lessons.filter(lessonComplete).length;
}
function mergeCourse(incoming) {
  const current = progress.course || freshCourse();
  for (const lesson of COURSE.lessons) {
    for (const key of lessonProgressKeys(lesson)) {
    const next = incoming.lessons[key];
    if (!next) continue;
    const old = current.lessons[key];
    current.lessons[key] = old
      ? {
          ...next,
          read: [...new Set([...old.read, ...next.read])],
          passed: old.passed || next.passed,
          best: Math.max(old.best, next.best),
          extra: mergeExtraProgress({}, next.extra, old.extra),
        }
      : next;
    }
  }
  current.last = incoming.last;
  return current;
}
function validView(id) {
  return (
    DATA.some((s) => s.id === id) ||
    ["start", "course", "console", "problems", "home", "saved", "all"].includes(id) ||
    COURSE.lessons.some((l) => "lesson-" + l.id === id)
  );
}
function activeLesson() {
  return COURSE.lessons.find((l) => "lesson-" + l.id === currentView);
}
function updateCourseBadge() {
  const badge = document.getElementById("course-count");
  if (badge) badge.textContent = courseCount() + "/" + COURSE.lessons.length;
  const consoleBadge = document.getElementById('console-count');
  if (consoleBadge) consoleBadge.textContent = consoleStats(progress.consolePractice).solved + '/' + consoleQuestionCount;
  const problemBadge = document.getElementById('problem-count');
  if (problemBadge) problemBadge.textContent = problemSolvedCount(progress.problemPractice) + '/' + problemChallengeCount;
}
function isCourseView() {
  return currentView === "course" || !!activeLesson();
}
/* 9. COURSE DISPLAY — welcome page, dashboard, lessons, exercises and quizzes. */
const welcomeExample = {
  title: "Your first JavaScript program",
  code: 'const message = "Hello, JavaScript!";\nconsole.log(message);\nconsole.log(7 + 5);',
};

// The home page introduces the course. Learning path still lists every lesson.
function renderStart() {
  const total = COURSE.lessons.length;
  const done = courseCount();
  const last = COURSE.lessons.find((lesson) => lesson.id === progress.course.last) || COURSE.lessons[0];
  const started = last.id !== "first-program" || COURSE.lessons.some((lesson) => {
    const state = lessonState(lesson);
    return state.step > 0 || state.read.length > 0 || state.passed || state.best > 0 ||
      state.answers.some((answer) => answer !== null) || state.code !== (lesson.exercise.starter || "");
  });
  const finished = done === total;
  const percent = Math.round(done / total * 100);
  const lessonIndex = COURSE.lessons.indexOf(last) + 1;
  const steps = ["Learn the idea", "See it in action", "Practice", "Quiz", "Extra practice (optional)"];
  const action = finished ? 'data-view="course"' : `data-lesson="${started ? last.id : "first-program"}"`;

  return `<div class="welcome-page">
    <section class="welcome-hero" aria-labelledby="welcome-heading">
      <div class="welcome-intro">
        <div class="welcome-kicker"><span aria-hidden="true">JS</span> A free course. A fresh start.</div>
        <h1 id="welcome-heading" tabindex="-1">Your first<br>JavaScript program<span class="welcome-accent"> starts here.</span></h1>
        <p class="welcome-lead">Go from “where do I begin?” to code you understand. Learn one idea, try it yourself, then put it to the test.</p>
        <div class="course-actions">
          <button class="btn course-primary" ${action}>${finished ? "Revisit the course" : started ? "Continue learning" : "Start learning"} <span aria-hidden="true">→</span></button>
          <button class="btn" data-view="course">Explore the course</button>
        </div>
        <p class="welcome-note">No experience needed · Learn at your own pace</p>
      </div>
      <div class="welcome-example" aria-label="A first JavaScript example">
        <div class="welcome-editor-bar"><span><span class="welcome-file-icon" aria-hidden="true">JS</span> hello.js</span><span>YOUR FIRST FEW LINES</span></div>
        <pre><code>${highlight(welcomeExample.code)}</code></pre>
        <div class="welcome-output"><span>EXPECTED OUTPUT</span><pre>Hello, JavaScript!\n12</pre></div>
        <button class="welcome-try" data-welcome-example>Try this code <span aria-hidden="true">↗</span></button>
        <p>Change a word. Run it. See what happens.</p>
      </div>
    </section>

    ${previousCourseNotice()}
    <div class="welcome-facts" aria-label="What is included">
      <div><strong>${total}</strong><span>guided lessons</span></div>
      <div><strong>${total}</strong><span>practice activities</span></div>
      <div><strong>${COURSE.lessons.reduce((count, lesson) => count + lesson.quiz.length, 0)}</strong><span>quiz questions</span></div>
      <div><strong>EN + SV</strong><span>English with Swedish terms</span></div>
    </div>

    ${started ? `<section class="welcome-resume" aria-label="Your saved progress">
      <div><span class="welcome-label">${finished ? "LOOK HOW FAR YOU’VE COME" : "PICK UP WHERE YOU LEFT OFF"}</span>
        <h2>${finished ? `All ${total} lessons complete.` : escapeHTML(last.title)}</h2>
        <p>${finished ? "Revisit an exercise or try something new in the playground." : `Lesson ${lessonIndex} of ${total} · ${steps[lessonState(last).step]}`}</p></div>
      <div class="welcome-progress"><strong>${done} / ${total} <span>complete</span></strong>
        <div class="progress-track" role="progressbar" aria-label="Completed lessons" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${percent}"><div style="width:${percent}%"></div></div></div>
    </section>` : ""}

    <section class="welcome-method" aria-labelledby="welcome-method-heading">
      <div class="welcome-section-heading"><div><span class="welcome-label">A LITTLE PRACTICE, EVERY STEP</span><h2 id="welcome-method-heading">Learn it. Write it. Make it stick.</h2></div><p>You do more than read. Every lesson gives you a chance to use what you just learned.</p></div>
      <ol class="welcome-steps">
        <li><span aria-hidden="true">01</span><h3>Get the idea</h3><p>Short explanations and worked examples make each new concept easier to follow.</p></li>
        <li><span aria-hidden="true">02</span><h3>Make something work</h3><p>Write code in your browser. Use hints and checks to understand what to try next.</p></li>
        <li><span aria-hidden="true">03</span><h3>Check what you know</h3><p>Finish with a three-question quiz. Get an explanation for every answer and retry anytime.</p></li>
      </ol>
    </section>

    ${consolePracticeCard(progress.consolePractice)}
    ${problemPracticeCard(progress.problemPractice)}
    <section class="welcome-curriculum" aria-labelledby="welcome-curriculum-heading">
      <div class="welcome-section-heading"><div><span class="welcome-label">YOUR LEARNING PATH</span><h2 id="welcome-curriculum-heading">Start small. Build on it.</h2></div><button class="btn" data-view="course">See all ${total} lessons <span aria-hidden="true">→</span></button></div>
      <div class="welcome-units">${COURSE.modules.map((unit, index) => {
        const lessons = COURSE.lessons.filter((lesson) => lesson.module === index);
        return `<button class="welcome-unit" data-lesson="${lessons[0].id}">
          <span class="welcome-unit-top"><span>UNIT ${unit.label}</span><span>${lessons.length} lessons</span></span>
          <strong>${escapeHTML(unit.title)}</strong><span class="welcome-unit-description">${escapeHTML(unit.subtitle)}</span>
          <span class="welcome-unit-bottom">Explore this unit <span aria-hidden="true">↗</span></span>
        </button>`;
      }).join("")}</div>
    </section>

    <section class="welcome-save" aria-labelledby="welcome-save-heading">
      <div><span class="welcome-label">KEEP YOUR MOMENTUM</span><h2 id="welcome-save-heading">Your progress, wherever you learn.</h2><p>Start as a guest, or sign in to save your lessons, code and quiz results across devices.</p></div>
      <button class="btn course-primary" data-welcome-account>${accounts?.signedIn ? "My account" : "Sign in / Create account"} <span aria-hidden="true">→</span></button>
    </section>
    <footer class="welcome-footer"><span>Made for learning, one small step at a time.</span><button class="btn" data-view="home">Explore the reference library <span aria-hidden="true">↗</span></button></footer>
  </div>`;
}

function courseDashboard() {
  const done = courseCount(),
    total = COURSE.lessons.length,
    pct = Math.round((done / total) * 100);
  const last = COURSE.lessons.find((l) => l.id === progress.course.last),
    next =
      (last && !lessonComplete(last)
        ? last
        : COURSE.lessons.find((l) => !lessonComplete(l))) || COURSE.lessons[0];
  const started = Object.values(progress.course.lessons).some(
    (s) => s.read.length || s.passed || s.answers.some((a) => a !== null),
  );
  return `<section class="course-hero"><div class="course-kicker">Your guided JavaScript course</div><h1>Small lessons.<br><span class="soft">Real understanding.</span></h1><p class="lead">Learn the idea, write the code, then check what sticks.<br>A hands-on path built from your ${COURSE.modules.length} class websites.</p><div class="course-actions"><button class="btn course-primary" data-lesson="${next.id}">${done === total ? "Revisit the course" : started ? "Continue learning" : "Start learning"} <span aria-hidden="true">→</span></button><button class="btn" data-view="home">Open reference guide</button></div><div class="course-meta"><span><strong>${total}</strong> guided lessons</span><span><strong>${total}</strong> practice activities</span><span><strong>${COURSE.lessons.reduce((n, l) => n + l.quiz.length, 0)}</strong> quiz questions</span><span>English + Swedish terms</span></div></section>
  ${previousCourseNotice()}
  ${consolePracticeCard(progress.consolePractice)}
  ${problemPracticeCard(progress.problemPractice)}
  <section class="course-summary" aria-label="Course progress"><div><h2>${done === total ? "Course completed" : "Your learning journey"}</h2><p>${done} of ${total} lessons complete · Read both pages, pass practice, and score 3/3 on the quiz.</p></div><div class="course-percent">${pct}%</div><div class="progress-track" role="progressbar" aria-label="Lesson completion" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}"><div style="width:${pct}%"></div></div></section>
  ${done === total ? `<section class="course-finished"><h2>You built a strong foundation.</h2><p>You completed all ${total} lessons, from the basics to higher-order functions and refactoring. Revisit any exercise, try different inputs, or use the reference guide for your next project.</p></section>` : ""}
  ${COURSE.modules
    .map((unit, mi) => {
      const lessons = COURSE.lessons.filter((l) => l.module === mi);
      return `<section class="unit"><div class="unit-heading"><span class="unit-number">${unit.label}</span><div><h2>${escapeHTML(unit.title)}</h2><p>${escapeHTML(unit.subtitle)}</p></div><span class="unit-count">${lessons.filter(lessonComplete).length} / ${lessons.length} complete</span></div><div class="lesson-list">${lessons
        .map((l) => {
          const s = lessonState(l),
            complete = lessonComplete(l),
            active =
              s.read.length || s.passed || s.answers.some((a) => a !== null);
          return `<button class="lesson-row ${complete ? "complete" : active ? "active" : ""}" data-lesson="${l.id}"><span class="lesson-number" aria-hidden="true">${complete ? "✓" : String(COURSE.lessons.indexOf(l) + 1).padStart(2, "0")}</span><span class="lesson-row-text"><strong>${escapeHTML(l.title)}</strong><small>${escapeHTML(l.summary)}</small></span><span class="lesson-row-side">~${l.minutes} min<b>${complete ? "Completed" : active ? "In progress" : "Start lesson"} →</b></span></button>`;
        })
        .join(
          "",
        )}</div><p class="source-note">Class source: <a href="${unit.source}" target="_blank" rel="noopener noreferrer">${escapeHTML(unit.sourceTitle)} ↗</a></p></section>`;
    })
    .join("")}
  <div class="course-how"><div><strong>01 · Understand</strong><p>Two short explanations, worked examples, and a key takeaway in every lesson.</p></div><div><strong>02 · Put it to work</strong><p>Edit real JavaScript with checks and hints. The Git lesson uses a command-order simulation.</p></div><div><strong>03 · Check your learning</strong><p>Three questions with explanations. Retry as often as you need; your best score stays.</p></div></div><p class="course-storage">${storageOK ? "Guest progress is saved in this browser. Sign in to save across devices, or use Settings to download a backup." : "Browser storage is unavailable. Use Settings to download your progress before closing the guide."} Once loaded, lessons can be studied offline. Account sync and source links need internet access.</p>`;
}
function lessonStepStatus(s, index) {
  return index < 2
    ? s.read.includes(index)
    : index === 2
      ? s.passed
      : s.best === 3;
}
function renderLesson(lesson) {
  const s = lessonState(lesson),
    unit = COURSE.modules[lesson.module],
    index = COURSE.lessons.indexOf(lesson),
    labels = ["Learn the idea", "See it in action", "Practice", "Quiz"];
  return `<div class="lesson-topline"><button class="btn" data-view="course">← Learning path</button><span>Lesson ${index + 1} of ${COURSE.lessons.length} · ~${lesson.minutes} min</span></div><header class="lesson-header"><div class="eyebrow">Unit ${unit.label} · ${escapeHTML(unit.subtitle)}</div><h1 id="lesson-heading" class="course-anchor" tabindex="-1">${escapeHTML(lesson.title)}</h1><p>${escapeHTML(lesson.summary)}</p></header><nav class="lesson-steps" aria-label="Lesson steps">${labels.map((label, i) => `<button class="lesson-step ${lessonStepStatus(s, i) ? "is-done" : ""}" data-step="${i}" ${s.step === i ? 'aria-current="step"' : ""}><span class="step-dot" aria-hidden="true">${lessonStepStatus(s, i) ? "✓" : i + 1}</span>${label}${lessonStepStatus(s, i) ? '<span class="sr-only"> (completed)</span>' : ""}</button>`).join("")}</nav>
  <div class="extra-nav"><button class="btn ${s.step === 4 ? 'extra-active' : ''}" data-extra-hub ${s.step === 4 ? 'aria-current="page"' : ''}>Extra practice <span>· optional · <span data-extra-count>${extraCount(lesson)}</span>/10 done</span></button></div>
  ${earlierWork(lesson)}
  ${s.step < 2 ? renderLearn(lesson, s) : s.step === 2 ? renderPractice(lesson, s) : s.step === 3 ? renderQuiz(lesson, s) : renderExtra(lesson, s)}
  <p class="terms"><strong>Swedish connections</strong><br>${escapeHTML(lesson.terms)}</p><p class="source-note lesson-source">Based on the topics in <a href="${unit.source}" target="_blank" rel="noopener noreferrer">${escapeHTML(unit.sourceTitle)} ↗</a>. Explanations, practice checks and quizzes are written for this guide.</p>`;
}
function renderLearn(lesson, s) {
  const part = lesson.steps[s.step];
  return `${s.step === 0 ? `<section class="lesson-goals" aria-label="Learning goals"><div><h2>What you’ll learn</h2><ul>${lesson.objectives.map(goal => `<li>${escapeHTML(goal)}</li>`).join('')}</ul></div><p><strong>Before you start</strong>${escapeHTML(lesson.prerequisites)}</p></section>` : ''}
    <div class="lesson-reading-grid">
      <article class="learn-card lesson-explanation">
        <div class="exercise-label">${s.step === 0 ? 'UNDERSTAND THE IDEA' : 'BUILD ON THE IDEA'}</div>
        <h2>${escapeHTML(part.title)}</h2>
        ${part.paragraphs.map(p => `<p>${escapeHTML(p)}</p>`).join('')}
        <aside class="lesson-takeaway"><strong>The key idea</strong>${escapeHTML(part.takeaway)}</aside>
        <aside class="lesson-mistake"><strong>A common mistake</strong><p>${escapeHTML(part.mistake)}</p></aside>
      </article>
      <section class="lesson-demonstration" aria-label="Worked example and explanation">
        <div class="lesson-example"><div class="lesson-example-label">${part.language === 'html' ? 'HTML · index.html' : part.language === 'terminal' ? 'TERMINAL · Git commands' : 'JAVASCRIPT · worked example'}</div><pre><code>${highlight(part.code)}</code></pre></div>
        <div class="lesson-expected"><strong>${part.language === 'javascript' ? 'Expected console output' : 'What this does'}</strong><pre>${escapeHTML(part.output)}</pre></div>
        ${part.language === 'javascript' ? `<button class="btn" data-run-lesson-example="${s.step}">Run and experiment with this example <span aria-hidden="true">↗</span></button>` : '<p class="course-storage">Read this example here. It belongs in an HTML file or terminal, not in the JavaScript practice editor.</p>'}
        <h3>Let’s walk through it</h3><ol class="lesson-walkthrough">${part.walkthrough.map(([snippet, explanation]) => `<li><code>${escapeHTML(snippet)}</code><p>${escapeHTML(explanation)}</p></li>`).join('')}</ol>
      </section>
    </div>
    <section class="lesson-understanding" aria-labelledby="understanding-heading"><span class="exercise-label">PAUSE AND THINK</span><h2 id="understanding-heading">Check your understanding</h2><p>${escapeHTML(part.check.prompt)}</p><details><summary>Reveal the answer and reasoning</summary><strong>${escapeHTML(part.check.answer)}</strong><p>${escapeHTML(part.check.why)}</p></details></section>
    <div class="lesson-bottom"><button class="btn" ${s.step === 0 ? 'data-view="course"' : 'data-step="0"'}>← ${s.step === 0 ? 'Learning path' : 'Previous explanation'}</button><span class="subtle">Take your time. Try predicting the output before running it.</span><button class="btn course-primary" data-continue>${s.step === 0 ? 'Continue the explanation' : 'Try it yourself'} →</button></div>`;
}
function renderPractice(lesson, s, ex = lesson.exercise, extra = false) {
  return `<div class="practice-grid"><section class="practice-brief"><div class="exercise-label">${ex.kind === 'code' ? 'YOUR TURN · A NEW SITUATION' : 'YOUR TURN · GIT SIMULATION'}</div><h2>${escapeHTML(ex.title)}</h2><p class="practice-intro">Use the same idea in a different example. Work through these steps in order.</p><ol>${ex.instructions.map(t => `<li>${escapeHTML(t)}</li>`).join('')}</ol>
  <aside class="practice-reminder"><strong>Connect it to the lesson</strong><p>${escapeHTML(lesson.steps[1].takeaway)}</p><button class="btn" data-step="0">Review the explanation</button></aside>
  <div class="practice-hints"><h3>Get a little help</h3>${ex.hints.map((hint, i) => `<details class="hint-box"><summary>Hint ${i + 1}${i === 0 ? ' · Where to begin' : i === 1 ? ' · The next step' : ' · Put it together'}</summary><p>${escapeHTML(hint)}</p></details>`).join('')}</div>
  <details class="hint-box"><summary>Worked solution, with reasoning</summary><p>Compare this with your attempt. Reading a solution does not complete the exercise.</p><pre><code>${highlight(ex.solution)}</code></pre><ol>${ex.solutionNotes.map(note => `<li>${escapeHTML(note)}</li>`).join('')}</ol></details>
  ${ex.kind === 'code' ? '<p class="course-storage">Core JavaScript only. No page DOM, network, or terminal access. Each run starts fresh and stops after 3 seconds.</p>' : ''}</section>
  ${ex.kind === "code" ? `<section class="code-workbench" aria-label="Coding practice"><div class="code-tab"><label for="course-editor"><strong>practice.js</strong></label><span>Ctrl / ⌘ + Enter</span></div><textarea id="course-editor" class="course-editor" spellcheck="false" autocapitalize="off" autocorrect="off" aria-label="Practice JavaScript code" maxlength="60000">${escapeHTML(s.code)}</textarea><div class="course-code-actions"><button class="btn course-primary" id="course-run" data-check>▶ Run & check</button><button class="btn" id="course-stop" data-stop disabled>Stop</button><button class="btn" data-reset-code>Reset code</button><span class="course-save-status" id="course-save-status">${storageOK ? "Saved locally" : "Session only"}</span></div><div class="course-console-label">CONSOLE</div><pre id="course-console" class="course-console" aria-label="Exercise output">Run your code to see the output here.</pre><div id="practice-status" class="practice-status ${s.passed ? "success" : ""}" role="status">${s.passed ? "✓ Practice passed previously. You can keep experimenting." : "Ready when you are. Run your code to check it."}</div><section id="practice-feedback" class="practice-feedback" aria-label="Practice feedback" aria-live="polite" hidden></section><ul class="exercise-checks" id="exercise-checks">${ex.tests.map((t) => `<li>○ ${escapeHTML(t.label)}</li>`).join("")}</ul></section>` : renderOrder(ex, s)}</div>
  ${extra ? extraFooter(lesson, ex) : `<div class="lesson-bottom"><button class="btn" data-step="1">← Back to the lesson</button><button class="btn course-primary" data-step="3">${s.passed ? "Practice complete · Take the quiz" : "Take the quiz"} →</button></div>`}`;
}
function extraCount(lesson) {
  const states = lessonState(lesson).extra || {};
  return lesson.extras.filter(ex => states[ex.id]?.passed).length;
}
function nextLessonButton(lesson, primary = false) {
  const next = COURSE.lessons[COURSE.lessons.indexOf(lesson) + 1];
  return `<button class="btn ${primary ? 'course-primary' : ''}" ${next ? `data-lesson="${next.id}"` : 'data-view="course"'}>${next ? 'Next lesson' : 'Back to learning path'} →</button>`;
}
function extraFooter(lesson, exercise) {
  const next = lesson.extras[lesson.extras.indexOf(exercise) + 1];
  return `<div class="lesson-bottom extra-footer"><button class="btn" data-extra-hub>← All 10 exercises</button>${next ? `<button class="btn" data-extra="${next.id}">Try another exercise →</button>` : ''}${nextLessonButton(lesson)}</div>`;
}
function renderExtra(lesson, s) {
  const exercise = lesson.extras.find(ex => ex.id === s.extraSelected);
  const count = extraCount(lesson);
  if (!exercise) return `<section class="extra-practice" aria-labelledby="extra-heading">
    <header class="extra-header"><div><div class="exercise-label">A LITTLE MORE CONFIDENCE · EXTRAÖVNINGAR</div><h2 id="extra-heading">Same idea. New challenges.</h2><p>Choose any of these 10 exercises. Do one, a few, or all of them — this is entirely optional and does not affect lesson completion.</p></div><div class="extra-total"><strong>${count}<span>/10</span></strong><span>extra exercises completed</span></div></header>
    <div class="extra-toolbar"><p>Your drafts and completed exercises are saved separately. Pick any card to begin or continue.</p>${nextLessonButton(lesson, true)}</div>
    <div class="extra-grid">${lesson.extras.map((ex, index) => {
      const saved = s.extra?.[ex.id];
      const started = saved && (saved.code !== (ex.starter || '') || saved.choice !== null);
      return `<button class="extra-card ${saved?.passed ? 'is-complete' : ''}" data-extra="${ex.id}"><span class="extra-card-top"><span class="extra-number">${String(index + 1).padStart(2, '0')}</span><span class="extra-card-status">${saved?.passed ? '✓ Completed' : started ? 'Continue draft' : ex.level}</span></span><strong>${escapeHTML(ex.title)}</strong><span class="extra-description">${escapeHTML(ex.instructions[0])}</span><span class="extra-card-action">${saved?.passed ? 'Practice again' : started ? 'Continue exercise' : 'Try this exercise'} <span aria-hidden="true">↗</span></span></button>`;
    }).join('')}</div><div class="lesson-bottom"><button class="btn" data-step="3">← Back to quiz</button>${nextLessonButton(lesson)}</div></section>`;
  const state = extraState(lesson, exercise);
  return `<section class="extra-detail" aria-label="Optional extra exercise"><header class="extra-detail-header"><button class="btn" data-extra-hub>← All 10 exercises</button><span>Optional exercise ${lesson.extras.indexOf(exercise) + 1} of 10 · ${exercise.level}</span><span class="extra-completion" data-extra-completion>${state.passed ? '✓ Completed' : 'Try it at your own pace'}</span></header><p class="extra-note">Extra practice · You can leave for the next lesson whenever you’re ready. Each exercise has its own saved attempt.</p>
    ${exercise.kind === 'code' ? renderPractice(lesson, state, exercise, true) : renderExtraChoice(lesson, exercise, state)}</section>`;
}
function renderExtraChoice(lesson, exercise, state) {
  const correct = state.choice === exercise.answer;
  return `<section class="extra-choice"><div class="exercise-label">GIT SCENARIO · NO TERMINAL NEEDED</div><h2>${escapeHTML(exercise.title)}</h2><form id="extra-choice"><fieldset class="quiz-question"><legend>${escapeHTML(exercise.instructions[0])}</legend>${exercise.choices.map((choice, i) => `<label class="quiz-option ${state.submitted && i === exercise.answer ? 'correct' : state.submitted && i === state.choice ? 'incorrect' : ''}"><input type="radio" name="extra-choice" value="${i}" ${state.choice === i ? 'checked' : ''} ${state.submitted ? 'disabled' : ''}><span>${escapeHTML(choice)}</span></label>`).join('')}</fieldset><p id="extra-choice-notice" role="alert"></p>${state.submitted ? `<div class="answer-feedback ${correct ? '' : 'wrong'}" role="status"><strong>${correct ? '✓ Exercise completed' : 'Review the reasoning, then try again'}</strong>${escapeHTML(exercise.reasoning)}</div><button type="button" class="btn" data-retry-extra>Try again</button>` : '<button type="submit" class="btn course-primary">Check answer →</button>'}</form></section>${extraFooter(lesson, exercise)}`;
}
function renderOrder(ex, s) {
  return `<section class="code-workbench" style="padding:20px" aria-label="Command order practice"><h3 style="font-size:18px">Choose the next command</h3><div class="order-picks">${ex.commands.map((c, i) => `<button class="btn" data-order="${i}" ${s.order.includes(i) ? "disabled" : ""}>${escapeHTML(c)}</button>`).join("")}</div><div class="order-result" aria-label="Your command order">${s.order.length ? "<ol>" + s.order.map((i) => "<li>" + escapeHTML(ex.commands[i]) + "</li>").join("") + "</ol>" : "Your three commands will appear here."}</div><div class="course-actions"><button class="btn course-primary" data-check-order>Check order</button><button class="btn" data-reset-order>Start over</button></div><p id="practice-status" class="practice-status ${s.passed ? "success" : ""}" role="status">${s.passed ? "✓ You passed this practice." : "Select all three commands, then check your answer."}</p></section>`;
}
function renderQuiz(lesson, s) {
  const score = lesson.quiz.reduce(
      (n, q, i) => n + (s.answers[i] === q.answer),
      0,
    ),
    complete = lessonComplete(lesson);
  return `<section><header class="quiz-head"><h2>Let’s see what stuck.</h2><p>Three questions · Get all three right to pass · Unlimited retries</p><p class="subtle">Best score: ${s.best}/3${s.passed ? " · Practice complete" : " · Complete the practice too to finish this lesson."}</p></header><form id="lesson-quiz">${lesson.quiz.map((q, qi) => `<fieldset class="quiz-question"><legend>${qi + 1}. ${escapeHTML(q.prompt)}</legend>${q.choices.map((option, oi) => `<label class="quiz-option ${s.submitted && oi === q.answer ? "correct" : s.submitted && s.answers[qi] === oi ? "incorrect" : ""}"><input type="radio" name="question-${qi}" value="${oi}" ${s.answers[qi] === oi ? "checked" : ""} ${s.submitted ? "disabled" : ""}><span>${escapeHTML(option)}</span>${s.submitted && oi === q.answer ? '<span class="course-answer-label">✓ Correct answer</span>' : ""}</label>`).join("")}${s.submitted ? `<p class="answer-feedback ${s.answers[qi] !== q.answer ? "wrong" : ""}"><strong>${s.answers[qi] === q.answer ? "✓ Correct" : "↺ Review this one"}</strong>${escapeHTML(q.why)}</p>` : ""}</fieldset>`).join("")}<p id="quiz-notice" class="quiz-notice" role="alert"></p>${!s.submitted ? '<button type="submit" class="btn course-primary">Check my answers →</button>' : ""}</form>
  ${s.submitted ? `<section class="quiz-result" role="status"><h3>${score === 3 ? "✓ Quiz passed" : score + "/3 · Keep going"}${score === 3 ? " · 3/3" : ""}</h3><p>${score === 3 ? (complete ? "Lesson complete. You have read, practiced, and checked your understanding." : !s.passed ? "Your quiz is passed. Finish the practice to complete this lesson." : "Your quiz is passed. Finish both lesson pages using Continue to complete this lesson.") : "Read the explanations above, revisit the lesson if needed, then give it another try. Your best score is saved."}</p><button class="btn" data-retry-quiz>Retry quiz</button> ${!s.passed ? '<button class="btn course-primary" data-step="2">Go to practice →</button>' : s.read.length < 2 ? '<button class="btn course-primary" data-step="0">Review the lesson →</button>' : ""}</section>` : ""}
  ${complete ? `<aside class="extra-invitation"><div><strong>Lesson complete. What would you like to do next?</strong><p>Move on when you’re ready, or build confidence with 10 optional exercises. You don’t need to finish them all.</p></div><div class="course-actions">${nextLessonButton(lesson, true)}<button class="btn" data-extra-hub>Practice more · 10 exercises</button></div></aside>` : ""}
  <div class="lesson-bottom"><button class="btn" data-step="2">← Back to practice</button><button class="btn" data-view="course">Learning path</button></div></section>`;
}
function changeLessonStep(step) {
  const lesson = activeLesson();
  if (!lesson) return;
  stopCourseRun();
  courseUndoCode = null;
  lessonState(lesson).step = step;
  persist();
  render();
  focusLesson();
}
function focusLesson() {
  document.getElementById("lesson-heading")?.focus({ preventScroll: true });
  window.scrollTo({ top: 0, behavior: "instant" });
}
function showPracticePassed() {
  const stepButton = document.querySelector('[data-step="2"]');
  if (stepButton) {
    stepButton.classList.add("is-done");
    stepButton.innerHTML =
      '<span class="step-dot" aria-hidden="true">✓</span>Practice<span class="sr-only"> (completed)</span>';
  }
  const nextButton = document.querySelector('.lesson-bottom [data-step="3"]');
  if (nextButton)
    nextButton.textContent = "Practice complete · Take the quiz →";
}
function showPracticeFeedback(feedback) {
  const panel = document.getElementById('practice-feedback');
  if (!panel) return;
  panel.hidden = !feedback;
  if (!feedback) { panel.innerHTML = ''; return; }
  const value = item => `<pre>${escapeHTML(item.text)}</pre>${['requirement', 'undefined'].includes(item.type) ? '' : `<span class="feedback-type">${escapeHTML(item.type)}</span>`}`;
  panel.innerHTML = `<div class="exercise-label">LET’S FIX ONE THING AT A TIME</div><h3>${escapeHTML(feedback.title)}</h3><p>${escapeHTML(feedback.explanation)}</p>
    ${feedback.actual && feedback.expected ? `<dl class="feedback-values"><div><dt>Expected</dt><dd>${value(feedback.expected)}</dd></div><div><dt>Your result</dt><dd>${value(feedback.actual)}</dd></div></dl>` : ''}
    <div class="feedback-hint"><strong>Hint · Try this next</strong><p>${escapeHTML(feedback.hint)}</p></div>
    ${feedback.exerciseHint ? `<details><summary>Hint for this exercise</summary><p>${escapeHTML(feedback.exerciseHint)}</p></details>` : ''}
    ${feedback.technical ? `<details><summary>JavaScript error message</summary><pre>${escapeHTML(feedback.technical)}</pre></details>` : ''}
    <p class="feedback-next">Change one thing, then run your code again. Your draft stays here.</p>`;
}
/* 10. COURSE CODE RUNNER — sandboxed execution with a three-second limit. */
let courseRun = null,
  courseRunTimer = null,
  courseDraftTimer = null,
  courseUndoCode = null;
function stopCourseRun(message) {
  if (courseRun) {
    courseRun.frame.remove();
    courseRun = null;
  }
  clearTimeout(courseRunTimer);
  const run = document.getElementById("course-run"),
    stop = document.getElementById("course-stop");
  if (run) run.disabled = false;
  if (stop) stop.disabled = true;
  if (message && document.getElementById("practice-status"))
    document.getElementById("practice-status").textContent = message;
}
// The frame has an opaque origin and a no-network CSP. The worker keeps loops off the UI thread.
function courseFrameMain(executePracticeChecks, createCheckObserver) {
  let worker;
  function workerMain(executePracticeChecks, createCheckObserver) {
    self.onmessage = async ({ data }) => {
      const logs = [];
      let displayed = 0;
      const format = (value) => {
        if (value === undefined) return "undefined";
        if (typeof value === "string") return value;
        try {
          return (
            JSON.stringify(value, (_, v) =>
              typeof v === "bigint" ? String(v) + "n" : v,
            ) ?? String(value)
          );
        } catch {
          return String(value);
        }
      };
      const log = (...args) => {
        if (logs.length < 100) logs.push(args);
        if (displayed++ < 60)
          self.postMessage({
            type: "log",
            text: args.map(format).join(" ").slice(0, 4000),
          });
      };
      const output = {
        log,
        info: log,
        warn: log,
        error: log,
        table: log,
        dir: log,
      };
      self.postMessage(await executePracticeChecks(data, output, logs, createCheckObserver));
    };
  }
  addEventListener("message", (event) => {
    if (event.source !== parent || event.data?.type !== "run") return;
    const token = event.data.token;
    const send = (data) => parent.postMessage({ ...data, token }, "*");
    try {
      worker?.terminate();
      const url = URL.createObjectURL(
        new Blob(["(" + workerMain.toString() + ")(" + executePracticeChecks.toString() + "," + createCheckObserver.toString() + ")"], {
          type: "text/javascript",
        }),
      );
      worker = new Worker(url);
      URL.revokeObjectURL(url);
      worker.onmessage = ({ data }) => {
        send(data);
        if (data.type === "results" || data.type === "error")
          worker.terminate();
      };
      worker.onerror = (e) => {
        send({ type: "error", text: "Runner error: " + e.message });
        worker.terminate();
      };
      worker.postMessage(event.data);
    } catch (error) {
      send({ type: "error", text: "Runner unavailable: " + error.message });
    }
  });
  parent.postMessage({ type: "ready" }, "*");
}
const COURSE_RUNNER_HTML =
  "<!doctype html><meta charset=\"utf-8\"><meta http-equiv=\"Content-Security-Policy\" content=\"default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval' blob:; worker-src blob:; connect-src 'none';\"><script>(" +
  courseFrameMain.toString() +
  ")(" + executePracticeChecks.toString() + "," + createCheckObserver.toString() + ");<\/script>";
function runCourseCode() {
  const lesson = activeLesson();
  const practice = lesson && activePractice(lesson);
  if (!practice || practice.exercise.kind !== "code") return;
  const editor = document.getElementById("course-editor");
  if (!editor) return;
  stopCourseRun();
  showPracticeFeedback(null);
  const { state: s, exercise, extraId } = practice;
  s.code = editor.value;
  persist();
  const output = document.getElementById("course-console");
  output.textContent = "";
  output.classList.remove("has-error");
  document.getElementById("practice-status").textContent =
    "Running your code and checking the results…";
  document.getElementById("practice-status").classList.remove("success");
  document.getElementById("course-run").disabled = true;
  document.getElementById("course-stop").disabled = false;
  document.getElementById("exercise-checks").innerHTML = exercise.tests
    .map((t) => "<li>○ " + escapeHTML(t.label) + "</li>")
    .join("");
  const frame = document.createElement("iframe");
  frame.hidden = true;
  frame.setAttribute("sandbox", "allow-scripts");
  frame.setAttribute("title", "Isolated JavaScript practice");
  courseRun = {
    frame,
    token: Date.now() + "-" + Math.random(),
    lesson,
    exercise,
    extraId,
    code: s.code,
  };
  frame.srcdoc = COURSE_RUNNER_HTML;
  document.body.append(frame);
  courseRunTimer = setTimeout(() => {
    if (!courseRun) return;
    output.textContent +=
      "\nStopped after 3 seconds. Check your loop condition and update.";
    output.classList.add("has-error");
    showPracticeFeedback(timeoutFeedback);
    stopCourseRun("Time limit reached. Revise your code and try again.");
  }, 3000);
}
window.addEventListener("message", (event) => {
  if (
    !courseRun ||
    event.source !== courseRun.frame.contentWindow ||
    !event.data
  )
    return;
  const data = event.data,
    run = courseRun;
  if (data.type === "ready") {
    run.frame.contentWindow.postMessage(
      {
        type: "run",
        token: run.token,
        code: run.code,
        tests: run.exercise.tests,
      },
      "*",
    );
    return;
  }
  if (data.token !== run.token) return;
  const output = document.getElementById("course-console");
  if (!output) {
    stopCourseRun();
    return;
  }
  if (data.type === "log") {
    output.textContent +=
      (output.textContent ? "\n" : "") + String(data.text).slice(0, 4000);
    return;
  }
  if (data.type === "error") {
    output.textContent += (output.textContent ? "\n" : "") + String(data.text);
    output.classList.add("has-error");
    const feedback = explainPracticeError(data.error);
    showPracticeFeedback({ ...feedback, technical: data.error?.message || String(data.text) });
    stopCourseRun(
      "The code stopped. Start with the explanation and hint below.",
    );
    return;
  }
  if (data.type === "results") {
    const results = Array.isArray(data.results) ? data.results : [],
      tests = run.exercise.tests;
    const passed = tests.every((_, i) =>
      results.some((r) => r.index === i && r.pass === true),
    );
    document.getElementById("exercise-checks").innerHTML = tests
      .map((t, i) => {
        const r = results.find((r) => r.index === i);
        return `<li class="${r?.pass ? "pass" : "fail"}">${r?.pass ? "✓" : "↺"} ${escapeHTML(t.label)}${r?.error ? ' — could not check yet' : ''}</li>`;
      })
      .join("");
    if (!output.textContent)
      output.textContent = "Finished with no console output.";
    if (!passed) {
      const index = tests.findIndex((_, i) => !results.some(r => r.index === i && r.pass));
      showPracticeFeedback(feedbackForResult(results.find(r => r.index === index), tests[index], run.exercise));
    }
    if (passed) {
      const state = run.extraId ? extraState(run.lesson, run.exercise) : lessonState(run.lesson);
      state.passed = true;
      persist();
      if (run.extraId) {
        document.querySelectorAll('[data-extra-count]').forEach(el => { el.textContent = extraCount(run.lesson); });
        const completed = document.querySelector('[data-extra-completion]');
        if (completed) completed.textContent = '✓ Completed';
      } else showPracticePassed();
    }
    stopCourseRun(
      passed
        ? run.extraId ? "✓ Extra exercise completed. Try another, or continue to the next lesson whenever you’re ready." : "✓ All checks passed. You’re ready for the quiz."
        : `${tests.filter((_, i) => results.some(r => r.index === i && r.pass)).length} of ${tests.length} checks passed. Start with the feedback below.`,
    );
    document
      .getElementById("practice-status")
      .classList.toggle("success", passed);
  }
});
/* 11. COURSE INTERACTIONS — navigation, practice controls and quiz submission. */
document.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  if (button.hasAttribute("data-welcome-example")) {
    openRunner(welcomeExample);
    return;
  }
  if (button.hasAttribute("data-welcome-account")) {
    $("#account-button").click();
    return;
  }
  if (button.dataset.lesson) {
    stopCourseRun();
    courseUndoCode = null;
    progress.course.last = button.dataset.lesson;
    persist();
    navigate("lesson-" + button.dataset.lesson);
    focusLesson();
    return;
  }
  const lesson = activeLesson();
  if (!lesson) return;
  const s = lessonState(lesson);
  if (button.hasAttribute('data-extra-hub') || button.hasAttribute('data-extra')) {
    const id = button.dataset.extra;
    if (id && !lesson.extras.some(ex => ex.id === id)) return;
    s.extraSelected = id || null;
    changeLessonStep(4);
    return;
  }
  if (button.hasAttribute('data-retry-extra')) {
    const practice = activePractice(lesson);
    if (!practice?.extraId) return;
    practice.state.choice = null;
    practice.state.submitted = false;
    persist();
    render();
    document.querySelector('#extra-choice input')?.focus();
    return;
  }
  if (button.hasAttribute('data-run-lesson-example')) {
    const part = lesson.steps[Number(button.dataset.runLessonExample)];
    if (part?.language === 'javascript') openRunner({ title: part.title, code: part.code });
    return;
  }
  if (button.hasAttribute("data-step")) {
    changeLessonStep(Number(button.dataset.step));
    return;
  }
  if (button.hasAttribute("data-continue")) {
    s.read = [...new Set([...s.read, s.step])];
    changeLessonStep(Math.min(s.step + 1, 3));
    return;
  }
  if (button.hasAttribute("data-check")) {
    runCourseCode();
    return;
  }
  if (button.hasAttribute("data-stop")) {
    stopCourseRun("Stopped. You can edit and run again.");
    return;
  }
  if (button.hasAttribute("data-reset-code")) {
    stopCourseRun();
    showPracticeFeedback(null);
    const practice = activePractice(lesson);
    if (!practice) return;
    const draft = practice.state;
    const editor = document.getElementById("course-editor");
    const undoing = button.dataset.undo === "true";
    if (undoing) {
      editor.value = courseUndoCode ?? draft.code;
      button.textContent = "Reset code";
      delete button.dataset.undo;
    } else {
      courseUndoCode = editor.value;
      editor.value = practice.exercise.starter;
      button.textContent = "Undo reset";
      button.dataset.undo = "true";
    }
    draft.code = editor.value;
    persist();
    document.getElementById("practice-status").textContent = undoing
      ? "Your previous code was restored."
      : "Starter code restored. You can undo this reset.";
    return;
  }
  if (button.hasAttribute("data-order")) {
    const i = Number(button.dataset.order);
    if (!s.order.includes(i)) s.order.push(i);
    persist();
    render();
    return;
  }
  if (button.hasAttribute("data-reset-order")) {
    s.order = [];
    persist();
    render();
    return;
  }
  if (button.hasAttribute("data-check-order")) {
    const correct =
      JSON.stringify(s.order) === JSON.stringify(lesson.exercise.answer);
    if (correct) {
      s.passed = true;
      persist();
      showPracticePassed();
    }
    const status = document.getElementById("practice-status");
    status.textContent = correct
      ? "✓ Correct: stage → commit locally → push to the remote."
      : s.order.length < 3
        ? "Choose all three commands before checking."
        : "Not quite. Stage first, commit second, then push. Start over and try again.";
    status.classList.toggle("success", correct);
    return;
  }
  if (button.hasAttribute("data-retry-quiz")) {
    s.answers = [null, null, null];
    s.submitted = false;
    persist();
    render();
    focusLesson();
  }
});
document.addEventListener("input", (event) => {
  if (event.target.id !== "course-editor") return;
  const lesson = activeLesson();
  if (!lesson) return;
  const practice = activePractice(lesson);
  if (!practice) return;
  practice.state.code = event.target.value;
  // Capture every keystroke locally; cloud writes are debounced in progress-sync.js.
  persist();
  const label = document.getElementById("course-save-status");
  label.textContent = "Saving…";
  clearTimeout(courseDraftTimer);
  courseDraftTimer = setTimeout(() => {
    if (document.getElementById("course-save-status"))
      document.getElementById("course-save-status").textContent = storageOK
        ? "Saved locally"
        : "Session only";
  }, 250);
});
document.addEventListener("change", (event) => {
  if (event.target.matches('#extra-choice input[type="radio"]')) {
    const lesson = activeLesson();
    const practice = lesson && activePractice(lesson);
    if (!practice?.extraId || practice.state.submitted) return;
    practice.state.choice = Number(event.target.value);
    persist();
    return;
  }
  if (!event.target.matches('#lesson-quiz input[type="radio"]')) return;
  const lesson = activeLesson();
  if (!lesson) return;
  const s = lessonState(lesson);
  if (s.submitted) return;
  const index = Number(event.target.name.split("-")[1]);
  s.answers[index] = Number(event.target.value);
  persist();
});
document.addEventListener("submit", (event) => {
  if (event.target.id === 'extra-choice') {
    event.preventDefault();
    const lesson = activeLesson();
    const practice = lesson && activePractice(lesson);
    if (!practice?.extraId || practice.state.submitted) return;
    if (practice.state.choice === null) {
      document.getElementById('extra-choice-notice').textContent = 'Choose an answer before checking.';
      document.querySelector('#extra-choice input')?.focus();
      return;
    }
    practice.state.submitted = true;
    practice.state.passed ||= practice.state.choice === practice.exercise.answer;
    persist();
    render();
    document.querySelector('[data-retry-extra]')?.focus();
    return;
  }
  if (event.target.id !== "lesson-quiz") return;
  event.preventDefault();
  const lesson = activeLesson(),
    s = lessonState(lesson);
  if (s.submitted) return;
  if (s.answers.some((a) => a === null)) {
    document.getElementById("quiz-notice").textContent =
      "Choose an answer for all three questions before checking.";
    document
      .querySelector(
        `[name="question-${s.answers.findIndex((a) => a === null)}"]`,
      )
      ?.focus();
    return;
  }
  const score = lesson.quiz.reduce(
    (n, q, i) => n + (s.answers[i] === q.answer),
    0,
  );
  s.best = Math.max(s.best, score);
  s.submitted = true;
  persist();
  render();
  document
    .querySelector(".quiz-result")
    ?.scrollIntoView({ behavior: "smooth", block: "center" });
});
document.addEventListener("keydown", (event) => {
  if (event.target.id !== "course-editor") return;
  if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
    event.preventDefault();
    runCourseCode();
  }
  // Leave Tab available for normal keyboard navigation.
});
window.addEventListener("pagehide", () => {
  clearTimeout(courseDraftTimer);
  persist();
  stopCourseRun();
});

/* 12. START THE APP
  Apply saved reading preferences, update counters, and open the requested page.
*/
bindConsolePractice({ getProgress: () => progress.consolePractice,
  active: () => currentView === 'console' && !query && !accounts?.loading,
  persist, render, copyText });
problemPractice = bindProblemPractice({ getProgress: () => progress.problemPractice,
  active: () => currentView === 'problems' && !query && !accounts?.loading,
  persist, render, copyText, runnerHTML: COURSE_RUNNER_HTML });
applySettings();
updateProgress();
const initial = readHash();
navigate(validView(initial) ? initial : "start", false);
accounts = createAccounts({
  getProgress: () => validateProgress(progress),
  getGuest(onlyMeaningful = false) {
    try {
      const guest = validateProgress(JSON.parse(localStorage.getItem(KEY)));
      if (!onlyMeaningful) return guest;
      // Rendering the dashboard creates untouched lesson defaults. Do not import
      // those over real drafts already saved in an account.
      for (const lesson of COURSE.lessons) {
        for (const key of lessonProgressKeys(lesson)) {
        const s = guest.course.lessons[key];
        if (s && !hasLessonWork(s, initialLessonCode(lesson, key))) {
          delete guest.course.lessons[key];
        }
        }
      }
      return guest.saved.length || guest.done.length || Object.keys(guest.course.lessons).length || Object.keys(guest.consolePractice.answers).length || Object.keys(guest.problemPractice.challenges).length ? guest : null;
    } catch { return null; }
  },
  applyProgress(value, { resume }) {
    stopCourseRun();
    problemPractice?.reset();
    clearTimeout(courseDraftTimer);
    const focused = document.activeElement;
    const editorFocused = ['course-editor', 'problem-editor'].includes(focused?.id);
    const editorId = editorFocused ? focused.id : null;
    const selection = editorFocused ? [focused.selectionStart, focused.selectionEnd] : null;
    progress = validateProgress(value);
    applySettings();
    updateProgress();
    updateCourseBadge();
    if (resume && !['start', 'console', 'problems'].includes(currentView)) navigate('lesson-' + progress.course.last);
    else render();
    if (editorFocused && document.getElementById(editorId)) {
      document.getElementById(editorId).focus();
      document.getElementById(editorId).setSelectionRange(...selection);
    }
  },
  setBusy(busy) {
    if (busy) problemPractice?.reset();
    document.body.classList.toggle('account-loading', busy);
    $('#main').inert = busy;
    $('#study-sidebar').inert = busy || (mobileView.matches && !document.body.classList.contains('nav-open'));
    document.querySelectorAll('.topbar > :not(.account-control)').forEach(element => { element.inert = busy; });
    if (busy) document.querySelectorAll('dialog[open]:not(#account-dialog)').forEach(dialog => dialog.close());
  },
});
void accounts.start();
