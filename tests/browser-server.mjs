// LOCAL TEST HARNESS ONLY. Fake Identity and in-memory storage are never deployed.
// Use npm run preview for a plain static preview, or npm run test:browser for this
// isolated integration harness. Its two fixtures accept the password Test-only-1234.
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { createProgressHandler } from '../server/progress-handler.js';
import { verifyRequestOrigin } from '@netlify/identity';
import { memoryStore } from './helpers.mjs';

if (process.env.NODE_ENV === 'production') throw Error('Test harness cannot run in production.');
const mock = process.argv.includes('--mock-auth');
const port = mock ? 4174 : 4173;
const store = memoryStore();
const fixtures = ['alice@example.test', 'bob@example.test'].map((email, i) => ({
  id: `test-user-${i}`, email, user_metadata: { full_name: i ? 'Bob' : 'Alice' }, app_metadata: {},
}));
const tokens = new Map();
function token(user) {
  const access_token = `${Buffer.from('{"alg":"test"}').toString('base64url')}.${Buffer.from(JSON.stringify({ sub: user.id, email: user.email, exp: Math.floor(Date.now() / 1000) + 3600 })).toString('base64url')}.test-only`;
  tokens.set(access_token, user);
  tokens.set(`refresh-${user.id}`, user);
  return { access_token, refresh_token: `refresh-${user.id}`, expires_in: 3600, token_type: 'bearer' };
}
const json = (data, status = 200) => Response.json(data, { status });
const server = http.createServer(async (req, res) => {
  try {
    const origin = `http://localhost:${port}`;
    const url = new URL(req.url, origin);
    let body = '';
    for await (const chunk of req) body += chunk;
    let response;
    const bearer = req.headers.authorization?.replace(/^Bearer /, '');
    if (mock && url.pathname === '/.netlify/identity/settings') response = json({ autoconfirm: false, disable_signup: false, external: { email: true } });
    else if (mock && url.pathname === '/.netlify/identity/token') {
      const params = new URLSearchParams(body);
      const user = params.get('grant_type') === 'refresh_token' ? tokens.get(params.get('refresh_token'))
        : params.get('password') === 'Test-only-1234' && fixtures.find(u => u.email === params.get('username'));
      response = user ? json(token(user)) : json({ error: 'invalid_grant', error_description: 'Invalid test credentials.' }, 400);
    } else if (mock && url.pathname === '/.netlify/identity/user') response = tokens.has(bearer) ? json(tokens.get(bearer)) : json({ error: 'Unauthorized' }, 401);
    else if (mock && url.pathname === '/.netlify/identity/logout') response = json({});
    else if (mock && url.pathname === '/.netlify/identity/recover') response = json({});
    else if (mock && url.pathname === '/.netlify/identity/signup') {
      const data = JSON.parse(body);
      response = json({ id: 'test-unconfirmed', email: data.email, user_metadata: data.data || {}, app_metadata: {} });
    } else if (mock && url.pathname === '/.netlify/identity/verify') {
      response = json(token(fixtures[0]));
    } else if (mock && url.pathname === '/.netlify/functions/progress') {
      const cookie = req.headers.cookie?.split('; ').find(s => s.startsWith('nf_jwt='))?.slice(7);
      const handler = createProgressHandler({ getUser: async () => tokens.get(cookie) || null, getStore: () => store, verifyOrigin: verifyRequestOrigin });
      response = await handler(new Request(url, { method: req.method, headers: req.headers, ...(body ? { body } : {}) }));
    } else if (url.pathname.startsWith('/.netlify/')) response = json({ error: 'Account service requires Netlify hosting.' }, 404);
    else {
      const file = url.pathname === '/' ? 'index.html' : url.pathname.slice(1);
      if (!['index.html', 'script.js', 'style.css', 'JavaScriptKursplan.pdf'].includes(file)) response = new Response('Not found', { status: 404 });
      else response = new Response(await readFile(new URL(`../dist/${file}`, import.meta.url)), { headers: {
        'Content-Type': file.endsWith('.html') ? 'text/html; charset=utf-8' : file.endsWith('.js') ? 'text/javascript; charset=utf-8' : file.endsWith('.css') ? 'text/css; charset=utf-8' : 'application/pdf',
      } });
    }
    res.writeHead(response.status, Object.fromEntries(response.headers));
    res.end(Buffer.from(await response.arrayBuffer()));
  } catch { res.writeHead(500); res.end('Local preview error'); }
});
server.listen(port, '127.0.0.1', () => console.log(`${mock ? 'TEST HARNESS (fake accounts)' : 'Static preview'}: http://localhost:${port}`));
