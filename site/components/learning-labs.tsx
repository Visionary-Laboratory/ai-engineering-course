'use client';
import { useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { ArrowRight, RotateCcw } from 'lucide-react';
function Range({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="lab-range">
      <span>
        {label}
        <strong>{value}</strong>
      </span>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={(v) => onChange(Array.isArray(v) ? v[0] : v)}
        thumbProps={{ 'aria-label': label }}
      />
    </div>
  );
}
function Activation() {
  const [kind, setKind] = useState('ReLU');
  const [x, setX] = useState(1);
  const f = (v: number) =>
    kind === 'ReLU'
      ? Math.max(0, v)
      : kind === 'Sigmoid'
        ? 1 / (1 + Math.exp(-v))
        : Math.max(0.1 * v, v);
  const grad =
    kind === 'Sigmoid'
      ? f(x) * (1 - f(x))
      : x > 0
        ? 1
        : x < 0
          ? kind === 'ReLU'
            ? 0
            : 0.1
          : NaN;
  const path = Array.from({ length: 121 }, (_, i) => {
    const v = -4 + i / 15;
    return `${i ? 'L' : 'M'}${36 + (v + 4) * 52},${203 - f(v) * 40}`;
  }).join(' ');
  return (
    <>
      <div className="lab-choice">
        {['ReLU', 'Leaky ReLU', 'Sigmoid'].map((t) => (
          <button key={t} aria-pressed={kind === t} onClick={() => setKind(t)}>
            {t}
          </button>
        ))}
      </div>
      <svg
        viewBox="0 0 490 240"
        role="img"
        aria-label={`${kind} 函数曲线，当前位置 x=${x}`}
      >
        <path d="M36 203H465 M244 25V224" stroke="#c5d6cc" fill="none" />
        {[-4, -2, 0, 2, 4].map((v) => (
          <text
            key={v}
            x={36 + (v + 4) * 52}
            y={233}
            textAnchor="middle"
            fontSize="13"
            fill="#667e71"
          >
            {v}
          </text>
        ))}
        <path d={path} fill="none" stroke="#176653" strokeWidth="3" />
        <path
          d={`M${36 + (x + 4) * 52} 203 V${203 - f(x) * 40} H244`}
          stroke="#a4bdae"
          fill="none"
          strokeDasharray="4 4"
        />
        <circle
          cx={36 + (x + 4) * 52}
          cy={203 - f(x) * 40}
          r="5"
          fill="#bd8349"
        />
        <text x="253" y="22" fontSize="14" fill="#567162">
          f(x)
        </text>
      </svg>
      <Range
        label="输入 x"
        value={x}
        min={-4}
        max={4}
        step={0.1}
        onChange={setX}
      />
      <p className="lab-result" aria-live="polite">
        输出 <strong>{f(x).toFixed(3)}</strong>
        <span>
          局部导数{' '}
          <strong>{Number.isNaN(grad) ? '此处不可导' : grad.toFixed(3)}</strong>
        </span>
      </p>
    </>
  );
}
const matrix = [
  [1, 2, 0, 1, 3],
  [0, 1, 2, 2, 1],
  [3, 0, 1, 0, 2],
  [1, 2, 3, 1, 0],
  [2, 1, 0, 2, 1],
];
const kernel = [
  [1, 0, -1],
  [1, 0, -1],
  [1, 0, -1],
];
function Convolution() {
  const [step, setStep] = useState(0);
  const y = Math.floor(step / 3),
    x = step % 3;
  const output = (r: number, c: number) =>
    kernel.reduce(
      (sum, row, i) =>
        sum + row.reduce((s, v, j) => s + v * matrix[r + i][c + j], 0),
      0,
    );
  return (
    <>
      <div className="conv-lab">
        <div>
          <span>输入 5 × 5</span>
          <div
            className="number-grid"
            style={{ gridTemplateColumns: 'repeat(5,1fr)' }}
          >
            {matrix.flatMap((row, r) =>
              row.map((v, c) => (
                <span
                  className={
                    r >= y && r < y + 3 && c >= x && c < x + 3 ? 'selected' : ''
                  }
                  key={`${r}-${c}`}
                >
                  {v}
                </span>
              )),
            )}
          </div>
        </div>
        <b>∗</b>
        <div>
          <span>卷积核 3 × 3</span>
          <div className="number-grid">
            {kernel.flat().map((v, i) => (
              <span key={i}>{v}</span>
            ))}
          </div>
        </div>
        <ArrowRight />
        <div>
          <span>输出 3 × 3</span>
          <div className="number-grid">
            {Array.from({ length: 9 }, (_, i) => (
              <button
                key={i}
                aria-label={`查看输出第 ${Math.floor(i / 3) + 1} 行第 ${(i % 3) + 1} 列`}
                aria-pressed={step === i}
                onClick={() => setStep(i)}
              >
                {output(Math.floor(i / 3), i % 3)}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="lab-choice">
        <button disabled={step === 0} onClick={() => setStep(step - 1)}>
          上一位置
        </button>
        <span>窗口 {step + 1} / 9</span>
        <button disabled={step === 8} onClick={() => setStep(step + 1)}>
          下一位置
        </button>
      </div>
      <p className="lab-result" aria-live="polite">
        局部乘加结果：<strong>{output(y, x)}</strong>
      </p>
      <p className="lab-footnote">
        步幅 1、无填充、无偏置。按神经网络中常用的互相关计算方式，核不翻转。
      </p>
    </>
  );
}
function Recurrence() {
  const [w, setW] = useState(0.8);
  const [step, setStep] = useState(0);
  const xs = [1, 0, 0, 0, 0, 0];
  const hs = xs.reduce<number[]>(
    (arr, x, i) => [...arr, Math.tanh(x + w * (arr[i - 1] ?? 0))],
    [],
  );
  return (
    <>
      <p>输入序列 [1, 0, 0, 0, 0, 0]，初始状态为 0。</p>
      <Range
        label="递归权重 w"
        value={w}
        min={0}
        max={1.5}
        step={0.1}
        onChange={setW}
      />
      <div className="state-chain">
        {hs.map((h, i) => (
          <button
            key={i}
            className={step === i ? 'selected' : ''}
            onClick={() => setStep(i)}
          >
            <small>t = {i + 1}</small>
            <span style={{ height: `${15 + Math.abs(h) * 65}px` }} />
            <strong>{h.toFixed(3)}</strong>
          </button>
        ))}
      </div>
      <p className="lab-result" aria-live="polite">
        h<sub>{step + 1}</sub> = tanh({xs[step]} + {w} ×{' '}
        {(hs[step - 1] ?? 0).toFixed(3)}) ={' '}
        <strong>{hs[step].toFixed(3)}</strong>
      </p>
      <p className="lab-footnote">
        一维状态示意，用于观察首次输入如何影响后续状态；实际 RNN
        使用向量与矩阵。
      </p>
    </>
  );
}
function Attention() {
  const [temp, setTemp] = useState(1);
  const [query, setQuery] = useState(0);
  const tokens = ['学生', '阅读', '课件'];
  const keys = [
    [1, 0],
    [0, 1],
    [1, 1],
  ];
  const q = keys[query];
  const scores = keys.map(
    (k) => (q[0] * k[0] + q[1] * k[1]) / Math.sqrt(2) / temp,
  );
  const exp = scores.map((v) => Math.exp(v));
  const weights = exp.map((v) => v / exp.reduce((a, b) => a + b, 0));
  const values = [1, 2, 4];
  return (
    <>
      <p>选择查询位置，观察它对三个位置分配的权重。</p>
      <div className="lab-choice">
        {tokens.map((t, i) => (
          <button
            key={t}
            aria-pressed={query === i}
            onClick={() => setQuery(i)}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="attention-bars">
        {tokens.map((t, i) => (
          <div key={t}>
            <span>
              {t}
              <small>K = [{keys[i].join(', ')}]</small>
            </span>
            <div>
              <i style={{ width: `${weights[i] * 100}%` }} />
            </div>
            <strong>{(weights[i] * 100).toFixed(1)}%</strong>
          </div>
        ))}
      </div>
      <Range
        label="温度 τ"
        value={temp}
        min={0.2}
        max={2}
        step={0.1}
        onChange={setTemp}
      />
      <p className="lab-result" aria-live="polite">
        V = [1, 2, 4]，加权输出{' '}
        <strong>
          {weights.reduce((s, w, i) => s + w * values[i], 0).toFixed(3)}
        </strong>
      </p>
      <p className="lab-footnote">
        二维 Q / K、标量 V 的简化示例。分数为 QKᵀ / (√2 · τ)；τ = 1
        对应本例的标准缩放。
      </p>
    </>
  );
}
function Masking() {
  const [ratio, setRatio] = useState(75);
  const [seed, setSeed] = useState(1);
  const order = Array.from({ length: 64 }, (_, i) => i).sort(
    (a, b) =>
      Math.sin((a + 1) * 91.17 + seed * 37) -
      Math.sin((b + 1) * 91.17 + seed * 37),
  );
  const hidden = new Set(order.slice(0, Math.round((64 * ratio) / 100)));
  return (
    <>
      <div
        className="mask-grid"
        role="img"
        aria-label={`8 乘 8 图像块，遮挡 ${hidden.size} 块，保留 ${64 - hidden.size} 块`}
      >
        {Array.from({ length: 64 }, (_, i) => {
          const r = Math.floor(i / 8),
            c = i % 8;
          return (
            <span
              key={i}
              style={{
                background: hidden.has(i)
                  ? '#dbe4df'
                  : r < 3
                    ? '#c4dfe7'
                    : r < 5 && c > 1 && c < 6
                      ? '#497b60'
                      : r >= 5 && c > 2 && c < 5
                        ? '#a2764d'
                        : '#95b68e',
              }}
            >
              {hidden.has(i) ? '·' : ''}
            </span>
          );
        })}
      </div>
      <Range
        label="遮挡比例（%）"
        value={ratio}
        min={0}
        max={95}
        step={5}
        onChange={setRatio}
      />
      <div className="lab-choice">
        <button onClick={() => setSeed(seed + 1)}>
          <RotateCcw size={14} />
          重新遮挡
        </button>
        <span>可见 {64 - hidden.size} / 64 块</span>
      </div>
      <p className="lab-footnote">
        示意图仅展示遮挡输入，不运行重建模型。MAE
        编码器处理可见块，解码器学习重建被遮挡区域。
      </p>
    </>
  );
}
export function LearningLab({ kind }: { kind: string }) {
  const contents: Record<string, React.ReactNode> = {
    activation: <Activation />,
    convolution: <Convolution />,
    recurrence: <Recurrence />,
    attention: <Attention />,
    masking: <Masking />,
  };
  return (
    <figure className="learning-lab">
      <figcaption>
        <span>动手观察</span>
        <small>对应本节概念的简化实验</small>
      </figcaption>
      {contents[kind]}
    </figure>
  );
}
