import type { Metadata } from 'next';
import FeedClientPage from './FeedClientPage';

export const metadata: Metadata = {
  title: '기록 모음',
  description: '일기, 습관, 거리두기 기록을 시간순으로 모아 보세요.',
};

export default function FeedPage() {
  return <FeedClientPage />;
}
