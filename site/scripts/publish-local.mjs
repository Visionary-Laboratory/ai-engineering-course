import { cpSync, existsSync, readdirSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';

const repo = resolve(import.meta.dirname, '..', '..');
const build = join(repo, 'site/dist/client');
for (const required of [
  'index.html',
  'model-foundations/index.html',
  'parallel-computing/course-manifest.json',
]) {
  if (!existsSync(join(build, required)))
    throw new Error(`Run build:pages first: missing ${required}`);
}

// Replace generated directories so removed lectures and old bundles stay removed.
for (const name of ['_next', 'lectures', 'parallel-computing']) {
  rmSync(join(repo, name), { recursive: true, force: true });
}
for (const entry of readdirSync(build, { withFileTypes: true })) {
  if (['.vite', '.assetsignore', '_headers'].includes(entry.name)) continue;
  cpSync(join(build, entry.name), join(repo, entry.name), { recursive: true });
}
console.log(
  'Published local static files: 6 model lectures and 4 parallel lectures.',
);
