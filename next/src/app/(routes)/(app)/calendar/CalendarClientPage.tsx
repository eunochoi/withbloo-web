'use client';

import CalendarSummaryToolbar from'./_components/CalendarSummaryToolbar';

import CalendarPageContent from'./_components/CalendarPageContent';
import CalendarPageSkeleton from'./_components/CalendarPageSkeleton';
import AppPageTitle from'@/common/components/layout/AppPageTitle';

import { keepPreviousData, useQuery } from'@tanstack/react-query';
import { format } from'date-fns';
import { useRouter } from'next/navigation';
import { useState } from'react';

import { authAction } from'@/common/auth/authAction';
import { diaryQueries } from'@/common/queries/diaryQueries';
import { habitQueries } from'@/common/queries/habitQueries';
import AppPageLayout from'@/common/components/layout/AppPageLayout';
import { usePrefetchPage } from'@/common/hooks/usePrefetchPage';
import { parseLocalDate } from'@/common/utils/date/parseLocalDate';

interface Props {
  initialDate: string;
}

//initialDate : 서버에서 브라우저 시간대로 현재 날짜를 구해서 전달
const CalendarClientPage = ({ initialDate }: Props) => {
  usePrefetchPage();
  const router = useRouter();
  const today = initialDate;
  const [month, setMonth] = useState(today.slice(0, 7));
  const [selectedDate, setSelectedDate] = useState(initialDate);

  const selectedDiaryQuery = useQuery({
    ...diaryQueries.byDate(selectedDate, authAction),
    placeholderData: keepPreviousData,
  });
  const monthQuery = useQuery({
    ...diaryQueries.habitMonth(month, authAction),
    placeholderData: keepPreviousData,
  });
  const todayHabitsQuery = useQuery({
    ...habitQueries.byDate(today, authAction),
  });
  const isInitialError = [selectedDiaryQuery, todayHabitsQuery, monthQuery].some(
    (query) => query.isError && query.data === undefined,
  );
  const isInitialPending = [selectedDiaryQuery, todayHabitsQuery, monthQuery].some(
    (query) => query.data === undefined,
  );
  const openSelectedDiary = () => {
    if (selectedDiaryQuery.isPending || selectedDiaryQuery.isPlaceholderData)
      return;
    if (selectedDiaryQuery.isError) {
      void selectedDiaryQuery.refetch();
      return;
    }

    const diary = selectedDiaryQuery.data;
    const href = diary
      ? `/diary/${diary.id}/edit`
      : `/diary/new?date=${selectedDate}`;
    router.push(href, { scroll: false });
  };

  const counts = { high: 0, medium: 0, low: 0 };
  for (const [date, day] of Object.entries(
    monthQuery.isPlaceholderData ? {} : (monthQuery.data?.daysByDate ?? {}),
  )) {
    if (!day || date > today || !day.countedHabitCount || !day.totalHabitCount)
      continue;
    const progress = (day.countedHabitCount / day.totalHabitCount) * 100;
    counts[progress < 25 ?'low' : progress < 75 ?'medium' :'high'] += 1;
  }

  const selectedDateLabel =
    selectedDate === today
      ?'오늘'
      : format(parseLocalDate(selectedDate),'M월 d일');
  const diaryActionLabel = `${selectedDateLabel} ${selectedDiaryQuery.data ?'일기 수정' :'일기 작성'}`;

  return (
    <AppPageLayout
      fixedDesktop
      header={<AppPageTitle title="월간 기록" hashtags="#기록 #발자국" />}
      toolbar={
        <CalendarSummaryToolbar
          diaryCount={monthQuery.isPlaceholderData ? 0 : (monthQuery.data?.summary.diaryCount ?? 0)}
          counts={counts}
        />
      }
    >
      {isInitialError ? (
        <div className="flex min-h-64 w-full flex-col items-center justify-center gap-3 text-center text-theme-text-secondary">
          <span>달력 기록을 불러오지 못했어요.</span>
          <button
            type="button"
            className="text-theme-accent"
            onClick={() => {
              if (selectedDiaryQuery.isError) void selectedDiaryQuery.refetch();
              if (monthQuery.isError) void monthQuery.refetch();
              if (todayHabitsQuery.isError) void todayHabitsQuery.refetch();
            }}
          >
            다시 시도
          </button>
        </div>
      ) : isInitialPending ? (
        <CalendarPageSkeleton />
      ) : (
        <CalendarPageContent
          today={today}
          onMonthChange={setMonth}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          selectedDiaryQuery={selectedDiaryQuery}
        />
      )}
    </AppPageLayout>
  );
};

export default CalendarClientPage;
