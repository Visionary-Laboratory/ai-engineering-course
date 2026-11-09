import { C, txt, box, line, arrow, path, circle, pill, grid, flow, table } from "./drawing.mjs";

// Tensor operations, dependency paths and shapes are drawn as SVG geometry.
export function transformerRenderers(r) {
  const step = (d, n) => Math.min(n - 1, Math.floor((d.stage * n) / d.span));
  const formula = (d) => (d.formula ? txt(480, 456, d.formula, 18, C.green, "middle", 64) : "");
  r.transformer = (d) => {
    let s = txt(246, 127, "编码器", 23, C.green) + txt(709, 127, "解码器", 23, C.green);
    const left = ["输入嵌入 + 位置", "自注意力", "前馈网络"],
      right = ["目标嵌入 + 位置", "因果自注意力", "跨注意力", "前馈网络"];
    left.forEach((v, i) => {
      const y = 368 - i * 97;
      s += box(100, y, 290, 65, v);
      if (i < 2) s += arrow(245, y - 4, 245, y - 29);
    });
    right.forEach((v, i) => {
      const y = 391 - i * 78;
      s += box(558, y, 302, 56, v);
      if (i < 3) s += arrow(709, y - 3, 709, y - 20);
    });
    s +=
      path("M392 207 H467 V260 H552", C.amber, 2) +
      arrow(516, 260, 554, 260, "K, V", C.amber) +
      txt(457, 171, "编码表示", 15, C.amber) +
      txt(246, 467, "各子层包含残差与归一化", 15, C.muted) +
      arrow(709, 153, 709, 126);
    return s;
  };
  r["self-attention"] = (d) => {
    const phase = step(d, 5),
      labels = ["线性投影", "相关性打分", "按行归一化", "加权汇总", "输出表示"];
    let s = box(42, 220, 118, 78, "输入 X");
    [
      ["Q", 138],
      ["K", 248],
      ["V", 358],
    ].forEach(
      ([t, y], i) =>
        (s +=
          arrow(165, 259, 225, y + 25, "", C.line) +
          box(231, y, 107, 56, t, "", phase === 0 ? C.sand : C.light)),
    );
    s +=
      arrow(342, 164, 413, 220) +
      arrow(342, 275, 413, 248) +
      box(418, 207, 179, 78, "QKᵀ / √dₖ", "N × N 分数", phase === 1 ? C.sand : C.light) +
      arrow(602, 246, 652, 246) +
      box(657, 206, 238, 79, "softmax（每行）", "归一化注意力 A", phase === 2 ? C.sand : C.light);
    s +=
      path("M285 415 V430 H777 V384", C.blue, 2) +
      txt(505, 420, "V：被汇总的信息", 16, C.blue) +
      arrow(777, 288, 777, 323) +
      box(669, 328, 216, 59, "输出 = AV", "", phase >= 3 ? C.sand : C.light) +
      pill(354, 114, 270, labels[phase]);
    return s + formula(d);
  };
  r.multihead = (d) => {
    let s = box(49, 223, 130, 86, "输入表示");
    ["head 1", "head 2", "head h"].forEach((v, i) => {
      const y = 121 + i * 113;
      s +=
        arrow(182, 266, 261, y + 36, "", C.line) +
        box(267, y, 285, 78, v, "独立 Q / K / V 投影", i === step(d, 3) ? C.sand : C.light) +
        arrow(556, y + 38, 625, 266, "", C.line);
    });
    return (
      s +
      box(630, 222, 117, 87, "拼接") +
      arrow(751, 266, 789, 266) +
      box(793, 221, 119, 89, "投影 Wᴼ") +
      formula(d)
    );
  };
  r.position = (d) => {
    let s =
      txt(205, 132, "内容嵌入", 21, C.ink) +
      txt(480, 132, "位置编码", 21, C.ink) +
      txt(755, 132, "输入表示", 21, C.ink);
    for (let i = 0; i < 4; i++)
      s +=
        box(105, 165 + i * 67, 200, 50, ["我", "喜欢", "机器", "学习"][i]) +
        txt(343, 198 + i * 67, "+", 27, C.amber) +
        box(380, 165 + i * 67, 200, 50, `位置 ${i + 1}`, "", C.sand) +
        arrow(595, 190 + i * 67, 641, 190 + i * 67) +
        box(655, 165 + i * 67, 200, 50, `词义 + 顺序 ${i + 1}`);
    return s;
  };
  r["inductive-bias"] = (d) => {
    let s = "";
    ["CNN：局部", "RNN：逐步传递", "自注意力：全局"].forEach((t, k) => {
      const x = 38 + k * 314;
      s += txt(x + 136, 128, t, 21, C.ink);
      for (let i = 0; i < 4; i++) {
        const xx = x + 27 + i * 69;
        s += circle(xx, 382, 15, `${i + 1}`) + circle(xx, 208, 15, "");
        if (k === 0) {
          for (let j = Math.max(0, i - 1); j <= Math.min(3, i + 1); j++)
            s += line(x + 27 + j * 69, 363, xx, 226, C.line);
        } else if (k === 1) {
          s += arrow(xx, 362, xx, 228);
          if (i < 3) s += arrow(xx + 17, 208, xx + 51, 208);
        } else {
          for (let j = 0; j < 4; j++) s += line(x + 27 + j * 69, 363, xx, 226, C.line, false, 1);
        }
      }
      s += txt(x + 136, 452, ["共享局部模式", "状态携带历史", "按内容直接关联"][k], 18, C.muted);
    });
    return s;
  };
  r.encoder = (d) => {
    let s = flow(["自注意力", "残差 + 归一化", "前馈网络", "残差 + 归一化"], {
      x: 50,
      w: 860,
      y: 220,
      height: 86,
      active: step(d, 4),
    });
    s +=
      path("M58 212 V161 H365 V212", C.amber, 2) +
      path("M487 212 V161 H791 V212", C.amber, 2) +
      txt(210, 144, "残差旁路", 17, C.amber) +
      txt(640, 144, "残差旁路", 17, C.amber) +
      txt(174, 382, "位置之间交换信息", 18, C.green) +
      txt(617, 382, "每个位置共享同一个 MLP", 18, C.green);
    return s + txt(480, 451, "编码器层可重复堆叠；图示采用 Post-LN 顺序", 18, C.muted);
  };
  r["pre-post-ln"] = (d) => {
    let s =
      txt(60, 136, "Post-LN", 21, C.green, "start") + txt(60, 324, "Pre-LN", 21, C.green, "start");
    s +=
      flow(["输入 x", "子层 F", "相加", "LayerNorm"], { x: 60, w: 840, y: 162, height: 65 }) +
      path("M152 158 V113 H572 V158", C.amber, 2);
    s +=
      flow(["输入 x", "LayerNorm", "子层 F", "相加"], { x: 60, w: 840, y: 350, height: 65 }) +
      path("M152 346 V299 H804 V346", C.amber, 2);
    return s + txt(480, 465, "Pre-LN 的残差支路直接连接相加位置", 18, C.muted);
  };
  r.generation = (d) => {
    const tokens = d.tokens ?? ["输入", "上下文", "模型", "输出"],
      k = step(d, 4);
    let s = "";
    tokens.forEach((t, i) => {
      s += box(66 + i * 221, 136, 163, 65, i <= k ? t : "…", "", i === k ? C.sand : C.light);
      if (i < 3) s += arrow(233 + i * 221, 169, 277 + i * 221, 169);
    });
    s +=
      arrow(480, 210, 480, 251) +
      box(289, 265, 382, 76, "模型预测下一个 token", "条件：已出现的完整前缀") +
      arrow(674, 304, 806, 304) +
      box(757, 364, 152, 65, "追加 token", "", C.sand) +
      path("M838 361 V226 H850 V204", C.amber, 2);
    return s + txt(395, 419, "输入前缀 → 词表分布 → 选择 → 继续", 20, C.green);
  };
  r["causal-mask"] = (d) => {
    let s =
      txt(296, 129, "查询位置 i → 可见的键位置 j", 20, C.ink) +
      grid(
        121,
        159,
        5,
        5,
        Array.from({ length: 25 }, (_, i) => (i % 5 <= Math.floor(i / 5) ? "0" : "−∞")),
        {
          cell: 54,
          fills: Array.from({ length: 25 }, (_, i) =>
            i % 5 <= Math.floor(i / 5) ? C.light : "#f2e5e2",
          ),
          font: 16,
        },
      );
    s +=
      box(536, 161, 345, 89, "j ≤ i：可以关注", "保留原始分数") +
      box(536, 278, 345, 89, "j > i：屏蔽未来", "softmax 后权重为 0", C.sand) +
      arrow(410, 294, 528, 294, "加到分数");
    return s + formula(d);
  };
  r["ar-nar"] = (d) => {
    let s =
      txt(480, 129, "自回归：后一个位置依赖已生成的历史", 20, C.ink) +
      flow(["y₁", "y₂", "y₃", "y₄"], { x: 130, w: 700, y: 155, height: 69 });
    s +=
      txt(480, 297, "非自回归：多个输出位置可并行预测", 20, C.ink) +
      box(355, 332, 250, 57, "共同条件");
    for (let i = 0; i < 4; i++)
      s +=
        arrow(480, 391, 195 + i * 190, 417, "", C.line) +
        txt(195 + i * 190, 444, `y${i + 1}`, 23, C.green);
    return s;
  };
  r["teacher-forcing"] = (d) => {
    if (d.variant === "schedule")
      return (
        flow(["真实历史 y<t", "历史输入选择", "解码预测"], { x: 60, w: 840, y: 162, height: 80 }) +
        box(361, 341, 238, 78, "模型生成历史 ŷ<t", "训练策略决定混合方式", C.sand) +
        arrow(480, 336, 480, 247, "选取历史", C.amber) +
        txt(480, 456, "推理时可用的是模型自己生成的历史", 18, C.muted)
      );
    let s = txt(58, 153, "输入", 20, C.ink, "start") + txt(58, 379, "目标", 20, C.ink, "start");
    ["<BOS>", "我", "喜欢", "学习"].forEach((t, i) => {
      const x = 167 + i * 185;
      s +=
        box(x, 121, 161, 63, t) +
        arrow(x + 80, 188, x + 80, 230) +
        box(x, 235, 161, 62, "因果预测") +
        arrow(x + 80, 301, x + 80, 336) +
        box(x, 343, 161, 64, ["我", "喜欢", "学习", "<EOS>"][i], "", C.sand);
    });
    return s + txt(480, 460, "所有位置可同时计算损失，但不能读取未来 token", 18, C.green);
  };
  r.sampling = (d) => {
    const vals = d.values ?? [0.45, 0.3, 0.15, 0.1];
    let s = "";
    vals.forEach((v, i) => {
      const x = 91 + i * 132,
        h = v * 490;
      s +=
        `<rect x="${x}" y="${395 - h}" width="75" height="${h}" rx="5" fill="${i ? C.line : C.green}"/>` +
        txt(x + 37, 425, ["词 A", "词 B", "词 C", "词 D"][i], 17, C.ink) +
        txt(x + 37, 380 - h, v, 17, C.green);
    });
    return (
      s +
      box(675, 172, 234, 83, "贪心", "选择最高概率") +
      box(675, 306, 234, 83, "随机采样", "依概率分布抽取", C.sand)
    );
  };
  r["model-families"] = (d) =>
    table(
      60,
      141,
      840,
      ["模型", "结构", "可见信息 / 目标"],
      [
        ["BERT", "仅编码器", "双向上下文；掩码预测"],
        ["T5", "编码器—解码器", "源序列编码；生成目标"],
        ["GPT", "仅解码器", "因果上下文；下一 token"],
      ],
      { rowHeight: 82, widths: [143, 239, 458] },
    );
  r.vit = (d) => {
    let s =
      grid(
        54,
        191,
        4,
        4,
        Array.from({ length: 16 }, (_, i) => i + 1),
        { cell: 40, selected: [5] },
      ) +
      txt(133, 393, "图像 patch", 18, C.ink) +
      arrow(224, 269, 288, 269, "切分");
    s +=
      grid(307, 153, 6, 1, ["p₁", "p₂", "p₃", "…", "p₁₅", "p₁₆"], { cell: 43 }) +
      arrow(355, 275, 412, 275) +
      box(423, 220, 192, 103, "线性投影", "patch → token") +
      arrow(620, 270, 678, 270) +
      box(688, 218, 210, 105, "Transformer", "加入位置表示");
    if (d.variant === "class")
      s +=
        box(679, 119, 227, 60, "可学习 [CLS]", "", C.sand) +
        arrow(792, 182, 792, 214) +
        arrow(792, 327, 792, 380) +
        txt(792, 416, "[CLS] 输出 → 分类", 18, C.green);
    else s += txt(665, 426, "每个 token 保留对应的空间来源", 17, C.muted);
    return s;
  };
  r["vit-position"] = (d) =>
    grid(
      102,
      168,
      4,
      4,
      Array.from({ length: 16 }, (_, i) => i + 1),
      { cell: 55, selected: [5] },
    ) +
    arrow(356, 280, 462, 280, "展平顺序") +
    grid(
      502,
      184,
      2,
      8,
      Array.from({ length: 16 }, (_, i) => i + 1),
      { cell: 48, selected: [5] },
    ) +
    box(557, 338, 288, 73, "内容嵌入 + 位置嵌入") +
    txt(216, 431, "二维空间来源", 20, C.ink) +
    txt(719, 447, "编号只表示位置，不表示语义", 17, C.muted);
  r["vit-cost"] = (d) => {
    let s =
      txt(251, 134, "4 × 4 patch → 16 tokens", 20, C.ink) +
      grid(103, 167, 16, 16, [], { cell: 16 }) +
      txt(253, 452, "注意力矩阵：16 × 16", 18, C.green);
    s +=
      txt(701, 134, "8 × 8 patch → 64 tokens", 20, C.ink) +
      grid(566, 167, 64, 64, [], { cell: 4 }) +
      txt(698, 452, "注意力矩阵：64 × 64", 18, C.green) +
      arrow(385, 286, 522, 286, "4× token / 16× 关联");
    // Grids are scaled representations; dimensions are explicitly labeled.
    return s + txt(480, 111, "示意网格按统一显示尺寸缩放", 14, C.muted);
  };
  r.swin = (d) => {
    let s = "";
    [8, 4, 2, 1].forEach((n, i) => {
      const x = 64 + i * 229,
        cell = 168 / 8;
      s += grid(x, 191 + (8 - n) * 10, n, n, [], {
        cell,
        fills: Array.from({ length: n * n }, (_, j) =>
          (((Math.floor(j / n) / 2) | 0) + (((j % n) / 2) | 0)) % 2 ? C.pale : C.light,
        ),
      });
      s +=
        txt(x + 75, 377, ["H/4 × W/4", "H/8 × W/8", "H/16 × W/16", "H/32 × W/32"][i], 16, C.ink) +
        txt(x + 75, 413, ["C", "2C", "4C", "8C"][i], 19, C.green);
      if (i < 3) s += arrow(x + 171, 275, x + 219, 275, "合并");
    });
    return s + txt(480, 142, "局部窗口注意力 → Patch merging → 更高层表示", 20, C.ink);
  };
  r["shifted-window"] = (d) => {
    let s = "";
    [0, 1].forEach((k) => {
      const x = 93 + k * 479;
      s +=
        grid(x, 157, 8, 8, [], {
          cell: 33,
          fills: Array.from({ length: 64 }, (_, i) => {
            const rr = Math.floor(i / 8),
              c = i % 8;
            return ["#e7f0e9", "#e2edf4", "#faf0df", "#ede5f1"][
              (Math.floor((rr + k * 2) / 4) % 2) * 2 + (Math.floor((c + k * 2) / 4) % 2)
            ];
          }),
        }) + txt(x + 129, 453, k ? "移位后：跨原边界交互" : "本层：固定窗口", 19, C.ink);
    });
    return s + arrow(390, 286, 541, 286, "移动窗口划分");
  };
  r["relative-position"] = (d) => {
    let s =
      grid(
        107,
        176,
        5,
        5,
        Array.from({ length: 25 }, (_, i) => (i === 12 ? "Q" : "")),
        { cell: 46, selected: [12] },
      ) +
      arrow(223, 284, 315, 238, "Δr, Δc", C.amber) +
      arrow(366, 287, 481, 287) +
      box(505, 184, 355, 75, "相对位移 → 偏置 B", "相同相对位移共享索引") +
      box(505, 327, 355, 75, "加到注意力分数", "再归一化与汇总");
    return s + formula(d);
  };
  r.moe = (d) => {
    let s =
      box(51, 222, 151, 79, "输入 token") +
      arrow(207, 261, 267, 261) +
      box(275, 216, 179, 91, "路由器", "计算专家分数");
    for (let i = 0; i < 4; i++) {
      const y = 112 + i * 89,
        active = i === step(d, 4) || i === (step(d, 4) + 1) % 4;
      s +=
        arrow(459, 261, 533, y + 29, "", active ? C.green : "#dde7e0") +
        box(540, y, 170, 62, `专家 ${i + 1}`, "", active ? C.sand : "#f3f6f3") +
        arrow(716, y + 31, 782, 264, "", active ? C.green : "#dde7e0");
    }
    return (
      s +
      box(790, 221, 133, 84, "加权汇总") +
      txt(480, 472, "每个 token 只激活选中的专家子网络", 18, C.green)
    );
  };
  r["dense-sparse"] = (d) => {
    let s = "";
    ["稠密：每次都使用", "稀疏：条件选择"].forEach((v, k) => {
      const x = 60 + k * 460;
      s += txt(x + 180, 135, v, 22, C.ink);
      for (let i = 0; i < 8; i++) {
        const active = !k || i === 1 || i === 5;
        s += box(
          x + (i % 4) * 93,
          192 + Math.floor(i / 4) * 103,
          79,
          73,
          `E${i + 1}`,
          "",
          active ? C.light : "#f4f5f3",
          active ? C.green : "#d8ded8",
        );
      }
      s += txt(x + 180, 427, k ? "总容量大于当前激活容量" : "当前计算覆盖全部单元", 18, C.muted);
    });
    return s;
  };
  r["moe-block"] = (d) =>
    flow(["输入", "自注意力", "MoE 前馈层", "输出"], {
      x: 48,
      w: 864,
      y: 210,
      height: 102,
      active: 2,
    }) +
    path("M75 203 V151 H542 V203", C.amber, 2) +
    path("M548 319 V387 H863 V319", C.amber, 2) +
    txt(480, 451, "共享注意力负责交互；专家负责选中的前馈计算", 18, C.green);
  r.topk = (d) => {
    let s = table(
      66,
      139,
      420,
      ["专家", "路由分数", "Top-2"],
      [
        ["E1", "0.50", "选中"],
        ["E2", "0.30", "选中"],
        ["E3", "0.15", "—"],
        ["E4", "0.05", "—"],
      ],
      { rowHeight: 55, widths: [110, 150, 160] },
    );
    s +=
      arrow(510, 271, 593, 271) +
      box(614, 158, 274, 83, "权重重新归一化", "0.50/0.80 与 0.30/0.80") +
      box(614, 306, 274, 102, "组合专家输出", "0.625·E1(x) + 0.375·E2(x)", C.sand);
    if (d.page >= 150)
      s += txt(480, 458, "Token choice 选专家；Expert choice 选 token", 18, C.green);
    return s;
  };
  r.balance = (d) => {
    let s = "";
    [
      [9, 1, 1, 1],
      [3, 3, 3, 3],
    ].forEach((values, k) => {
      const x = 65 + k * 466;
      s += txt(x + 164, 130, k ? "分布更均匀" : "负载集中", 22, C.ink);
      values.forEach((v, i) => {
        s +=
          `<rect x="${x + i * 91}" y="${401 - v * 26}" width="65" height="${v * 26}" rx="5" fill="${k ? C.green : C.amber}"/>` +
          txt(x + i * 91 + 32, 390 - v * 26, v, 18, C.ink) +
          txt(x + i * 91 + 32, 429, `E${i + 1}`, 16, C.muted);
      });
    });
    return s + txt(480, 467, "相同 12 个 token 的示意分配，不能代表实测性能", 17, C.muted);
  };
  r.capacity = (d) => {
    let s = "";
    [6, 3, 2, 1].forEach((n, i) => {
      const x = 83 + i * 223;
      s +=
        txt(x + 69, 130, `专家 E${i + 1}`, 20, C.ink) +
        `<rect x="${x}" y="163" width="140" height="262" rx="8" fill="#f8faf8" stroke="${C.line}"/>`;
      for (let j = 0; j < n; j++)
        s += box(x + 16, 383 - j * 47, 108, 36, `t${j + 1}`, "", j >= 4 ? C.sand : C.light);
      s +=
        line(x - 13, 208, x + 153, 208, C.red, true) +
        txt(x + 70, 455, `收到 ${n} / 容量 4`, 17, C.muted);
    });
    return s + txt(480, 109, "超过容量线的 token 需要单独处理", 16, C.red);
  };
  r["router-training"] = (d) =>
    flow(d.labels, { x: 55, w: 850, y: 201, height: 104, active: step(d, 4) }) +
    arrow(785, 387, 346, 387, "依据负载反馈调整路由", C.amber) +
    txt(
      480,
      457,
      d.page >= 166 ? "辅助损失与专家偏置调节属于不同机制" : "优化任务目标，同时考虑路由负载",
      18,
      C.muted,
    );
  r["vision-moe"] = (d) =>
    grid(54, 170, 4, 4, [], { cell: 42, selected: [1, 6, 9, 14] }) +
    arrow(242, 250, 318, 250, "patch tokens") +
    box(329, 211, 156, 77, "路由器") +
    [0, 1, 2]
      .map(
        (i) =>
          arrow(488, 250, 614, 148 + i * 128, "", C.line) +
          box(620, 112 + i * 128, 267, 77, `视觉专家 ${i + 1}`, "处理选中的 patch"),
      )
      .join("");
  r.mixtral = (d) => {
    let s = "";
    for (let i = 0; i < 8; i++)
      s += box(60 + i * 111, 199, 93, 98, `E${i + 1}`, "", i === 2 || i === 5 ? C.sand : "#eef3ef");
    s +=
      box(96, 366, 317, 78, "总参数", "包含全部专家与共享部分") +
      box(533, 366, 317, 78, "激活参数", "当前 token 选中的专家 + 共享部分", C.sand) +
      txt(480, 149, "8 个专家 / Top-2 路由", 23, C.ink);
    return s;
  };
}
