import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

const site = resolve(import.meta.dirname, '..');
const snapshots = join(site, 'content/parallel-computing');
const provenance = JSON.parse(
  readFileSync(join(snapshots, 'upstream.json'), 'utf8'),
);
const hash = (data) => createHash('sha256').update(data).digest('hex');
const expectedSlugs = [
  '01-introduction',
  '02-execution-models',
  '05-cuda-introduction',
  '06-memory-hierarchy',
  '10-flash-attention',
  '11-gaussian-splatting',
];

function checkCourse(root) {
  const manifest = JSON.parse(
    readFileSync(join(root, 'course-manifest.json'), 'utf8'),
  );
  assert.deepEqual(
    manifest.lectures.map((lecture) => lecture.slug),
    expectedSlugs,
  );
  const bundle = readFileSync(join(root, provenance.bundle), 'utf8');
  const contentMatch = bundle.match(
    /\/\* parallel-course-content:start \*\/([\s\S]*?)\/\* parallel-course-content:end \*\//,
  );
  assert.ok(contentMatch, 'Missing course content in the renderer bundle');
  const content = JSON.parse(contentMatch[1]);
  assert.deepEqual(Object.keys(content), expectedSlugs);
  for (const lecture of provenance.lectures) {
    const raw = readFileSync(join(snapshots, `${lecture.slug}.json`));
    assert.equal(
      hash(raw),
      lecture.sha256,
      `${lecture.slug}: source snapshot changed`,
    );
    assert.deepEqual(
      content[lecture.slug],
      JSON.parse(raw),
      `${lecture.slug}: imported content changed`,
    );
  }
  for (const asset of provenance.assets) {
    assert.equal(
      hash(readFileSync(join(root, asset.path))),
      asset.sha256,
      `${asset.path}: image changed`,
    );
  }
  for (const lecture of manifest.lectures) {
    assert.equal(content[lecture.slug].slides.length, lecture.slides);
    const html = readFileSync(
      join(root, 'lectures', lecture.slug, 'index.html'),
      'utf8',
    );
    assert.ok(
      html.includes(provenance.bundle),
      `${lecture.slug}: stale renderer`,
    );
    assert.ok(
      html.includes(provenance.stylesheet),
      `${lecture.slug}: missing styles`,
    );
    assert.ok(
      html.includes('embed-shell.js'),
      `${lecture.slug}: missing course layout integration`,
    );
    for (const image of JSON.stringify(content[lecture.slug]).matchAll(
      /\/materials\/[^\s"\\)<>]+/g,
    )) {
      assert.ok(
        existsSync(join(root, image[0])),
        `${lecture.slug}: missing ${image[0]}`,
      );
    }
  }
  const cssPath = join(root, provenance.stylesheet);
  for (const match of readFileSync(cssPath, 'utf8').matchAll(
    /url\(["']?([^"')]+)["']?\)/g,
  )) {
    if (/^(?:data:|https?:|#)/.test(match[1])) continue;
    assert.ok(
      existsSync(resolve(dirname(cssPath), match[1])),
      `Missing font or stylesheet asset: ${match[1]}`,
    );
  }
  console.log(
    `${root}: 6 lectures; 130 imported slides and ${provenance.assets.length} images match upstream snapshots.`,
  );
}

checkCourse(join(site, 'public/parallel-computing'));
if (process.argv.includes('--published'))
  checkCourse(join(site, '../parallel-computing'));
