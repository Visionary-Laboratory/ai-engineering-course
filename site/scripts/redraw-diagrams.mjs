import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { recipes } from './diagrams/catalog.mjs';
import { renderFigure } from './diagrams/renderers.mjs';
const root = path.resolve(import.meta.dirname, '..');
const elements = JSON.parse(
  await fs.readFile(
    path.join(root, '../.course-build/redraw/elements.json'),
    'utf8',
  ),
);
const files = (await fs.readdir(path.join(root, 'content')))
  .filter((f) => f.endsWith('.json'))
  .sort();
const slides = await Promise.all(
  files.map(async (f) =>
    JSON.parse(await fs.readFile(path.join(root, 'content', f), 'utf8')),
  ),
);
const overrides = {
  '1/3': { sources: [[1, 3, 0]] },
  '1/4': {
    kind: 'classification-compare',
    title: '人工特征与自动学习表示',
    subtitle: '传统机器学习与深度学习的处理流程',
    sources: [[1, 4, 0, [0.014, 0.146, 0.12, 0.233]]],
  },
  '1/5': {
    kind: 'training',
    title: '从预测误差到参数更新',
    subtitle: '前向产生预测，反向计算梯度，优化器更新参数',
  },
  '3/64': { title: 'GRU：重置门与更新门' },
  '3/65': { title: 'GRU：组合历史状态与候选状态' },
  '3/66': { title: 'GRU 与 LSTM 的状态组织' },
  '4/167': {
    kind: 'evidence',
    title: '负载均衡策略的实验比较',
    sources: [[4, 167, 0]],
    labels: ['路由设定', '负载均衡', '实验效果'],
  },
  '4/176': { kind: 'moe-block' },
  '4/177': { kind: 'vision-moe' },
  '4/178': { kind: 'capacity' },
  '5/36': {
    sources: [
      [5, 38, 0, [0.005, 0.018, 0.432, 0.623]],
      [5, 39, 0, [0.56, 0.016, 0.431, 0.6]],
    ],
  },
  '5/37': {
    sources: [
      [5, 38, 0, [0.005, 0.018, 0.432, 0.623]],
      [5, 38, 0, [0.562, 0.018, 0.431, 0.623]],
    ],
  },
  '5/38': {
    sources: [
      [5, 38, 0, [0.005, 0.018, 0.432, 0.623]],
      [5, 38, 0, [0.562, 0.018, 0.431, 0.623]],
    ],
  },
  '5/39': {
    sources: [
      [5, 39, 0, [0.005, 0.016, 0.432, 0.6]],
      [5, 39, 0, [0.56, 0.016, 0.431, 0.6]],
    ],
  },
  '5/40': {
    kind: 'split-brain',
    title: '跨通道预测：Split-Brain Autoencoders',
    subtitle: '将输入分为两个通道子集，互相预测缺失部分',
  },
  '5/41': {
    kind: 'split-brain',
    title: '两个方向同时学习跨通道关系',
    subtitle: '一支由 X₁ 预测 X₂，另一支由 X₂ 预测 X₁',
  },
  '5/42': {
    kind: 'split-brain',
    title: '自编码与跨通道预测的区别',
    subtitle: '避免简单复制输入；通过缺失通道构造目标',
  },
  '5/43': { kind: 'evidence', labels: ['预训练目标', '评价协议', '迁移结果'] },
  '5/44': { sources: [[5, 44, 0]] },
  '5/47': { sources: [[5, 45, 0]] },
  '5/48': { sources: [] },
  '5/49': { sources: [] },
  '5/50': { sources: [] },
  '5/55': {
    sources: [
      [5, 58, 0],
      [5, 58, 1],
      [5, 58, 2],
      [5, 58, 3],
    ],
  },
  '5/57': {
    kind: 'inpainting-loss',
    title: '重建损失与对抗损失',
    subtitle: '既比较缺失区域的内容，也约束输出的真实性',
  },
  '5/58': {
    kind: 'reconstruction',
    title: '图像修复的输入与输出',
    subtitle: '比较遮挡输入、修复结果与目标图像',
  },
  '5/59': {
    kind: 'evidence',
    title: '图像修复预训练的下游效果',
    labels: ['预训练方法', '下游任务', '实验指标'],
  },
  '5/69': {
    kind: 'reconstruction',
    title: 'MAE 的重建样本',
    subtitle: '对照输入、遮挡与预测，观察可见上下文的作用',
  },
};
const photoKinds = new Set([
  'evidence',
  'reconstruction',
  'translation-errors',
  'augment',
  'dino-v2',
]);
const cache = new Map();
async function asset([n, p, index = 0, crop]) {
  const meta = elements[n]?.[p]?.[index];
  if (!meta) return null;
  if (!cache.has(meta.url)) {
    const source = path.join(
      root,
      '../.course-build/redraw/original-elements',
      meta.url.split('/elements/')[1],
    );
    const target = path.join(root, 'public', meta.url);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.copyFile(source, target);
    const data = await fs.readFile(source);
    const ext = path.extname(meta.url).slice(1).toLowerCase(),
      mime = ext === 'jpg' || ext === 'jpeg' ? 'jpeg' : ext;
    cache.set(meta.url, `data:image/${mime};base64,${data.toString('base64')}`);
  }
  return {
    ...meta,
    data: cache.get(meta.url),
    crop,
    sourcePage: p,
    sourceLesson: n,
  };
}
let count = 0;
const seen = new Set(),
  manifest = [];
for (const r of recipes) {
  await fs.mkdir(path.join(root, 'public/diagrams', String(r.lesson)), {
    recursive: true,
  });
  for (let page = r.start; page <= r.end; page++) {
    const key = `${r.lesson}/${page}`;
    assert(!seen.has(key), `Duplicate ${key}`);
    seen.add(key);
    const d = {
      ...r,
      ...overrides[key],
      page,
      stage: page - r.start,
      span: r.end - r.start + 1,
      step: `${page - r.start + 1} / ${r.end - r.start + 1}`,
    };
    let sources = d.sources;
    if (sources === undefined && photoKinds.has(d.kind))
      sources = (elements[r.lesson]?.[page] ?? [])
        .slice(0, 4)
        .map((_, i) => [r.lesson, page, i]);
    if (
      sources === undefined &&
      d.kind === 'video-color' &&
      (page <= 46 || page >= 51)
    )
      sources = (elements[5]?.[page] ?? [])
        .slice(0, 3)
        .map((_, i) => [5, page, i]);
    d.assets = (await Promise.all((sources ?? []).map(asset))).filter(Boolean);
    const url = `/diagrams/${key}.svg`;
    await fs.writeFile(path.join(root, 'public', url), renderFigure(d));
    const info = {
      page,
      kind: d.kind,
      title: d.title,
      caption: d.subtitle,
      note: d.note ?? '',
      url,
      sourceElements: d.assets.map((a) => ({
        url: a.url,
        lesson: a.sourceLesson,
        page: a.sourcePage,
        ...(a.crop ? { crop: a.crop } : {}),
      })),
    };
    slides[r.lesson - 1].slides[page - 1].figure = info;
    manifest.push({ lesson: r.lesson, ...info });
    count++;
  }
}
assert.equal(count, 739);
for (let i = 0; i < slides.length; i++) {
  for (const s of slides[i].slides)
    assert(seen.has(`${i + 1}/${s.page}`), `Unmapped page ${i + 1}/${s.page}`);
  await fs.writeFile(
    path.join(root, 'content', files[i]),
    JSON.stringify(slides[i], null, 2) + '\n',
  );
}
await fs.writeFile(
  path.join(root, 'public/diagrams/manifest.json'),
  JSON.stringify(manifest, null, 2) + '\n',
);
console.log(
  `Generated ${count} figures; ${new Set(manifest.map((m) => m.kind)).size} diagram types; ${cache.size} reused original image elements.`,
);
