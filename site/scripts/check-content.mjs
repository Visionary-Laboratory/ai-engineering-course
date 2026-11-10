import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root = path.resolve(import.meta.dirname, '..');
const archiveRoot = process.env.COURSE_SOURCE_ARCHIVE
  ? path.resolve(process.env.COURSE_SOURCE_ARCHIVE)
  : path.join(root, 'public/model-foundations/materials');
const files = fs
  .readdirSync(path.join(root, 'content/model-foundations'))
  .filter((f) => f.endsWith('.json'))
  .sort();
let pages = 0,
  hidden = 0,
  topics = 0,
  media = new Set();
for (const [i, file] of files.entries()) {
  const data = JSON.parse(
    fs.readFileSync(path.join(root, 'content/model-foundations', file), 'utf8'),
  );
  assert(data.slides.length > 0);
  for (const [j, slide] of data.slides.entries()) {
    assert.equal(slide.page, j + 1, `${file}: source slide ordering`);
    for (const suffix of ['', '-thumb'])
      assert(
        fs.statSync(
          path.join(
            archiveRoot,
            String(i + 1),
            `${slide.page}${suffix}.webp`,
          ),
        ).size > 100,
      );
    for (const m of slide.media) {
      assert(fs.statSync(path.join(root, 'public', m.url)).size > 0);
      media.add(m.url);
    }
    for (const url of slide.links)
      assert(['http:', 'https:'].includes(new URL(url).protocol));
    hidden += Number(slide.hidden);
  }
  let next = 1;
  for (const topic of data.topics) {
    assert.equal(
      topic.start,
      next,
      `${file}: gap or overlap at ${topic.title}`,
    );
    assert.equal(topic.id, `topic-${topic.start}`);
    assert(topic.end >= topic.start && topic.body.length > 20);
    assert(
      !/[\u0000-\u0008\u000b-\u001f]/.test(topic.body),
      `${file}: invalid escaped formula`,
    );
    assert(
      !topic.body.includes('\\n\\n'),
      `${file}: unparsed paragraph marker`,
    );
    next = topic.end + 1;
  }
  assert.equal(next, data.slides.length + 1);
  pages += data.slides.length;
  topics += data.topics.length;
  console.log(
    `${file}: ${data.slides.length} pages, ${data.topics.length} ordered topics`,
  );
}
assert.equal(pages, 739);
assert.equal(hidden, 38);
assert.equal(files.length, 5);
console.log(
  `PASS: ${pages} pages, ${hidden} hidden, ${topics} topics, ${media.size} distinct teaching media.`,
);
