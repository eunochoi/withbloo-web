'use client';

import ScrollableName from '@/common/components/ui/ScrollableName';

import { HabitStats } from "@/common/actions/stats";
import { AppSection, AppSectionHeader, AppSectionMeta, AppSectionTitle } from "@/common/components/ui/AppSection";
import AppUnderlineTabs, { titleMarkerClass, underlineTitleClass } from "@/common/components/ui/AppUnderlineTabs";
import { HabitPriority } from '@/common/components/ui/Habit/HabitPriority';
import HabitIcon from "@/common/components/ui/HabitIcon";
import InfoNotice from '@/common/components/ui/InfoNotice';
import { useRouter } from "next/navigation";
import { useState } from "react";
import HabitFlow from '../../habit/_components/HabitFlow';

interface Props {
  stats?: HabitStats;
  year: number;
  today: string;
}

type HabitTab = 'top' | 'bottom';

const HABIT_TAB_OPTIONS: Array<{ label: string; value: HabitTab }> = [
  { label: '상위 Top 3', value: 'top' },
  { label: '하위 Top 3', value: 'bottom' },
];

const HabitAnalysis = ({ stats, year, today }: Props) => {
  const router = useRouter();

  const [habitTab, setHabitTab] = useState<HabitTab>('top');

  const habits = habitTab === 'top' ? stats?.topHabits : stats?.bottomHabits;
  const handleHabitClick = (habitId: number) => {
    router.push(`/habit/${habitId}`, { scroll: false });
  };

  return (
    <AppSection>
      <AppSectionHeader>
        <AppSectionTitle>습관 기록</AppSectionTitle>
        <AppSectionMeta className="min-w-0 shrink text-right !text-theme-text-secondary">{year}년 · 별 1개 이상 기준</AppSectionMeta>
      </AppSectionHeader>

      <div className="flex min-w-0 flex-col gap-4">
        <div className="flex min-w-0 flex-col gap-4">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className={`${underlineTitleClass} mx-1 flex items-center gap-2`}><span aria-hidden="true" className={titleMarkerClass} />최근 7일 흐름</h3>
          </div>
          <HabitFlow today={today} compact />
        </div>

        <div className="flex min-w-0 flex-col gap-4">

          <AppUnderlineTabs
            options={HABIT_TAB_OPTIONS}
            value={habitTab}
            onChange={setHabitTab}
          />

          {habits && habits.length > 0 ?
            <ol className="mx-1 m-0 list-none rounded-theme border border-theme-text-secondary/10 bg-theme-surface-muted/60 p-6">
              {habits.slice(0, 3).map((habit) => (
                <li key={habit.id} className="border-b border-theme-border/50 py-6 first:pt-0 last:border-0 last:pb-0">
                  <button
                    type="button"
                    onClick={() => handleHabitClick(habit.id)}
                    className="flex w-full min-w-0 items-center gap-6 rounded-lg text-left tablet:gap-4"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center bg-transparent">
                      <HabitIcon iconKey={habit.iconKey} iconColor={habit.iconColor} className="text-4xl" />
                    </span>
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <ScrollableName name={habit.name} className="text-base leading-relaxed text-theme-text-primary" />
                      <HabitPriority priority={habit.priority} className="shrink-0 gap-0.5 text-base opacity-80" />
                    </div>
                    <span className="flex shrink-0 items-baseline gap-1  tabular-nums">
                      <span className="text-2xl font-semibold text-theme-text-primary">{habit.count}</span>
                      <span className="text-sm text-theme-text-secondary">회</span>
                    </span>
                  </button>
                </li>
              ))}
            </ol> :
            <p className="mx-1 rounded-theme border border-theme-text-secondary/10 bg-theme-surface-muted/60 px-6 py-8 text-center text-sm text-theme-text-secondary">
              {year}년에 완료한 집계 대상 습관이 없어요.
            </p>}
          <div className="flex flex-col gap-2">
            <InfoNotice>7일 흐름은 습관이 있었던 날의 실천율을 평균으로 계산해요.</InfoNotice>
            <InfoNotice>습관 순위와 7일 흐름에는 자유 기록이 포함되지 않아요.</InfoNotice>
          </div>
        </div>
      </div>
    </AppSection>
  );
};

export default HabitAnalysis;
