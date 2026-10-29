import { copy, equal, freshProgress, cleanProgress, mergeProgress } from '../shared/progress.js';

export const accountStorageKey = id => `javascript-course-account-v1:${id}`;

// One instance belongs to one account. Its cache and requests can never be reused
// by the next person signing in on the same browser.
export class ProgressSync {
  constructor({ userId, storage, request = (...args) => fetch(...args), onUpdate, onStatus }) {
    Object.assign(this, { userId, storage, request, onUpdate, onStatus });
    this.progress = freshProgress();
    this.base = freshProgress();
    this.etag = null;
    this.pending = false;
    this.loaded = false;
    this.closed = false;
    this.localOK = true;
    this.controller = new AbortController();
    try {
      const cached = JSON.parse(storage.getItem(accountStorageKey(userId)));
      if (cached?.userId === userId) {
        this.progress = cleanProgress(cached.progress);
        this.base = cleanProgress(cached.base);
        this.pending = cached.pending === true;
      }
    } catch { /* A missing or damaged cache must not prevent a cloud restore. */ }
  }

  cache() {
    try {
      this.storage.setItem(accountStorageKey(this.userId), JSON.stringify({
        userId: this.userId, progress: this.progress, base: this.base, pending: this.pending,
      }));
      this.localOK = true;
    } catch { this.localOK = false; }
  }

  status(message) {
    if (!this.closed) this.onStatus(message, this.localOK);
  }

  async api(method, body, keepalive = false) {
    const response = await this.request('/.netlify/functions/progress', {
      method, credentials: 'same-origin', cache: 'no-store',
      headers: { 'Content-Type': 'application/json', 'X-Account-ID': this.userId },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.any([this.controller.signal, AbortSignal.timeout(12000)]),
      keepalive,
    });
    if (response.status === 401 || response.status === 403) {
      throw new Error('Session changed or expired. Sign in again to sync.');
    }
    if (!response.ok && response.status !== 409) throw new Error('Cloud save unavailable. Retry when online.');
    const result = await response.json();
    if (result.userId !== this.userId) throw new Error('Account changed. Reload to sync.');
    if (!(result.etag === null || typeof result.etag === 'string')) throw new Error('Invalid cloud response.');
    return { ...result, conflict: response.status === 409,
      progress: result.progress === null ? freshProgress() : cleanProgress(result.progress) };
  }

  // Loads remote data before the first write, even if a previous attempt failed.
  async load() {
    this.status('Loading your progress…');
    const remote = await this.api('GET');
    if (this.closed) return;
    const next = this.pending ? mergeProgress(this.base, this.progress, remote.progress) : remote.progress;
    this.base = copy(remote.progress);
    this.progress = next;
    this.etag = remote.etag;
    this.pending = !equal(next, remote.progress);
    this.loaded = true;
    this.cache();
    this.onUpdate(copy(next));
  }

  save(progress) {
    if (this.closed || equal(progress, this.progress)) return;
    this.progress = cleanProgress(progress);
    this.pending = true;
    this.cache();
    this.status('Changes waiting to save…');
    clearTimeout(this.timer);
    this.timer = setTimeout(() => { void this.flush(); }, 700);
  }

  async flush({ refresh = false, keepalive = false } = {}) {
    clearTimeout(this.timer);
    if (this.closed) return false;
    if (this.running) return this.running;
    this.running = this.perform({ refresh, keepalive });
    try { return await this.running; } finally { this.running = null; }
  }

  async perform({ refresh, keepalive }) {
    try {
      if (!this.loaded || refresh) await this.load();
      for (let tries = 0; this.pending && !this.closed && tries < 5; tries++) {
        this.status('Saving to your account…');
        const sent = copy(this.progress);
        const base = copy(this.base);
        const body = { etag: this.etag, progress: sent };
        const small = new TextEncoder().encode(JSON.stringify(body)).byteLength < 60000;
        const remote = await this.api('PUT', body, keepalive && small);
        if (this.closed) return false;
        // Preserve keystrokes made while this request was in flight.
        const next = mergeProgress(remote.conflict ? base : sent, this.progress, remote.progress);
        const changed = !equal(next, this.progress);
        this.progress = next;
        this.base = copy(remote.progress);
        this.etag = remote.etag;
        this.pending = !equal(next, remote.progress);
        this.cache();
        if (changed) this.onUpdate(copy(next));
      }
      if (this.closed) return false;
      if (this.pending) throw new Error('Another device is saving. Please retry.');
      this.status(this.localOK ? 'Saved to your account' : 'Saved online · browser backup unavailable');
      return true;
    } catch (error) {
      if (!this.closed) {
        this.cache();
        this.status(`${error.message} ${this.localOK ? 'This device keeps a copy.' : 'Download a backup before closing.'}`);
        // Also restored on the next sign-in. Never silently discard an offline edit.
        clearTimeout(this.timer);
        this.timer = setTimeout(() => { void this.flush(); }, 30000);
      }
      return false;
    }
  }

  close() {
    this.closed = true;
    clearTimeout(this.timer);
    this.controller.abort();
  }
}
