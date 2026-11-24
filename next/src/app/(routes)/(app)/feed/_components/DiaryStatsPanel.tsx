'use client';

import { authAction } from '@/common/auth/authAction';
import { statsQueries } from '@/common/queries/statsQueries';
import MonthlyBarChart from '@/common/components/features/HabitDetail/MonthlyBarChart';
import { YearRecordHeader } from '@/common/components/ui/YearRecordHeader';
import { useMonthSwipe } from '@/common/components/ui/Calendar/useMonthSwipe';
import { useStoredFilters } from '@/common/hooks/useStoredFilters';
import { cn } from '@/common/utils/cn';
import { useQuery } from '@tanstack/react-query';

interface Props {
  className?: string;
}

const DiaryStatsPanel = ({ className }: Props) => {
  const currentYear = new Date().getFullYear();
  const { value: year, setStoredValue: setYear, isStorageReady } = useStoredFilters('feed-stats', currentYear);
  const { data, isPending, isError, refetch } = useQuery({
    ...statsQueries.diary(year, authAction),
    enabled: isStorageReady,
  });

  const canPrevious = isStorageReady && year > 1900;
  const canNext = isStorageReady && year < currentYear;
  const previous = () => { if (canPrevious) setYear(year - 1); };
  const next = () => { if (canNext) setYear(year + 1); };
  const swipeProps = useMonthSwipe(previous, next);
  return (
    <aside {...swipeProps} className={cn("hidden w-full flex-col gap-3 desktop:flex desktop:sticky desktop:top-[max(112px,calc(var(--page-toolbar-height,0px)+24px))] desktop:self-start", className)}>
      <h2 className="text-sm font-semibold text-theme-text-secondary">일기 통계</h2>
      <YearRecordHeader
        year={year}
        canPrevious={canPrevious}
        canNext={canNext}
        onPreviousYear={previous}
        onCurrentYear={() => { if (isStorageReady) setYear(currentYear); }}
        onNextYear={next}
      />
      <div className="grid grid-cols-3 divide-x divide-theme-border/50 rounded-theme border border-theme-accent/20 bg-theme-accent-light/50 py-3 text-center">
        <div className="flex min-w-0 flex-col gap-1 px-2">
          <span className="text-sm text-theme-text-secondary">작성된 일기</span>
          <strong className="text-2xl text-theme-text-primary">
            {isPending || isError ? '—' : data?.totalCount ?? 0}<span className="ml-0.5 text-sm text-theme-text-secondary">개</span>
          </strong>
        </div>
        <div className="flex min-w-0 flex-col gap-1 px-2">
          <span className="text-sm text-theme-text-secondary">현재 연속 기록</span>
          <strong className="text-2xl text-theme-text-primary">
            {isPending || isError ? '—' : data?.currentStreak.days ?? 0}<span className="ml-0.5 text-sm text-theme-text-secondary">일</span>
          </strong>
        </div>
        <div className="flex min-w-0 flex-col gap-1 px-2">
          <span className="text-sm text-theme-text-secondary">역대 최고 기록</span>
          <strong className="text-2xl text-theme-text-primary">
            {isPending || isError ? '—' : data?.longestStreak.days ?? 0}<span className="ml-0.5 text-sm text-theme-text-secondary">일</span>
          </strong>
        </div>
      </div>
      {isError && (
        <div className="text-center text-sm text-theme-text-secondary">
          기록을 불러오지 못했어요.{' '}
          <button type="button" className="text-theme-accent" onClick={() => { void refetch(); }}>다시 시도</button>
        </div>
      )}
      {data && !isError && (
        <MonthlyBarChart
          data={data.monthlyCount}
          rootClassName="!p-0"
        />
      )}
    </aside>
  );
};

export default DiaryStatsPanel;
