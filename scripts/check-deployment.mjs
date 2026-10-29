// Read-only checks against the published site. This does not create test users,
// send emails, or modify a learner's progress.
const target = new URL(process.argv[2] || 'https://javasscripcoursefree.netlify.app');
if (!['https:', 'http:'].includes(target.protocol)) throw Error('Use an HTTP or HTTPS website URL.');

const checks = [];
async function check(label, action) {
  try {
    const result = await action();
    checks.push({ label, ...result });
  } catch {
    checks.push({ label, ok: false, detail: 'The site could not be reached. Try again when online.' });
  }
}
const request = path => fetch(new URL(path, target), { cache: 'no-store', signal: AbortSignal.timeout(15000) });

await Promise.all([
  check('Account page', async () => {
    const response = await request('/');
    const html = await response.text();
    const ok = response.ok && html.includes('id="account-form"') && html.includes('id="account-button"');
    return { ok, detail: ok ? 'Sign-up and sign-in forms are deployed.' : 'Deploy the updated repository before testing accounts.' };
  }),
  check('Account JavaScript', async () => {
    const response = await request('/script.js');
    const source = await response.text();
    const ok = response.ok && source.includes('/.netlify/functions/progress') && source.includes('handleAuthCallback');
    return { ok, detail: ok ? 'Authentication and progress synchronization code are deployed.' : 'Check the build command and dist publish directory.' };
  }),
  check('Registration service', async () => {
    const response = await request('/.netlify/identity/settings');
    if (response.status === 404) return { ok: false, detail: 'Enable Identity in this Netlify project. Uploading code does not enable it.' };
    if (!response.ok) return { ok: false, detail: `Identity returned HTTP ${response.status}. Check Netlify Identity settings.` };
    const settings = await response.json();
    const ok = settings.disable_signup === false;
    return { ok, detail: ok
      ? `Public registration is enabled. Email confirmation is ${settings.autoconfirm ? 'off' : 'on'}.`
      : 'Identity is reachable, but public registration is closed. Set Registration preferences to Open.' };
  }),
  check('Private progress API', async () => {
    const response = await request('/.netlify/functions/progress');
    const ok = response.status === 401;
    return { ok, detail: ok ? 'The function is deployed and requires a signed-in account.'
      : `Expected HTTP 401 for a guest; received ${response.status}. Check the deployed function.` };
  }),
]);

console.log(`Account deployment check: ${target.origin}`);
for (const result of checks) console.log(`${result.ok ? 'PASS' : 'ACTION NEEDED'} | ${result.label}: ${result.detail}`);
console.log('After these checks pass, confirm an email and save a lesson using a real learner account to verify the full flow.');
process.exitCode = checks.every(result => result.ok) ? 0 : 1;
