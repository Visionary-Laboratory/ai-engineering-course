import { notFound } from 'next/navigation';
import { CourseShell } from '@/components/course-shell';
import { LectureView } from '@/components/lecture-view';
import { GenerativeLectureView } from '@/components/generative-lecture-view';
import { lessons } from '@/lib/course';
import { getContent } from '@/lib/content';

export function generateStaticParams() {
  return lessons.map((lesson) => ({ slug: lesson.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return {
    title: lessons.find((lesson) => lesson.slug === slug)?.title ?? '课程讲义',
  };
}

export default async function ModelLecturePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const lesson = lessons.find((lesson) => lesson.slug === slug);
  if (!lesson) notFound();
  return (
    <CourseShell
      active={slug}
      title={`模型原理 · 第 ${lesson.number} 讲 · ${lesson.shortTitle}`}
    >
      {slug === '06-generative' ? (
        <GenerativeLectureView lesson={lesson} />
      ) : (
        <LectureView key={slug} lesson={lesson} content={getContent(slug)} />
      )}
    </CourseShell>
  );
}
