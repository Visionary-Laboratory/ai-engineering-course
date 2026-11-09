import type { Lesson } from '@/lib/course';

export type ContentsEntry = { id: string; title: string; kind?: string };
export type ContentsGroup = ContentsEntry & { entries: ContentsEntry[] };

export function romanNumeral(position: number) {
  return ['I', 'II', 'III', 'IV', 'V', 'VI'][position - 1] ?? String(position);
}

export function lectureContents(
  lesson: Lesson,
  entries: ContentsEntry[],
): ContentsGroup[] {
  return lesson.topics.map((title, index) => {
    const id = lesson.topicAnchors[index];
    const start = entries.findIndex((entry) => entry.id === id);
    const next = lesson.topicAnchors[index + 1];
    const end = next
      ? entries.findIndex((entry) => entry.id === next)
      : entries.length;
    return {
      id,
      title,
      entries:
        start < 0
          ? []
          : entries
              .slice(start, end)
              .filter((entry) => !entry.kind || entry.kind === 'lesson'),
    };
  });
}
