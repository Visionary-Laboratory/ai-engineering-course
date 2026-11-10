import { courseUrl } from '@/lib/course-url';

export type SourceSlide = {
  page: number;
  text: string[];
  hidden: boolean;
  media: { url: string; type: string }[];
  links: string[];
  figure: {
    title: string;
    caption: string;
    note: string;
    kind: string;
    url: string;
    sourceElements: {
      url: string;
      lesson: number;
      page: number;
      crop?: number[];
    }[];
  };
};
export type Topic = {
  id: string;
  start: number;
  end: number;
  title: string;
  body: string;
  chapter: string;
  lab: string | null;
  kind: string;
};
export type LectureContent = {
  file: string;
  slides: SourceSlide[];
  topics: Topic[];
  chapters: { start: number; title: string }[];
};
export function slideImage(lesson: number, page: number) {
  return courseUrl(`/model-foundations/diagrams/${lesson}/${page}.svg`);
}
