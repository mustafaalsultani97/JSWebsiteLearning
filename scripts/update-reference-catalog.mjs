// Refresh the checked-in reference index. Public documentation is read only.
// Cache responses locally so an interrupted refresh can resume without refetching.
import fs from 'node:fs';
import { createHash } from 'node:crypto';
const directory = new URL('../javascript-course/reference/', import.meta.url);
const cacheDir = new URL('../.reference-cache/', import.meta.url);
fs.mkdirSync(directory, { recursive: true });
fs.mkdirSync(cacheDir, { recursive: true });
const cacheFile = new URL('mdn.ndjson', cacheDir);
const cache = new Map(fs.existsSync(cacheFile) ? fs.readFileSync(cacheFile, 'utf8').trim().split('\n').filter(Boolean).map(line => { const row = JSON.parse(line); return [row.path, row]; }) : []);
const index = await (await fetch('https://developer.mozilla.org/en-US/search-index.json')).json();
const paths = [...new Set(index.filter(({url}) => /^\/en-US\/docs\/Web\/(JavaScript|API|WebAssembly)(\/|$)/.test(url)).map(({url}) => url))].sort();
let cursor = 0, completed = 0;
const failures = [];
function excerpt(text = '') {
  const words = text.replace(/\s+/g, ' ').trim().split(' ');
  return words.slice(0, 24).join(' ') + (words.length > 24 ? '…' : '');
}
async function worker() {
  while (cursor < paths.length) {
    const path = paths[cursor++];
    if (!cache.has(path)) {
      try {
        let response;
        for (let attempt = 0; attempt < 3; attempt++) {
          response = await fetch(`https://developer.mozilla.org${path}/index.json`, { signal: AbortSignal.timeout(30000) });
          if (response.ok || response.status === 404) break;
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        }
        if (!response.ok) throw Error(`HTTP ${response.status}`);
        const { doc } = await response.json();
        if (!doc?.title || !doc.summary) throw Error('Missing page metadata');
        const intro = doc.body?.find(part => part.type === 'prose' && !part.value?.id)?.value?.content ?? '';
        const flags = ['experimental', 'deprecated', 'nonstandard', 'secure'].filter(flag => intro.includes(`notecard ${flag}`));
        if (doc.status?.baseline === 'discouraged' && !flags.includes('deprecated')) flags.push('discouraged');
        if (doc.status?.baseline === 'limited') flags.push('limited');
        const row = { id: 'ref-' + createHash('sha256').update(path).digest('hex').slice(0, 20), path, title: doc.title, excerpt: excerpt(doc.summary), kind: doc.pageType || 'reference', flags };
        cache.set(path, row);
        fs.appendFileSync(cacheFile, JSON.stringify(row) + '\n');
      } catch (error) { failures.push({path, error: error.message}); }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    completed++;
    if (completed % 500 === 0) console.log(`Reference pages checked: ${completed}/${paths.length}`);
  }
}
console.log(`Checking ${paths.length} indexed pages; ${cache.size} cached.`);
await Promise.all(Array.from({length: 4}, worker));
fs.writeFileSync(new URL('failures.json', cacheDir), JSON.stringify(failures, null, 2));
if (failures.length) { console.error(JSON.stringify(failures.slice(0, 12))); throw Error(`${failures.length} pages could not be checked. Re-run to resume.`); }
const entries = paths.map(path => cache.get(path));
// Deprecation flags are not present in every page's prose metadata. Use MDN's
// canonical compatibility dataset for the status of documented API members.
const compatFile = new URL('browser-compat-data.json', cacheDir);
if (!fs.existsSync(compatFile)) {
  const response = await fetch('https://unpkg.com/@mdn/browser-compat-data/data.json');
  if (!response.ok) throw Error(`Compatibility download: HTTP ${response.status}`);
  fs.writeFileSync(compatFile, JSON.stringify(await response.json()));
}
const compat = JSON.parse(fs.readFileSync(compatFile, 'utf8'));
const statuses = new Map();
function collectStatuses(node) {
  if (!node || typeof node !== 'object') return;
  const metadata = node.__compat;
  if (metadata?.mdn_url && metadata.status && !statuses.has(metadata.mdn_url.split('#')[0])) statuses.set(metadata.mdn_url.split('#')[0], metadata.status);
  for (const [key, child] of Object.entries(node)) if (key !== '__compat') collectStatuses(child);
}
collectStatuses(compat);
for (const entry of entries) {
  const status = statuses.get(`https://developer.mozilla.org${entry.path.replace('/en-US/', '/')}`)
    ?? statuses.get(`https://developer.mozilla.org${entry.path}`);
  if (!status) continue;
  entry.flags = entry.flags.filter(flag => !['deprecated', 'experimental', 'nonstandard'].includes(flag));
  if (status.deprecated) entry.flags.push('deprecated');
  if (status.experimental) entry.flags.push('experimental');
  if (!status.standard_track) entry.flags.push('nonstandard');
}
fs.writeFileSync(new URL('catalog.json', directory), JSON.stringify(entries));
fs.writeFileSync(new URL('sources.json', directory), JSON.stringify({ checked: new Date().toISOString().slice(0, 10), count: entries.length, indexes: ['https://developer.mozilla.org/en-US/search-index.json', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference', 'https://developer.mozilla.org/en-US/docs/Web/API', 'https://developer.mozilla.org/en-US/docs/WebAssembly'], coverage: 'All JavaScript, Web API and WebAssembly pages in the English MDN search index at refresh time.', attribution: 'Mozilla Contributors', license: 'https://creativecommons.org/licenses/by-sa/2.5/', compatibility: { source: 'https://github.com/mdn/browser-compat-data', version: compat.__meta?.version, license: 'CC0-1.0' }, note: 'Quoted summaries are limited to 24 words per page. Full documentation remains at the linked source.' }, null, 2) + '\n');
console.log(`Saved ${entries.length} verified reference entries.`);
