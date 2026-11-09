'use client';
import Markdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import { courseUrl } from '@/lib/course-url';
export function LectureMarkdown({ text }: { text: string }) {
  return (
    <div className="lecture-markdown">
      <Markdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          a: ({ href, ...props }) => (
            <a {...props} href={href ? courseUrl(href) : href} />
          ),
          img: ({ src, ...props }) => (
            <img
              {...props}
              src={typeof src === 'string' ? courseUrl(src) : src}
            />
          ),
        }}
      >
        {text}
      </Markdown>
    </div>
  );
}
