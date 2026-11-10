import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { esc } from './diagrams/drawing.mjs';

const root = path.resolve(import.meta.dirname, '..');
const manifest = JSON.parse(
  fs.readFileSync(
    path.join(root, 'public/model-foundations/diagrams/manifest.json'),
    'utf8',
  ),
);
const entries = new Map(manifest.map((m) => [`${m.lesson}/${m.page}`, m]));
const files = fs
  .readdirSync(path.join(root, 'content/model-foundations'))
  .filter((f) => f.endsWith('.json'))
  .sort();
assert.equal(
  entries.size,
  739,
  'Every source page must have exactly one diagram',
);
const elements = new Set();
for (const [i, file] of files.entries()) {
  const { slides } = JSON.parse(
    fs.readFileSync(path.join(root, 'content/model-foundations', file), 'utf8'),
  );
  for (const slide of slides) {
    const m = entries.get(`${i + 1}/${slide.page}`);
    assert(m, `Missing figure for ${file}, page ${slide.page}`);
    for (const key of [
      'url',
      'kind',
      'title',
      'caption',
      'note',
      'sourceElements',
    ])
      assert.deepEqual(
        slide.figure[key],
        m[key],
        `${file}, page ${slide.page}: ${key}`,
      );
    const svg = fs.readFileSync(path.join(root, 'public', m.url), 'utf8');
    assert(svg.startsWith('<svg ') && svg.endsWith('</svg>'), m.url);
    assert(svg.includes('viewBox="0 72 960 417"'), m.url);
    assert(
      svg.includes('<title>') && svg.includes('<desc>'),
      `${m.url}: accessible description`,
    );
    assert(
      svg.includes(`<title>${esc(slide.figure.title)}</title>`),
      `${m.url}: SVG title must match the course content`,
    );
    assert(
      !/undefined|NaN|<script|\/materials\/\d+\//.test(
        svg.replace(/data:image\/[^"]+/g, 'embedded-image'),
      ),
      `${m.url}: invalid content or full-slide screenshot`,
    );
    for (const [, href] of svg.matchAll(/href="([^"]+)"/g))
      assert(
        href.startsWith('data:image/'),
        `${m.url}: external embedded asset`,
      );
    for (const a of m.sourceElements) {
      assert(fs.statSync(path.join(root, 'public', a.url)).size > 0, a.url);
      assert(Number.isInteger(a.page) && a.page > 0);
      elements.add(a.url);
    }
  }
}
console.log(
  `PASS: 739 mapped SVG figures; ${new Set(manifest.map((m) => m.kind)).size} diagram types; ${elements.size} traceable original picture elements.`,
);
