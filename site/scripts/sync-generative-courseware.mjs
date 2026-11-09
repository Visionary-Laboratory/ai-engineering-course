import { cpSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const siteRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sourceRoot = resolve(siteRoot, '..', '..', 'ai-engineering-course');
const targetRoot = join(siteRoot, 'public', 'courseware');
const files = [
  'generative-models.html',
  'generative-models.js',
  'generative-content.css',
  'styles.css',
  'transformer-content.css',
  'script.js',
];
const directories = ['vendor', 'diagrams/generative', 'media/generative'];
const downloads = ['Part I-Generative.pdf', 'Part II-Generative.pdf'];

mkdirSync(targetRoot, { recursive: true });
mkdirSync(join(targetRoot, 'pdf'), { recursive: true });
for (const file of files)
  cpSync(join(sourceRoot, file), join(targetRoot, file));
for (const directory of directories) {
  cpSync(join(sourceRoot, directory), join(targetRoot, directory), {
    recursive: true,
  });
}
for (const file of downloads) {
  cpSync(join(sourceRoot, 'pdf', file), join(targetRoot, 'pdf', file));
}

const legacyRoutes = [
  ['index.html', '/'],
  ['lectures.html', '/'],
  ['downloads.html', '/'],
  ['intro-overview.html', '/lectures/01-neural-networks'],
  ['cnn-image-recognition.html', '/lectures/02-cnns'],
  ['rnn-lstm-sequence-modeling.html', '/lectures/03-rnns-lstms'],
  ['transformer-models.html', '/lectures/04-transformers'],
  ['self-supervised-learning.html', '/lectures/05-self-supervised'],
];
const page = join(targetRoot, 'generative-models.html');
let html = readFileSync(page, 'utf8');
for (const [from, to] of legacyRoutes)
  html = html.replaceAll(`href="${from}`, `href="${to}`);
html = html.replace('</head>', '<script src="embed-shell.js"></script></head>');
writeFileSync(page, html);

console.log(
  'Synced generated generative-models courseware to public/courseware.',
);
