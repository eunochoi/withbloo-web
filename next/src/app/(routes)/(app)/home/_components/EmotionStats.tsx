'use client';

import { AppSection, AppSectionHeader, AppSectionMeta, AppSectionTitle } from '@/common/components/ui/AppSection';
import AppUnderlineTabs from '@/common/components/ui/AppUnderlineTabs';
import EmotionImage from '@/common/components/ui/EmotionImage';
import InfoNotice from '@/common/components/ui/InfoNotice';
import { DIARY_EMOTION_GROUPS } from '@/common/constants/diaryFilters';
import { EMOTIONS } from '@/common/constants/emotions';
import { useState } from 'react';

interface Props {
  year: number;
  emotionCounts: number[];
  halfYearEmotionCounts: number[][];
}

const HALF_YEAR_OPTIONS = ['전체', '전반기', '후반기'];
const GROUPS = [
  { label: '긍정', ids: DIARY_EMOTION_GROUPS.positive.emotions, color: '#EDA5B1' },
  { label: '중립', ids: DIARY_EMOTION_GROUPS.neutral.emotions, color: '#979FC7' },
  { label: '부정', ids: DIARY_EMOTION_GROUPS.negative.emotions, color: '#8CADE2' },
];

const EmotionStats = ({ year, emotionCounts, halfYearEmotionCounts }: Props) => {
  const [selectedHalfYear, setSelectedHalfYear] = useState(0);
  const source = selectedHalfYear === 0 ? emotionCounts : halfYearEmotionCounts[selectedHalfYear - 1] ?? [];
  const counts = EMOTIONS.map((emotion) => source[emotion.id] ?? 0);
  const total = counts.reduce((sum, count) => sum + count, 0);
  const groups = GROUPS.map((group) => ({ ...group, count: group.ids.reduce<number>((sum, id) => sum + counts[id], 0) }));
  const sortedEmotions = [...EMOTIONS].sort((a, b) => counts[b.id] - counts[a.id] || a.id - b.id);

  return (
    <AppSection>
      <AppSectionHeader>
        <AppSectionTitle>감정 기록</AppSectionTitle>
        <AppSectionMeta className="min-w-0 shrink text-right !text-theme-text-secondary">{year}년 {total}개</AppSectionMeta>
      </AppSectionHeader>
      <AppUnderlineTabs options={HALF_YEAR_OPTIONS.map((label, value) => ({ label, value }))} value={selectedHalfYear} onChange={setSelectedHalfYear} />
      <div className="mx-1 flex flex-col gap-6 rounded-theme border border-theme-accent/20 bg-theme-accent-light/50 px-4 py-6">
        <div className={`flex h-4 gap-0.5 overflow-hidden rounded-full ${total ? '' : 'bg-theme-accent/30'}`} role="img" aria-label={`감정 비율: ${groups.map((group) => `${group.label} ${group.count}회 ${total ? Math.round(group.count / total * 100) : 0}%`).join(', ')}`}>
          {groups.filter((group) => group.count > 0).map((group) => <span key={group.label} style={{ flex: group.count, backgroundColor: group.color }} />)}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {groups.map((group) => (
            <div key={group.label} className="flex flex-col items-center gap-2">
              <span className="flex items-center gap-2 text-sm text-theme-text-secondary"><span className="h-3 w-3 rounded-full" style={{ backgroundColor: group.color }} />{group.label}</span>
              <span className="text-2xl font-semibold">{group.count}<span className="ml-1 text-base font-normal text-theme-text-secondary">회</span></span>
            </div>
          ))}
        </div>
      </div>
      <div className="-mx-5 w-auto flex gap-3 overflow-x-auto overscroll-x-contain px-6 pb-2 tablet:-mx-12 tablet:px-[calc(3rem+0.25rem)] desktop:-mx-[81px] desktop:px-[calc(81px+0.25rem)]">
        {sortedEmotions.map((emotion) => (
          <div key={emotion.id} className="flex w-[40%] shrink-0 flex-col items-center gap-1 rounded-theme border p-3" style={{ backgroundColor: `${emotion.color}26`, borderColor: `${emotion.color}40` }}>
            <EmotionImage emotion={emotion} alt="" width={64} height={64} className="h-16 w-16" />
            <span className="text-sm text-theme-text-secondary">{emotion.nameKr}</span>
            <span className="text-2xl font-semibold">{counts[emotion.id]}<span className="ml-1 text-base font-normal text-theme-text-secondary">회</span></span>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-2">
        {groups.map((group) => <InfoNotice key={group.label}>{group.label}: {group.ids.map((id) => EMOTIONS[id].nameKr).join(', ')}</InfoNotice>)}
      </div>
    </AppSection>
  );
};

export default EmotionStats;
