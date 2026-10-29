// Account UI uses Netlify's maintained SDK; passwords are never saved by our code.
import { login, signup, logout, getUser, getSettings, handleAuthCallback,
  onAuthChange, requestPasswordRecovery, updateUser } from '@netlify/identity';
import { ProgressSync } from './progress-sync.js';
import { freshProgress, mergeProgress } from '../shared/progress.js';

export function createAccounts({ getProgress, getGuest, applyProgress, setBusy }) {
  const $ = selector => document.querySelector(selector);
  const dialog = $('#account-dialog');
  const form = $('#account-form');
  const storage = { getItem: key => localStorage.getItem(key), setItem: (key, value) => localStorage.setItem(key, value) };
  let user = null, sync = null, loading = true, mode = 'login', generation = 0, transition = Promise.resolve();
  let actionBusy = false, recovery = false;

  function message(text, error = false) {
    $('#account-message').textContent = text;
    $('#account-message').classList.toggle('is-error', error);
  }
  function status(text) {
    $('#account-sync-status').textContent = text;
    $('#account-status').textContent = user ? text : 'Guest · saved on this device';
  }
  function showMode(next) {
    mode = next;
    const signed = !!user && next !== 'reset';
    form.hidden = signed;
    $('#account-profile').hidden = !signed;
    $('#account-switches').hidden = signed || next === 'reset';
    document.querySelectorAll('[data-account-mode]').forEach(button => {
      button.hidden = button.dataset.accountMode === next;
    });
    $('#account-name-row').hidden = next !== 'signup';
    $('#account-email-row').hidden = next === 'reset';
    $('#account-password-row').hidden = next === 'recover';
    $('#account-confirm-row').hidden = !['signup', 'reset'].includes(next);
    $('#account-cancel-password').hidden = next !== 'reset';
    $('#account-name').required = next === 'signup';
    $('#account-email').required = next !== 'reset';
    $('#account-password').required = next !== 'recover';
    $('#account-confirm').required = ['signup', 'reset'].includes(next);
    $('#account-password').minLength = ['signup', 'reset'].includes(next) ? 12 : 1;
    $('#account-password').autocomplete = next === 'login' ? 'current-password' : 'new-password';
    const labels = { login: 'Sign in', signup: 'Create an account', recover: 'Reset your password', reset: 'Choose a new password' };
    $('#account-title').textContent = signed ? 'Your learning account' : labels[next];
    $('#account-submit').textContent = next === 'recover' ? 'Send reset email' : next === 'reset' ? 'Save new password' : labels[next];
    $('#account-intro').textContent = signed
      ? 'Pick up where you left off on any device.'
      : next === 'signup' ? 'Save your lessons, code drafts and quiz results. Use a password with at least 12 characters.'
        : next === 'recover' ? 'We’ll email you a link to choose a new password.'
          : next === 'reset' ? 'Use at least 12 characters for your new password.'
            : 'Welcome back. Sign in to continue your JavaScript course.';
    $('#account-email-value').textContent = user?.email || '';
    $('#account-button').textContent = user ? 'My account' : 'Sign in / Join';
    $('.guest-import').hidden = !getGuest(true);
  }

  function selectUser(next) {
    if (next?.id === user?.id && !loading) return Promise.resolve();
    const epoch = ++generation;
    sync?.close();
    user = next;
    if (!user) recovery = false;
    sync = null;
    loading = true;
    setBusy(true);
    showMode(recovery ? 'reset' : 'login');
    if (!user) {
      applyProgress(getGuest() || freshProgress(), { resume: false });
      status('Guest · saved on this device');
      loading = false;
      setBusy(false);
      transition = Promise.resolve();
      return transition;
    }
    const current = new ProgressSync({
      userId: user.id, storage,
      onStatus: text => { if (epoch === generation) status(text); },
      onUpdate: progress => {
        if (epoch === generation) applyProgress(progress, { resume: loading });
      },
    });
    sync = current;
    // Show only this user's cached copy while retrieving the latest cloud copy.
    applyProgress(current.progress, { resume: false });
    transition = current.flush().finally(() => {
      if (epoch !== generation) return;
      loading = false;
      setBusy(false);
      showMode(recovery ? 'reset' : 'login');
    });
    return transition;
  }

  async function open() {
    showMode(recovery ? 'reset' : 'login');
    message('');
    dialog.showModal();
    if (!user) {
      try {
        const settings = await getSettings();
        if (settings.disableSignup) message('New registrations are currently closed. Existing accounts can sign in.');
      } catch { message('Account service is currently unavailable. You can keep studying as a guest.', true); }
    }
  }
  $('#account-button').addEventListener('click', () => { void open(); });
  for (const button of document.querySelectorAll('[data-account-mode]')) {
    button.addEventListener('click', () => {
      if (actionBusy) return;
      form.reset(); showMode(button.dataset.accountMode); message('');
    });
  }
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (actionBusy) return;
    const submittedMode = mode;
    const email = $('#account-email').value.trim();
    const password = $('#account-password').value;
    if (['signup', 'reset'].includes(mode) && password !== $('#account-confirm').value) {
      message('The two passwords do not match.', true); return;
    }
    actionBusy = true;
    $('#account-submit').disabled = true;
    message('Please wait…');
    try {
      if (submittedMode === 'login') {
        const signedIn = await login(email, password);
        await transition;
        if (signedIn.id !== user?.id) await selectUser(signedIn);
        message('You’re signed in. Check your save status below.');
      } else if (submittedMode === 'signup') {
        await signup(email, password, { full_name: $('#account-name').value.trim() });
        await transition;
        message(user ? 'Your account is ready.' : 'Check your email and click the confirmation link, then sign in here.');
        if (!user) showMode('login');
      } else if (submittedMode === 'recover') {
        await requestPasswordRecovery(email);
        message('If this email has an account, a password reset link will arrive shortly. Check your spam folder too.');
      } else if (submittedMode === 'reset') {
        await updateUser({ password });
        recovery = false;
        showMode('login');
        message('Password updated. You can continue learning.');
      }
      $('#account-password').value = '';
      $('#account-confirm').value = '';
    } catch (error) {
      message(error.message || 'That did not work. Please try again.', true);
    } finally {
      actionBusy = false;
      $('#account-submit').disabled = false;
    }
  });
  $('#account-logout').addEventListener('click', async () => {
    if (actionBusy) return;
    actionBusy = true;
    $('#account-logout').disabled = true;
    setBusy(true);
    try {
      sync?.save(getProgress());
      const saved = await sync?.flush();
      await logout();
      await transition;
      if (user) await selectUser(null);
      message(saved ? 'Signed out. Your guest progress is now shown.' : 'Signed out. Unsynced changes stay on this device for your next sign-in.');
    } catch { message('Could not sign out. Please retry.', true); }
    finally { actionBusy = false; $('#account-logout').disabled = false; setBusy(loading); }
  });
  $('#account-retry').addEventListener('click', () => { void sync?.flush({ refresh: true }); });
  $('#import-guest-progress').addEventListener('click', () => {
    const guest = getGuest(true);
    if (!sync || loading || !guest) return;
    const merged = mergeProgress(freshProgress(), guest, getProgress());
    applyProgress(merged, { resume: true });
    sync.save(getProgress());
    message('Guest progress added to this account. Any overlapping guest drafts replace the account drafts.');
  });
  $('#account-change-password').addEventListener('click', () => { recovery = true; showMode('reset'); message(''); });
  $('#account-cancel-password').addEventListener('click', () => {
    if (actionBusy) return;
    recovery = false; form.reset(); showMode('login'); message('');
  });
  dialog.addEventListener('close', () => { $('#account-password').value = ''; $('#account-confirm').value = ''; });
  const retry = () => { if (user && !loading) void sync?.flush({ refresh: true }); };
  window.addEventListener('online', retry);
  window.addEventListener('focus', retry);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') void sync?.flush({ keepalive: true });
  });
  window.addEventListener('pagehide', () => { void sync?.flush({ keepalive: true }); });

  return {
    get signedIn() { return !!user; },
    get localOK() { return sync?.localOK ?? true; },
    get loading() { return loading; },
    save(value) { if (!loading) sync?.save(value); },
    async start() {
      setBusy(true);
      try {
        // Must run before navigation rewrites the email confirmation/recovery hash.
        const callback = await handleAuthCallback();
        recovery = callback?.type === 'recovery' || callback?.type === 'invite';
        await selectUser(await getUser());
        if (recovery) { showMode('reset'); dialog.showModal(); }
        else if (callback) { await open(); message('Email confirmed. Your account is ready.'); }
      } catch {
        await selectUser(null);
        await open();
        message('This account link has expired or could not be opened. Sign in or request a new reset email.', true);
      } finally {
        onAuthChange((event, next) => {
          if (event === 'recovery') recovery = true;
          if (next?.id !== user?.id) void selectUser(next);
        });
        $('#account-button').disabled = false;
      }
    },
  };
}
