import { notFound } from 'next/navigation';
import { CourseShell } from '@/components/course-shell';
import { LectureView } from '@/components/lecture-view';
import { GenerativeLectureView } from '@/components/generative-lecture-view';
import { ParallelLectureEmbed } from '@/components/parallel-lecture-embed';
import { lessons, parallelCourse } from '@/lib/course';
import { getContent } from '@/lib/content';
import { courseUrl } from '@/lib/course-url';

const parallelLessons = parallelCourse.parts.flatMap((part) =>
  part.lectures.map((lecture) => ({ ...lecture, partTitle: part.title })),
);

export function generateStaticParams() {
  return [
    ...lessons.map((lesson) => ({ slug: lesson.slug })),
    ...parallelLessons.map((lesson) => ({ slug: lesson.slug })),
  ];
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const modelLesson = lessons.find((lesson) => lesson.slug === slug);
  const parallelLesson = parallelLessons.find((lesson) => lesson.slug === slug);
  return { title: modelLesson?.title ?? parallelLesson?.title ?? '课程讲义' };
}
export default async function LecturePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const parallelLesson = parallelLessons.find((lesson) => lesson.slug === slug);
  if (parallelLesson) {
    return (
      <CourseShell
        active={slug}
        title={`并行计算 · 第 ${parallelLesson.number} 讲 · ${parallelLesson.title}`}
      >
        <ParallelLectureEmbed
          src={courseUrl(
            `/parallel-computing/lectures/${parallelLesson.sourcePath}/?embedded=1`,
          )}
          title={`第 ${parallelLesson.number} 讲 · ${parallelLesson.title}`}
        />
      </CourseShell>
    );
  }
  const lesson = lessons.find((l) => l.slug === slug);
  if (!lesson) notFound();
  if (slug === '06-generative') {
    return (
      <CourseShell
        active={slug}
        title={`第 ${lesson.number} 讲 · ${lesson.shortTitle}`}
      >
        <GenerativeLectureView lesson={lesson} />
      </CourseShell>
    );
  }
  return (
    <CourseShell
      active={slug}
      title={`第 ${lesson.number} 讲 · ${lesson.shortTitle}`}
    >
      <LectureView key={slug} lesson={lesson} content={getContent(slug)} />
    </CourseShell>
  );
}
