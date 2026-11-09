import type { Metadata } from 'next';
import 'katex/dist/katex.min.css';
import './globals.css';
import { courseUrl } from '@/lib/course-url';
export const metadata: Metadata = {
  title: { default: 'AI 工程学', template: '%s · AI 工程学' },
  icons: { icon: courseUrl('/favicon.svg') },
  description:
    '上海创智学院 AI 工程学。人工神经网络、卷积网络、序列模型、Transformer 与自监督学习。',
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
