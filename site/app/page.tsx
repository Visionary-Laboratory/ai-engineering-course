import { ArrowRight, BookOpen, Cpu, MonitorPlay } from 'lucide-react';
import { CourseShell } from '@/components/course-shell';
import { lessons, parallelCourse } from '@/lib/course';
import { courseUrl } from '@/lib/course-url';
export default function Home() {
  return (
    <CourseShell>
      <div className="reading-layout">
        <main id="main-content" className="home-content">
          <section className="course-intro">
            <div className="eyebrow">
              <span className="green-rule" />
              上海创智学院 · 2026 秋季
            </div>
            <h1>AI 工程学</h1>
            <p className="english-title">AI Engineering</p>
            <p className="intro-copy">
              理解模型如何计算、如何学习，
              <br />
              建立连接模型、系统与智能体的工程基础。
            </p>
            <div className="intro-actions">
              <a
                className="button primary"
                href={courseUrl('/lectures/01-neural-networks')}
              >
                <BookOpen size={17} />
                阅读第一讲
                <ArrowRight size={16} />
              </a>
              <a
                className="button secondary"
                href={courseUrl('/lectures/01-neural-networks?mode=slides')}
              >
                <MonitorPlay size={18} />
                开始授课
              </a>
            </div>
            <div className="course-metadata">
              <span>
                <strong>3</strong> 学分
              </span>
              <i />
              <span>
                <strong>48</strong> 学时
              </span>
              <i />
              <span>
                <strong>16</strong> 周
              </span>
              <i />
              <span>核心基础必修课</span>
            </div>
          </section>
          <section className="course-section" id="lectures">
            <div className="section-title">
              <h2>模型原理</h2>
              <span>MODEL FOUNDATIONS</span>
            </div>
            <div className="lecture-list">
              {lessons.map((l) => (
                <article key={l.slug}>
                  <span className="lecture-list-number">0{l.number}</span>
                  <div>
                    <a href={courseUrl(`/lectures/${l.slug}`)}>
                      <h3>
                        {l.title}
                        <ArrowRight size={18} />
                      </h3>
                    </a>
                    <p className="lecture-english">{l.english}</p>
                    <p>{l.summary}</p>
                    <div className="lecture-topics">
                      {l.topics.map((t) => (
                        <span key={t}>{t}</span>
                      ))}
                    </div>
                    <div className="lecture-list-actions">
                      <a href={courseUrl(`/lectures/${l.slug}`)}>
                        <BookOpen size={15} />
                        阅读
                      </a>
                      <a href={courseUrl(`/lectures/${l.slug}?mode=slides`)}>
                        <MonitorPlay size={15} />
                        演示
                      </a>
                      <span>{l.topics.length} 个主题</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
          <section className="course-section" id="parallel-computing">
            <div className="section-title">
              <h2>并行计算</h2>
              <span>{parallelCourse.english}</span>
            </div>
            <p className="section-description">
              理解并行的思想，掌握 GPU 的语言，从 CUDA 编程基础走向现代 AI
              算子的设计与优化。
            </p>
            <div className="parallel-course-outline">
              {parallelCourse.parts.map((part) => (
                <article className="parallel-course-part" key={part.number}>
                  <div className="parallel-course-heading">
                    <span className="parallel-course-number">
                      PART {part.number}
                    </span>
                    <Cpu size={19} aria-hidden="true" />
                    <h3>{part.title}</h3>
                  </div>
                  <p>{part.summary}</p>
                  <div className="parallel-course-lessons">
                    {part.lectures.map((lecture) => (
                      <a href={courseUrl(lecture.href)} key={lecture.number}>
                        <span>{lecture.number}</span>
                        <strong>{lecture.title}</strong>
                        <ArrowRight size={15} aria-hidden="true" />
                      </a>
                    ))}
                  </div>
                </article>
              ))}
            </div>
            <div className="parallel-course-action">
              <a
                className="button secondary"
                href={courseUrl(parallelCourse.href)}
              >
                <BookOpen size={17} />
                进入并行计算与算子编程
                <ArrowRight size={16} />
              </a>
            </div>
          </section>
          <section className="course-section" id="assessment">
            <div className="section-title">
              <h2>课程考核</h2>
            </div>
            <div className="assessment-grid ai-assessment">
              <div>
                <span>工程习题</span>
                <strong>
                  30<small>%</small>
                </strong>
                <p>共 3 个题目，依据正确性和性能评分。</p>
              </div>
              <div>
                <span>出席与课堂表现</span>
                <strong>
                  10<small>%</small>
                </strong>
                <p>根据出席率与课堂表现评分。</p>
              </div>
              <div>
                <span>期末考试</span>
                <strong>
                  60<small>%</small>
                </strong>
                <p>考查课程知识与方法的掌握情况。</p>
              </div>
            </div>
          </section>
          <section className="course-section" id="faculty">
            <div className="section-title">
              <h2>授课团队</h2>
            </div>
            <p>授课顺序：杨学、张少锋、钟志航、夏纫秋、任麒冰。</p>
            <p>课程负责人：钟志航。前五讲由杨学老师主讲。</p>
          </section>
          <footer className="page-footer">
            <span>AI 工程学</span>
            <span>上海创智学院 · 2026 秋季</span>
          </footer>
        </main>
        <aside className="page-toc">
          <p>本页内容</p>
          <a href="#lectures">模型原理</a>
          <a href="#parallel-computing">并行计算</a>
          <a href="#assessment">课程考核</a>
          <a href="#faculty">授课团队</a>
          <div className="toc-divider" />
          <p>课程内容</p>
          <span>
            模型原理
            <br />
            并行计算
            <br />
            系统优化
            <br />
            智能体开发
          </span>
        </aside>
      </div>
    </CourseShell>
  );
}
