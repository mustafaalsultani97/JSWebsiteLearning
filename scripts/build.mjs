import { mkdir, copyFile } from 'node:fs/promises';
import { build } from 'esbuild';

await mkdir('dist', { recursive: true });
for (const file of ['index.html', 'style.css', 'JavaScriptKursplan.pdf']) {
  await copyFile(`javascript-course/${file}`, `dist/${file}`);
}
await build({
  entryPoints: ['javascript-course/script.js'], outfile: 'dist/script.js',
  bundle: true, platform: 'browser', format: 'iife', target: 'es2022',
  // Readable output helps learners inspect the website's code.
  minify: false, legalComments: 'eof',
});
console.log('Built dist/ with HTML, CSS, JavaScript and the course PDF.');
