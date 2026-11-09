import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..', 'dist', 'client');
const basePath = '/ai-engineering-course';

// The asset prefix is a URL prefix; GitHub Pages already mounts the repository there.
const prefixedAssets = join(root, 'ai-engineering-course');
if (existsSync(prefixedAssets)) {
  cpSync(prefixedAssets, root, { recursive: true });
  rmSync(prefixedAssets, { recursive: true });
}

let updated = 0;
const lectures = join(root, 'lectures');
for (const entry of readdirSync(lectures, { withFileTypes: true })) {
  if (!entry.isFile() || !entry.name.endsWith('.html')) continue;
  const directory = join(lectures, entry.name.slice(0, -5));
  mkdirSync(directory, { recursive: true });
  renameSync(join(lectures, entry.name), join(directory, 'index.html'));
}

function prepare(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const file = join(directory, entry.name);
    if (entry.isDirectory()) {
      prepare(file);
    } else if (/\.(html|svg)$/.test(entry.name)) {
      const original = readFileSync(file, 'utf8');
      const content = original.replace(
        /\b(href|src|poster)="\/(?!\/|ai-engineering-course(?:\/|"))/g,
        `$1="${basePath}/`,
      );
      if (content !== original) {
        writeFileSync(file, content);
        updated++;
      }
    }
  }
}
prepare(root);
writeFileSync(join(root, '.nojekyll'), '');
console.log(
  `Prepared GitHub Pages: ${updated} embedded documents use ${basePath}/.`,
);
