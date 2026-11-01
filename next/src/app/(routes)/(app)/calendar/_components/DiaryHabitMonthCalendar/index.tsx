'use client';

import EmotionImage from '@/common/components/ui/EmotionImage';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { addMonths, format } from 'date-fns';
import { useEffect } from 'react';

import { authAction } from '@/common/auth/authAction';
import { CalendarDay } from '@/common/components/ui/Calendar/CalendarDay';
import { CalendarGrid } from '@/common/components/ui/Calendar/CalendarGrid';
import {
  CalendarDayModel,
  useMonthCalendar,
} from '@/common/components/ui/Calendar/useMonthCalendar';
import { useMonthSwipe } from '@/common/components/ui/Calendar/useMonthSwipe';
import { Emotion, EMOTIONS } from '@/common/constants/emotions';
import { diaryQueries } from '@/common/queries/diaryQueries';
import { unwrapQueryAction } from '@/common/queries/queryAction';
import type { DateKey, DiaryHabitDayData } from '@/common/types/calendar';
import { parseLocalDate } from '@/common/utils/date/parseLocalDate';
import CalendarHeader from '@/common/components/ui/Calendar/CalendarHeader';

interface Props {
  today: DateKey;
  selectedDate: DateKey;
  onSelectDate: (date: DateKey) => void;
  onMonthChange: (month: string) => void;
}

const DiaryHabitMonthCalendar = ({
  today,
  selectedDate,
  onSelectDate,
  onMonthChange,
}: Props) => {
  const queryClient = useQueryClient();
  const calendar = useMonthCalendar(selectedDate, { maxDate: today });
  const monthQuery = useQuery({
    ...diaryQueries.habitMonth(calendar.visibleMonth, authAction),
  });
  const diaryHabitMonthData = monthQuery.data;
  const swipeProps = useMonthSwipe(
    calendar.goPreviousMonth,
    calendar.goNextMonth,
  );

  useEffect(() => {
    const monthStart = parseLocalDate(`${calendar.visibleMonth}-01`);

    for (const offset of [-1, 1]) {
      const month = format(addMonths(monthStart, offset), 'yyyy-MM');
      if (month < '1900-01' || month > today.slice(0, 7)) continue;
      void queryClient.prefetchQuery({
        ...diaryQueries.habitMonth(month, unwrapQueryAction),
        retry: false,
      });
    }
  }, [calendar.visibleMonth, queryClient, today]);

  useEffect(() => {
    onMonthChange(calendar.visibleMonth);
  }, [calendar.visibleMonth, onMonthChange]);

  const selectDate = (date: DateKey) => {
    if (!calendar.isDateAvailable(date)) return;
    calendar.showDate(date);
    onSelectDate(date);
  };

  return (
    <section className="flex w-full min-w-0 flex-col desktop:min-h-0">
      <div className="flex w-full min-w-0 flex-1 flex-col gap-4 desktop:min-h-0">
        <CalendarHeader
          monthLabel={calendar.monthLabel}
          onPreviousMonth={calendar.goPreviousMonth}
          onNextMonth={calendar.goNextMonth}
          onToday={() => selectDate(today)}
          canGoPrevious={calendar.canGoPrevious}
          canGoNext={calendar.canGoNext}
        />

        {monthQuery.isError && (
          <p className="text-sm text-theme-danger" role="alert">
            월 기록을 불러오지 못했어요.{' '}
            <button
              type="button"
              onClick={() => void monthQuery.refetch()}
              className="underline"
            >
              다시 시도
            </button>
          </p>
        )}

        <CalendarGrid
          {...swipeProps}
          className="flex flex-1 flex-col desktop:min-h-0"
          daysClassName="min-h-[21rem] flex-1 auto-rows-fr desktop:min-h-0"
          aria-label={`${calendar.monthLabel} 일기와 습관 달력`}
          aria-busy={monthQuery.isFetching}
        >
          {calendar.days.map((day: CalendarDayModel) => {
            const available = calendar.isDateAvailable(day.dateKey);
            const record: DiaryHabitDayData | undefined = day.isOutsideMonth
              ? undefined
              : diaryHabitMonthData?.daysByDate[day.dateKey];
            const emotion: Emotion | undefined =
              record?.emotion == null ? undefined : EMOTIONS[record.emotion];
            let hash = 2166136261;
            for (const character of day.dateKey) {
              hash = Math.imul(hash ^ character.charCodeAt(0), 16777619);
            }
            const rotationDegrees = ((hash >>> 0) % 21) - 10;
            const done = record?.countedHabitCount ?? 0;
            const total = record?.totalHabitCount ?? 0;
            const progress = total ? Math.min(100, (done / total) * 100) : 0;
            const color =
              progress < 25 ? '#E599A5' : progress < 75 ? '#EFBE48' : '#7BBDAD';
            const isSelected = day.dateKey === selectedDate;

            return (
              <CalendarDay
                key={day.dateKey}
                day={day}
                isToday={day.dateKey === today}
                isSelected={isSelected}
                showTodayIndicator={false}
                className={
                  available
                    ? 'aspect-auto min-h-0'
                    : 'aspect-auto min-h-0 opacity-30'
                }
                onClick={available ? () => selectDate(day.dateKey) : undefined}
                label={[
                  day.dateKey,
                  record?.hasDiary ? '일기 있음' : '',
                  emotion?.nameKr ?? '',
                  done > 0 && day.dateKey <= today
                    ? `습관 ${done}/${total}개 완료`
                    : '',
                ]
                  .filter(Boolean)
                  .join(', ')}
              >
                <span className="flex min-h-0 w-full flex-1 items-center justify-center py-1">
                  {record?.hasDiary && emotion ? (
                    <EmotionImage
                      emotion={emotion}
                      alt=""
                      className="h-full max-h-full w-full object-contain tablet:max-h-[40px] tablet:max-w-[40px]"
                      style={{ rotate: `${rotationDegrees}deg` }}
                    />
                  ) : (
                    <span>{day.dayNumber}</span>
                  )}
                </span>
                <span className="h-2 w-full shrink-0 px-2.5">
                  {done > 0 && day.dateKey <= today && (
                    <span className="mx-auto block h-2 w-full overflow-hidden rounded-full bg-theme-border/80 tablet:max-w-[40px]">
                      <span
                        className="block h-full"
                        style={{
                          width: `${progress}%`,
                          backgroundColor: color,
                        }}
                      />
                    </span>
                  )}
                </span>
              </CalendarDay>
            );
          })}
        </CalendarGrid>
      </div>
    </section>
  );
};

export default DiaryHabitMonthCalendar;
