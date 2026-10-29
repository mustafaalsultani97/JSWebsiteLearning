# JavaScript Learning Course

21 lessons, coding exercises, 63 quiz questions, and a searchable reference library.
Lessons are in English with key Swedish terms.

## Accounts and saved progress

Visitors can study as guests or create an email/password account. Accounts save the
last lesson and step, code drafts, quiz answers and best scores, bookmarks, completed
topics, and reading preferences. Signing in restores that account's progress.

Guest progress stays separate. The account window offers **Add this browser’s guest
progress** so someone can deliberately bring their earlier work into their account.
Do this only for your own work. Guest drafts replace overlapping account drafts.

The browser keeps a backup for each account. If saving fails, the toolbar says so;
retry with **My account → Sync now**. Wait for **Saved to your account** before moving
to another device. Unsynced changes are retried after reconnecting or signing in
again. Signing out returns to guest progress and does not erase the account cache.

## One-time setup for this Netlify website

1. Commit these files to the GitHub repository connected to
   **javasscripcoursefree.netlify.app**. Keep `package.json`, `netlify.toml`,
   `javascript-course/`, `shared/`, `server/`, and `netlify/` at the repository root.
2. In Netlify, open **javasscripcoursefree → Identity → Enable Identity**.
3. Allow open registration if everyone should be able to join. Keep email
   confirmation enabled. Confirm the site's URL is
   `https://javasscripcoursefree.netlify.app` in Identity's email settings.
4. Deploy the updated repository. `netlify.toml` configures `npm run build`, the
   `dist` publish folder, Node 22, and the server function. The base directory should
   be the repository root. No database password or API key goes in the browser code.
5. Create a test learner account on the live site, confirm the email, and sign in.
   Complete a lesson step, write a draft, and wait for the saved status. Sign in in
   another browser/device and check the lesson and draft. Also test sign-out and
   the password-reset email link.

Identity must be enabled before live sign-in works. A plain drag-and-drop upload of
only the HTML/CSS/JS files cannot run the progress-saving function; deploy this
repository through Netlify. The existing guest lessons still work if Identity is
temporarily unavailable.

Provider documentation: [Identity setup](https://docs.netlify.com/manage/security/secure-access-to-sites/identity/get-started/),
[Identity in Functions](https://docs.netlify.com/manage/security/secure-access-to-sites/identity/use-identity-in-functions/),
and [Netlify Blobs](https://docs.netlify.com/build/data-and-storage/netlify-blobs/).

## Open and edit in VS Code

Open this entire repository folder with **File → Open Folder**. Install Node.js
22.12 or later, then run these commands in its terminal:

```sh
npm ci
npm test
npm run build
npm run preview
```

Open `http://localhost:4173`. This is a static preview: real sign-in and cloud
storage require the Netlify deployment. Press Ctrl+C to stop the preview.

| File | What to edit |
| --- | --- |
| `javascript-course/index.html` | Page structure, toolbar and account forms |
| `javascript-course/style.css` | Colors, spacing, layout and mobile styles |
| `javascript-course/script.js` | Lesson content, quizzes, exercises and navigation |
| `javascript-course/accounts.js` | Sign-in, signup, sign-out, recovery and account UI |
| `javascript-course/progress-sync.js` | Browser backup, retry, and cloud synchronization |
| `shared/progress.js` | Data validation and merging changes from different devices |
| `netlify/functions/progress.mjs` | The private progress API entry point |
| `server/progress-handler.js` | Authentication checks and conditional storage writes |
| `scripts/build.mjs` | Bundles JavaScript and copies the page and styles to `dist/` |

Edit source files, then rebuild. Do not edit the generated `dist/` files directly.
The build keeps HTML, CSS and JavaScript separate. The JavaScript bundle is readable
and includes the account SDK, so there are no runtime CDN dependencies.

## Storage and access

Netlify Identity handles passwords, email confirmation and password recovery.
The progress API accepts only authenticated requests and derives the storage key
from the verified user's ID. An account header guards against another tab switching
accounts during a save; it never grants access by itself. Writes require the same
origin and valid, bounded JSON. Responses are private and not cached.

Progress is stored in the site-wide `course-progress` Netlify Blobs store. Conditional
writes detect simultaneous changes. A three-way merge keeps independent edits and
achievements; for conflicting edits to the same draft or quiz attempt, the device
retrying the save wins. Existing progress backup download/restore still works.

## Tests

`npm test` checks access isolation, invalid/oversized requests, conditional writes,
concurrent devices, offline recovery, account switching, and edits made while a save
is in flight.

For browser integration checks, run `npm run build` then `npm run test:browser`.
Open `http://localhost:4174`. This is a **local test harness**, with fake Identity and
temporary in-memory storage. Its fixtures are `alice@example.test` and
`bob@example.test`, both using `Test-only-1234`. It binds only to the local computer,
is outside `dist/`, and is never deployed. Passing these tests does not replace the
live email and cross-device check in the setup steps above.
