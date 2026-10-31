import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { REFERENCE_DATA, searchReference, referencePage, referenceCatalogCardHTML, featureLabels } from '../javascript-course/reference/index.js';
import { ORIGINAL_REFERENCE } from '../javascript-course/reference/original.js';
import catalog from '../javascript-course/reference/catalog.json' with { type: 'json' };
import sources from '../javascript-course/reference/sources.json' with { type: 'json' };
import { cleanProgress, freshProgress, mergeProgress, MAX_PROGRESS_BYTES, MAX_REFERENCE_IDS } from '../shared/progress.js';

const cards = REFERENCE_DATA.flatMap(section => section.cards.map(card => ({ ...card, group: section.group, sectionTitle: section.title })));
test('the original 207 topics and their bookmark IDs remain unchanged', () => {
  assert.equal(ORIGINAL_REFERENCE.flatMap(section => section.cards).length, 207);
  assert.equal(createHash('sha256').update(JSON.stringify(ORIGINAL_REFERENCE)).digest('hex'), '8139e4ddc346ce772c76e7e47d3a072a5cbd18a78b95fa39966bd2bca604bf5a');
});
test('every audited documentation page has a reachable catalog or existing-guide entry', () => {
  assert.equal(catalog.length, sources.count);
  assert.ok(catalog.length > 9000);
  const covered = new Set(cards.map(card => card.source.split('#')[0]));
  assert.equal(new Set(cards.map(card => card.id)).size, cards.length);
  assert.equal(new Set(REFERENCE_DATA.map(section => section.id)).size, REFERENCE_DATA.length);
  for (const row of catalog) {
    assert.ok(covered.has(`https://developer.mozilla.org${row.path}`), row.path);
    assert.ok(row.excerpt.trim().split(/\s+/).length <= 24, row.path);
    assert.ok(row.flags.every(flag => featureLabels[flag]), row.path);
  }
  for (const card of cards) {
    assert.match(card.id, /^[a-z0-9][a-z0-9-]{0,79}$/);
    assert.equal(new URL(card.source).protocol, 'https:');
    assert.ok(card.title && card.summary);
  }
  assert.ok(catalog.find(row => row.path === '/en-US/docs/Web/API/Window/event').flags.includes('deprecated'));
  assert.ok(catalog.find(row => row.path === '/en-US/docs/Web/API/BarcodeDetector').flags.includes('experimental'));
});
test('search finds specific methods, browser interfaces, concepts and tools', () => {
  for (const query of ['toSorted', 'Temporal', 'WebGPU', 'AudioContext', 'Clipboard read', 'ArrayBuffer', 'Object.groupBy', 'closure', 'implements', 'Vitest', 'ESLint', 'node:sqlite']) {
    assert.ok(searchReference(cards, query).length, query);
  }
  assert.equal(searchReference(cards, 'impossibly-nonexistent-reference-abcxyz').length, 0);
});
test('all reference results can be paged without missing or repeating topics', () => {
  const ids = [];
  for (let n = 1; n <= referencePage(cards).pages; n++) {
    const page = referencePage(cards, n);
    assert.ok(page.cards.length <= 40);
    ids.push(...page.cards.map(card => card.id));
  }
  assert.deepEqual(ids, cards.map(card => card.id));
  assert.equal(referencePage(cards, 99999).page, referencePage(cards).pages);
  assert.deepEqual(referencePage([], 20), { cards: [], page: 1, pages: 1, start: 0, end: 0 });
});
test('the full reference collection survives backup and concurrent bookmark merging', () => {
  const base = freshProgress(), local = freshProgress(), remote = freshProgress();
  local.saved = cards.map(card => card.id);
  local.done = [...local.saved];
  remote.saved = [cards.at(-1).id];
  const merged = mergeProgress(base, local, remote);
  assert.deepEqual(new Set(cleanProgress(JSON.parse(JSON.stringify(merged))).saved), new Set(local.saved));
  assert.equal(merged.done.length, cards.length);
  assert.deepEqual(merged.course, base.course);
  assert.deepEqual(merged.consolePractice, base.consolePractice);
  assert.deepEqual(merged.problemPractice, base.problemPractice);
  assert.ok(Buffer.byteLength(JSON.stringify(merged)) < MAX_PROGRESS_BYTES);
  assert.ok(cards.length < MAX_REFERENCE_IDS);
  assert.throws(() => cleanProgress({ ...base, saved: Array(MAX_REFERENCE_IDS + 1).fill('test') }));
});
test('catalog cards escape documentation text and retain bookmark and study controls', () => {
  const card = { ...cards.find(card => card.catalog), title: '<script>bad</script>', excerpt: '<img src=x>', flags: ['experimental'], environment: 'Browser / Web API' };
  const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
  const html = referenceCatalogCardHTML(card, true, true, escape, '');
  assert.ok(!html.includes('<script>'));
  assert.ok(!html.includes('<img'));
  assert.match(html, /Experimental/);
  assert.match(html, /Mozilla Contributors/);
  assert.match(html, /aria-pressed="true"/);
  assert.match(html, /data-done=.*checked/);
  assert.match(html, /rel="noopener noreferrer"/);
});
