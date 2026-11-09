// Shared vector vocabulary for the five lectures. All teaching figures are redrawn.
export const C = {
  ink: "#263f35",
  muted: "#667f72",
  green: "#176653",
  light: "#e9f3ee",
  line: "#a8c2b4",
  amber: "#b47936",
  sand: "#fbf0dd",
  blue: "#497b98",
  pale: "#ecf3f8",
  red: "#b56660",
  white: "#ffffff",
};
export const esc = (v) =>
  String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
const widthOf = (s) => [...s].reduce((n, c) => n + (/[\u2e80-\uffff]/.test(c) ? 1 : 0.56), 0);
export function wrap(s, max = 16) {
  let lines = [],
    line = "";
  for (const part of String(s).split("\n")) {
    for (const c of part) {
      if (widthOf(line + c) > max) {
        lines.push(line);
        line = "";
      }
      line += c;
    }
    lines.push(line);
    line = "";
  }
  return lines;
}
const subChars = "₀₁₂₃₄₅₆₇₈₉₊₋₌₍₎ₐₑₒₓₔₕₖₗₘₙₚₛₜᵢⱼᵣᵤᵥ";
const subPlain = "0123456789+-=()aeoxəhklmnpstijruv";
const superChars = "⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻⁽⁾ᵀᵗᵏᵈʰˣʸᴼ";
const superPlain = "0123456789+-()TtkdhxyO";
function mathText(s) {
  let out = "",
    mode = "",
    group = "";
  const flush = () => {
    if (!group) return;
    out += mode
      ? `<tspan baseline-shift="${mode}" font-size="72%">${esc(group)}</tspan>`
      : esc(group);
    group = "";
  };
  for (const c of s) {
    const si = subChars.indexOf(c),
      su = superChars.indexOf(c),
      m = si >= 0 ? "sub" : su >= 0 ? "super" : "";
    if (m !== mode) {
      flush();
      mode = m;
    }
    group += si >= 0 ? subPlain[si] : su >= 0 ? superPlain[su] : c;
  }
  flush();
  return out;
}
export function txt(x, y, s, size = 19, color = C.ink, anchor = "middle", max = 999, weight = 400) {
  const lines = wrap(s, max);
  return `<text x="${x}" y="${y}" fill="${color}" font-size="${size}" font-weight="${weight}" text-anchor="${anchor}">${lines.map((l, i) => `<tspan x="${x}" dy="${i ? size * 1.45 : 0}">${mathText(l)}</tspan>`).join("")}</text>`;
}

export function box(x, y, w, h, title, sub = "", fill = C.light, stroke = C.line) {
  let content = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="9" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>`;
  const lines = wrap(title, (w - 26) / 19);
  content += txt(
    x + w / 2,
    y + (sub ? 28 : h / 2 - (lines.length - 1) * 13 + 7),
    title,
    19,
    C.ink,
    "middle",
    (w - 26) / 19,
    550,
  );
  if (sub) content += txt(x + w / 2, y + 57, sub, 14, C.muted, "middle", (w - 22) / 14);
  return content;
}
export function line(x1, y1, x2, y2, color = C.line, dash = false, width = 2) {
  return `<path d="M${x1} ${y1} L${x2} ${y2}" stroke="${color}" stroke-width="${width}" fill="none"${dash ? ' stroke-dasharray="5 5"' : ""}/>`;
}
export function arrow(x1, y1, x2, y2, label = "", color = C.green, dashed = false) {
  const angle = Math.atan2(y2 - y1, x2 - x1),
    len = 9;
  return (
    line(x1, y1, x2, y2, color, dashed, 2) +
    `<path d="M${x2 - len * Math.cos(angle - 0.48)} ${y2 - len * Math.sin(angle - 0.48)} L${x2} ${y2} L${x2 - len * Math.cos(angle + 0.48)} ${y2 - len * Math.sin(angle + 0.48)}" fill="none" stroke="${color}" stroke-width="2"/>` +
    (label ? txt((x1 + x2) / 2, (y1 + y2) / 2 - 9, label, 14, color) : "")
  );
}
export function path(d, color = C.green, width = 2, dash = false) {
  return `<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}"${dash ? ' stroke-dasharray="6 5"' : ""}/>`;
}
export function circle(x, y, r, text = "", fill = C.light, stroke = C.green) {
  return (
    `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="1.7"/>` +
    (text ? txt(x, y + 6, text, 18, stroke) : "")
  );
}
export function pill(x, y, w, label, color = C.green) {
  return (
    `<rect x="${x}" y="${y}" width="${w}" height="30" rx="15" fill="${color}" fill-opacity=".09"/>` +
    txt(x + w / 2, y + 21, label, 14, color)
  );
}
export function grid(x, y, rows, cols, values = [], options = {}) {
  const cell = options.cell ?? 42;
  let out = "";
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      const i = r * cols + c;
      const selected = options.selected?.includes(i);
      const fill = options.fills?.[i] ?? (selected ? C.green : C.white);
      out += `<rect x="${x + c * cell}" y="${y + r * cell}" width="${cell - 3}" height="${cell - 3}" rx="3" fill="${fill}" stroke="${C.line}"/>`;
      if (values[i] !== undefined && values[i] !== "")
        out += txt(
          x + c * cell + (cell - 3) / 2,
          y + r * cell + cell / 2 + 5,
          values[i],
          options.font ?? 17,
          selected ? "white" : C.ink,
        );
    }
  return out;
}
export function flow(
  labels,
  { y = 220, x = 40, w = 880, height = 92, subs = [], active = -1, vertical = false } = {},
) {
  const gap = 30;
  let result = "";
  if (vertical) {
    const h = 58;
    labels.forEach((t, i) => {
      result += box(x, y + i * (h + gap), w, h, t, "", i === active ? C.sand : C.light);
      if (i < labels.length - 1)
        result += arrow(x + w / 2, y + i * (h + gap) + h, x + w / 2, y + (i + 1) * (h + gap));
    });
    return result;
  }
  const bw = (w - gap * (labels.length - 1)) / labels.length;
  labels.forEach((t, i) => {
    result += box(
      x + i * (bw + gap),
      y,
      bw,
      height,
      t,
      subs[i] ?? "",
      i === active ? C.sand : C.light,
    );
    if (i < labels.length - 1)
      result += arrow(
        x + i * (bw + gap) + bw + 2,
        y + height / 2,
        x + (i + 1) * (bw + gap) - 3,
        y + height / 2,
      );
  });
  return result;
}
export function axes(x, y, w, h, xlabel, ylabel) {
  return (
    arrow(x, y + h, x + w + 8, y + h, "", C.muted) +
    arrow(x, y + h, x, y - 8, "", C.muted) +
    txt(x + w, y + h + 30, xlabel, 14, C.muted) +
    txt(x + 6, y - 19, ylabel, 14, C.muted, "start")
  );
}
export function plot(
  fn,
  {
    x = 110,
    y = 140,
    w = 700,
    h = 260,
    xmin = 0,
    xmax = 1,
    ymin = 0,
    ymax = 1,
    color = C.green,
    dash = false,
  } = {},
) {
  let d = "";
  for (let i = 0; i <= 150; i++) {
    const xv = xmin + ((xmax - xmin) * i) / 150;
    const v = fn(xv);
    const py = y + h - ((v - ymin) / (ymax - ymin)) * h;
    if (Number.isFinite(py))
      d += `${d ? "L" : "M"}${(x + (w * i) / 150).toFixed(2)} ${Math.max(y - 4, Math.min(y + h + 4, py)).toFixed(2)} `;
  }
  return path(d, color, 3, dash);
}
export function table(x, y, width, headers, rows, options = {}) {
  const widths = options.widths ?? headers.map(() => width / headers.length),
    rh = options.rowHeight ?? 42;
  let out = "",
    xx = x;
  headers.forEach((h, i) => {
    out +=
      `<rect x="${xx}" y="${y}" width="${widths[i]}" height="${rh}" fill="${C.light}"/>` +
      txt(xx + 12, y + rh / 2 + 6, h, 16, C.green, "start", widths[i] / 16 - 1, 600);
    xx += widths[i];
  });
  rows.forEach((r, ri) => {
    let cx = x;
    r.forEach((v, i) => {
      out +=
        `<rect x="${cx}" y="${y + (ri + 1) * rh}" width="${widths[i]}" height="${rh}" fill="${ri % 2 ? C.white : "#f7faf8"}"/>` +
        txt(cx + 12, y + (ri + 1.5) * rh + 6, v, 15, C.ink, "start", widths[i] / 15 - 1);
      cx += widths[i];
    });
  });
  return out;
}
export function network({
  layers = [3, 4, 3, 2],
  x = 110,
  y = 120,
  w = 700,
  h = 280,
  active = -1,
  backward = false,
} = {}) {
  let out = "",
    pos = layers.map((n, i) =>
      Array.from({ length: n }, (_, j) => ({
        x: x + (i * w) / (layers.length - 1),
        y: y + ((j + 1) * h) / (n + 1),
      })),
    );
  for (let i = 0; i < pos.length - 1; i++)
    for (const a of pos[i])
      for (const b of pos[i + 1])
        out += line(
          a.x + 17,
          a.y,
          b.x - 17,
          b.y,
          i === active ? C.green : "#cfdfd5",
          false,
          i === active ? 2 : 1,
        );
  pos.forEach((layer, i) => {
    layer.forEach((p, j) => {
      out += circle(
        p.x,
        p.y,
        18,
        `${i ? "h" : "x"}${j + 1}`,
        i === active ? C.sand : C.white,
        i === active ? C.amber : C.green,
      );
    });
    out += txt(
      layer[0].x,
      y + h + 22,
      i === 0 ? "输入层" : i === layers.length - 1 ? "输出层" : `隐藏层 ${i}`,
      15,
      C.muted,
    );
  });
  if (backward) out += arrow(x + w, y - 15, x, y - 15, "误差反向传播", C.amber);
  return out;
}
// Keep headings, captions and navigation in the document, outside the graphic.
export function svg(body, { title, subtitle = "", note = "" } = {}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="417" viewBox="0 72 960 417" role="img" aria-label="${esc(title)}"><title>${esc(title)}</title><desc>${esc(subtitle + " " + note)}</desc><g font-family="PingFang SC,Microsoft YaHei,Arial,sans-serif">${body}</g></svg>`;
}
