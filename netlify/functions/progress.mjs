import { getUser, verifyRequestOrigin } from '@netlify/identity';
import { getStore } from '@netlify/blobs';
import { createProgressHandler } from '../../server/progress-handler.js';

// Identity validates the session; the browser never chooses a storage key.
export default createProgressHandler({
  getUser,
  verifyOrigin: verifyRequestOrigin,
  getStore: () => getStore({ name: 'course-progress', consistency: 'strong' }),
});
