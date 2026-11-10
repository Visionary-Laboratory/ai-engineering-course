import { ArrowRight, BookOpen, MonitorPlay } from 'lucide-react';
import { lessons } from '@/lib/course';
import { courseUrl } from '@/lib/course-url';

export function ModelCourseOutline() {
  return (
    <div className="lecture-list">
      {lessons.map((lesson) => {
        const href = `/model-foundations/lectures/${lesson.slug}`;
        return (
          <article key={lesson.slug}>
            <span className="lecture-list-number">0{lesson.number}</span>
            <div>
              <a href={courseUrl(href)}>
                <h3>
                  {lesson.title}
                  <ArrowRight size={18} />
                </h3>
              </a>
              <p className="lecture-english">{lesson.english}</p>
              <p>{lesson.summary}</p>
              <div className="lecture-topics">
                {lesson.topics.map((topic) => (
                  <span key={topic}>{topic}</span>
                ))}
              </div>
              <div className="lecture-list-actions">
                <a href={courseUrl(href)}>
                  <BookOpen size={15} />
                  阅读
                </a>
                <a href={courseUrl(`${href}?mode=slides`)}>
                  <MonitorPlay size={15} />
                  演示
                </a>
                <span>{lesson.topics.length} 个主题</span>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
