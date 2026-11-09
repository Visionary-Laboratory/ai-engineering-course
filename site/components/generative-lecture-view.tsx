'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { LectureContents } from '@/components/lecture-contents';
import type { Lesson } from '@/lib/course';
import { lectureContents, type ContentsEntry } from '@/lib/lecture-contents';
import { courseUrl } from '@/lib/course-url';

export function GenerativeLectureView({ lesson }: { lesson: Lesson }) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const cleanupRef = useRef<() => void>(() => {});
  const [height, setHeight] = useState(760);
  const [entries, setEntries] = useState<ContentsEntry[]>([]);
  const [activeTopic, setActiveTopic] = useState<string>(
    lesson.topicAnchors[0],
  );
  const [reading, setReading] = useState(true);

  const navigate = useCallback((id: string) => {
    const frame = frameRef.current;
    const doc = frame?.contentDocument;
    const target = doc?.getElementById(id);
    if (!frame || !doc || !target) return;

    // Use the courseware's own controls to restore reading mode and select a section.
    if (doc.getElementById('read-mode')?.hidden)
      doc.getElementById('read-tab')?.click();
    doc
      .querySelector<HTMLAnchorElement>(`[data-section-link="${id}"]`)
      ?.click();
    setReading(true);
    setActiveTopic(id);
    requestAnimationFrame(() => {
      frame.contentWindow?.scrollTo({ top: 0, behavior: 'instant' });
      window.scrollTo({
        top:
          window.scrollY +
          frame.getBoundingClientRect().top +
          target.getBoundingClientRect().top -
          108,
        behavior: 'instant',
      });
    });
  }, []);

  const onLoad = useCallback(() => {
    cleanupRef.current();
    const frame = frameRef.current;
    const doc = frame?.contentDocument;
    const data = doc?.getElementById('gen-course-data')?.textContent;
    if (!frame || !doc || !data) return;
    const sections: ContentsEntry[] = JSON.parse(data).sections;
    setEntries(sections.map(({ id, title }) => ({ id, title })));

    const syncLayout = () => {
      setReading(!doc.getElementById('read-mode')?.hidden);
      const nextHeight = Math.max(
        760,
        Math.ceil(doc.body.getBoundingClientRect().height),
      );
      setHeight((current) =>
        Math.abs(current - nextHeight) > 2 ? nextHeight : current,
      );
    };
    const resize = new ResizeObserver(syncLayout);
    resize.observe(doc.body);
    syncLayout();

    let pending = 0;
    const syncActive = () => {
      cancelAnimationFrame(pending);
      pending = requestAnimationFrame(() => {
        if (doc.getElementById('read-mode')?.hidden) return;
        const frameTop = frame.getBoundingClientRect().top;
        let current = sections[0].id;
        for (const section of sections) {
          const target = doc.getElementById(section.id);
          if (target && frameTop + target.getBoundingClientRect().top <= 140)
            current = section.id;
        }
        setActiveTopic(current);
      });
    };
    window.addEventListener('scroll', syncActive, { passive: true });
    cleanupRef.current = () => {
      resize.disconnect();
      cancelAnimationFrame(pending);
      window.removeEventListener('scroll', syncActive);
    };
    if (window.location.hash) navigate(window.location.hash.slice(1));
  }, [navigate]);

  useEffect(() => {
    // A cached iframe can finish loading before React attaches its load handler.
    if (frameRef.current?.contentDocument?.readyState === 'complete') onLoad();
    const syncHash = () => navigate(window.location.hash.slice(1));
    window.addEventListener('hashchange', syncHash);
    window.addEventListener('popstate', syncHash);
    return () => {
      cleanupRef.current();
      window.removeEventListener('hashchange', syncHash);
      window.removeEventListener('popstate', syncHash);
    };
  }, [navigate, onLoad]);

  return (
    <main
      id="main-content"
      className="lecture-workspace ai-lecture generative-lecture"
    >
      <div
        className={`lecture-reading-layout ${reading ? '' : 'generative-slides'}`}
      >
        <iframe
          className="parallel-lecture-frame"
          ref={frameRef}
          src={courseUrl('/courseware/generative-models.html?embedded=1')}
          title={`第 ${lesson.number} 讲 · ${lesson.title}`}
          onLoad={onLoad}
          style={{ height }}
        />
        {reading && (
          <LectureContents
            groups={lectureContents(lesson, entries)}
            activeTopic={activeTopic}
            onNavigate={(id, event) => {
              event.preventDefault();
              window.history.pushState({}, '', `#${id}`);
              navigate(id);
            }}
          />
        )}
      </div>
    </main>
  );
}
