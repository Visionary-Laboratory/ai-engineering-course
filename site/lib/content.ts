import first from '@/content/model-foundations/01-neural-networks.json';
import second from '@/content/model-foundations/02-cnns.json';
import third from '@/content/model-foundations/03-rnns-lstms.json';
import fourth from '@/content/model-foundations/04-transformers.json';
import fifth from '@/content/model-foundations/05-self-supervised.json';
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
