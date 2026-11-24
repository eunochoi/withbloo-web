import type { DiaryEmotionGroup, DiarySeason } from '@/common/constants/diaryFilters';
import type { DiaryData, DiaryImage } from './diary';

export const FEED_KINDS = ['diary', 'habit', 'sober'] as const;
export type FeedKind = (typeof FEED_KINDS)[number];
export const FEED_KIND_LABELS: Record<FeedKind, string> = { diary: '일기', habit: '습관', sober: '거리두기' };

export interface FeedFilters {
  kinds: FeedKind[];
  year: number | null;
  seasons: DiarySeason[];
  groups: DiaryEmotionGroup[];
}

export const DEFAULT_FEED_FILTERS: FeedFilters = {
  kinds: [...FEED_KINDS],
  year: null,
  seasons: [],
  groups: [],
};

export type FeedCursor = { date: string; orderAt: string; source: number; id: number };

export type FeedActivity = {
  kind: 'habit' | 'sober';
  id: number;
  date: string;
  parentId: number;
  name: string;
  initialStartedAt: string;
  iconKey: string;
  iconColor: string;
  recordedAt: string;
  timeLabel: string;
  isRestart: boolean;
  memo: string | null;
  images: DiaryImage[];
};

export type FeedItem =
  | { kind: 'diary'; id: number; date: string; diary: DiaryData }
  | FeedActivity;
