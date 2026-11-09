'use client';

import type { MouseEvent } from 'react';
import { romanNumeral, type ContentsGroup } from '@/lib/lecture-contents';

export function LectureContents({
  groups,
  activeTopic,
  onNavigate,
}: {
  groups: ContentsGroup[];
  activeTopic: string;
  onNavigate?: (id: string, event: MouseEvent<HTMLAnchorElement>) => void;
}) {
  return (
    <nav className="page-toc lecture-toc" aria-label="本讲内容">
      <p>本讲内容</p>
      {groups.map((group, index) => (
        <div className="toc-chapter" key={group.id}>
          <a
            className="toc-chapter-heading"
            href={`#${group.id}`}
            onClick={(event) => onNavigate?.(group.id, event)}
          >
            <span className="toc-chapter-number">
              {romanNumeral(index + 1)}
            </span>
            <span>{group.title}</span>
          </a>
          {group.entries.map((entry) => (
            <a
              key={entry.id}
              className={`toc-entry ${activeTopic === entry.id ? 'selected' : ''}`}
              aria-current={activeTopic === entry.id ? 'location' : undefined}
              href={`#${entry.id}`}
              onClick={(event) => onNavigate?.(entry.id, event)}
            >
              {entry.title}
            </a>
          ))}
        </div>
      ))}
    </nav>
  );
}
