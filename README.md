# JavaScript Learning Course

21 lessons, coding exercises, 63 lesson quiz questions, 100 console predictions,
and a searchable reference library.
Lessons are in English with key Swedish terms.

The website opens on **Home** (`#start`), with a course introduction, a runnable
example, a four-unit overview, and a Start learning or Continue learning button.
The JS logo and Home button return here. Learning path (`#course`) lists every
lesson; Reference desk (`#home`) keeps its existing address. Returning to Home
preserves the current lesson and step, including after account progress loads.

**Predict the console** (`#console`) is a separate learning method directly below
Home and Learning path in the sidebar, with entry cards on both pages. Learners
read 100 distinct JavaScript snippets, choose A–D, then check the output and read
the explanation. Ten levels build from simple messages to loops, functions,
references, closures and async execution. Previous, next, and a question picker
support review; missed answers can be retried. A summary appears after all 100
questions are answered. Correct predictions remain credited when practising again.

The selected question, draft answer and checked results are included in guest
storage, account synchronization and progress backups, independently of lessons.
Authored questions live in `javascript-course/console-questions.js`; keep their
IDs and answer order stable. `npm test` executes all 100 snippets to verify the
answer key and checks progress validation, merging and answer/retry behavior.

## How the lessons teach

All 21 course lessons use newly authored examples and practice situations while
keeping the topics and learning order from the four class websites. Each lesson
has goals and prerequisites, two detailed explanation pages, runnable examples
where appropriate, expected output, a line-by-line walkthrough, common mistakes,
and a prediction question with reasoning. Practice includes an ordered task,
three progressive hints, an explained solution, and automatic checks. Three new
quiz questions finish the lesson with explanations for every answer.

When adding material from another class website, keep its learning objectives,
but write fresh scenarios, data and exercises. Explain the concept and each new
piece of syntax before asking the learner to use it. A renamed school example
alone is not a new exercise. Use the files in `javascript-course/lessons/` as the
content template; keep the English explanations and key Swedish terms.

The expanded course has separate `-v2` progress records. Earlier lesson drafts,
reading marks and quiz results are retained under their existing keys and can be
viewed in **Your earlier work** inside each lesson. Old quiz choices are never
displayed as answers to different new questions. The current progress indicator
counts the new exercises. Both versions are included in account sync and backups.

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

The production site was configured on 29 October 2026: Identity is enabled,
public registration is open, email confirmation is required, and the progress
store passed a cloud write/read check. Use `npm run check:live` to check its current
status. The steps below also describe how to set up another deployment.

1. Commit these files to the GitHub repository connected to
   **javascriptcoursefree.netlify.app**. Keep `package.json`, `netlify.toml`,
   `javascript-course/`, `shared/`, `server/`, and `netlify/` at the repository root.
2. In Netlify, open **javascriptcoursefree → Identity → Enable Identity**.
3. Allow open registration if everyone should be able to join. Keep email
   confirmation enabled. Confirm the site's URL is
   `https://javascriptcoursefree.netlify.app` in Identity's email settings.
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
| `javascript-course/script.js` | Navigation, lesson screens, code runners and progress |
| `javascript-course/lessons/` | Teaching text, examples, practice tasks, hints, solutions and quizzes, grouped into four topic files |
| `javascript-course/extra-practice/` | Ten optional exercises per lesson, with independent checks, hints and explained solutions |
| `javascript-course/practice-feedback.js` | Observed values, plain-English error explanations, and hints for failed coding checks |
| `javascript-course/lessons/check-hints.js` | A targeted hint for each required coding check |
| `javascript-course/accounts.js` | Sign-in, signup, sign-out, recovery and account UI |
| `javascript-course/progress-sync.js` | Browser backup, retry, and cloud synchronization |
| `shared/progress.js` | Data validation and merging changes from different devices |
| `netlify/functions/progress.mjs` | The private progress API entry point |
| `server/progress-handler.js` | Authentication checks and conditional storage writes |
| `scripts/build.mjs` | Bundles JavaScript and copies the page and styles to `dist/` |

Edit source files, then rebuild. Do not edit the generated `dist/` files directly.
`npm test` executes every JavaScript teaching example and every worked practice
solution, checks that the starter still requires learner work, and verifies that
both course versions fit the account progress schema.
The build keeps HTML, CSS and JavaScript separate. The JavaScript bundle is readable
and includes the account SDK, so there are no runtime CDN dependencies.

## Optional extra practice

Every lesson offers **10 optional exercises (210 total)**. After completing the
required lesson, learners can choose **Next lesson** or **Practice more**. The
extra-practice button is also available at any time. All ten cards are unlocked;
learners can choose any order and leave whenever they want. Git uses ten command
scenarios; the other lessons use checked JavaScript exercises.

Each exercise saves its own code draft or choice and completion status. Guests
save on this browser; signed-in learners also save through the existing private
progress service. These results never affect the required lesson score. The
extra-practice screen and selected exercise are restored when learners return.

To edit an exercise, find its lesson ID in `extra-practice/`. Keep the existing
array order stable: IDs `p01` through `p10` correspond to saved attempts. Each
code task defines instructions, a starter, a worked solution, check expressions,
a hint, and solution reasoning. `npm test` runs all 200 extra code solutions,
verifies that their starters need work, validates the ten Git scenarios, and
checks saving and concurrent edits within the same lesson.

When a coding attempt fails, the practice screen explains the first failed check,
shows expected and observed values where available, and offers a targeted hint.
Syntax errors, missing names, wrong types, missing returns and timeouts have
separate explanations. After one fix, running again reveals the next issue.
Worked solutions remain behind their existing disclosure; feedback does not
automatically open them. Feedback comes from local checks, not an AI service.

`scripts/practice-checks.mjs` parses the authored assertions during the build and
adds value observations without calling learner functions twice. The build embeds
the prepared course content, so the parser is not downloaded by learners. Checks
still run in the isolated, time-limited worker; progress and account formats are
unchanged. Tests run every worked solution through this same feedback runner.

## Storage and access

The account backend has two persistent stores on Netlify:

| Information | Storage |
| --- | --- |
| Learner IDs, email addresses, names and authentication credentials | Netlify Identity's managed user store |
| Lessons, code drafts, quiz results, bookmarks and reading settings | The private `course-progress` Netlify Blobs store |

Identity creates each learner's user record at sign-up. The progress API creates
their progress record on the first save. These records persist across website
deployments. GitHub contains the application code and data rules; learner records
are held by the hosting services. No separate SQL database setup is required for
this version of the course.

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

Run `npm run check:live` to check the published account forms, JavaScript bundle,
public registration service and authentication requirement on the progress API.
It prints the specific missing setup step if accounts are not ready. This is a
read-only check; it does not register users, send email or write progress. To check
another deployment, run `npm run check:live -- https://your-site.netlify.app`.

`npm test` checks access isolation, invalid/oversized requests, conditional writes,
concurrent devices, offline recovery, account switching, and edits made while a save
is in flight.

For browser integration checks, run `npm run build` then `npm run test:browser`.
Open `http://localhost:4174`. This is a **local test harness**, with fake Identity and
temporary in-memory storage. Its fixtures are `alice@example.test` and
`bob@example.test`, both using `Test-only-1234`. It binds only to the local computer,
is outside `dist/`, and is never deployed. Passing these tests does not replace the
live email and cross-device check in the setup steps above.
