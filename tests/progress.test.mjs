import test from 'node:test';
import assert from 'node:assert/strict';
import { verifyRequestOrigin } from '@netlify/identity';
import { createProgressHandler } from '../server/progress-handler.js';
import { cleanProgress, freshProgress, mergeProgress, copy, MAX_PROGRESS_BYTES } from '../shared/progress.js';
import { ProgressSync, accountStorageKey } from '../javascript-course/progress-sync.js';
import { lesson, example, memoryStore, memoryStorage } from './helpers.mjs';

const origin = 'https://course.example';
function harness() {
  const store = memoryStore();
  let user = { id: 'alice' }, offline = false;
  const handler = createProgressHandler({ getUser: async () => user, getStore: () => store, verifyOrigin: verifyRequestOrigin });
  const request = async (url, options = {}) => {
    if (offline) throw Error('Offline');
    return handler(new Request(new URL(url, origin), { ...options, headers: { Origin: origin, ...options.headers } }));
  };
  return { store, handler, request, setUser: v => { user = v; }, setOffline: v => { offline = v; } };
}
function client(h, userId = 'alice', storage = memoryStorage(), update = () => {}) {
  const statuses = [];
  const sync = new ProgressSync({ userId, storage, request: h.request, onUpdate: update, onStatus: s => statuses.push(s) });
  return { sync, storage, statuses };
}
const headers = { 'Content-Type': 'application/json', 'X-Account-ID': 'alice' };

test('unauthenticated requests, cross-account writes, and cross-origin writes are rejected', async () => {
  const h = harness();
  h.setUser(null);
  assert.equal((await h.request('/progress', { headers })).status, 401);
  h.setUser({ id: 'bob' });
  assert.equal((await h.request('/progress', { method: 'PUT', headers, body: JSON.stringify({ etag: null, progress: example() }) })).status, 403);
  h.setUser({ id: 'alice' });
  for (const originValue of ['https://attacker.example', null]) {
    const request = new Request(origin + '/progress', { method: 'PUT', headers: { ...headers, ...(originValue ? { Origin: originValue } : {}) }, body: '{}' });
    assert.equal((await h.handler(request)).status, 403);
  }
  assert.equal(h.store.values.size, 0);
});

test('only the verified account can read its saved progress; supplied IDs are ignored', async () => {
  const h = harness();
  const data = example();
  const written = await h.request('/progress', { method: 'PUT', headers, body: JSON.stringify({ etag: null, progress: data, userId: 'bob' }) });
  assert.equal(written.status, 200);
  assert.equal(written.headers.get('cache-control'), 'private, no-store');
  assert.ok(h.store.values.has('users/alice'));
  h.setUser({ id: 'bob' });
  const read = await h.request('/progress?userId=alice', { headers: { 'X-Account-ID': 'bob' } });
  assert.equal((await read.json()).progress, null);
});

test('schema, body limits, and unsupported methods are enforced', async () => {
  const h = harness();
  const put = body => h.request('/progress', { method: 'PUT', headers, body });
  assert.equal((await put('{bad')).status, 400);
  assert.equal((await put(JSON.stringify({ progress: example() }))).status, 400);
  const hugeCode = example(); hugeCode.course.lessons.variables.code = 'x'.repeat(60001);
  assert.equal((await put(JSON.stringify({ etag: null, progress: hugeCode }))).status, 400);
  assert.equal((await put('x'.repeat(MAX_PROGRESS_BYTES + 1))).status, 413);
  assert.equal((await h.request('/progress', { method: 'DELETE', headers })).status, 405);
  const polluted = JSON.parse(JSON.stringify(example()));
  Object.defineProperty(polluted.course.lessons, '__proto__', { value: lesson(), enumerable: true });
  assert.throws(() => cleanProgress(polluted));
  const valid = example(); valid.secret = 'discard';
  assert.equal(cleanProgress(valid).secret, undefined);
});

test('compare-and-swap refuses stale writes and returns the current snapshot', async () => {
  const h = harness();
  const put = etag => h.request('/progress', { method: 'PUT', headers, body: JSON.stringify({ etag, progress: example() }) });
  const first = await (await put(null)).json();
  assert.ok(first.etag);
  assert.equal((await put(null)).status, 409);
  assert.equal((await put('old-revision')).status, 409);
  assert.equal((await put(first.etag)).status, 200);
});

test('three-way merging preserves independent lessons, quiz attempts, and removals', () => {
  const base = example(); base.saved = ['old'];
  const left = copy(base), right = copy(base);
  left.course.lessons.variables.code = 'my new draft';
  left.saved = []; // Explicit bookmark removal.
  right.saved = ['old', 'new'];
  right.course.lessons.arrays = { ...lesson(), best: 3, passed: true, read: [0, 1] };
  right.course.lessons.variables.answers = [1, 2, 0];
  right.course.lessons.variables.submitted = true;
  const merged = mergeProgress(base, left, right);
  assert.equal(merged.course.lessons.variables.code, 'my new draft');
  assert.deepEqual(merged.course.lessons.variables.answers, [1, 2, 0]);
  assert.equal(merged.course.lessons.variables.submitted, true);
  assert.equal(merged.course.lessons.arrays.best, 3);
  assert.deepEqual(merged.saved, ['new']);
});

test('two devices save concurrently without losing the other device’s lesson', async t => {
  const h = harness();
  const a = client(h).sync, b = client(h).sync;
  t.after(() => { a.close(); b.close(); });
  await Promise.all([a.flush(), b.flush()]);
  const first = example(); first.course.last = 'variables';
  const second = freshProgress(); second.course.lessons.arrays = { ...lesson(), best: 3 };
  a.save(first); b.save(second);
  assert.deepEqual(await Promise.all([a.flush(), b.flush()]), [true, true]);
  const cloud = h.store.values.get('users/alice').data.progress;
  assert.equal(cloud.course.lessons.variables.code, 'let score = 1;');
  assert.equal(cloud.course.lessons.arrays.best, 3);
  assert.equal(cloud.course.last, 'variables');
});

test('console answers survive account saves, concurrent devices, reloads and account separation', async t => {
  const h = harness();
  const a = client(h).sync, b = client(h).sync;
  t.after(() => { a.close(); b.close(); });
  await Promise.all([a.flush(), b.flush()]);
  const first = freshProgress(), second = example();
  first.consolePractice.answers['console-001'] = { choice: 1, submitted: true, solved: true };
  second.consolePractice.current = 199;
  second.consolePractice.answers['console-200'] = { choice: 3, submitted: true, solved: true };
  a.save(first); b.save(second);
  assert.deepEqual(await Promise.all([a.flush(), b.flush()]), [true, true]);
  const restored = client(h).sync;
  t.after(() => restored.close());
  await restored.flush();
  assert.equal(restored.progress.consolePractice.current, 199);
  assert.deepEqual(restored.progress.consolePractice.answers, {
    ...first.consolePractice.answers, ...second.consolePractice.answers,
  });
  assert.equal(restored.progress.course.lessons.variables.code, 'let score = 1;');
  h.setUser({ id: 'bob' });
  const bob = client(h, 'bob').sync;
  t.after(() => bob.close());
  await bob.flush();
  assert.deepEqual(bob.progress.consolePractice.answers, {});
});

test('an offline draft survives closing and is merged after reconnecting', async t => {
  const h = harness(), storage = memoryStorage();
  const a = client(h, 'alice', storage).sync;
  await a.flush();
  h.setOffline(true);
  const draft = example(); draft.course.lessons.variables.code = 'offline draft';
  a.save(draft);
  assert.equal(await a.flush(), false);
  a.close();
  assert.equal(JSON.parse(storage.getItem(accountStorageKey('alice'))).pending, true);
  h.setOffline(false);
  const b = client(h, 'alice', storage).sync;
  t.after(() => b.close());
  assert.equal(await b.flush(), true);
  assert.equal(h.store.values.get('users/alice').data.progress.course.lessons.variables.code, 'offline draft');
});

test('a failed initial load cannot overwrite existing cloud progress', async t => {
  const h = harness(), original = client(h).sync;
  await original.flush(); original.save(example()); await original.flush(); original.close();
  h.setOffline(true);
  const { sync } = client(h);
  t.after(() => sync.close());
  assert.equal(await sync.flush(), false);
  const newWork = freshProgress(); newWork.course.lessons.arrays = { ...lesson(), passed: true };
  sync.save(newWork);
  h.setOffline(false);
  assert.equal(await sync.flush(), true);
  const saved = h.store.values.get('users/alice').data.progress;
  assert.ok(saved.course.lessons.variables);
  assert.equal(saved.course.lessons.arrays.passed, true);
});

test('account switching isolates caches and ignores late responses', async t => {
  const h = harness(), storage = memoryStorage();
  let updates = 0, release;
  const { sync: alice } = client(h, 'alice', storage, () => updates++);
  await alice.flush(); alice.save(example()); await alice.flush();
  const originalRequest = alice.request;
  alice.request = async (...args) => { const response = await originalRequest(...args); await new Promise(resolve => { release = resolve; }); return response; };
  const draft = example(); draft.course.lessons.variables.code = 'private draft'; alice.save(draft);
  const inFlight = alice.flush();
  while (!release) await new Promise(resolve => setImmediate(resolve));
  const before = updates; alice.close(); h.setUser({ id: 'bob' });
  const bob = client(h, 'bob', storage).sync;
  t.after(() => bob.close());
  assert.equal(await bob.flush(), true);
  release(); await inFlight;
  assert.equal(updates, before);
  assert.deepEqual(bob.progress, freshProgress());
  assert.equal(storage.getItem('javascript-study-companion-v1'), null);
});

test('keystrokes typed during a save are queued for a subsequent save', async t => {
  const h = harness();
  const { sync } = client(h); t.after(() => sync.close());
  await sync.flush();
  let release, first = true;
  sync.request = async (...args) => {
    const response = await h.request(...args);
    if (first) { first = false; await new Promise(resolve => { release = resolve; }); }
    return response;
  };
  sync.save(example()); const writing = sync.flush();
  while (!release) await new Promise(resolve => setImmediate(resolve));
  const newer = example(); newer.course.lessons.variables.code = 'typed while saving'; sync.save(newer);
  release(); assert.equal(await writing, true);
  assert.equal(h.store.values.get('users/alice').data.progress.course.lessons.variables.code, 'typed while saving');
});
