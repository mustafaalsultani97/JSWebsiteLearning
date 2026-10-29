import { freshProgress } from '../shared/progress.js';

export function lesson(code = '') {
  return { step: 0, read: [], code, passed: false, answers: [null, null, null], submitted: false, best: 0, order: [] };
}
export function example() {
  const progress = freshProgress();
  progress.course.lessons.variables = lesson('let score = 1;');
  return progress;
}
export function memoryStorage() {
  const values = new Map();
  return { getItem: k => values.get(k) ?? null, setItem: (k, v) => values.set(k, v), values };
}
export function memoryStore() {
  const values = new Map();
  let revision = 0;
  return {
    values,
    async getWithMetadata(key) { return structuredClone(values.get(key) ?? null); },
    async setJSON(key, data, options) {
      const current = values.get(key);
      if ((options.onlyIfNew && current) || (options.onlyIfMatch && current?.etag !== options.onlyIfMatch)) {
        return { modified: false };
      }
      const etag = String(++revision);
      values.set(key, { data: structuredClone(data), etag });
      return { modified: true, etag };
    },
  };
}
