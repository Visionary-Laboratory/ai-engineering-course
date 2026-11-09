import first from '@/content/01-neural-networks.json';
import second from '@/content/02-cnns.json';
import third from '@/content/03-rnns-lstms.json';
import fourth from '@/content/04-transformers.json';
import fifth from '@/content/05-self-supervised.json';
import type { LectureContent } from './lecture-types';
const content: Record<string, LectureContent> = {
  '01-neural-networks': first,
  '02-cnns': second,
  '03-rnns-lstms': third,
  '04-transformers': fourth,
  '05-self-supervised': fifth,
};
export function getContent(slug: string) {
  return content[slug];
}
