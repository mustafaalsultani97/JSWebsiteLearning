import { cleanProgress, MAX_PROGRESS_BYTES } from '../shared/progress.js';

const reply = (body, status = 200) => Response.json(body, {
  status, headers: { 'Cache-Control': 'private, no-store', 'Vary': 'Cookie', 'X-Content-Type-Options': 'nosniff' },
});
async function boundedJSON(request) {
  const reader = request.body?.getReader();
  if (!reader) throw new Error('body');
  const decoder = new TextDecoder();
  let text = '', size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_PROGRESS_BYTES) { await reader.cancel(); throw new Error('size'); }
    text += decoder.decode(value, { stream: true });
  }
  return JSON.parse(text + decoder.decode());
}

// Dependencies are injected so authorization and concurrent writes can be tested
// without real credentials or altering anyone's live course progress.
export function createProgressHandler({ getUser, verifyOrigin, getStore }) {
  return async (request) => {
    if (!['GET', 'PUT'].includes(request.method)) return reply({ error: 'Method not allowed.' }, 405);
    if (request.method === 'PUT') {
      try { verifyOrigin(request); } catch { return reply({ error: 'Origin not allowed.' }, 403); }
      if (!request.headers.get('content-type')?.startsWith('application/json')) {
        return reply({ error: 'JSON required.' }, 415);
      }
    }
    try {
      const user = await getUser();
      if (!user?.id) return reply({ error: 'Please sign in again.' }, 401);
      // A second tab may have switched the shared auth cookie during a save.
      if (request.headers.get('x-account-id') !== user.id) {
        return reply({ error: 'Account changed. Reload before saving.' }, 403);
      }
      const key = `users/${encodeURIComponent(user.id)}`;
      const store = getStore();
      const snapshot = async () => {
        const item = await store.getWithMetadata(key, { type: 'json', consistency: 'strong' });
        return { userId: user.id, progress: item?.data.progress ?? null,
          etag: item?.etag ?? null, updatedAt: item?.data.updatedAt ?? null };
      };
      if (request.method === 'GET') return reply(await snapshot());
      let body, progress;
      try {
        body = await boundedJSON(request);
        if (!(body.etag === null || (typeof body.etag === 'string' && body.etag.length <= 256))) throw Error();
        progress = cleanProgress(body.progress);
      } catch (error) {
        return reply({ error: error.message === 'size' ? 'Progress exceeds the size limit.' : 'Invalid progress data.' }, error.message === 'size' ? 413 : 400);
      }
      const updatedAt = new Date().toISOString();
      const result = await store.setJSON(key, { progress, updatedAt },
        body.etag === null ? { onlyIfNew: true } : { onlyIfMatch: body.etag });
      if (!result.modified) return reply(await snapshot(), 409);
      return reply({ userId: user.id, progress, updatedAt, etag: result.etag });
    } catch {
      // Do not expose provider tokens, request bodies, emails or internal errors.
      return reply({ error: 'Cloud storage is temporarily unavailable. Please retry.' }, 503);
    }
  };
}
