'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Grid2X2,
  Maximize,
  Minimize,
  MonitorPlay,
  Play,
  Search,
  ZoomIn,
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Pagination } from '@/components/ui/pagination';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { LectureMarkdown } from '@/components/lecture-markdown';
import { LearningLab } from '@/components/learning-labs';
import { LectureContents } from '@/components/lecture-contents';
import { lessons, type Lesson } from '@/lib/course';
import { lectureContents } from '@/lib/lecture-contents';
import { courseUrl } from '@/lib/course-url';
import {
  slideImage,
  type LectureContent,
  type SourceSlide,
  type Topic,
} from '@/lib/lecture-types';

type Mode = 'read' | 'slides';
function LessonMedia({ slide }: { slide: SourceSlide }) {
  const [playing, setPlaying] = useState(false);
  if (!slide.media.length) return null;
  return (
    <div className="source-media">
      <button
        className="media-trigger"
        aria-expanded={playing}
        onClick={() => setPlaying(!playing)}
      >
        <Play size={15} />
        {playing ? '收起演示' : '观看动态演示'}
        <span>{slide.media.length} 项</span>
      </button>
      {playing && (
        <div className="media-grid">
          {slide.media.map((m, i) => (
            <figure key={m.url}>
              {m.type === 'video' ? (
                <video
                  controls
                  preload="metadata"
                  playsInline
                  src={courseUrl(m.url)}
                  aria-label={`${slide.figure.title}视频演示`}
                />
              ) : (
                <img
                  src={courseUrl(m.url)}
                  alt={`${slide.figure.title}动态演示 ${i + 1}`}
                />
              )}
              <figcaption>
                {slide.figure.title}
                {slide.media.length > 1 ? ` · ${i + 1}` : ''}
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}
function LessonFigure({
  lesson,
  topic,
  slides,
  onPresent,
  onZoom,
}: {
  lesson: Lesson;
  topic: Topic;
  slides: SourceSlide[];
  onPresent: (p: number) => void;
  onZoom: (p: number) => void;
}) {
  const [index, setIndex] = useState(0);
  const slide = slides[index];
  return (
    <figure className="source-figure native-figure">
      <div className="figure-heading">
        <div aria-live="polite">
          <h3>{slide.figure.title}</h3>
          <p>{slide.figure.caption}</p>
        </div>
        <button
          className="figure-present"
          onClick={() => onPresent(slide.page)}
          aria-label={`演示${slide.figure.title}`}
        >
          <MonitorPlay size={16} />
          <span>演示</span>
        </button>
      </div>
      <button
        className="source-image-button"
        onClick={() => onZoom(slide.page)}
        aria-label={`放大图解：${slide.figure.title}`}
      >
        <img
          src={slideImage(lesson.number, slide.page)}
          alt={`${slide.figure.title}。${slide.figure.caption}`}
          loading="lazy"
          width="960"
          height="417"
        />
        <span className="zoom-hint">
          <ZoomIn size={16} />
          放大
        </span>
      </button>
      {slide.figure.note && (
        <figcaption className="diagram-note">{slide.figure.note}</figcaption>
      )}
      {slides.length > 1 && (
        <div className="figure-nav">
          <span>分步理解</span>
          <div>
            <button
              className="icon-button"
              disabled={index === 0}
              onClick={() => setIndex(index - 1)}
              aria-label={`${topic.title}：上一步`}
            >
              <ChevronLeft size={17} />
            </button>
            <Select
              value={index}
              onValueChange={(v) => {
                if (v !== null) setIndex(Number(v));
              }}
            >
              <SelectTrigger
                aria-label={`${topic.title}的图解步骤`}
                className="figure-select"
              >
                步骤 {index + 1} / {slides.length}
              </SelectTrigger>
              <SelectContent>
                {slides.map((s, i) => (
                  <SelectItem key={s.page} value={i}>
                    {i + 1}. {s.figure.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <button
              className="icon-button"
              disabled={index === slides.length - 1}
              onClick={() => setIndex(index + 1)}
              aria-label={`${topic.title}：下一步`}
            >
              <ChevronRight size={17} />
            </button>
          </div>
        </div>
      )}
      <LessonMedia key={`media-${slide.page}`} slide={slide} />
    </figure>
  );
}
export function LectureView({
  lesson,
  content,
}: {
  lesson: Lesson;
  content: LectureContent;
}) {
  const [mode, setMode] = useState<Mode>('read');
  const [page, setPage] = useState(1);
  const [includeHidden, setIncludeHidden] = useState(true);
  const [focused, setFocused] = useState(false);
  const [grid, setGrid] = useState(false);
  const [query, setQuery] = useState('');
  const [zoom, setZoom] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTopic, setActiveTopic] = useState(content.topics[0].id);
  const touchX = useRef<number | null>(null);
  const topicFor = (p: number) =>
    content.topics.find((t) => p >= t.start && p <= t.end)!;
  const topic = topicFor(page);
  const slide = content.slides[page - 1];
  const visibleSlides = useMemo(
    () => content.slides.filter((s) => includeHidden || !s.hidden),
    [content.slides, includeHidden],
  );
  const index = visibleSlides.findIndex((s) => s.page === page);
  function updateUrl(
    nextMode: Mode,
    nextPage: number,
    hidden = includeHidden,
    replace = false,
  ) {
    const url = new URL(window.location.href);
    url.searchParams.set('mode', nextMode);
    url.searchParams.set('page', String(nextPage));
    if (!hidden) url.searchParams.set('hidden', '0');
    else url.searchParams.delete('hidden');
    url.hash = nextMode === 'read' ? topicFor(nextPage).id : '';
    window.history[replace ? 'replaceState' : 'pushState']({}, '', url);
  }
  function go(p: number, nextMode: Mode = mode) {
    const bounded = Math.min(content.slides.length, Math.max(1, p));
    setPage(bounded);
    setMode(nextMode);
    const hidden = includeHidden || content.slides[bounded - 1].hidden;
    if (hidden !== includeHidden) setIncludeHidden(hidden);
    updateUrl(nextMode, bounded, hidden);
    if (nextMode === 'read') {
      setFocused(false);
      setActiveTopic(topicFor(bounded).id);
      requestAnimationFrame(() =>
        document
          .getElementById(topicFor(bounded).id)
          ?.scrollIntoView({ behavior: 'instant' }),
      );
    }
    if (nextMode === 'slides' && mode === 'read')
      window.scrollTo({ top: 0, behavior: 'instant' });
    setGrid(false);
  }
  function switchMode(nextMode: Mode) {
    if (nextMode === 'slides' && mode === 'read') {
      const start =
        content.topics.find((t) => t.id === activeTopic)?.start ?? page;
      go(start, nextMode);
    } else go(page, nextMode);
  }
  function move(delta: number) {
    const next = visibleSlides[index + delta];
    if (next) go(next.page);
  }
  useEffect(() => {
    const read = () => {
      const p = new URLSearchParams(window.location.search);
      const nextMode = p.get('mode') === 'slides' ? 'slides' : 'read';
      const raw = Number(p.get('page'));
      const nextPage =
        Number.isInteger(raw) && raw > 0 && raw <= content.slides.length
          ? raw
          : 1;
      setMode(nextMode);
      if (nextMode === 'read') setFocused(false);
      setPage(nextPage);
      setIncludeHidden(
        p.get('hidden') !== '0' || content.slides[nextPage - 1].hidden,
      );
      setActiveTopic(topicFor(nextPage).id);
      if (nextMode === 'read' && window.location.hash) {
        setTimeout(
          () =>
            document
              .getElementById(window.location.hash.slice(1))
              ?.scrollIntoView(),
          100,
        );
      }
    };
    read();
    window.addEventListener('popstate', read);
    return () => window.removeEventListener('popstate', read);
  }, [lesson.slug]);
  useEffect(() => {
    if (mode !== 'read') return;
    const observer = new IntersectionObserver(
      (entries) => {
        const seen = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (seen[0]) setActiveTopic(seen[0].target.id);
      },
      { rootMargin: '-120px 0px -55% 0px' },
    );
    document
      .querySelectorAll('[data-lecture-topic]')
      .forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, [mode]);
  useEffect(() => {
    document.body.style.overflow = focused ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [focused]);
  useEffect(() => {
    if (mode !== 'slides') return;
    const handler = (event: KeyboardEvent) => {
      if (grid || zoom !== null) return;
      const target = event.target as HTMLElement;
      if (
        target.closest(
          'input,textarea,select,[role="slider"],[role="tab"],[contenteditable="true"]',
        )
      )
        return;
      if (
        event.key === 'ArrowRight' ||
        event.key === 'PageDown' ||
        (event.code === 'Space' && !target.closest('button'))
      ) {
        event.preventDefault();
        move(1);
      }
      if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
        event.preventDefault();
        move(-1);
      }
      if (event.key === 'Home') {
        event.preventDefault();
        go(visibleSlides[0].page);
      }
      if (event.key === 'End') {
        event.preventDefault();
        go(visibleSlides[visibleSlides.length - 1].page);
      }
      if (event.key.toLowerCase() === 'f') setFocused((v) => !v);
      if (event.key === 'Escape') setFocused(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [mode, page, includeHidden, grid, zoom]);
  useEffect(() => {
    if (mode === 'slides') {
      const next = visibleSlides[index + 1];
      if (next) {
        const img = new window.Image();
        img.src = slideImage(lesson.number, next.page);
      }
    }
  }, [page, mode, includeHidden]);
  const searchResults = visibleSlides.filter((s) => {
    const t = topicFor(s.page);
    return (
      !query.trim() ||
      `${s.page} ${t.title} ${t.chapter} ${s.figure.title} ${s.figure.caption} ${s.text.join(' ')}`
        .toLowerCase()
        .includes(query.trim().toLowerCase())
    );
  });
  const previous = lessons.find((l) => l.number === lesson.number - 1),
    next = lessons.find((l) => l.number === lesson.number + 1);
  async function copyLink() {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('mode', mode);
      url.searchParams.set(
        'page',
        String(
          mode === 'read'
            ? (content.topics.find((t) => t.id === activeTopic)?.start ?? page)
            : page,
        ),
      );
      if (mode === 'read') url.hash = activeTopic;
      await navigator.clipboard.writeText(url.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }
  return (
    <main
      id="main-content"
      className={`lecture-workspace ai-lecture ${focused ? 'is-focused' : ''}`}
    >
      <div className="lecture-toolbar">
        <div className="lecture-location">
          <span>LECTURE 0{lesson.number}</span>
          <span>
            杨学 · {content.topics.filter((t) => t.kind === 'lesson').length}{' '}
            个小节
          </span>
        </div>
        <div className="lecture-tools">
          <Tabs value={mode} onValueChange={(v) => switchMode(v as Mode)}>
            <TabsList className="mode-tabs" aria-label="讲义显示方式">
              <TabsTrigger value="read">
                <BookOpen size={16} />
                阅读
              </TabsTrigger>
              <TabsTrigger value="slides">
                <MonitorPlay size={16} />
                演示
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <button
            className="icon-button"
            onClick={() => setGrid(true)}
            aria-label="查找知识点"
            title="查找知识点"
          >
            <Search size={17} />
          </button>
          {mode === 'slides' && (
            <button
              className="icon-button"
              onClick={() => setFocused(!focused)}
              aria-label={focused ? '退出专注演示' : '进入专注演示'}
              title="专注演示（F）"
            >
              {focused ? <Minimize size={17} /> : <Maximize size={17} />}
            </button>
          )}
        </div>
      </div>
      {mode === 'read' ? (
        <div className="lecture-reading-layout">
          <article className="lecture-article">
            <header className="lecture-title">
              <div className="eyebrow">
                <span className="green-rule" />
                模型原理 · 第 {lesson.number} 讲
              </div>
              <h1>{lesson.title}</h1>
              <p className="lecture-en">{lesson.english}</p>
              <p>{lesson.summary}</p>
              <div className="article-metadata">
                <span>授课：杨学</span>
                <span>·</span>
                <span>
                  {content.topics.filter((t) => t.kind === 'lesson').length}{' '}
                  个知识小节
                </span>
                <button onClick={copyLink}>
                  {copied ? <Check size={14} /> : <ExternalLink size={14} />}{' '}
                  {copied ? '已复制' : '复制位置'}
                </button>
              </div>
            </header>
            <div className="chapter-roadmap">
              {content.chapters.map((c, i) => (
                <a
                  href={`#topic-${c.start}`}
                  key={c.start}
                  onClick={() => setActiveTopic(`topic-${c.start}`)}
                >
                  <span>0{i + 1}</span>
                  <strong>{c.title}</strong>
                  <ArrowRight size={14} />
                </a>
              ))}
            </div>
            {content.topics.map((t, i) => (
              <section
                key={t.id}
                id={t.id}
                data-lecture-topic
                className={`article-section ${t.kind === 'divider' ? 'chapter-divider' : ''}`}
              >
                <div className="article-section-label">
                  <span>
                    {t.chapter} / {String(i + 1).padStart(2, '0')}
                  </span>
                  <button onClick={() => go(t.start, 'slides')}>
                    <MonitorPlay size={14} />
                    演示本节
                  </button>
                </div>
                <h2 className="topic-heading">{t.title}</h2>
                <LectureMarkdown text={t.body} />
                {t.lab && <LearningLab kind={t.lab} />}
                <LessonFigure
                  lesson={lesson}
                  topic={t}
                  slides={content.slides.slice(t.start - 1, t.end)}
                  onPresent={(p) => go(p, 'slides')}
                  onZoom={setZoom}
                />
              </section>
            ))}
            <nav className="lecture-pagination" aria-label="前后讲导航">
              {previous ? (
                <a href={courseUrl(`/lectures/${previous.slug}`)}>
                  <span>
                    <ArrowLeft size={15} />
                    上一讲
                  </span>
                  <strong>{previous.title}</strong>
                </a>
              ) : (
                <a href={courseUrl('/')}>
                  <span>
                    <ArrowLeft size={15} />
                    返回
                  </span>
                  <strong>课程概览</strong>
                </a>
              )}
              {next && (
                <a href={courseUrl(`/lectures/${next.slug}`)}>
                  <span>
                    下一讲
                    <ArrowRight size={15} />
                  </span>
                  <strong>{next.title}</strong>
                </a>
              )}
            </nav>
            <footer className="page-footer">
              <span>AI 工程学 · 上海创智学院</span>
              <span>2026 秋季</span>
            </footer>
          </article>
          <LectureContents
            groups={lectureContents(lesson, content.topics)}
            activeTopic={activeTopic}
            onNavigate={(id) => setActiveTopic(id)}
          />
        </div>
      ) : (
        <div className="classroom">
          <div className="classroom-heading">
            <div>
              <span>
                {topic.chapter}
                {slide.hidden && <em>拓展内容</em>}
              </span>
              <h1>{slide.figure.title}</h1>
              <p className="classroom-caption">{slide.figure.caption}</p>
            </div>
            <span className="source-page-number">
              {String(page).padStart(2, '0')}
              <small> / {lesson.pages}</small>
            </span>
          </div>
          <div
            className="classroom-image"
            onTouchStart={(e) => {
              touchX.current = e.touches[0].clientX;
            }}
            onTouchEnd={(e) => {
              if (touchX.current !== null) {
                const d = e.changedTouches[0].clientX - touchX.current;
                if (Math.abs(d) > 70) move(d < 0 ? 1 : -1);
              }
              touchX.current = null;
            }}
          >
            <button
              onClick={() => setZoom(page)}
              aria-label={`放大图解：${slide.figure.title}`}
            >
              <img
                src={slideImage(lesson.number, page)}
                alt={`${slide.figure.title}。${slide.figure.caption}`}
                width="960"
                height="417"
                fetchPriority="high"
              />
            </button>
          </div>
          {slide.figure.note && (
            <p className="diagram-note">{slide.figure.note}</p>
          )}
          <Progress
            className="slide-progress"
            value={((index + 1) / visibleSlides.length) * 100}
            aria-label="本讲翻页进度"
          />
          <div className="classroom-controls">
            <div>
              <button
                className="icon-button"
                onClick={() => setGrid(true)}
                aria-label="打开图解总览"
              >
                <Grid2X2 size={18} />
              </button>
              <button
                className="icon-button"
                onClick={() => setZoom(page)}
                aria-label="放大当前图解"
              >
                <ZoomIn size={18} />
              </button>
              <label className="hidden-toggle">
                <Checkbox
                  checked={includeHidden}
                  onCheckedChange={(hidden) => {
                    setIncludeHidden(hidden);
                    const p =
                      !hidden && slide.hidden
                        ? (content.slides.slice(page).find((s) => !s.hidden)
                            ?.page ??
                          content.slides.find((s) => !s.hidden)!.page)
                        : page;
                    setPage(p);
                    updateUrl(mode, p, hidden);
                  }}
                />
                包含拓展内容
                {lesson.hidden > 0 && <span>（{lesson.hidden}）</span>}
              </label>
            </div>
            <Pagination className="page-turner" aria-label="图解导航">
              <button
                className="button secondary"
                disabled={index === 0}
                onClick={() => move(-1)}
                aria-label="上一图"
              >
                <ChevronLeft size={17} />
                <span>上一图</span>
              </button>
              <span aria-live="polite">
                {index + 1} / {visibleSlides.length}
              </span>
              <button
                className="button primary"
                disabled={index === visibleSlides.length - 1}
                onClick={() => move(1)}
                aria-label="下一图"
              >
                <span>下一图</span>
                <ChevronRight size={17} />
              </button>
            </Pagination>
          </div>
          <p className="classroom-hint">
            <span>← → 切换图解 · F 专注 · Esc 退出</span>
            <button onClick={() => go(page, 'read')}>
              <BookOpen size={14} />
              阅读本节讲解
            </button>
            <button onClick={copyLink}>
              {copied ? '已复制链接' : '复制当前位置'}
            </button>
          </p>
          <LessonMedia key={`media-${page}`} slide={slide} />
          <details className="classroom-explanation">
            <summary>
              本节讲解
              <span>{topic.title}</span>
            </summary>
            <LectureMarkdown text={topic.body} />
            {topic.lab && <LearningLab kind={topic.lab} />}
          </details>
          {index === visibleSlides.length - 1 && (
            <div className="lecture-finish">
              <p>第 {lesson.number} 讲已结束</p>
              {next ? (
                <a
                  className="button primary"
                  href={courseUrl(`/lectures/${next.slug}?mode=slides`)}
                >
                  进入第 {next.number} 讲<ArrowRight size={16} />
                </a>
              ) : (
                <a className="button primary" href={courseUrl('/')}>
                  返回课程概览
                  <ArrowRight size={16} />
                </a>
              )}
            </div>
          )}
        </div>
      )}
      <Dialog open={grid} onOpenChange={setGrid}>
        <DialogContent className="lecture-dialog source-picker">
          <DialogTitle>查找知识点</DialogTitle>
          <DialogDescription>
            第 {lesson.number} 讲 · 搜索概念、关键词或图解编号。
          </DialogDescription>
          <label className="page-search">
            <Search size={18} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="例如：反向传播 / attention / 93"
              aria-label="搜索本讲内容"
            />
          </label>
          <div className="picker-shortcuts">
            {content.chapters.map((c) => (
              <button key={c.start} onClick={() => go(c.start, 'slides')}>
                {c.title}
              </button>
            ))}
          </div>
          <p className="picker-count">
            {searchResults.length} 个图解
            {!includeHidden ? ' · 已隐藏拓展内容' : ''}
          </p>
          <div className="source-grid">
            {searchResults.map((s) => (
              <button
                key={s.page}
                className={s.page === page ? 'selected' : ''}
                onClick={() => go(s.page, 'slides')}
              >
                <img
                  loading="lazy"
                  width="384"
                  height="167"
                  src={slideImage(lesson.number, s.page)}
                  alt=""
                />
                <span>
                  <b>{String(s.page).padStart(2, '0')}</b>
                  {s.hidden && <em>拓展</em>}
                  {s.media.length > 0 && <Play size={12} />}
                </span>
                <strong>{s.figure.title}</strong>
              </button>
            ))}
            {!searchResults.length && (
              <p className="search-empty">没有找到相关内容，请换一个关键词。</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
      <Dialog
        open={zoom !== null}
        onOpenChange={(open) => {
          if (!open) setZoom(null);
        }}
      >
        <DialogContent className="lecture-dialog source-lightbox">
          <DialogTitle>
            {zoom !== null ? content.slides[zoom - 1].figure.title : '图解'}
          </DialogTitle>
          <DialogDescription>
            {zoom !== null ? content.slides[zoom - 1].figure.caption : ''}
          </DialogDescription>
          {zoom !== null && (
            <div className="lightbox-scroll">
              <img
                src={slideImage(lesson.number, zoom)}
                alt={`第 ${zoom} 页图解：${content.slides[zoom - 1].figure.title}`}
                width="960"
                height="417"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
