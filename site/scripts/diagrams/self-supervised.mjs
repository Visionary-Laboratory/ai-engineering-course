import { C, txt, box, line, arrow, path, circle, pill, grid, flow, table } from "./drawing.mjs";

export function selfSupervisedRenderers(r, { image, images, sample }) {
  const step = (d, n) => Math.min(n - 1, Math.floor((d.stage * n) / d.span));
  const patch = (x, y, masked = false) =>
    grid(
      x,
      y,
      4,
      4,
      Array.from({ length: 16 }, (_, i) => (masked && i % 4 !== 0 ? "" : i + 1)),
      {
        cell: 36,
        fills: Array.from({ length: 16 }, (_, i) =>
          masked && i % 4 !== 0 ? "#e6e9e6" : ["#c0d8cd", "#e7eee8", "#d2e1eb", "#eddbc0"][i % 4],
        ),
        font: 15,
      },
    );
  r.augment = (d) => {
    if (d.assets?.length)
      return (
        images(d, 54, 111, 852, 263, 4) +
        flow(d.labels ?? ["原图", "裁剪", "颜色变化", "模糊"], {
          x: 55,
          w: 850,
          y: 394,
          height: 63,
        })
      );
    let s = "";
    (d.labels ?? ["原样本", "裁剪", "翻转", "颜色变化"]).forEach((v, k) => {
      const x = 61 + k * 227,
        vals = Array.from({ length: 16 }, (_, i) =>
          k === 2 ? Math.floor(i / 4) * 4 + 4 - (i % 4) : i + 1,
        );
      s += grid(x, 179, 4, 4, vals, {
        cell: 42,
        fills: vals.map((i) => (k === 3 ? (i % 3 ? C.sand : C.amber) : i % 3 ? C.light : C.line)),
      });
      if (k === 1)
        s += `<rect x="${x + 40}" y="218" width="85" height="86" fill="none" stroke="${C.amber}" stroke-width="3"/>`;
      s += txt(x + 84, 414, v, 20, C.ink);
    });
    return s + txt(480, 138, "原始图像变换的网格示意", 17, C.muted);
  };
  r.evidence = (d) => {
    if (!d.assets?.length)
      return (
        flow(d.labels ?? ["问题与设置", "图像 / 数据", "比较与解释"], {
          x: 60,
          w: 840,
          y: 193,
          height: 106,
        }) + txt(480, 419, "统一实验设置与评价协议后，再比较方法表现", 19, C.muted)
      );
    return (
      images(d, 37, 106, 688, 357, 4) +
      flow(d.labels ?? ["实验条件", "数据与指标", "比较结果"], {
        x: 757,
        y: 138,
        w: 165,
        vertical: true,
      }) +
      txt(380, 475, "", 13, C.muted)
    );
  };
  r["multi-task"] = (d) => {
    let s =
      box(58, 220, 173, 83, "图像输入") +
      arrow(236, 261, 322, 261) +
      box(330, 210, 227, 102, "共享视觉表示", "预训练编码器");
    ["分类：图像类别", "检测：位置与类别", "分割：像素类别"].forEach(
      (v, i) =>
        (s +=
          arrow(562, 261, 647, 154 + i * 112, "", C.line) + box(655, 119 + i * 112, 251, 73, v)),
    );
    return s;
  };
  r["self-supervision"] = (d) => {
    let s = box(50, 217, 169, 89, "原始数据 x");
    s +=
      arrow(225, 261, 308, 171) +
      arrow(225, 261, 308, 368) +
      box(315, 127, 249, 89, "构造可见输入", "增强 / 遮挡 / 变换") +
      box(315, 324, 249, 89, "构造训练目标", "来自数据本身", C.sand) +
      arrow(570, 172, 654, 172) +
      box(661, 127, 240, 89, "编码器 + 任务头") +
      arrow(781, 221, 781, 319) +
      box(661, 325, 240, 89, "代理任务损失") +
      arrow(570, 368, 655, 368);
    return s + txt(480, 465, "评价学到的表示时，再使用下游任务与固定协议", 18, C.green);
  };
  r.evaluation = (d) => {
    let s =
      txt(70, 134, "线性评估", 21, C.ink, "start") +
      flow(["输入", "冻结编码器", "可训练线性头", "下游预测"], {
        x: 65,
        w: 830,
        y: 161,
        height: 87,
        subs: ["任务数据", "固定表示", "学习类别映射", "检验表示"],
        active: 2,
      });
    s +=
      txt(70, 328, "微调", 21, C.ink, "start") +
      flow(["输入", "可训练编码器", "可训练任务头", "下游预测"], {
        x: 65,
        w: 830,
        y: 353,
        height: 87,
        subs: ["任务数据", "适配目标任务", "任务相关输出", "检验适配"],
        active: 1,
      });
    return s;
  };
  r["relative-patch"] = (d) => {
    let s =
      grid(79, 144, 3, 3, ["↖", "↑", "↗", "←", "中心", "→", "↙", "↓", "↘"], {
        cell: 91,
        selected: [4],
        font: 23,
      }) +
      arrow(379, 279, 469, 279) +
      box(493, 158, 360, 79, "共享编码器", "中心块 + 随机邻近块") +
      arrow(673, 242, 673, 303) +
      box(493, 311, 360, 95, "预测相对位置", "8 个方向之一", C.sand);
    return s + txt(214, 452, "位置标签来自裁剪过程", 18, C.muted);
  };
  r.jigsaw = (d) => {
    const order = [6, 1, 8, 3, 9, 2, 4, 7, 5];
    let s =
      grid(65, 171, 3, 3, [1, 2, 3, 4, 5, 6, 7, 8, 9], { cell: 68 }) +
      arrow(288, 273, 352, 273, "打乱") +
      grid(366, 171, 3, 3, order, { cell: 68 }) +
      arrow(585, 273, 650, 273) +
      box(664, 207, 239, 124, "排列分类器", "预测打乱采用的排列");
    return (
      s + txt(168, 425, "原始空间布局", 19, C.ink) + txt(468, 425, "置换后的 patch", 19, C.ink)
    );
  };
  r.rotation = (d) => {
    let s = "";
    [0, 90, 180, 270].forEach((a, i) => {
      const x = 140 + i * 227;
      s +=
        `<g transform="rotate(${a} ${x} 261)">` +
        grid(x - 66, 195, 3, 3, ["1", "2", "3", "4", "5", "6", "7", "8", "9"], {
          cell: 44,
          selected: [0, 3, 6, 7],
        }) +
        "</g>" +
        txt(x, 391, `${a}°`, 24, C.green);
    });
    return (
      s +
      txt(480, 133, "已知变换自动给出四分类标签", 21, C.ink) +
      txt(480, 453, "网格仅表示方向变化；模型输入仍是图像", 17, C.muted)
    );
  };
  r.colorization = (d) => {
    let s = flow(["亮度 L", "编码器—解码器", "颜色 a、b"], {
      x: 64,
      w: 832,
      y: 123,
      height: 77,
      subs: ["从原图转换", "预测缺失的颜色", "与原图目标比较"],
      active: step(d, 3),
    });
    if (d.assets?.length) s += images(d, 64, 235, 832, 220, 3);
    else
      s +=
        grid(83, 247, 4, 4, [], {
          cell: 44,
          fills: Array.from(
            { length: 16 },
            (_, i) => `rgb(${90 + i * 7},${90 + i * 7},${90 + i * 7})`,
          ),
        }) +
        arrow(291, 330, 639, 330, "学习亮度与颜色的联系") +
        grid(659, 247, 4, 4, [], {
          cell: 44,
          fills: Array.from({ length: 16 }, (_, i) => [C.green, C.line, C.sand, C.amber][i % 4]),
        });
    return s;
  };
  r["video-color"] = (d) => {
    let s = flow(["参考帧颜色", "跨帧对应", "目标帧着色"], {
      x: 64,
      w: 832,
      y: 128,
      height: 79,
      subs: ["已有的颜色信息", "通过特征建立匹配", "传播颜色并比较目标"],
      active: step(d, 3),
    });
    if (d.assets?.length) s += images(d, 63, 233, 834, 216, 3);
    else {
      [0, 1, 2].forEach((i) => {
        s +=
          patch(132 + i * 291, 275) + txt(202 + i * 291, 448, `帧 t${i ? `+${i}` : ""}`, 19, C.ink);
        if (i < 2) s += arrow(287 + i * 291, 345, 412 + i * 291, 345);
      });
    }
    return s;
  };
  r.inpainting = (d) => {
    let s =
      patch(64, 195, true) +
      txt(136, 384, "遮挡输入", 20, C.ink) +
      arrow(219, 269, 303, 269) +
      box(315, 218, 255, 105, "编码器—解码器", "由上下文预测缺失内容") +
      arrow(579, 270, 668, 270) +
      patch(688, 195, false) +
      txt(758, 384, "完整图作为目标", 20, C.ink);
    return s + txt(480, 451, "损失关注缺失区域；遮挡位置由构造过程确定", 18, C.green);
  };
  r.mae = (d) => {
    let s =
      patch(41, 191, true) +
      txt(110, 384, "随机遮挡", 18, C.ink) +
      arrow(189, 260, 239, 260) +
      box(248, 195, 184, 113, "重型编码器", "只处理可见 patch") +
      arrow(437, 248, 492, 248) +
      box(501, 195, 184, 113, "轻型解码器", "补入 mask token", C.sand) +
      arrow(691, 248, 749, 248) +
      patch(770, 191, false) +
      txt(837, 384, "重建 patch", 18, C.ink);
    return (
      s +
      box(481, 374, 221, 61, "mask token + 位置") +
      arrow(592, 369, 592, 313, "", C.amber) +
      txt(480, 461, "预测目标来自原图；通常只在被遮挡位置计算重建损失", 18, C.green)
    );
  };
  r.reconstruction = (d) => {
    if (d.assets?.length)
      return (
        images(d, 40, 110, 880, 348, 4) +
        txt(480, 475, "输入、遮挡与输出共同说明模型利用了哪些上下文", 14, C.muted)
      );
    return r.mae(d);
  };
  r.contrastive = (d) => {
    let s =
      box(45, 225, 166, 74, "原始样本 x") +
      arrow(215, 261, 304, 159) +
      arrow(215, 261, 304, 368) +
      box(312, 119, 191, 82, "增强视图 x₁") +
      box(312, 326, 191, 82, "增强视图 x₂") +
      arrow(508, 160, 633, 197) +
      arrow(508, 367, 633, 313);
    s +=
      circle(689, 212, 19, "z₁", C.light) +
      circle(705, 310, 19, "z₂", C.light) +
      arrow(691, 236, 702, 284, "拉近", C.green);
    [
      [851, 137],
      [860, 384],
      [789, 259],
    ].forEach(([x, y], i) => {
      s += circle(x, y, 15, "", C.sand, C.amber) + arrow(717, 255, x - 16, y, "", C.amber);
    });
    return s + txt(775, 454, "与其他样本作对照", 18, C.muted);
  };
  r.simclr = (d) => {
    let s = "";
    [0, 1].forEach((i) => {
      const y = 147 + i * 174;
      s += flow([`增强视图 ${i + 1}`, "编码器 f", "投影头 g", `z${i + 1}`], {
        x: 56,
        w: 848,
        y,
        height: 78,
        subs: ["同一原样本", "共享参数", "共享参数", "对比空间"],
        active: step(d, 4),
      });
    });
    s +=
      arrow(820, 229, 820, 315, "对比损失", C.amber) +
      line(369, 230, 369, 315, C.line, true) +
      line(601, 230, 601, 315, C.line, true);
    return (
      s +
      txt(
        480,
        467,
        d.variant === "batch"
          ? "一个批次中的其他视图提供当前对照集合"
          : "下游通常使用编码器输出 h，而非投影 z",
        18,
        C.green,
      )
    );
  };
  r.projection = (d) =>
    flow(["输入 x", "编码器 f", "表示 h", "投影头 g", "向量 z"], {
      x: 40,
      w: 880,
      y: 180,
      height: 88,
      active: 2,
    }) +
    arrow(480, 274, 480, 343) +
    box(352, 355, 257, 75, "下游任务", "使用预训练表示 h") +
    arrow(844, 274, 844, 344) +
    box(702, 355, 214, 75, "对比损失", "约束投影 z", C.sand);
  r.moco = (d) => {
    let s =
      flow(["查询视图", "查询编码器", "q"], {
        x: 50,
        w: 586,
        y: 145,
        height: 82,
        subs: ["当前样本", "梯度更新", "参与损失"],
      }) +
      flow(["键视图", "动量编码器", "k"], {
        x: 50,
        w: 586,
        y: 323,
        height: 82,
        subs: ["配对增强", "参数移动平均", "入队"],
        active: 1,
      });
    s +=
      arrow(346, 232, 346, 317, "动量更新", C.amber) +
      box(714, 195, 189, 151, "键队列", "存储历史 k", C.sand) +
      arrow(642, 366, 785, 352, "新键入队") +
      arrow(707, 245, 639, 192, "对照键") +
      txt(480, 466, "θk ← mθk + (1−m)θq；队列出入保持容量", 18, C.green);
    return s;
  };
  r.dino = (d) => {
    let s =
      flow(["视图 1", "学生网络", "学生分布"], {
        x: 50,
        w: 856,
        y: 133,
        height: 90,
        subs: ["局部 / 全局裁剪", "梯度更新", "温度处理"],
        active: 1,
      }) +
      flow(["视图 2", "教师网络", "教师分布"], {
        x: 50,
        w: 856,
        y: 327,
        height: 90,
        subs: ["全局裁剪", "停止梯度", "中心化 + 温度处理"],
        active: 2,
      });
    s +=
      arrow(480, 228, 480, 321, "参数移动平均", C.amber) +
      arrow(778, 320, 778, 229, "匹配预测分布", C.green) +
      txt(480, 466, "监督来自同一图像的不同视图；教师不接收反向传播梯度", 17, C.muted);
    return s;
  };
  r["dino-v2"] = (d) => {
    let s = flow(d.labels, { x: 45, w: 870, y: 120, height: 88, active: 2 });
    return (
      s +
      (d.assets?.length
        ? images(d, 48, 229, 864, 235, 3)
        : txt(480, 350, "从多样数据中学习可复用的视觉表示", 24, C.green))
    );
  };
}
