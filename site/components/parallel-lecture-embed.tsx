'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export function ParallelLectureEmbed({
  src,
  title,
}: {
  src: string;
  title: string;
}) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const observerRef = useRef<ResizeObserver | null>(null);
  const [height, setHeight] = useState(760);
  const [frameSrc, setFrameSrc] = useState(src);

  const syncHeight = useCallback(() => {
    const frame = frameRef.current;
    if (!frame) return;

    const updateHeight = () => {
      const document = frame.contentDocument;
      if (!document) return;
      document.documentElement.classList.toggle(
        'ai-engineering-embedded-compact',
        frame.clientWidth <= 1100,
      );
      const focused = document.querySelector<HTMLElement>(
        '.lecture-workspace.is-focused',
      );
      const content =
        focused?.firstElementChild ??
        document.querySelector('#root') ??
        document.body;
      // The document height is at least the iframe's current viewport height,
      // so measuring it would prevent the frame from shrinking after a long page.
      let contentHeight = Math.max(
        content.scrollHeight,
        content.getBoundingClientRect().height,
      );
      if (focused) {
        const style = frame.contentWindow?.getComputedStyle(focused);
        contentHeight +=
          parseFloat(style?.paddingTop ?? '0') +
          parseFloat(style?.paddingBottom ?? '0');
      }
      const nextHeight = Math.max(1, Math.ceil(contentHeight));
      setHeight((currentHeight) =>
        Math.abs(currentHeight - nextHeight) > 2 ? nextHeight : currentHeight,
      );
    };

    observerRef.current?.disconnect();
    updateHeight();
    const document = frame.contentDocument;
    const content = document?.querySelector('#root') ?? document?.body;
    if (content) {
      observerRef.current = new ResizeObserver(updateHeight);
      observerRef.current.observe(content);
      const tabs =
        document?.querySelector('.lecture-workspace')?.firstElementChild;
      if (tabs) observerRef.current.observe(tabs);
    }
    window.setTimeout(updateHeight, 750);
  }, []);

  useEffect(() => {
    const retry = window.setTimeout(syncHeight, 250);
    return () => {
      observerRef.current?.disconnect();
      window.clearTimeout(retry);
    };
  }, [src, syncHeight]);

  useEffect(() => {
    const syncHash = () => setFrameSrc(`${src}${window.location.hash}`);
    syncHash();
    window.addEventListener('hashchange', syncHash);
    return () => window.removeEventListener('hashchange', syncHash);
  }, [src]);

  return (
    <section className="parallel-lecture-embed" aria-label={title}>
      <iframe
        className="parallel-lecture-frame"
        key={frameSrc}
        ref={frameRef}
        src={frameSrc}
        title={title}
        onLoad={syncHeight}
        style={{ height }}
      />
    </section>
  );
}
