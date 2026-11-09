import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import Markdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
const dir = path.resolve(import.meta.dirname, '../content');
let count = 0;
for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.json'))) {
  const { topics } = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
  for (const topic of topics) {
    const html = renderToStaticMarkup(
      React.createElement(
        Markdown,
        {
          remarkPlugins: [remarkGfm, remarkMath],
          rehypePlugins: [rehypeKatex],
        },
        topic.body,
      ),
    );
    assert(
      !html.includes('katex-error'),
      `${file}, ${topic.id}: formula parse error`,
    );
    count += (html.match(/class="katex"/g) || []).length;
  }
}
console.log(`PASS: ${count} formulas render without KaTeX errors.`);
