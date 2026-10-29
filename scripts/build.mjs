import { mkdir, copyFile } from 'node:fs/promises';
import { build } from 'esbuild';
import { dirname } from 'node:path';
import { COURSE } from '../javascript-course/lessons/index.js';
import { compileCourseChecks } from './practice-checks.mjs';

await mkdir('dist', { recursive: true });
for (const file of ['index.html', 'style.css']) {
  await copyFile(`javascript-course/${file}`, `dist/${file}`);
}
await build({
  entryPoints: ['javascript-course/script.js'], outfile: 'dist/script.js',
  bundle: true, platform: 'browser', format: 'iife', target: 'es2022',
  // Readable output helps learners inspect the website's code.
  minify: false, legalComments: 'eof',
  // Ship prepared content, not the parser or authoring tools, to the browser.
  plugins: [{ name: 'prepare-course-feedback', setup(builder) {
    builder.onLoad({ filter: /javascript-course[\\/]lessons[\\/]index\.js$/ }, args => ({
      contents: `export { lessonProgressKey, lessonProgressKeys, initialLessonCode, hasLessonWork } from './progress-keys.js';\nexport const COURSE = ${JSON.stringify(compileCourseChecks(COURSE))};`,
      resolveDir: dirname(args.path), loader: 'js',
    }));
  } }],
});
console.log('Built dist/ with HTML, CSS and JavaScript.');
