import { notFound } from 'next/navigation';
import { CourseShell } from '@/components/course-shell';
import { ParallelLectureEmbed } from '@/components/parallel-lecture-embed';
import { parallelCourse } from '@/lib/course';
import { courseUrl } from '@/lib/course-url';

const parallelLessons = parallelCourse.parts.flatMap((part) =>
  part.lectures.map((lesson) => ({ ...lesson })),
);

export function generateStaticParams() {
  return parallelLessons.map((lesson) => ({ slug: lesson.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return {
    title:
      parallelLessons.find((lesson) => lesson.slug === slug)?.title ??
      '课程讲义',
  };
}

export default async function LecturePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const lesson = parallelLessons.find((lesson) => lesson.slug === slug);
  if (!lesson) notFound();
  return (
    <CourseShell
      active={slug}
      title={`并行计算 · 第 ${lesson.number} 讲 · ${lesson.title}`}
    >
      <ParallelLectureEmbed
        src={courseUrl(
          `/parallel-computing/lectures/${lesson.sourcePath}/?embedded=1`,
        )}
        title={`第 ${lesson.number} 讲 · ${lesson.title}`}
      />
    </CourseShell>
  );
}
