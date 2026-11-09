import { courseUrl } from '@/lib/course-url';

export default function NotFound() {
  return (
    <main className="not-found">
      <p>AI 工程学 · 404</p>
      <h1>这一页暂不存在</h1>
      <p>请从课程概览选择前五讲内容。</p>
      <a className="button primary" href={courseUrl('/')}>
        返回课程概览
      </a>
    </main>
  );
}
