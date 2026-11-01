'use client';

import { useMonthSwipe } from '@/common/components/ui/Calendar/useMonthSwipe';
import DiaryAnalysis from "./DiaryAnalysis";
import EmotionStats from "./EmotionStats";
import HabitAnalysis from "./HabitAnalysis";
import SoberAnalysis from "./SoberAnalysis";

import type { DiaryStats, HabitStats } from "@/common/actions/stats";
import HomeYearChangePrompt from "./HomeYearChangePrompt";

interface Props {
  today: string;
  selectedYear: number;
  onChangeYear: (year: number) => void;
  diaryStats?: DiaryStats;
  habitStats?: HabitStats;
  isDiaryStatsError: boolean;
  isHabitStatsError: boolean;
  onRetryDiaryStats: () => void;
  onRetryHabitStats: () => void;
  onOpenYearPicker: () => void;
}

const HomePageContent = ({ today, selectedYear, onChangeYear, diaryStats, habitStats, isDiaryStatsError, isHabitStatsError, onRetryDiaryStats, onRetryHabitStats, onOpenYearPicker }: Props) => {
  const swipeProps = useMonthSwipe(() => { if (selectedYear > 1900) onChangeYear(selectedYear - 1); }, () => { if (selectedYear < new Date().getFullYear()) onChangeYear(selectedYear + 1); });
  return (
    <section {...swipeProps} className="flex min-w-0 flex-col gap-14">
        {diaryStats && <>
          <DiaryAnalysis stats={diaryStats} year={selectedYear} />
          <EmotionStats
            year={selectedYear}
            emotionCounts={diaryStats?.emotionCounts}
            halfYearEmotionCounts={diaryStats?.halfYearEmotionCounts}
          />
        </>}
        {habitStats && <HabitAnalysis stats={habitStats} year={selectedYear} today={today} />}
        <SoberAnalysis />
        <HomeYearChangePrompt onOpenYearPicker={onOpenYearPicker} />
    </section>
  );
};

export default HomePageContent;
