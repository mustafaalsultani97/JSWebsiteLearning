// Editorial learning tracks, not job requirements. Preserve topic IDs and content.
export const REFERENCE_TRACKS = {
  junior: {
    title: 'Junior developer', label: 'Build your foundation',
    description: 'Learn the language, build interactive pages, work with data, and develop reliable everyday coding habits.',
    focus: ['Values, decisions, loops and functions', 'Arrays, objects and everyday async code', 'DOM, forms, events and HTTP requests', 'Debugging, accessibility, Git and basic tests'],
    first: ['kw-let', 'kw-const', 'lang-types', 'kw-if', 'kw-for', 'kw-function', 'kw-return', 'lang-equality', 'lang-arrows', 'builtin-array-map', 'builtin-array-filter', 'builtin-object-literals', 'builtin-json-basics', 'platform-select', 'platform-listeners', 'platform-forms', 'platform-fetch', 'kw-async', 'kw-await', 'platform-error-handling', 'platform-safe-dom', 'platform-accessibility', 'platform-testing', 'tool-git', 'tool-npm', 'tool-vite'],
  },
  senior: {
    title: 'Senior developer', label: 'Deepen your expertise',
    description: 'Explore language internals, concurrency, performance and advanced platform capabilities. Use specialist references as your projects need them.',
    focus: ['Prototypes, descriptors and execution behavior', 'Concurrency, streams, workers and resource cleanup', 'Performance, automated testing and build systems', 'Advanced data structures, runtime APIs and specialist browser features'],
    first: ['lang-prototypes', 'lang-descriptors', 'lang-call-apply-bind', 'lang-microtasks', 'lang-for-await', 'lang-async-generators', 'builtin-promise-race', 'platform-workers', 'platform-streams', 'platform-service-workers', 'platform-indexeddb', 'platform-performance', 'tool-playwright', 'tool-msw', 'tool-github-actions', 'builtin-proxy-reflect', 'builtin-weak-collections', 'builtin-shared-memory', 'builtin-symbol-protocols', 'builtin-iterator-helpers', 'lang-using', 'lang-await-using', 'lang-disposal-order', 'node-ref-worker-threads', 'node-ref-async-context'],
  },
};
const seniorIds = new Set([...REFERENCE_TRACKS.senior.first, 'kw-with', 'kw-enum', 'kw-yield', 'kw-void', 'builtin-dynamic-code']);
const juniorTools = new Set(['git', 'npm', 'vite', 'eslint', 'prettier', 'typescript', 'vscode', 'chrome-devtools', 'firefox-devtools', 'vitest', 'jest', 'testing-library', 'react', 'vue', 'svelte', 'angular', 'astro', 'express']);
const juniorGuides = new Set(['Introduction', 'Grammar_and_types', 'Control_flow_and_error_handling', 'Loops_and_iteration', 'Functions', 'Expressions_and_operators', 'Numbers_and_strings', 'Indexed_collections', 'Keyed_collections', 'Working_with_objects', 'Using_classes', 'Using_promises', 'Modules']);
const builtins = {
  Array: 'Array at concat entries every fill filter find findIndex findLast findLastIndex flat flatMap forEach from includes indexOf isArray join keys lastIndexOf length map of pop push reduce reduceRight reverse shift slice some sort splice toReversed toSorted toSpliced unshift values with',
  String: 'String at charAt charCodeAt concat endsWith fromCharCode includes indexOf lastIndexOf length match padEnd padStart repeat replace replaceAll search slice split startsWith substring toLowerCase toUpperCase trim trimEnd trimStart',
  Number: 'Number EPSILON MAX_SAFE_INTEGER MIN_SAFE_INTEGER isFinite isInteger isNaN isSafeInteger parseFloat parseInt toFixed toPrecision toString',
  Math: 'abs ceil floor max min pow random round sign sqrt trunc PI',
  Object: 'Object assign entries freeze fromEntries hasOwn is keys values',
  JSON: 'parse stringify', Boolean: 'Boolean valueOf toString',
  Map: 'Map clear delete entries get has keys set size values forEach',
  Set: 'Set add clear delete entries has keys size values forEach',
  Promise: 'Promise all allSettled catch finally reject resolve then',
  Date: 'Date now parse getDate getDay getFullYear getHours getMinutes getMonth getSeconds getTime toISOString toLocaleDateString toLocaleString toLocaleTimeString',
  Error: 'Error message name stack toString',
};
const browserBasics = {
  Document: 'querySelector querySelectorAll getElementById createElement createTextNode body documentElement title forms DOMContentLoaded_event',
  Element: 'querySelector querySelectorAll classList id innerHTML getAttribute setAttribute removeAttribute hasAttribute append prepend remove closest matches children',
  HTMLElement: 'click focus blur hidden innerText style dataset',
  Node: 'appendChild removeChild replaceChild textContent parentNode childNodes contains cloneNode',
  EventTarget: 'EventTarget addEventListener removeEventListener dispatchEvent',
  Event: 'Event target currentTarget type preventDefault stopPropagation defaultPrevented',
  MouseEvent: 'MouseEvent clientX clientY button buttons',
  KeyboardEvent: 'KeyboardEvent key code ctrlKey shiftKey altKey metaKey repeat',
  HTMLInputElement: 'value checked disabled type name required validity checkValidity reportValidity',
  HTMLFormElement: 'elements requestSubmit reset checkValidity reportValidity',
  Window: 'fetch alert confirm prompt setTimeout clearTimeout setInterval clearInterval requestAnimationFrame cancelAnimationFrame localStorage sessionStorage location load_event',
  Response: 'Response ok status statusText headers json text',
  Request: 'Request method url headers',
  Headers: 'Headers append delete entries get has set keys values',
  FormData: 'FormData append delete entries get getAll has set keys values',
  URL: 'URL hash host hostname href origin pathname port protocol search searchParams toString',
  URLSearchParams: 'URLSearchParams append delete entries get getAll has keys set size sort toString values',
  Storage: 'clear getItem key length removeItem setItem',
  console: 'assert clear count countReset debug dir error group groupCollapsed groupEnd info log table time timeEnd trace warn',
};
const browserGuides = new Set(['Document_Object_Model', 'DOM', 'Fetch_API', 'Fetch_API/Using_Fetch', 'Web_Storage_API', 'Web_Storage_API/Using_the_Web_Storage_API', 'URL_API', 'URL_API/Resolving_relative_references', 'FormData', 'HTML_DOM_API', 'Console_API']);
function basicMember(parts, table) {
  const [root, member, ...rest] = parts;
  if (!(root in table) || rest.length) return false;
  return !member || table[root].split(' ').includes(member);
}
export function classifyReferenceTrack(card) {
  if (seniorIds.has(card.id) || (card.flags || []).some(flag => ['experimental', 'deprecated', 'discouraged', 'nonstandard'].includes(flag))) return 'senior';
  if (!card.catalog) {
    if (card.id.startsWith('tool-')) return juniorTools.has(card.id.slice(5)) ? 'junior' : 'senior';
    if (card.id.startsWith('node-')) return 'senior';
    return card.level === 'Deeper' ? 'senior' : 'junior';
  }
  const path = card.path.split('/').slice(4);
  if (path[0] === 'JavaScript') {
    if (path[1] === 'Guide') return path.length === 2 || (path.length === 3 && juniorGuides.has(path[2])) ? 'junior' : 'senior';
    if (path[2] === 'Statements') return ['async_function', 'block', 'break', 'class', 'const', 'continue', 'do...while', 'export', 'for', 'for...in', 'for...of', 'function', 'if...else', 'import', 'let', 'return', 'switch', 'throw', 'try...catch', 'var', 'while'].includes(path[3]) ? 'junior' : 'senior';
    if (path[2] === 'Global_Objects') {
      if (basicMember(path.slice(3), builtins)) return 'junior';
      if (path.length === 4 && ['undefined', 'NaN', 'Infinity', 'parseInt', 'parseFloat', 'globalThis', 'TypeError', 'ReferenceError', 'SyntaxError', 'RangeError', 'encodeURIComponent', 'decodeURIComponent'].includes(path[3])) return 'junior';
    }
    if (path[2] === 'Operators' && ['Addition', 'Subtraction', 'Multiplication', 'Division', 'Remainder', 'Exponentiation', 'Assignment', 'Addition_assignment', 'Subtraction_assignment', 'Increment', 'Decrement', 'Strict_equality', 'Strict_inequality', 'Greater_than', 'Greater_than_or_equal', 'Less_than', 'Less_than_or_equal', 'Logical_AND', 'Logical_OR', 'Logical_NOT', 'Nullish_coalescing', 'Optional_chaining', 'Conditional_operator', 'Destructuring', 'Spread_syntax', 'Object_initializer', 'Property_accessors', 'function', 'Arrow_functions', 'await', 'typeof', 'this', 'new'].includes(path[3])) return 'junior';
    return 'senior';
  }
  if (path[0] === 'API' && (basicMember(path.slice(1), browserBasics) || browserGuides.has(path.slice(1).join('/')))) return 'junior';
  return 'senior';
}
export function trackTopics(cards, track) {
  return track === 'junior' || track === 'senior' ? cards.filter(card => card.track === track) : cards;
}
export function orderTrackTopics(cards, track) {
  const preferred = new Map((REFERENCE_TRACKS[track]?.first || []).map((id, i) => [id, i]));
  return [...cards].sort((a, b) => (preferred.get(a.id) ?? 1000) - (preferred.get(b.id) ?? 1000) || Number(Boolean(a.catalog)) - Number(Boolean(b.catalog)));
}
export function referenceTrackChoicesHTML(counts, escape) {
  return `<section class="reference-track-choices" aria-labelledby="reference-track-choice-heading"><h2 id="reference-track-choice-heading">What would you like to learn?</h2><p>Choose a focus for your reference library. You can switch tracks at any time.</p><div class="reference-track-grid">${Object.entries(REFERENCE_TRACKS).map(([id, track]) => `<article class="reference-track-card is-${id}"><span class="welcome-label">${escape(track.label)}</span><h3>${escape(track.title)}</h3><p>${escape(track.description)}</p><ul>${track.focus.map(focus => `<li>${escape(focus)}</li>`).join('')}</ul><button class="btn ${id === 'junior' ? 'primary' : ''}" data-view="${id}">Explore ${escape(track.title.toLowerCase())} topics →</button><small>${counts[id].toLocaleString('en')} topics · Suggested starting guides first</small></article>`).join('')}</div></section>`;
}
