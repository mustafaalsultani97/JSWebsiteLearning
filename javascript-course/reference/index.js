import { ORIGINAL_REFERENCE } from './original.js';
import catalog from './catalog.json' with { type: 'json' };
import sources from './sources.json' with { type: 'json' };
import { EXTRA_REFERENCE } from './tools.js';

const sections = [
  ['ref-statements', 'Statement & declaration index', 'Keywords'],
  ['ref-language', 'Syntax, operators & classes', 'Core concepts'],
  ['ref-guides', 'Language guides & internals', 'Core concepts'],
  ['ref-errors', 'JavaScript error reference', 'Core concepts'],
  ['ref-array', 'Array method & property index', 'Standard library'],
  ['ref-string', 'String & RegExp index', 'Standard library'],
  ['ref-object', 'Objects, functions & reflection', 'Standard library'],
  ['ref-number', 'Numbers, BigInt & Math', 'Standard library'],
  ['ref-time', 'Date, Temporal & Intl index', 'Standard library'],
  ['ref-binary', 'Binary data & typed arrays', 'Standard library'],
  ['ref-collection', 'Collections, promises & iterators', 'Standard library'],
  ['ref-builtins', 'Globals, errors & other built-ins', 'Standard library'],
  ['ref-web-families', 'Web API families & guides', 'Browser & tools'],
  ['ref-web-a-f', 'Browser interfaces A–F', 'Browser & tools'],
  ['ref-web-g-m', 'Browser interfaces G–M', 'Browser & tools'],
  ['ref-web-n-s', 'Browser interfaces N–S', 'Browser & tools'],
  ['ref-web-t-z', 'Browser interfaces T–Z', 'Browser & tools'],
  ['ref-wasm', 'WebAssembly reference', 'Browser & tools'],
].map(([id, title, group]) => ({ id, title, group, color: '#6bdcf5', description: 'Browse concise reference entries, check feature status, and open the source for full syntax, examples and compatibility.', cards: [] }));
const sectionMap = new Map(sections.map(section => [section.id, section]));
function sectionFor(row) {
  const path = row.path.split('/');
  if (path[4] === 'WebAssembly') return 'ref-wasm';
  if (path[4] === 'API') {
    if (!row.kind.startsWith('web-api-')) return 'ref-web-families';
    const first = (path[5] || row.title)[0].toUpperCase();
    return first <= 'F' ? 'ref-web-a-f' : first <= 'M' ? 'ref-web-g-m' : first <= 'S' ? 'ref-web-n-s' : 'ref-web-t-z';
  }
  if (path[6] === 'Statements') return 'ref-statements';
  if (path[6] === 'Errors') return 'ref-errors';
  if (path[5] !== 'Reference') return 'ref-guides';
  if (path[6] !== 'Global_Objects') return 'ref-language';
  const root = path[7];
  if (root === 'Array') return 'ref-array';
  if (['String', 'RegExp'].includes(root)) return 'ref-string';
  if (['Object', 'Function', 'Proxy', 'Reflect', 'JSON', 'Symbol', 'Boolean'].includes(root)) return 'ref-object';
  if (['Number', 'BigInt', 'Math'].includes(root)) return 'ref-number';
  if (['Date', 'Temporal', 'Intl'].includes(root)) return 'ref-time';
  if (/Array$/.test(root || '') || ['ArrayBuffer', 'SharedArrayBuffer', 'DataView', 'Atomics'].includes(root)) return 'ref-binary';
  if (['Map', 'Set', 'WeakMap', 'WeakSet', 'WeakRef', 'FinalizationRegistry', 'Promise', 'Iterator', 'AsyncIterator', 'Generator', 'AsyncGenerator', 'GeneratorFunction', 'AsyncGeneratorFunction', 'AsyncFunction'].includes(root)) return 'ref-collection';
  return 'ref-builtins';
}
export const featureLabels = { experimental: 'Experimental', deprecated: 'Deprecated', nonstandard: 'Non-standard', secure: 'HTTPS required', discouraged: 'Discouraged', limited: 'Limited availability' };
const existing = new Set([...ORIGINAL_REFERENCE, ...EXTRA_REFERENCE].flatMap(section => section.cards.map(card => card.source.split('#')[0])));
for (const row of catalog) {
  const source = `https://developer.mozilla.org${row.path}`;
  if (existing.has(source)) continue;
  const section = sectionMap.get(sectionFor(row));
  section.cards.push({ ...row, catalog: true, source, summary: row.excerpt, explanation: [], code: '', level: 'Reference', mode: 'read', tags: [row.kind, row.path.split('/').slice(5).join(' '), ...row.flags.map(flag => featureLabels[flag])], environment: row.path.includes('/JavaScript') ? 'JavaScript language' : row.path.includes('/WebAssembly') ? 'WebAssembly' : 'Browser / Web API' });
}
for (const section of sections) section.cards.sort((a, b) => a.title.localeCompare(b.title, 'en'));
const groupOrder = ['Keywords', 'Core concepts', 'Standard library', 'Browser & tools'];
export const REFERENCE_DATA = [...ORIGINAL_REFERENCE, ...EXTRA_REFERENCE, ...sections.filter(s => s.cards.length)].sort((a, b) => groupOrder.indexOf(a.group) - groupOrder.indexOf(b.group));
export const referenceStats = { checked: sources.checked, indexed: catalog.length, total: REFERENCE_DATA.reduce((n, s) => n + s.cards.length, 0), sections: REFERENCE_DATA.length };
const searchCache = new WeakMap();
export function searchReference(cards, query) {
  const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  return cards.filter(card => {
    let haystack = searchCache.get(card);
    if (!haystack) {
      haystack = [card.title, card.summary, ...card.explanation, card.code, card.pitfall, ...card.tags, card.sectionTitle, card.group].join(' ').toLocaleLowerCase();
      searchCache.set(card, haystack);
    }
    return terms.every(term => haystack.includes(term));
  });
}
export function referencePage(cards, requestedPage = 1, size = 40) {
  const pages = Math.max(1, Math.ceil(cards.length / size));
  const page = Math.max(1, Math.min(pages, requestedPage));
  return { cards: cards.slice((page - 1) * size, page * size), page, pages, start: cards.length ? (page - 1) * size + 1 : 0, end: Math.min(page * size, cards.length) };
}
export function referenceCatalogCardHTML(card, saved, done, escape, bookIcon) {
  const flags = card.flags.map(flag => `<span class="reference-tag">${escape(featureLabels[flag])}</span>`).join('');
  return `<article class="topic-card reference-entry${done ? ' card-complete' : ''}" data-card="${card.id}"><div class="card-meta"><span class="level">Quick reference</span><span class="mode-label read">${escape(card.environment)}</span><button class="icon-btn save-button" data-save="${card.id}" aria-pressed="${saved}" aria-label="${saved ? 'Remove bookmark for' : 'Bookmark'} ${escape(card.title)}">${bookIcon}</button></div><details><summary><span class="card-title">${escape(card.title)}<span class="plus" aria-hidden="true">+</span></span><span class="card-summary">${escape(card.excerpt)}</span></summary><div class="card-body"><div class="reference-tags">${flags}</div><p class="subtle">${escape(card.kind.replace(/^(web-api|javascript)-/, "").replaceAll("-", " "))}</p><p class="source-note">Shortened excerpt from <a href="${escape(card.source)}" target="_blank" rel="noopener noreferrer">${escape(card.title)} — MDN Web Docs</a>, by Mozilla Contributors. <a href="https://creativecommons.org/licenses/by-sa/2.5/" target="_blank" rel="noopener noreferrer">CC BY-SA 2.5</a>.</p><p>Open the documentation for the complete explanation, examples and applicable compatibility notes.</p><div class="card-actions"><a class="btn primary" href="${escape(card.source)}" target="_blank" rel="noopener noreferrer">Read full reference ↗</a></div><label class="done-control"><input type="checkbox" data-done="${card.id}" ${done ? 'checked' : ''}>I have studied this topic</label></div></details></article>`;
}
export function referenceOverviewHTML(escape) {
  return `<section class="reference-coverage"><h2>A broader JavaScript reference</h2><p>Browse ${referenceStats.total.toLocaleString('en')} topics: worked examples, language guides, individual built-in methods, browser interfaces, and development tools. Search by an API name, concept, method or error message.</p><p>The quick-reference catalog covers the JavaScript, Web API and WebAssembly pages in MDN’s English index checked on ${escape(referenceStats.checked)}. Full documentation is linked from each entry. Tooling guides cover selected development tools; the wider ecosystem keeps growing.</p><div class="card-actions"><button class="btn primary" data-view="all">Browse every topic</button><button class="btn" data-view="ref-web-families">Explore browser APIs</button><button class="btn" data-view="reference-tooling">Explore development tools</button></div></section>`;
}
