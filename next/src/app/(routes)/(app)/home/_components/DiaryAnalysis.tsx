'use client';

import { CalendarIcon, DescriptionIcon, TrophyIcon } from '@/common/constants/appIcons';

import { DiaryStats } from "@/common/actions/stats";

import { AppSection, AppSectionHeader, AppSectionMeta, AppSectionTitle } from "@/common/components/ui/AppSection";
import { dotTabMarkerClass, dotTabTitleClass } from '@/common/components/ui/AppDotTabs';
import InfoNotice from '@/common/components/ui/InfoNotice';
import { cn } from "@/common/utils/cn";


interface Props {
  stats?: DiaryStats;
  year: number;
}

const monthlyBarClass = "min-h-1 w-3 max-w-5 rounded-[3px] transition-[height] duration-200 ease-in-out";
const statIconClass = "h-6 w-6 text-theme-accent";
const statBoxClass = "flex min-w-0 flex-col items-center gap-2 py-3";

const DiaryAnalysis = ({ stats, year }: Props) => {
  const currentStreak = stats?.currentStreak?.days ?? 0;
  const longestStreak = stats?.longestStreak?.days ?? 0;

  const totalCount = stats?.totalCount ?? 0;
  const monthlyCount = stats?.monthlyCount ?? Array(12).fill(0);
  const firstMonth = monthlyCount.findIndex((count) => count > 0);
  const endMonth = year === new Date().getFullYear() ? new Date().getMonth() : 11;
  const months = firstMonth < 0 ? 0 : Math.max(1, endMonth - firstMonth + 1);
  const monthlyAverage = months ? Number((totalCount / months).toFixed(1)) : 0;

  return (
    <AppSection>
      <AppSectionHeader>
        <AppSectionTitle>일기 기록</AppSectionTitle>
        <AppSectionMeta className="min-w-0 shrink text-right !text-theme-text-secondary">{year}년 {totalCount}개</AppSectionMeta>
      </AppSectionHeader>

      <div className="flex min-w-0 flex-col gap-4">
        <div className="flex min-w-0 flex-col gap-4">
          <h3 className={`${dotTabTitleClass} mx-1 flex items-center gap-2`}><span aria-hidden="true" className={dotTabMarkerClass} />기록 요약</h3>
          <div className="mx-1 grid grid-cols-3 divide-x divide-theme-border/50 rounded-theme border border-theme-accent/20 bg-theme-accent-light/50 py-2">
            <div className={statBoxClass}>
              <CalendarIcon className={statIconClass} aria-hidden="true" />
              <p className="m-0 text-center text-sm text-theme-text-secondary">현재 연속 기록</p>
              <div className="flex items-baseline justify-center gap-1">
                <span className="flex items-baseline text-2xl font-bold leading-none text-theme-text-primary tablet:text-xl">{currentStreak}</span>
                <span className="text-sm font-bold text-theme-text-secondary">일</span>
              </div>
            </div>

            <div className={statBoxClass}>
              <TrophyIcon className={statIconClass} aria-hidden="true" />
              <p className="m-0 text-center text-sm text-theme-text-secondary">역대 최고 기록</p>
              <div className="flex items-baseline justify-center gap-1">
                <span className="flex items-baseline text-2xl font-bold leading-none text-theme-text-primary tablet:text-xl">{longestStreak}</span>
                <span className="text-sm font-bold text-theme-text-secondary">일</span>
              </div>
            </div>
            <div className={statBoxClass}>
              <DescriptionIcon className={statIconClass} aria-hidden="true" />
              <p className="m-0 text-center text-sm text-theme-text-secondary">월평균 일기</p>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-2xl font-bold leading-none text-theme-text-primary">{monthlyAverage}</span>
                <span className="text-sm text-theme-text-secondary">개</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex min-w-0 flex-col gap-4">
          <h3 className={`${dotTabTitleClass} mx-1 flex items-center gap-2`}><span aria-hidden="true" className={dotTabMarkerClass} />월별 기록</h3>
          <div className="mx-1 flex flex-col gap-3 rounded-theme border border-theme-text-secondary/10 bg-theme-surface-muted/60 px-4 py-4">
            <div className="flex flex-row">
              {(stats?.monthlyCount ?? Array(12).fill(0)).map((count, index) => {
                const maxCount = Math.max(...(stats?.monthlyCount ?? [1]), 1);
                const barHeight = count > 0 ? Math.max((count / maxCount) * 112, 8) : 4;

                return (
                  <div key={index} className="flex flex-1 flex-col items-center gap-1.5">
                    <div className="flex h-40 w-full items-end justify-center">
                      <div className="flex flex-col items-center gap-1">
                        {count > 0 && (
                          <span className="text-sm font-medium leading-none text-theme-accent">
                            {count}
                          </span>
                        )}

                        <div
                          className={cn(
                            monthlyBarClass,
                            count > 0
                              ? 'bg-theme-accent'
                              : 'bg-theme-text-primary/15',
                          )}
                          style={{ height: `${barHeight}px` }}
                        />
                      </div>
                    </div>

                    <span className="text-sm text-theme-text-secondary">
                      {index + 1}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <InfoNotice>연속·최고 기록은 전체 기간 기준이에요.</InfoNotice>
            <InfoNotice>월평균: 첫 기록 월~{year === new Date().getFullYear() ? '이번 달' : '12월'}, 빈 달 포함.</InfoNotice>
          </div>
        </div>
      </div>
    </AppSection >
  );
};

export default DiaryAnalysis;
