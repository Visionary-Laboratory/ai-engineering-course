'use client';
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  GraduationCap,
  Menu,
  Network,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarProvider,
  useSidebar,
} from '@/components/ui/sidebar';
import { lessons, parallelCourse } from '@/lib/course';
import { romanNumeral } from '@/lib/lecture-contents';
import { courseUrl } from '@/lib/course-url';

function Nav({ active }: { active?: string }) {
  const { setOpenMobile } = useSidebar();
  return (
    <Sidebar className="course-sidebar">
      <div className="sidebar-heading">
        课程讲义{' '}
        <span>
          {lessons.length +
            parallelCourse.parts.reduce(
              (count, part) => count + part.lectures.length,
              0,
            )}{' '}
          讲
        </span>
      </div>
      <SidebarContent className="course-nav">
        <a
          href={courseUrl('/')}
          className={`overview-link ${!active ? 'active' : ''}`}
          onClick={() => setOpenMobile(false)}
        >
          <BookOpen size={17} />
          课程概览
        </a>
        <details className="nav-module" open>
          <summary>
            <span className="nav-module-title">
              模型原理 <small>MODEL FOUNDATIONS</small>
            </span>
            <ChevronDown className="nav-module-chevron" size={15} />
          </summary>
          <div className="nav-module-content">
            {lessons.map((lesson) => (
              <details
                className="nav-subpart nav-model-subpart"
                key={lesson.slug}
                open
              >
                <summary
                  className={`nav-subpart-title ${active === lesson.slug ? 'active' : ''}`}
                >
                  <span className="nav-subpart-number">0{lesson.number}</span>
                  <span className="nav-subpart-name">{lesson.shortTitle}</span>
                  <ChevronDown className="nav-subpart-chevron" size={14} />
                </summary>
                <div className="nav-topic-list">
                  {lesson.topics.map((topic, topicIndex) => (
                    <a
                      className="nav-topic-link"
                      href={courseUrl(
                        `/model-foundations/lectures/${lesson.slug}#${lesson.topicAnchors[topicIndex]}`,
                      )}
                      key={topic}
                      onClick={() => setOpenMobile(false)}
                    >
                      <span className="nav-topic-number">
                        {romanNumeral(topicIndex + 1)}
                      </span>
                      <span>{topic}</span>
                    </a>
                  ))}
                </div>
              </details>
            ))}
          </div>
        </details>
        <details className="nav-module parallel-nav-module" open>
          <summary>
            <span className="nav-module-title">
              {parallelCourse.shortTitle}{' '}
              <small>{parallelCourse.english}</small>
            </span>
            <ChevronDown className="nav-module-chevron" size={15} />
          </summary>
          <div className="nav-module-content">
            {parallelCourse.parts.map((part) => (
              <section className="nav-subpart" key={part.number}>
                <p className="nav-subpart-title">
                  <span className="nav-subpart-number">{part.number}</span>
                  <span className="nav-subpart-name">{part.title}</span>
                </p>
                <div className="nav-topic-list">
                  {part.lectures.map((lecture, lectureIndex) => (
                    <a
                      className="nav-topic-link"
                      href={courseUrl(lecture.href)}
                      key={lecture.slug}
                      onClick={() => setOpenMobile(false)}
                    >
                      <span className="nav-topic-number">
                        {romanNumeral(lectureIndex + 1)}
                      </span>
                      <span>{lecture.title}</span>
                    </a>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </details>
        <a className="sidebar-resource" href={courseUrl('/#assessment')}>
          课程考核
        </a>
        <a className="sidebar-resource" href={courseUrl('/#faculty')}>
          授课团队
        </a>
      </SidebarContent>
      <div className="sidebar-footer">
        上海创智学院 <span>2026 秋季</span>
      </div>
    </Sidebar>
  );
}
function MobileMenu() {
  const { toggleSidebar } = useSidebar();
  return (
    <button
      className="icon-button mobile-menu"
      onClick={toggleSidebar}
      aria-label="打开课程目录"
    >
      <Menu size={20} />
    </button>
  );
}
export function CourseShell({
  children,
  active,
  title = '课程概览',
}: {
  children: React.ReactNode;
  active?: string;
  title?: string;
}) {
  return (
    <SidebarProvider
      style={{ '--sidebar-width': '264px' } as React.CSSProperties}
      className="course-app"
    >
      <a href="#main-content" className="skip-link">
        跳转至正文
      </a>
      <header className="site-header">
        <a href={courseUrl('/')} className="brand">
          <span className="brand-mark">
            <Network size={23} />
          </span>
          <span>
            AI 工程学<small>AI ENGINEERING</small>
          </span>
        </a>
        <nav className="header-nav" aria-label="网站导航">
          <a href={courseUrl('/')} className={!active ? 'current' : ''}>
            课程概览
          </a>
          <a href={courseUrl('/model-foundations/lectures/01-neural-networks')}>
            课程讲义
          </a>
          <span className="institution">
            <GraduationCap size={17} />
            上海创智学院
          </span>
        </nav>
      </header>
      <Nav active={active} />
      <div className="site-body">
        <div className="breadcrumb">
          <div>
            <MobileMenu />
            <a href={courseUrl('/')}>AI 工程学</a>
            <ChevronRight size={13} />
            <span>{title}</span>
          </div>
          <span className="breadcrumb-note">
            模型原理 · 系统优化 · 智能体开发
          </span>
        </div>
        {children}
      </div>
    </SidebarProvider>
  );
}
