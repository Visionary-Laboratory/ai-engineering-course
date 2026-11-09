import {
  C,
  txt,
  box,
  line,
  arrow,
  path,
  circle,
  pill,
  grid,
  flow,
  axes,
  plot,
  table,
  network,
  svg,
} from "./drawing.mjs";
export const renderers = {};
export function renderFigure(d) {
  if (!renderers[d.kind]) throw Error(`Missing renderer: ${d.kind}`);
  return svg(renderers[d.kind](d), d);
}
const stageIndex = (d, n) => Math.min(n - 1, Math.floor((d.stage * n) / Math.max(1, d.span)));
const formula = (d, y = 448) =>
  d.formula ? txt(480, y, d.formula, 18, C.green, "middle", 68) : "";
const image = (asset, x, y, w, h) => {
  if (!asset) return "";
  if (asset.crop) {
    const [cx, cy, cw, ch] = asset.crop,
      ratio = (asset.h * 720) / (asset.w * 1280),
      scale = Math.min(w / (cw * 1000), h / (ch * 1000 * ratio)),
      ww = cw * 1000 * scale,
      hh = ch * 1000 * ratio * scale;
    return `<svg x="${x + (w - ww) / 2}" y="${y + (h - hh) / 2}" width="${ww}" height="${hh}" viewBox="${cx * 1000} ${cy * 1000 * ratio} ${cw * 1000} ${ch * 1000 * ratio}" overflow="hidden"><image href="${asset.data}" width="1000" height="${1000 * ratio}" preserveAspectRatio="none"/></svg>`;
  }
  return `<image href="${asset.data}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid meet"/>`;
};
function sample(d, x, y, w, h, index = 0) {
  return image(d.assets?.[index], x, y, w, h);
}
function images(d, x, y, w, h, max = 4) {
  const a = (d.assets ?? []).slice(0, max);
  if (!a.length) return "";
  if (
    a.length > 1 &&
    a.every(
      (v) => !v.crop && v.sourcePage === a[0].sourcePage && v.sourceLesson === a[0].sourceLesson,
    )
  ) {
    const left = Math.min(...a.map((v) => v.x * 1280)),
      top = Math.min(...a.map((v) => v.y * 720)),
      right = Math.max(...a.map((v) => (v.x + v.w) * 1280)),
      bottom = Math.max(...a.map((v) => (v.y + v.h) * 720)),
      scale = Math.min(w / (right - left), h / (bottom - top)),
      ox = x + (w - (right - left) * scale) / 2,
      oy = y + (h - (bottom - top) * scale) / 2;
    return a
      .map((v) =>
        image(
          v,
          ox + (v.x * 1280 - left) * scale,
          oy + (v.y * 720 - top) * scale,
          v.w * 1280 * scale,
          v.h * 720 * scale,
        ),
      )
      .join("");
  }
  const cols = a.length > 2 ? 2 : a.length,
    rows = Math.ceil(a.length / cols);
  return a
    .map((asset, i) =>
      image(
        asset,
        x + ((i % cols) * w) / cols,
        y + (Math.floor(i / cols) * h) / rows,
        w / cols - 10,
        h / rows - 10,
      ),
    )
    .join("");
}
renderers.flow = (d) =>
  flow(d.labels ?? ["输入", "表示", "模型", "输出"], {
    active: stageIndex(d, d.labels?.length ?? 4),
  }) + formula(d);
renderers.roadmap = (d) => {
  let out = "";
  const labels = d.labels;
  labels.forEach((label, i) => {
    const x = 70 + (i * 820) / labels.length;
    out += circle(
      x + 50,
      177,
      25,
      String(i + 1),
      i === stageIndex(d, labels.length) ? C.green : C.light,
      i === stageIndex(d, labels.length) ? C.white : C.green,
    );
    if (i < labels.length - 1)
      out += arrow(x + 80, 177, x + 820 / labels.length + 20, 177, "", C.line);
    out += box(
      x,
      230,
      Math.min(180, 790 / labels.length),
      100,
      label,
      "",
      i === stageIndex(d, labels.length) ? C.sand : C.light,
    );
  });
  return out + txt(480, 414, "以数据定义任务　·　用模型组织计算　·　通过评价验证方法", 18, C.muted);
};
renderers.timeline = (d) => {
  let out = line(90, 260, 870, 260, C.line, false, 3);
  d.labels.forEach((s, i) => {
    const x = 90 + (i * 780) / (d.labels.length - 1);
    out +=
      circle(x, 260, 11, "", i === stageIndex(d, d.labels.length) ? C.amber : C.green, C.white) +
      line(x, i % 2 ? 278 : 242, x, i % 2 ? 319 : 201, C.line) +
      txt(x, i % 2 ? 349 : 161, s, 18, C.ink, "middle", 8, 550);
  });
  return out + txt(480, 425, "研究问题　×　可用数据　×　计算资源　×　训练方法", 18, C.muted);
};
renderers.nested = (d) =>
  `<rect x="140" y="110" width="680" height="342" rx="18" fill="#f4f8f5" stroke="${C.line}"/><rect x="200" y="199" width="560" height="219" rx="14" fill="${C.light}" stroke="${C.line}"/><rect x="275" y="288" width="410" height="100" rx="10" fill="${C.green}"/>` +
  txt(480, 159, d.labels[0], 24, C.ink) +
  txt(480, 248, d.labels[1], 23, C.green) +
  txt(480, 346, d.labels[2], 24, C.white);
renderers.branches = (d) => {
  let out = box(365, 114, 230, 72, d.center);
  d.labels.forEach((s, i) => {
    const x = 45 + i * 305;
    out +=
      arrow(480, 186, x + 130, 261, "", C.line) +
      box(x, 272, 260, 110, s, d.subs?.[i] ?? "", i === stageIndex(d, 3) ? C.sand : C.light);
  });
  return out;
};
renderers.classification = (d) => {
  if (!d.assets?.length)
    return flow(["颜色 / 形状", "模型 fθ", "类别分数"], { active: stageIndex(d, 3) }) + formula(d);
  return (
    sample(d, 40, 115, 315, 278) +
    arrow(357, 249, 421, 249) +
    flow(["输入特征", "模型 fθ", "预测类别"], {
      x: 425,
      y: 210,
      w: 485,
      height: 90,
      subs: ["颜色 · 形状", "可学习参数", "芒果 / 其他"],
      active: stageIndex(d, 3),
    }) +
    arrow(755, 360, 605, 360, "标签反馈", C.amber) +
    arrow(605, 360, 605, 303, "", C.amber) +
    txt(676, 419, "训练调整参数；预测复用映射", 19, C.muted)
  );
};
renderers.neuron = (d) => {
  let out = "";
  ["x₁", "x₂", "x₃"].forEach((v, i) => {
    out +=
      circle(110, 153 + i * 106, 24, v) + arrow(137, 153 + i * 106, 366, 254, `w${i + 1}`, C.line);
  });
  out +=
    circle(396, 254, 32, "Σ") +
    arrow(428, 254, 532, 254, "z") +
    box(542, 216, 140, 76, "激活 σ") +
    arrow(684, 254, 813, 254, "a") +
    circle(843, 254, 24, "输出") +
    arrow(396, 127, 396, 216, "偏置 b", C.amber) +
    formula(d);
  return out;
};
renderers.linear = (d) => {
  const a = grid(
    70,
    168,
    3,
    4,
    ["w₁₁", "w₁₂", "w₁₃", "w₁₄", "w₂₁", "w₂₂", "w₂₃", "w₂₄", "w₃₁", "w₃₂", "w₃₃", "w₃₄"],
    {
      cell: 49,
      font: 15,
      selected: [
        stageIndex(d, 3) * 4,
        stageIndex(d, 3) * 4 + 1,
        stageIndex(d, 3) * 4 + 2,
        stageIndex(d, 3) * 4 + 3,
      ],
    },
  );
  return (
    a +
    txt(161, 139, "权重 W：3 × 4", 18, C.green) +
    txt(290, 253, "×", 32, C.muted) +
    grid(325, 144, 4, 1, ["x₁", "x₂", "x₃", "x₄"], { cell: 49 }) +
    txt(350, 124, "输入", 16, C.muted) +
    txt(420, 254, "+", 32, C.muted) +
    grid(460, 168, 3, 1, ["b₁", "b₂", "b₃"], { cell: 49 }) +
    txt(484, 139, "偏置", 16, C.muted) +
    txt(560, 254, "=", 32, C.muted) +
    grid(610, 168, 3, 1, ["z₁", "z₂", "z₃"], { cell: 49, selected: [stageIndex(d, 3)] }) +
    txt(754, 206, "每一行产生", 18, C.ink) +
    txt(754, 235, "一个类别分数", 18, C.ink) +
    txt(480, 386, "输入维度决定列数，输出单元数决定行数", 20, C.muted) +
    formula(d)
  );
};
renderers.network = (d) =>
  network({ layers: d.layers, active: stageIndex(d, d.layers.length) }) + formula(d);
renderers.forward = (d) =>
  flow(d.labels ?? ["输入", "隐藏层 1", "隐藏层 2", "任务输出"], {
    x: 48,
    w: 864,
    y: 220,
    height: 104,
    active: stageIndex(d, 4),
  }) + formula(d, 453);
renderers.composition = (d) =>
  flow(["x", "W₁x + b₁", "W₂h + b₂"], { x: 115, w: 730, y: 135, height: 75 }) +
  arrow(480, 230, 480, 277, "合并") +
  box(210, 301, 540, 74, "等效的一次线性变换 W′x + b′") +
  formula(d);
renderers.decision = (d) => {
  let s = axes(150, 126, 610, 286, "x₁", "x₂");
  const points = [
    [260, 340, 0],
    [340, 286, 0],
    [627, 181, 0],
    [691, 225, 0],
    [262, 181, 1],
    [321, 211, 1],
    [625, 343, 1],
    [687, 299, 1],
  ];
  points.forEach(([x, y, c]) => {
    s += circle(x, y, 10, "", c ? C.amber : C.green, c ? C.amber : C.green);
  });
  s +=
    path("M400 126 C370 212 420 285 388 409", C.line, 2, true) +
    path("M150 259 C310 245 577 272 761 257", C.line, 2, true) +
    pill(366, 99, 219, "单一直线难以分开") +
    txt(480, 462, "非线性隐藏表示可以改变可分性", 18, C.muted);
  return s;
};
renderers.activation = (d) => {
  const variant = d.variant === "relu" && d.page === 53 ? "leaky" : d.variant;
  const f = (x) =>
    variant === "sigmoid"
      ? 1 / (1 + Math.exp(-x))
      : variant === "tanh"
        ? Math.tanh(x)
        : variant === "leaky"
          ? Math.max(0.1 * x, x)
          : Math.max(0, x);
  let s = axes(150, 120, 650, 287, "输入 x", "输出");
  const ymin = variant === "sigmoid" ? 0 : variant === "tanh" ? -1.4 : -1,
    ymax = variant === "sigmoid" ? 1.2 : variant === "tanh" ? 1.4 : 4;
  const zero = 120 + 287 - ((0 - ymin) / (ymax - ymin)) * 287;
  s +=
    line(150, zero, 800, zero, C.line) +
    line(475, 120, 475, 407, C.line) +
    plot(f, { x: 150, y: 120, w: 650, h: 287, xmin: -4, xmax: 4, ymin, ymax });
  [-4, -2, 0, 2, 4].forEach(
    (v) => (s += txt(150 + ((v + 4) / 8) * 650, 433, String(v), 14, C.muted)),
  );
  return (
    s +
    pill(
      645,
      116,
      130,
      variant === "relu"
        ? "ReLU"
        : variant === "leaky"
          ? "Leaky ReLU"
          : variant === "sigmoid"
            ? "Sigmoid"
            : "Tanh",
    ) +
    formula(d, 466)
  );
};
renderers.softmax = (d) => {
  const values = d.values ?? [1, 2, 3],
    exp = values.map(Math.exp),
    sum = exp.reduce((a, b) => a + b, 0);
  let s =
    txt(190, 127, "输入分数 z", 18, C.ink) +
    txt(492, 127, "exp(z)", 18, C.ink) +
    txt(786, 127, "归一化概率", 18, C.ink);
  values.forEach((v, i) => {
    s +=
      box(110, 155 + i * 79, 160, 58, String(v)) +
      arrow(277, 184 + i * 79, 408, 184 + i * 79) +
      box(414, 155 + i * 79, 155, 58, exp[i].toFixed(2)) +
      arrow(577, 184 + i * 79, 701, 184 + i * 79, "÷ 总和") +
      box(708, 155 + i * 79, 155, 58, (exp[i] / sum).toFixed(3), "", C.sand);
  });
  return s + formula(d);
};
renderers.table = (d) =>
  table(58, 140, 844, d.headers, d.rows, { rowHeight: d.rows.length > 5 ? 40 : 55 }) +
  formula(d, 452);
renderers.chain = (d) =>
  flow(["x", "中间量 z", "损失 L"], {
    x: 115,
    w: 730,
    y: 170,
    height: 92,
    subs: ["输入或参数", "局部运算 g(x)", "目标函数"],
    active: stageIndex(d, 3),
  }) +
  arrow(805, 330, 536, 330, "∂L / ∂z", C.amber) +
  arrow(421, 330, 152, 330, "再乘 ∂z / ∂x", C.amber) +
  formula(d, 432);
renderers.descent = (d) => {
  let s = axes(120, 111, 720, 300, "参数 θ", "损失 L");
  s += plot((x) => (x * x) / 2, {
    x: 120,
    y: 111,
    w: 720,
    h: 300,
    xmin: -3,
    xmax: 3,
    ymin: 0,
    ymax: 5,
  });
  let v = 2.75;
  for (let i = 0; i < 6; i++) {
    const nv = v * 0.68;
    const x1 = 120 + ((v + 3) / 6) * 720,
      y1 = 411 - ((v * v) / 2 / 5) * 300,
      x2 = 120 + ((nv + 3) / 6) * 720,
      y2 = 411 - ((nv * nv) / 2 / 5) * 300;
    s += circle(x1, y1, 4, "", C.amber, C.amber) + arrow(x1, y1, x2, y2, "", C.amber);
    v = nv;
  }
  return s + formula(d, 464);
};
renderers.backprop = (d) =>
  network({ layers: d.layers ?? [2, 3, 2, 1], active: stageIndex(d, 4), backward: true }) +
  txt(480, 460, "前向缓存中间量；反向把误差传给每个参数", 18, C.green);
renderers.fit = (d) => {
  let s = "";
  const titles = ["欠拟合", "适当拟合", "过拟合"];
  titles.forEach((t, i) => {
    const x = 60 + i * 310;
    s += txt(x + 132, 125, t, 21, C.ink) + axes(x + 20, 156, 230, 205, "输入", "输出");
    for (let j = 0; j < 8; j++) {
      const vx = j / 7,
        vy = 0.2 + 0.7 * vx + 0.06 * Math.sin(j * 3);
      s += circle(x + 20 + vx * 230, 361 - vy * 205, 4, "", C.muted, C.muted);
    }
    s += plot(
      (v) => (i === 0 ? 0.5 : i === 1 ? 0.2 + 0.7 * v : 0.2 + 0.7 * v + 0.18 * Math.sin(v * 40)),
      { x: x + 20, y: 156, w: 230, h: 205, color: i === 2 ? C.amber : C.green },
    );
  });
  return s;
};
renderers.regularization = (d) => {
  let s = "";
  [
    [275, "L1：菱形约束"],
    [685, "L2：圆形约束"],
  ].forEach(([cx, label], i) => {
    s += line(cx - 156, 295, cx + 156, 295, C.line) + line(cx, 132, cx, 439, C.line);
    s += i
      ? `<circle cx="${cx}" cy="295" r="102" fill="${C.light}" stroke="${C.green}" stroke-width="2"/>`
      : `<path d="M${cx} 168 L${cx + 127} 295 L${cx} 422 L${cx - 127} 295 Z" fill="${C.light}" stroke="${C.green}" stroke-width="2"/>`;
    for (let r = 0; r < 3; r++)
      s += `<ellipse cx="${cx + 96}" cy="206" rx="${50 + r * 29}" ry="${36 + r * 25}" fill="none" stroke="${C.amber}" stroke-width="1.6"/>`;
    s += txt(cx, 121, label, 20, C.ink);
  });
  return s + formula(d, 465);
};
renderers.dropout = (d) => {
  let s = network({ layers: d.layers, active: -1 });
  [
    [343, 166],
    [343, 306],
    [577, 232],
  ].forEach(
    ([x, y]) =>
      (s +=
        line(x - 20, y - 20, x + 20, y + 20, C.red, false, 4) +
        line(x - 20, y + 20, x + 20, y - 20, C.red, false, 4)),
  );
  return s + txt(480, 462, "本次迭代：被屏蔽单元不参与当前前向与反向计算", 18, C.muted);
};
renderers["early-stop"] = (d) =>
  axes(130, 123, 680, 285, "训练轮次", "误差") +
  plot((x) => 0.9 * Math.exp(-4 * x) + 0.1, { x: 130, y: 123, w: 680, h: 285 }) +
  plot((x) => 0.65 * Math.exp(-4 * x) + 0.12 + 0.7 * Math.max(0, x - 0.5), {
    x: 130,
    y: 123,
    w: 680,
    h: 285,
    color: C.amber,
  }) +
  line(488, 132, 488, 409, C.amber, true) +
  pill(190, 146, 110, "训练误差") +
  pill(600, 213, 110, "验证误差", C.amber) +
  txt(491, 445, "选择验证表现较好的轮次", 18, C.amber);
renderers.batch = (d) => {
  let s = "";
  const labels = ["全批量", "单样本", "小批量"];
  labels.forEach((t, j) => {
    s += txt(78, 166 + j * 108, t, 19, C.ink, "start");
    for (let i = 0; i < 12; i++)
      s += circle(
        290 + i * 39,
        158 + j * 108,
        12,
        "",
        j === 0 || (j === 1 && i === d.stage % 12) || (j === 2 && i < 4) ? C.green : "#e9efea",
        C.line,
      );
    s +=
      arrow(782, 158 + j * 108, 832, 158 + j * 108) + txt(872, 166 + j * 108, "更新", 18, C.green);
  });
  return s;
};
renderers.ema = (d) =>
  flow(["历史 vₜ₋₁", "加权组合", "当前 vₜ"], {
    x: 100,
    w: 760,
    y: 192,
    height: 90,
    subs: ["权重 β", "βvₜ₋₁ + (1−β)gₜ", "用于本次更新"],
  }) +
  arrow(480, 387, 480, 287, "当前观测 gₜ", C.amber) +
  formula(d, 449);
renderers.optimizer = (d) => {
  let s = "";
  for (let i = 1; i <= 5; i++)
    s += `<ellipse cx="480" cy="281" rx="${i * 67}" ry="${i * 27}" fill="none" stroke="#d6e3db" stroke-width="1.5"/>`;
  const names =
    d.page === 117
      ? ["SGD", "Momentum", "Adam"]
      : [
          {
            110: "Momentum",
            111: "Nesterov",
            112: "Adagrad",
            113: "RMSprop",
            114: "RMSprop",
            115: "Adam",
            116: "AdamW",
          }[d.page] ?? "SGD",
        ];
  names.forEach((name, k) => {
    let x = 2.8,
      y = 2.4,
      vx = 0,
      vy = 0,
      sx = 0,
      sy = 0,
      px = 480 + x * 95,
      py = 281 - y * 44;
    const color = [C.green, C.amber, C.blue][k];
    for (let t = 1; t <= 35; t++) {
      let gx = x,
        gy = 10 * y;
      let lr = 0.065;
      if (name === "Momentum" || name === "Nesterov") {
        if (name === "Nesterov") {
          gx = x - 0.75 * vx;
          gy = 10 * (y - 0.75 * vy);
        }
        vx = 0.75 * vx + lr * gx;
        vy = 0.75 * vy + lr * gy;
        x -= vx;
        y -= vy;
      } else if (name === "Adagrad") {
        sx += gx * gx;
        sy += gy * gy;
        x -= (0.7 * gx) / Math.sqrt(sx + 1e-8);
        y -= (0.7 * gy) / Math.sqrt(sy + 1e-8);
      } else if (name === "Adam" || name === "AdamW") {
        vx = 0.9 * vx + 0.1 * gx;
        vy = 0.9 * vy + 0.1 * gy;
        sx = 0.99 * sx + 0.01 * gx * gx;
        sy = 0.99 * sy + 0.01 * gy * gy;
        x -= (0.18 * (vx / (1 - 0.9 ** t))) / (Math.sqrt(sx / (1 - 0.99 ** t)) + 1e-8);
        y -= (0.18 * (vy / (1 - 0.9 ** t))) / (Math.sqrt(sy / (1 - 0.99 ** t)) + 1e-8);
        if (name === "AdamW") {
          x *= 0.998;
          y *= 0.998;
        }
      } else if (name === "RMSprop") {
        sx = 0.9 * sx + 0.1 * gx * gx;
        sy = 0.9 * sy + 0.1 * gy * gy;
        x -= (0.18 * gx) / Math.sqrt(sx + 1e-8);
        y -= (0.18 * gy) / Math.sqrt(sy + 1e-8);
      } else {
        x -= lr * gx;
        y -= lr * gy;
      }
      const nx = 480 + x * 95,
        ny = 281 - y * 44;
      s += line(px, py, nx, ny, color, false, 2);
      if (t % 5 === 0) s += circle(nx, ny, 3, "", color, color);
      px = nx;
      py = ny;
    }
    s += pill(160 + k * 230, 118, 190, name, color);
  });
  return (
    s +
    circle(480, 281, 4, "", C.ink, C.ink) +
    txt(480, 444, "相同目标函数，不同的历史统计与步长规则", 18, C.muted)
  );
};
renderers.initialization = (d) => {
  let s = "";
  ["尺度过小", "尺度合适", "尺度过大"].forEach((label, i) => {
    const x = 65 + i * 310;
    s += txt(x + 125, 131, label, 20, C.ink);
    for (let j = 0; j < 4; j++) {
      const h = i === 0 ? 70 * 0.52 ** j : i === 1 ? 65 : 30 * 1.55 ** j;
      s +=
        `<rect x="${x + 30 + j * 53}" y="${354 - h}" width="32" height="${h}" rx="3" fill="${i === 1 ? C.green : C.amber}"/>` +
        txt(x + 46 + j * 53, 379, `L${j + 1}`, 14, C.muted);
    }
    s += line(x + 20, 354, x + 252, 354, C.line);
  });
  return s + txt(480, 441, "层间数值尺度的示意；不是实际训练测量", 18, C.muted);
};
renderers.variance = (d) =>
  flow(["输入方差", "线性层", "输出方差"], {
    x: 110,
    w: 740,
    y: 160,
    height: 95,
    subs: ["Var(x)", "fan_in 个乘加", "fan_in · Var(w) · Var(x)"],
  }) +
  box(165, 329, 270, 64, "Xavier：兼顾输入与输出") +
  box(515, 329, 270, 64, "He：考虑 ReLU 的作用") +
  formula(d, 459);
renderers.normalize = (d) => {
  const v = d.values ?? [45, 29, 61, 52],
    min = Math.min(...v),
    max = Math.max(...v),
    mean = v.reduce((a, b) => a + b) / v.length,
    std = Math.sqrt(v.reduce((s, x) => s + (x - mean) ** 2, 0) / v.length);
  const vv = v.map((x) => (d.variant === "standard" ? (x - mean) / std : (x - min) / (max - min)));
  return (
    table(
      145,
      142,
      670,
      ["原始值", "处理规则", "变换结果"],
      v.map((x, i) => [
        String(x),
        d.variant === "standard" ? "减均值，除标准差" : "减最小值，除极差",
        vv[i].toFixed(3),
      ]),
      { rowHeight: 52 },
    ) + formula(d, 457)
  );
};
renderers.dataset = (d) =>
  table(
    45,
    148,
    870,
    ["ID", "年龄", "BMI", "血糖", "胰岛素", "家族史", "标签"],
    [
      ["1", "45", "28.1", "6.8", "85", "是", "是"],
      ["2", "29", "NULL", "5.1", "64", "否", "否"],
      ["3", "61", "32.0", "15.3", "142", "是", "是"],
      ["4", "35", "24.5", "5.6", "NULL", "否", "否"],
      ["5", "52", "30.2", "6.2", "88", "是", "是"],
    ],
    { rowHeight: 45, widths: [75, 95, 120, 120, 135, 115, 210] },
  ) +
  pill(286, 109, 330, "输入特征 X") +
  pill(782, 109, 122, "目标 y", C.amber) +
  txt(480, 458, "一行 = 一个样本；输入与目标在学习中承担不同角色", 18, C.green);
renderers.cleaning = (d) =>
  table(
    65,
    147,
    470,
    ["原始字段", "发现的问题"],
    [
      ["BMI = NULL", "缺失"],
      ["极端观测值", "需要核实"],
      ["年龄 / 胰岛素", "数值尺度不同"],
    ],
    { rowHeight: 65 },
  ) +
  arrow(558, 267, 635, 267) +
  box(657, 146, 232, 83, "缺失处理", "填补 / 删除 / 建模") +
  box(657, 251, 232, 83, "异常核实", "结合数据来源") +
  box(657, 356, 232, 83, "尺度处理", "分别计算各列统计量");
renderers.discretize = (d) => {
  let s = line(120, 262, 840, 262, C.line, false, 4);
  for (let i = 0; i < 3; i++)
    s +=
      `<rect x="${120 + i * 240}" y="193" width="237" height="69" rx="5" fill="${[C.pale, C.light, C.sand][i]}"/>` +
      txt(240 + i * 240, 236, ["区间 A", "区间 B", "区间 C"][i], 22, C.ink);
  s +=
    txt(480, 309, "连续观测值", 19, C.muted) +
    arrow(480, 332, 480, 368) +
    box(285, 390, 390, 55, "区间标签 / 类别编码");
  return s;
};
renderers.split = (d) => {
  let x = 70,
    s = "";
  const colors = [C.green, C.blue, C.amber];
  ["训练集", "验证集", "测试集"].forEach((t, i) => {
    const w = d.values[i] * 8.2;
    s +=
      `<rect x="${x}" y="183" width="${w - 4}" height="84" rx="5" fill="${colors[i]}"/>` +
      txt(x + w / 2, 233, String(d.values[i]), 23, C.white);
    x += w;
  });
  return (
    s +
    flow(["学习参数", "选择模型", "最终评价"], {
      x: 70,
      w: 820,
      y: 335,
      height: 80,
      subs: ["训练集 · 70", "验证集 · 20", "测试集 · 10"],
    }) +
    txt(480, 137, "100 条记录：三个集合互不重叠", 22, C.ink)
  );
};
renderers.tasks = (d) => {
  let s = box(373, 127, 214, 67, "任务与数据");
  d.labels.forEach((t, i) => {
    const x = 50 + i * 230;
    s += arrow(480, 195, x + 105, 290, "", C.line) + box(x, 300, 210, 110, t);
  });
  return s;
};
renderers.segmentation = (d) => {
  let s = "";
  for (let k = 0; k < 3; k++) {
    const x = 74 + k * 300;
    s += grid(x, 159, 6, 6, [], {
      cell: 34,
      fills: Array.from({ length: 36 }, (_, i) => {
        const r = Math.floor(i / 6),
          c = i % 6;
        if (k === 2) return r > 1 && r < 5 && c > 1 && c < 5 ? C.green : "#eff4f0";
        return r > 1 && r < 5 && c > 1 && c < 5 ? "#c6d9ce" : "#e8eeea";
      }),
    });
    if (k === 1)
      s += `<rect x="${x + 61}" y="214" width="124" height="130" fill="none" stroke="${C.amber}" stroke-width="3"/>`;
    s += txt(
      x + 100,
      400,
      ["图像级：类别标签", "区域级：框 / 轮廓", "像素级：分割掩码"][k],
      18,
      C.ink,
    );
  }
  return s;
};
renderers.supervision = (d) => {
  let s = "";
  ["有监督", "半监督", "无监督"].forEach((t, k) => {
    const x = 75 + k * 300;
    s += txt(x + 105, 130, t, 22, C.ink);
    for (let i = 0; i < 9; i++)
      s +=
        box(
          x + (i % 3) * 67,
          178 + Math.floor(i / 3) * 67,
          54,
          51,
          "",
          "",
          k === 0 || (k === 1 && i < 3) ? C.light : "#f3f5f3",
          C.line,
        ) +
        (k === 0 || (k === 1 && i < 3)
          ? txt(x + (i % 3) * 67 + 27, 211 + Math.floor(i / 3) * 67, "y", 18, C.green)
          : "");
    s += txt(x + 105, 418, ["全部带标签", "部分带标签", "不使用类别标签"][k], 17, C.muted);
  });
  return s;
};
renderers.ensemble = (d) => {
  let s =
    txt(253, 126, "Bagging：并行训练", 20, C.ink) + txt(708, 126, "Boosting：依次改进", 20, C.ink);
  for (let i = 0; i < 3; i++) {
    s +=
      box(66 + i * 133, 199, 112, 72, `模型 ${i + 1}`) +
      arrow(122 + i * 133, 273, 253, 358, "", C.line);
  }
  s +=
    box(159, 369, 188, 62, "组合预测") +
    flow(["模型 1", "模型 2", "模型 3"], { x: 510, w: 385, y: 220, height: 80 }) +
    txt(705, 352, "后续模型依据已有不足改进", 17, C.muted, "middle", 19);
  return s;
};
const X = [
    [1, 2, 0, 1, 3],
    [0, 1, 2, 2, 1],
    [3, 0, 1, 0, 2],
    [1, 2, 3, 1, 0],
    [2, 1, 0, 2, 1],
  ],
  K = [
    [1, 0, -1],
    [1, 0, -1],
    [1, 0, -1],
  ];
const conv = (r, c) =>
  K.reduce((s, row, i) => s + row.reduce((a, v, j) => a + v * X[r + i][c + j], 0), 0);
renderers["image-fc"] = (d) => {
  let s = grid(67, 168, 6, 6, [], {
    cell: 35,
    fills: Array.from({ length: 36 }, (_, i) => (i % 7 === 0 || i % 7 === 1 ? C.green : "#e3eee6")),
  });
  s +=
    arrow(290, 270, 348, 270, "展平") +
    grid(
      365,
      119,
      10,
      1,
      Array.from({ length: 10 }, (_, i) => `x${i + 1}`),
      { cell: 30, font: 14 },
    );
  for (let i = 0; i < 10; i++)
    for (let j = 0; j < 3; j++)
      s += line(394, 134 + i * 30, 740, 184 + j * 91, "#d5e2d9", false, 1);
  for (let j = 0; j < 3; j++) s += circle(761, 184 + j * 91, 24, `z${j + 1}`);
  return (
    s +
    txt(176, 419, "二维空间", 19, C.ink) +
    txt(383, 449, "长向量", 18, C.muted) +
    txt(759, 438, "全连接输出", 18, C.muted)
  );
};
renderers.convolution = (d) => {
  const step = stageIndex(d, 9),
    r = Math.floor(step / 3),
    c = step % 3,
    active = [];
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) active.push((r + i) * 5 + c + j);
  let s =
    txt(169, 134, "输入 5 × 5", 19, C.ink) +
    grid(63, 162, 5, 5, X.flat(), { cell: 45, selected: active }) +
    txt(349, 274, "∗", 31, C.muted) +
    txt(464, 158, "共享卷积核", 18, C.ink) +
    grid(402, 191, 3, 3, K.flat(), { cell: 45 }) +
    arrow(565, 252, 647, 252) +
    txt(759, 157, "输出 3 × 3", 18, C.ink) +
    grid(
      693,
      191,
      3,
      3,
      Array.from({ length: 9 }, (_, i) => conv(Math.floor(i / 3), i % 3)),
      { cell: 45, selected: [step] },
    );
  return (
    s +
    txt(
      480,
      446,
      `当前窗口：第 ${r + 1} 行，第 ${c + 1} 列　→　局部乘加结果 ${conv(r, c)}`,
      20,
      C.green,
    )
  );
};
renderers.equivariance = (d) => {
  let s = "";
  const at = [
    [2, 2],
    [2, 3],
  ];
  at.forEach(([r, c], i) => {
    const x = 87 + i * 330;
    s +=
      grid(x, 151, 6, 6, [], { cell: 40, selected: [r * 6 + c, (r + 1) * 6 + c, r * 6 + c + 1] }) +
      txt(x + 119, 424, i ? "向右移动后的输入" : "原输入", 19, C.ink);
  });
  s += arrow(341, 261, 404, 261, "平移");
  if (d.variant === "compare")
    s +=
      box(767, 160, 140, 96, "类别不变", "分类输出", C.sand) +
      box(767, 303, 140, 96, "位置改变", "特征响应");
  else s += box(767, 210, 140, 125, "特征响应", "随位置移动");
  return s;
};
renderers.padding = (d) => {
  const stride = d.page === 21 || d.stage % 2 ? 2 : 1,
    pad = d.page === 21 ? 0 : 1,
    n = 5,
    out = Math.floor((n + 2 * pad - 3) / stride) + 1,
    size = n + 2 * pad;
  const fills = Array.from({ length: size * size }, (_, i) => {
    const r = Math.floor(i / size),
      c = i % size;
    return r < pad || r >= size - pad || c < pad || c >= size - pad ? "#e8ede9" : C.light;
  });
  const values = Array.from({ length: size * size }, (_, i) => {
    const r = Math.floor(i / size),
      c = i % size;
    return r < pad || r >= size - pad || c < pad || c >= size - pad ? 0 : "";
  });
  return (
    txt(228, 129, `填充 p = ${pad}，步幅 s = ${stride}`, 20, C.ink) +
    grid(103, 158, size, size, values, { cell: 36, fills }) +
    `<rect x="${103 + stride * 36}" y="${158 + stride * 36}" width="105" height="105" fill="none" stroke="${C.amber}" stroke-width="3"/>` +
    arrow(413, 274, 527, 274) +
    grid(584, 179, out, out, [], { cell: 43, selected: [0] }) +
    txt(697, 402, `输出 ${out} × ${out}`, 20, C.green) +
    formula(d, 458)
  );
};
function stack(x, y, w, h, label, depth = 3) {
  let s = "";
  for (let i = depth - 1; i >= 0; i--)
    s += `<rect x="${x + i * 11}" y="${y - i * 10}" width="${w}" height="${h}" fill="${i % 2 ? C.pale : C.light}" stroke="${C.line}" stroke-width="1.5"/>`;
  return s + txt(x + w / 2, y + h + 30, label, 17, C.ink);
}
renderers.channels = (d) =>
  stack(72, 191, 143, 155, "Cin 个通道") +
  arrow(256, 264, 359, 264) +
  stack(393, 228, 74, 74, "核覆盖全部 Cin") +
  arrow(509, 264, 612, 264, "乘加求和") +
  stack(657, 191, 143, 155, "Cout 个特征图", 4) +
  txt(480, 145, "一个输出通道 = 各输入通道局部响应之和", 21, C.green) +
  formula(d, 461);
renderers.depthwise = (d) => {
  let s =
    txt(164, 130, "输入通道", 18, C.ink) +
    txt(424, 130, "逐通道空间卷积", 18, C.ink) +
    txt(770, 130, "1 × 1 通道混合", 18, C.ink);
  for (let i = 0; i < 3; i++)
    s +=
      box(92, 168 + i * 82, 143, 57, `通道 ${i + 1}`) +
      arrow(244, 197 + i * 82, 343, 197 + i * 82) +
      box(350, 168 + i * 82, 146, 57, `空间核 ${i + 1}`) +
      arrow(503, 197 + i * 82, 681, 279, "", C.line);
  return s + box(688, 228, 162, 100, "Pointwise", "组合各通道") + formula(d, 459);
};
renderers.dilation = (d) =>
  grid(157, 139, 7, 7, [], { cell: 41, selected: [8, 10, 12, 22, 24, 26, 36, 38, 40] }) +
  box(581, 176, 258, 93, "核参数仍为 3 × 3", "采样间隔扩大") +
  box(581, 302, 258, 78, "有效范围扩大为 5 × 5") +
  formula(d, 459);
renderers.transpose = (d) => {
  let s =
    grid(103, 219, 2, 2, [1, 2, 3, 4], { cell: 56, selected: [stageIndex(d, 4)] }) +
    arrow(247, 271, 374, 271, "散射贡献");
  const vals = Array(25).fill(0);
  for (let r = 0; r < 2; r++)
    for (let c = 0; c < 2; c++)
      for (let i = 0; i < 3; i++)
        for (let j = 0; j < 3; j++) vals[(r * 2 + i) * 5 + c * 2 + j] += r * 2 + c + 1;
  s +=
    grid(426, 161, 5, 5, vals, { cell: 48, selected: [12] }) +
    txt(166, 373, "输入 2 × 2", 19, C.ink) +
    txt(548, 440, "重叠位置相加", 19, C.green) +
    txt(797, 223, "3 × 3 全 1 核", 18, C.ink) +
    txt(797, 262, "步幅 2", 18, C.muted) +
    txt(797, 303, "输出 5 × 5", 18, C.ink);
  return s;
};
renderers.deformable = (d) => {
  let s = "";
  for (let i = 0; i < 6; i++)
    s +=
      line(128, 148 + i * 49, 421, 148 + i * 49, "#dce8df") +
      line(128 + i * 49, 148, 128 + i * 49, 393, "#dce8df");
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 3; c++) {
      const x = 177 + c * 98,
        y = 197 + r * 98,
        dx = (r - c) * 12 + 8,
        dy = (r + c) % 2 ? 15 : -13;
      s +=
        circle(x, y, 5, "", C.line, C.line) +
        arrow(x, y, x + dx, y + dy, "", C.amber) +
        circle(x + dx, y + dy, 7, "", C.green, C.green);
    }
  return (
    s +
    box(571, 173, 276, 83, "规则采样网格", "固定的核坐标") +
    arrow(709, 269, 709, 312, "加上偏移") +
    box(571, 328, 276, 83, "可学习的采样位置", "响应输入的局部结构")
  );
};
const P = [
  [1, 3, 2, 0],
  [4, 2, 1, 5],
  [0, 2, 6, 1],
  [3, 1, 2, 4],
];
renderers.pooling = (d) => {
  const outs = [];
  for (let r = 0; r < 2; r++)
    for (let c = 0; c < 2; c++) {
      const a = [
        P[r * 2][c * 2],
        P[r * 2][c * 2 + 1],
        P[r * 2 + 1][c * 2],
        P[r * 2 + 1][c * 2 + 1],
      ];
      outs.push(d.page === 34 ? a.reduce((s, x) => s + x) / 4 : Math.max(...a));
    }
  return (
    grid(92, 167, 4, 4, P.flat(), { cell: 55, selected: [0, 1, 4, 5] }) +
    arrow(338, 268, 497, 268, d.page === 34 ? "平均池化" : "最大池化") +
    grid(548, 213, 2, 2, outs, { cell: 55, selected: [0] }) +
    txt(780, 246, "窗口 2 × 2", 19, C.ink) +
    txt(780, 282, "步幅 2", 19, C.muted) +
    txt(480, 428, "每个局部窗口汇总为一个输出值", 20, C.green)
  );
};
renderers["pool-gradient"] = (d) =>
  grid(100, 177, 2, 2, [1, 3, 4, 2], { cell: 72, selected: [2] }) +
  arrow(268, 248, 396, 248, "取最大值") +
  box(420, 207, 126, 77, "4") +
  arrow(562, 248, 688, 248, "上游梯度 g", C.amber) +
  grid(725, 177, 2, 2, [0, 0, "g", 0], { cell: 62, selected: [2] }) +
  txt(480, 406, "梯度只回到本次前向传播的最大值位置", 21, C.green);
renderers["norm-axes"] = (d) => {
  let type = "BatchNorm";
  if (d.lesson === 4 || d.page === 44) type = "LayerNorm";
  if (d.page === 45) type = "InstanceNorm";
  if (d.page === 39) type = ["BatchNorm", "LayerNorm", "InstanceNorm"][d.stage % 3];
  let s = txt(457, 129, "通道 C →", 18, C.ink) + txt(92, 150, "样本 N", 17, C.ink);
  for (let n = 0; n < 3; n++)
    for (let c = 0; c < 4; c++) {
      const sel =
        type === "BatchNorm" ? c === 1 : type === "LayerNorm" ? n === 1 : n === 1 && c === 1;
      s += grid(172 + c * 136, 168 + n * 84, 3, 3, [], {
        cell: 23,
        fills: Array(9).fill(sel ? C.green : "#edf3ee"),
      });
    }
  return (
    s +
    pill(708, 147, 178, type) +
    txt(795, 224, "每个小格块", 17, C.muted) +
    txt(795, 253, "包含 H × W", 17, C.muted) +
    txt(795, 335, "绿色为同一", 17, C.green) +
    txt(795, 365, "统计组", 17, C.green) +
    txt(
      481,
      460,
      type === "BatchNorm"
        ? "每通道跨样本与空间统计"
        : type === "LayerNorm"
          ? "单个样本内跨特征统计"
          : "单样本、单通道内跨空间统计",
      19,
      C.green,
    )
  );
};
renderers.architecture = (d) => {
  let s = flow(d.labels, {
    x: 37,
    w: 886,
    y: 225,
    height: 93,
    subs: d.subs,
    active: stageIndex(d, d.labels.length),
  });
  d.labels.forEach((_, i) => {
    if (i < d.labels.length - 1)
      s += txt(
        37 + ((i + 0.5) * 886) / d.labels.length,
        178,
        i < 2 ? "较高空间分辨率" : i < 4 ? "更深特征" : "任务表示",
        13,
        C.muted,
      );
  });
  return s + txt(480, 400, "沿箭头核对分辨率、通道数和参数组织", 20, C.green);
};
renderers.inception = (d) => {
  let s = box(359, 106, 242, 57, "输入特征");
  const branches = [
    ["1×1 Conv"],
    ["1×1 Conv", "3×3 Conv"],
    ["1×1 Conv", "5×5 Conv"],
    ["3×3 MaxPool", "1×1 Conv"],
  ];
  branches.forEach((ls, i) => {
    const x = 49 + i * 231;
    s += arrow(480, 164, x + 90, 205, "", C.line);
    s += box(x, 216, 180, 58, ls[0]);
    if (ls[1]) s += arrow(x + 90, 276, x + 90, 295) + box(x, 307, 180, 58, ls[1]);
    s +=
      arrow(x + 90, ls[1] ? 365 : 276, x + 90, 396, "", C.line) +
      line(x + 90, 396, 480, 396, C.line);
  });
  return s + arrow(480, 396, 480, 411) + box(307, 420, 346, 50, "沿通道维拼接");
};
renderers.residual = (d) =>
  box(76, 230, 126, 70, "输入 x") +
  arrow(205, 265, 297, 265) +
  box(312, 210, 248, 110, "残差子网络", "学习 F(x)") +
  arrow(565, 265, 708, 265, "F(x)") +
  circle(738, 265, 25, "+") +
  arrow(764, 265, 862, 265) +
  txt(886, 272, "y", 25, C.green) +
  path("M139 228 V139 H738 V233", C.amber, 2.5) +
  txt(457, 128, "恒等映射 / 维度投影", 19, C.amber) +
  formula(d, 432);
renderers["architecture-comparison"] = (d) =>
  table(
    48,
    148,
    865,
    ["设计", "信息如何组合", "主要关注"],
    [
      ["VGG", "顺序堆叠小卷积", "规整的深层结构"],
      ["Inception", "多尺度分支拼接", "组合不同感受范围"],
      ["ResNet", "残差与输入相加", "更深网络的优化"],
      ["DenseNet", "此前特征逐层拼接", "特征复用"],
      ["SENet", "通道重加权", "全局上下文调节"],
    ],
    { rowHeight: 47 },
  );
renderers.dense = (d) => {
  let s = flow(["x₀", "层 1", "层 2", "层 3"], { x: 50, w: 860, y: 293, height: 77 });
  for (let i = 0; i < 3; i++)
    for (let j = i + 1; j < 4; j++) {
      const x1 = 146 + i * 226,
        x2 = 146 + j * 226,
        h = 255 - (j - i) * 44;
      s += path(`M${x1} 291 V${h} H${x2} V290`, j - i > 1 ? C.amber : C.line, 1.8);
    }
  return s + txt(480, 135, "每一层接收此前所有层的特征拼接", 21, C.green) + formula(d, 445);
};
renderers.se = (d) =>
  stack(50, 212, 95, 135, "特征图") +
  arrow(177, 265, 234, 265) +
  flow(["全局平均", "瓶颈变换", "Sigmoid"], {
    x: 250,
    w: 478,
    y: 221,
    height: 80,
    subs: ["Squeeze", "Excitation", "通道权重"],
  }) +
  arrow(733, 265, 789, 265) +
  circle(817, 265, 25, "×") +
  path("M100 209 V125 H817 V238", C.amber, 2) +
  arrow(842, 265, 912, 265) +
  txt(818, 396, "逐通道缩放", 19, C.green);
renderers.transfer = (d) => {
  let s = flow(["目标数据", "预训练主干", "新分类头", "预测"], {
    x: 42,
    w: 879,
    y: 223,
    height: 94,
    subs: ["较少标注", "复用已有表示", "适配目标标签", "任务输出"],
  });
  s += pill(304, 154, 194, "冻结 / 部分微调", C.blue) + pill(572, 154, 171, "训练", C.amber);
  return (
    s +
    arrow(665, 374, 416, 374, "允许时向主干传播梯度", C.amber) +
    txt(480, 434, "数据规模与任务相似性决定微调范围", 19, C.muted)
  );
};
renderers.tokens = (d) =>
  flow(d.labels, {
    x: 55,
    w: 850,
    y: 228,
    height: 90,
    subs: ["语言符号", "离散 ID", "可计算向量", "学习映射"],
  }) + txt(480, 413, "模型处理的是表示，而不是词形本身", 20, C.green);
renderers.embedding = (d) =>
  grid(60, 153, 6, 1, [0, 0, 1, 0, 0, 0], { cell: 43, selected: [2] }) +
  txt(82, 439, "one-hot", 16, C.muted) +
  txt(147, 277, "×", 29, C.muted) +
  grid(
    195,
    153,
    6,
    4,
    Array.from({ length: 24 }, (_, i) => ((((i * 7) % 13) - 6) / 10).toFixed(1)),
    { cell: 43, selected: [8, 9, 10, 11], font: 15 },
  ) +
  txt(283, 439, "嵌入矩阵 E", 17, C.muted) +
  arrow(403, 280, 529, 280, "选中一行") +
  grid(570, 248, 1, 4, [-0.2, 0.5, -0.1, 0.6], { cell: 54, selected: [0, 1, 2, 3] }) +
  txt(679, 351, "稠密表示", 20, C.green) +
  formula(d, 471);
renderers.word2vec = (d) => {
  const words = ["the", "quick", "brown", "fox", "jumps"];
  let s = "";
  words.forEach(
    (w, i) => (s += box(68 + i * 170, 130, 145, 67, w, "", i === 2 ? C.sand : C.light)),
  );
  s += arrow(480, 201, 480, 257, "中心词") + box(366, 271, 228, 74, "词向量");
  [0, 1, 3, 4].forEach((i, j) => {
    const x = 56 + j * 224;
    s += arrow(480, 346, x + 102, 392, "", C.line) + box(x, 398, 204, 62, words[i]);
  });
  return s + txt(790, 290, "Skip-gram", 19, C.green) + txt(790, 325, "预测上下文", 18, C.muted);
};
renderers["word2vec-training"] = (d) =>
  flow(["中心词 ID", "查表 E", "上下文分数", "训练损失"], {
    x: 45,
    w: 870,
    y: 189,
    height: 94,
    subs: ["构造训练样本", "得到词向量", "对词表建模", "目标来自语料"],
  }) +
  arrow(824, 361, 327, 361, "通过梯度调整嵌入与输出参数", C.amber) +
  txt(480, 442, "词向量在预测任务中被学到，而非人工指定每维语义", 19, C.muted);
renderers.polysemy = (d) =>
  box(366, 119, 228, 62, "bank") +
  arrow(480, 184, 225, 258) +
  arrow(480, 184, 735, 258) +
  box(64, 274, 322, 95, "financial bank", "金融语境", C.light) +
  box(574, 274, 322, 95, "river bank", "河岸语境", C.pale) +
  txt(480, 438, "固定词向量难以单独区分当前语境", 20, C.green);
function recurrent(d, back = false) {
  let s = "";
  for (let i = 0; i < 4; i++) {
    const x = 62 + i * 230;
    s += box(
      x,
      229,
      146,
      82,
      `h${i + 1}`,
      "同一更新函数",
      i === stageIndex(d, 4) ? C.sand : C.light,
    );
    if (i < 3) s += arrow(x + 149, 270, x + 226, 270, "Wₕ");
    s +=
      circle(x + 73, 404, 23, `x${i + 1}`) +
      arrow(x + 73, 378, x + 73, 315) +
      arrow(x + 73, 225, x + 73, 164) +
      box(x + 27, 111, 92, 51, `y${i + 1}`);
    if (back && i < 3) s += arrow(x + 225, 202, x + 148, 202, "", C.amber);
  }
  if (back) s += txt(480, 448, "来自不同时间步的梯度在共享参数处累加", 18, C.amber);
  else s += formula(d, 461);
  return s;
}
renderers.rnn = (d) => recurrent(d);
renderers.bptt = (d) => recurrent(d, true);
renderers["gradient-time"] = (d) => {
  let s = axes(120, 121, 700, 292, "时间间隔", "相对梯度尺度");
  s +=
    plot((t) => Math.pow(0.6, t), {
      x: 120,
      y: 121,
      w: 700,
      h: 292,
      xmin: 0,
      xmax: 6,
      ymin: 0,
      ymax: 4,
      color: C.green,
    }) +
    plot((t) => Math.pow(1.25, t), {
      x: 120,
      y: 121,
      w: 700,
      h: 292,
      xmin: 0,
      xmax: 6,
      ymin: 0,
      ymax: 4,
      color: C.amber,
    });
  s +=
    pill(617, 145, 175, "1.25ᵗ：增长", C.amber) +
    pill(443, 337, 175, "0.6ᵗ：衰减") +
    txt(480, 462, "长期依赖需要控制反复相乘的梯度尺度", 19, C.green);
  return s;
};
renderers.lstm = (d) => {
  let s =
    txt(74, 133, "cₜ₋₁", 23, C.green) +
    arrow(78, 158, 222, 158) +
    circle(250, 158, 23, "×") +
    arrow(276, 158, 552, 158) +
    circle(580, 158, 23, "+") +
    arrow(607, 158, 882, 158) +
    txt(888, 136, "cₜ", 23, C.green);
  s +=
    line(744, 159, 744, 200, C.green) +
    circle(744, 226, 27, "tanh") +
    arrow(774, 226, 817, 226) +
    circle(843, 226, 23, "×") +
    arrow(870, 226, 918, 226) +
    txt(888, 273, "hₜ", 23, C.green);
  const gates = [
    ["遗忘门", "fₜ", 250],
    ["输入门", "iₜ", 430],
    ["候选信息", "gₜ", 580],
    ["输出门", "oₜ", 843],
  ];
  gates.forEach(([label, name, x], i) => {
    s +=
      box(x - 60, 307, 120, 60, name, "", i === stageIndex(d, 4) ? C.sand : C.light) +
      txt(x, 298, label, 16, C.muted) +
      line(x, 413, x, 369, C.line);
  });
  s +=
    arrow(250, 306, 250, 185) +
    circle(506, 237, 20, "×") +
    arrow(430, 306, 490, 256) +
    arrow(580, 306, 524, 256) +
    path("M506 216 V196 H580 V183", C.green, 2) +
    arrow(843, 306, 843, 253) +
    line(91, 413, 843, 413, C.line, false, 2) +
    box(58, 382, 172, 62, "[hₜ₋₁, xₜ]", "", C.pale) +
    formula(d, 470);
  return s;
};
renderers["gated-variants"] = (d) => {
  let s =
    box(66, 207, 159, 76, "旧状态 hₜ₋₁") +
    box(342, 126, 200, 69, "重置门 rₜ") +
    box(342, 286, 200, 69, "更新门 zₜ") +
    arrow(226, 243, 340, 161) +
    arrow(225, 246, 340, 320) +
    box(636, 124, 246, 78, "候选状态 h̃ₜ") +
    arrow(544, 161, 632, 161) +
    box(636, 306, 246, 78, "新状态 hₜ") +
    arrow(544, 320, 632, 346) +
    arrow(759, 204, 759, 302);
  return s + txt(480, 445, "GRU：在一个隐藏状态中组合保留信息与候选信息", 19, C.green);
};
renderers.translation = (d) =>
  flow(d.labels ?? ["源序列", "翻译模型", "目标序列"], {
    x: 80,
    w: 800,
    y: 210,
    height: 101,
    subs: ["Machine Translation", "表示与解码", "Maschinelle Übersetzung"],
  }) + txt(480, 409, "语言之间的词序、长度与对应关系都可能不同", 20, C.muted);
renderers.alignment = (d) => {
  let s = "";
  const src = ["the", "black", "cat"],
    tar = ["黑色", "的", "猫"];
  src.forEach((t, i) => (s += box(104 + i * 291, 127, 167, 67, t)));
  tar.forEach((t, i) => (s += box(104 + i * 291, 363, 167, 67, t)));
  const pairs =
    d.page === 74
      ? [
          [0, 0],
          [1, 0],
          [2, 2],
        ]
      : d.page === 75
        ? [
            [0, 0],
            [1, 0],
            [1, 1],
            [2, 2],
          ]
        : [
            [0, 1],
            [1, 0],
            [2, 2],
          ];
  pairs.forEach(([a, b]) => (s += arrow(187 + a * 291, 198, 187 + b * 291, 359, "", C.line)));
  return (
    s +
    pill(334, 261, 292, d.page === 74 ? "多对一" : d.page === 75 ? "一对多" : "词级或短语级对齐")
  );
};
function encdec(d, bottleneck = false) {
  let s = "";
  for (let i = 0; i < 3; i++) {
    const x = 40 + i * 137;
    s +=
      box(x, 184, 110, 67, `编码 ${i + 1}`) +
      arrow(x + 55, 323, x + 55, 255) +
      txt(x + 55, 354, `x${i + 1}`, 22, C.green);
    if (i < 2) s += arrow(x + 113, 217, x + 134, 217);
  }
  s +=
    box(443, 182, 99, 77, bottleneck ? "压缩\n向量" : "编码\n表示", "", C.sand) +
    arrow(429, 217, 440, 217);
  for (let i = 0; i < 3; i++) {
    const x = 578 + i * 126;
    s +=
      box(x, 184, 105, 67, `解码 ${i + 1}`) +
      arrow(x + 52, 180, x + 52, 142) +
      txt(x + 52, 126, `y${i + 1}`, 22, C.green);
    if (i < 2) s += arrow(x + 108, 217, x + 123, 217);
  }
  s += arrow(545, 217, 575, 217);
  return (
    s +
    txt(
      480,
      419,
      bottleneck ? "全部输入信息通过固定长度向量传递" : "源序列表示支持目标序列逐步生成",
      21,
      C.muted,
    )
  );
}
renderers.seq2seq = (d) => encdec(d);
renderers.bottleneck = (d) => encdec(d, true);
renderers.searchtree = (d) => {
  let s = circle(480, 135, 27, "起点");
  const layer1 = [230, 480, 730];
  layer1.forEach((x, i) => {
    s +=
      arrow(480, 165, x, 229, "", C.line) +
      circle(x, 257, 25, `A${i + 1}`, i === stageIndex(d, 3) ? C.sand : C.light);
    for (let j = 0; j < 2; j++) {
      const xx = x - 64 + j * 128;
      s += arrow(x, 286, xx, 365, "", C.line) + circle(xx, 390, 21, `B${i * 2 + j + 1}`);
    }
  });
  return s;
};
renderers["search-compare"] = (d) => {
  let s = "";
  ["贪心", "穷举", "束搜索"].forEach((label, i) => {
    const x = 45 + i * 313;
    s += txt(x + 133, 126, label, 22, C.ink);
    s += circle(x + 133, 177, 13, "", C.green, C.green);
    for (let j = 0; j < 3; j++) {
      const xx = x + 47 + j * 84,
        col = i === 0 && j !== 1 ? "#dce5df" : i === 2 && j === 0 ? "#dce5df" : C.green;
      s += line(x + 133, 192, xx, 268, col) + circle(xx, 277, 13, "", col, col);
      for (let k = 0; k < 2; k++)
        s +=
          line(xx, 291, xx - 18 + k * 36, 350, col) +
          circle(xx - 18 + k * 36, 360, 8, "", col, col);
    }
    s += txt(x + 133, 427, ["仅保留 1 条", "保留全部候选", "每轮保留 k 条"][i], 18, C.muted);
  });
  return s;
};
renderers.beam = (d) => {
  const levels = [
    { x: 45, nodes: [["<START>", 250, 0]] },
    {
      x: 245,
      nodes: [
        ["he", 184, -0.7],
        ["I", 340, -1.2],
      ],
    },
    {
      x: 465,
      nodes: [
        ["he hit", 144, -1.4],
        ["he was", 248, -2.4],
        ["I saw", 355, -1.6],
      ],
    },
    {
      x: 700,
      nodes: [
        ["he hit me", 151, -1.9],
        ["I saw him", 354, -2.1],
      ],
    },
  ];
  let s = "";
  levels.forEach((level, i) => {
    level.nodes.forEach(([label, y, score], j) => {
      s += box(level.x, y, 160, 58, label, "", i === stageIndex(d, 4) ? C.sand : C.light);
      if (i > 0) s += txt(level.x + 80, y - 12, String(score), 15, C.blue);
    });
    s += txt(level.x + 80, 439, `步骤 ${i}`, 15, C.muted);
  });
  [
    [0, 0, 1, 0],
    [0, 0, 1, 1],
    [1, 0, 2, 0],
    [1, 0, 2, 1],
    [1, 1, 2, 2],
    [2, 0, 3, 0],
    [2, 2, 3, 1],
  ].forEach(
    ([i, j, k, l]) =>
      (s += arrow(
        levels[i].x + 161,
        levels[i].nodes[j][1] + 29,
        levels[k].x - 3,
        levels[k].nodes[l][1] + 29,
        "",
        j === 1 && k === 3 ? C.line : C.green,
      )),
  );
  return s + pill(303, 100, 352, "每轮：扩展 → 评分 → 保留 Top-2");
};
renderers["beam-end"] = (d) =>
  box(78, 159, 293, 80, "未完成候选", "继续生成") +
  box(78, 331, 293, 80, "已完成候选", "包含 <END>") +
  arrow(379, 199, 570, 199, "扩展") +
  box(589, 153, 293, 92, "继续保留 Top-k", "按同一评分规则比较") +
  arrow(724, 249, 724, 326, "产生结束符") +
  box(589, 333, 293, 79, "停止或进入完成集合") +
  arrow(584, 373, 378, 373, "收集完成候选", C.amber);
renderers.bleu = (d) => {
  let s =
    txt(85, 134, "候选译文", 18, C.muted, "start") + txt(85, 248, "参考译文", 18, C.muted, "start");
  const a = ["the", "cat", "is", "on", "the", "mat"],
    b = ["the", "cat", "sat", "on", "the", "mat"];
  a.forEach((w, i) => (s += box(70 + i * 145, 153, 124, 55, w, "", i === 2 ? C.sand : C.light)));
  b.forEach((w, i) => (s += box(70 + i * 145, 268, 124, 55, w, "", i === 2 ? C.pale : C.light)));
  return (
    s +
    flow(["n-gram 匹配", "精度组合", "长度惩罚"], { x: 165, w: 630, y: 378, height: 73 }) +
    txt(480, 110, "局部词组匹配与整体语义是不同层面的评价", 19, C.ink)
  );
};
renderers["translation-errors"] = (d) => {
  if (d.assets?.length)
    return (
      images(d, 43, 128, 575, 295, 2) +
      flow(["语义与指代", "流畅与忠实", "领域与长句"], { x: 667, y: 134, w: 246, vertical: true })
    );
  return renderers.tasks(d);
};
renderers["cross-attention"] = (d) => {
  let s = "";
  const colors = [C.light, C.light, C.sand, C.light];
  for (let i = 0; i < 4; i++) {
    s +=
      box(47 + i * 231, 117, 174, 65, `源表示 h${i + 1}`, "", colors[i]) +
      arrow(134 + i * 231, 186, 480, 315, `${[0.1, 0.2, 0.5, 0.2][i]}`, C.line);
  }
  return (
    s +
    box(366, 324, 228, 65, "加权上下文 cₜ") +
    box(679, 343, 231, 65, "当前解码状态") +
    arrow(677, 374, 599, 354, "Query", C.amber) +
    arrow(480, 391, 480, 432) +
    txt(480, 463, "用于预测当前目标词", 20, C.green)
  );
};
renderers.attention = (d) => {
  const weights = [0.1, 0.2, 0.5, 0.2],
    values = [1, 2, 4, 3];
  let s =
    txt(180, 123, "兼容度分数", 18, C.ink) +
    txt(480, 123, "注意力权重 α", 18, C.ink) +
    txt(780, 123, "源表示 / 值", 18, C.ink);
  for (let i = 0; i < 4; i++) {
    const y = 147 + i * 68;
    s +=
      box(90, y, 180, 49, ["e₁", "e₂", "e₃", "e₄"][i]) +
      arrow(276, y + 25, 386, y + 25, "", C.line) +
      box(390, y, 180, 49, String(weights[i]), "", C.light) +
      arrow(576, y + 25, 686, y + 25, "×", C.line) +
      box(690, y, 180, 49, String(values[i]), "", C.pale);
  }
  return (
    s +
    txt(
      480,
      461,
      `示例加权结果：Σ αᵢvᵢ = ${weights.reduce((s, w, i) => s + w * values[i], 0).toFixed(1)}`,
      20,
      C.green,
    )
  );
};
renderers["sequence-tasks"] = (d) => {
  let s = "";
  ["多对一", "一对多", "多对多"].forEach((title, k) => {
    const x = 36 + k * 317;
    s += txt(x + 139, 130, title, 21, C.ink);
    for (let t = 0; t < 3; t++) {
      s += box(x + t * 92, 249, 78, 61, "RNN");
      if (t < 2) s += arrow(x + t * 92 + 79, 279, x + (t + 1) * 92 - 2, 279);
      if (k !== 1 || t === 0)
        s +=
          circle(x + t * 92 + 39, 394, 14, "", C.light, C.green) +
          arrow(x + t * 92 + 39, 377, x + t * 92 + 39, 314);
      if (k !== 0 || t === 2)
        s +=
          arrow(x + t * 92 + 39, 244, x + t * 92 + 39, 199) +
          circle(x + t * 92 + 39, 181, 14, "", C.sand, C.amber);
    }
    s += txt(x + 139, 451, ["序列分类", "图像描述", "序列标注 / 变换"][k], 17, C.muted);
  });
  return s;
};

import { transformerRenderers } from "./transformer.mjs";
import { selfSupervisedRenderers } from "./self-supervised.mjs";
transformerRenderers(renderers);
selfSupervisedRenderers(renderers, { image, images, sample });

// Special source pages and checked numerical examples.
renderers["classification-compare"] = (d) =>
  sample(d, 35, 178, 147, 222) +
  txt(500, 130, "传统机器学习", 22, C.ink) +
  flow(["手工特征", "分类器", "类别输出"], {
    x: 215,
    w: 685,
    y: 164,
    height: 90,
    subs: ["人为设计表示", "学习映射", "猫 / 狗"],
  }) +
  txt(500, 318, "深度学习", 22, C.ink) +
  flow(["深层网络学习特征", "类别输出"], {
    x: 215,
    w: 685,
    y: 350,
    height: 90,
    subs: ["联合学习表示与预测", "猫 / 狗"],
  });
renderers.training = (d) => {
  let s = flow(["训练样本", "模型预测", "计算损失"], {
    x: 80,
    w: 800,
    y: 136,
    height: 86,
    subs: ["输入与标签", "前向传播", "比较预测与目标"],
  });
  s +=
    box(648, 342, 230, 83, "梯度与参数更新", "反向传播 + 优化器", C.sand) +
    arrow(771, 225, 771, 337) +
    path("M644 384 H480 V230", C.amber, 2) +
    arrow(480, 281, 480, 229, "更新参数", C.amber);
  s +=
    box(80, 343, 266, 81, "验证与最终测试", "独立数据检查泛化") +
    arrow(369, 180, 216, 335, "复用模型", C.line);
  return s;
};
renderers["split-brain"] = (d) => {
  let s = box(55, 228, 161, 87, "通道拆分 X");
  [
    ["X₁", "预测 X₂", 145],
    ["X₂", "预测 X₁", 339],
  ].forEach(([input, target, y]) => {
    s +=
      arrow(221, 271, 294, y + 37, "", C.line) +
      box(302, y, 151, 76, input) +
      arrow(458, y + 38, 518, y + 38) +
      box(526, y, 151, 76, "编码器") +
      arrow(682, y + 38, 742, y + 38) +
      box(750, y, 154, 76, target, "", C.sand);
  });
  return s + txt(480, 463, "跨通道预测需要补全信息，不能直接复制同一输入通道", 18, C.green);
};
renderers["inpainting-loss"] = (d) =>
  flow(["可见上下文", "修复网络", "修复图像"], { x: 55, w: 850, y: 143, height: 89 }) +
  arrow(798, 236, 697, 331) +
  box(551, 340, 319, 87, "对抗损失", "区分真实与修复结果", C.sand) +
  arrow(798, 236, 247, 331, "", C.line) +
  box(83, 340, 319, 87, "重建损失", "比较缺失区域与原图") +
  txt(480, 470, "L = Lreconstruction + λLadversarial", 19, C.green);
renderers["conv-grad"] = (d) => {
  const stride = d.variant === "stride" ? 2 : 1,
    n = stride === 2 ? 5 : 4,
    k = stride === 2 ? 3 : 2,
    out = 3 - stride + 1,
    cell = 43;
  const active = stageIndex(d, out * out),
    rr = Math.floor(active / out),
    cc = active % out,
    selected = [];
  for (let i = 0; i < k; i++)
    for (let j = 0; j < k; j++) selected.push((rr * stride + i) * n + cc * stride + j);
  const input = Array.from({ length: n * n }, (_, i) => (i * 3 + Math.floor(i / n)) % 5);
  let s =
    txt(178, 129, `输入 X：${n}×${n}`, 19, C.ink) +
    grid(63, 162, n, n, input, { cell, selected }) +
    txt(471, 149, `共享核 K：${k}×${k}`, 19, C.ink) +
    grid(
      405,
      186,
      k,
      k,
      Array.from({ length: k * k }, (_, i) => `k${i + 1}`),
      { cell: 43 },
    ) +
    txt(763, 150, `输出梯度 G：${out}×${out}`, 18, C.ink) +
    grid(
      701,
      186,
      out,
      out,
      Array.from({ length: out * out }, (_, i) => `g${i + 1}`),
      { cell: 43, selected: [active] },
    );
  s +=
    arrow(679, 297, 548, 297, "局部梯度", C.amber) +
    arrow(390, 297, 288, 297, "累加", C.amber) +
    txt(
      480,
      417,
      `输出 (${rr + 1},${cc + 1}) 对应窗口左上角 (${rr * stride + 1},${cc * stride + 1})`,
      19,
      C.green,
    );
  return (
    s +
    txt(
      480,
      459,
      d.variant === "kernel"
        ? "核参数梯度：所有使用位置的「上游梯度 × 输入」之和"
        : d.variant === "input"
          ? "输入梯度：所有依赖此输入的「上游梯度 × 核权重」之和"
          : "步幅 2：相邻输出对应的输入窗口移动两格",
      17,
      C.muted,
    )
  );
};
renderers["backprop-example"] = (d) => {
  const sig = (x) => 1 / (1 + Math.exp(-x)),
    a1 = [5, 9, 10].map(sig),
    z2 = [2 * a1[0] + a1[1] + 3 * a1[2] + 1, 3 * a1[0] + 4 * a1[1] + 2 * a1[2] + 1],
    a2 = z2.map(sig),
    z3 = 2 * a2[0] + 3 * a2[1] + 2,
    y = sig(z3),
    delta3 = (y - 1) * y * (1 - y),
    delta2 = a2.map((a, i) => delta3 * [2, 3][i] * a * (1 - a));
  const fmt = (a) => a.map((x) => x.toFixed(5)).join(", "),
    rows =
      d.stage < 5
        ? [
            ["第 1 层", "z₁ = (5, 9, 10)", fmt(a1)],
            ["第 2 层", `z₂ = (${fmt(z2)})`, fmt(a2)],
            ["输出层", `z₃ = ${z3.toFixed(5)}`, `ŷ = ${y.toFixed(7)}`],
          ]
        : [
            ["输出误差", "δ₃ = (ŷ−1)ŷ(1−ŷ)", delta3.toExponential(3)],
            ["前层误差", "δ₂ = W₃ᵀδ₃ ⊙ σ′(z₂)", delta2.map((x) => x.toExponential(3)).join(", ")],
            ["参数梯度", "∂L/∂W₃ = δ₃a₂ᵀ", a2.map((a) => (a * delta3).toExponential(3)).join(", ")],
          ];
  let s = flow(["输入 (1,2)", "隐藏 3 单元", "隐藏 2 单元", "Sigmoid 输出"], {
    x: 42,
    w: 876,
    y: 119,
    height: 71,
    active: stageIndex(d, 4),
  });
  s += table(51, 229, 858, ["阶段", "计算", "结果"], rows, {
    rowHeight: 57,
    widths: [125, 362, 371],
  });
  return (
    s +
    txt(
      480,
      470,
      d.stage < 5
        ? `目标 1；平方损失 L = ${(0.5 * (y - 1) ** 2).toExponential(4)}`
        : "更新方向：W ← W − η∂L/∂W；各层依次使用链式法则",
      18,
      C.green,
    )
  );
};
