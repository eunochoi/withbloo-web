import { CalendarDay } from '@/common/components/ui/Calendar/CalendarDay';
import { CalendarGrid } from '@/common/components/ui/Calendar/CalendarGrid';
import type { CalendarDayModel } from '@/common/components/ui/Calendar/useMonthCalendar';
import type { HabitMonthData } from '@/common/types/calendar';
import HabitIcon from '@/common/components/ui/HabitIcon';

interface Props {
  habitMonthData?: HabitMonthData;
  monthLabel: string;
  days: CalendarDayModel[];
  today: string;
  isFetching: boolean;
  onShowDate: (date: string) => void;
  iconKey?: string;
  iconColor?: string;
}

const HabitMonthCalendar = ({
  habitMonthData, monthLabel, days, today, isFetching,
  onShowDate, iconKey, iconColor,
}: Props) => {
  return (
    <div className="w-full">
      <CalendarGrid aria-busy={isFetching} aria-label={`${monthLabel} 습관 실천 달력`}>
        {days.map((day) => {
          const isBeforeStart = habitMonthData ? day.dateKey < habitMonthData.startedDate : false;
          const isFuture = day.dateKey > today;
          const unavailable = isBeforeStart || isFuture;
          const isCompleted = !day.isOutsideMonth && !unavailable && habitMonthData?.daysByDate[day.dateKey] === true;

          return (
            <CalendarDay
              key={day.dateKey}
              day={day}
              isToday={day.dateKey === today}
              showTodayIndicator={false}
              className={unavailable && !day.isOutsideMonth ? 'opacity-30' : undefined}
              onClick={day.isOutsideMonth && !unavailable ? () => onShowDate(day.dateKey) : undefined}
              label={[
                day.dateKey,
                isCompleted ? '완료 기록 있음' : '',
                !isCompleted && !unavailable && !day.isOutsideMonth ? '기록 없음' : '',
                isBeforeStart ? '시작일 이전, 통계 제외' : '',
                isFuture ? '미래 날짜' : '',
              ].filter(Boolean).join(', ')}
            >
              {isCompleted ? (
                <span className="flex aspect-square w-[60%] items-center justify-center tablet:max-w-[32px]">
                  <HabitIcon iconKey={iconKey} iconColor={iconColor} className="h-full w-full" />
                </span>
              ) : <span>{day.dayNumber}</span>}
            </CalendarDay>
          );
        })}
      </CalendarGrid>
    </div>
  );
};

export default HabitMonthCalendar;
