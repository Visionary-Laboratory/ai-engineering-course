import { CourseShell } from '@/components/course-shell';
import { ModelCourseOutline } from '@/components/model-course-outline';

export const metadata = { title: '模型原理' };

export default function ModelFoundationsPage() {
  return (
    <CourseShell title="模型原理">
      <div className="reading-layout">
        <main id="main-content" className="home-content">
          <section className="course-intro">
            <div className="eyebrow">
              <span className="green-rule" />
              AI 工程学 · 模型原理
            </div>
            <h1>模型原理</h1>
            <p className="english-title">Model Foundations</p>
            <p className="intro-copy">
              从神经网络基础出发，理解视觉、序列、自监督与生成模型。
            </p>
          </section>
          <section className="course-section" id="lectures">
            <div className="section-title">
              <h2>课程讲义</h2>
              <span>6 LECTURES</span>
            </div>
            <ModelCourseOutline />
          </section>
        </main>
      </div>
    </CourseShell>
  );
}
