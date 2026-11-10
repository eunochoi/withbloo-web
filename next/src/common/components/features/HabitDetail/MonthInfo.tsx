'use client';

import { addDays, format } from 'date-fns';
import { getActivityDates } from '@/common/actions/records';
import { useQuery } from '@tanstack/react-query';

import { authAction } from '@/common/auth/authAction';
import { habitQueries } from '@/common/queries/habitQueries';
import { AppSection, AppSectionTitle } from '@/common/components/ui/AppSection';
import CalendarHeader from '@/common/components/ui/Calendar/CalendarHeader';
import { useMonthCalendar } from '@/common/components/ui/Calendar/useMonthCalendar';

import { useMonthSwipe } from '@/common/components/ui/Calendar/useMonthSwipe';
import HabitMonthCalendar from './HabitMonthCalendar';

interface Props {
  onSelectDate: (date: string) => void;
  habitId: string;
  today: string;
  iconKey?: string;
  iconColor?: string;
  startedDate?: string;
}

const MonthInfo = ({
  habitId,
  onSelectDate,
  today,
  iconKey,
  iconColor,
  startedDate,
}: Props) => {
  const calendar = useMonthCalendar(today, {
    minDate: startedDate ?? today,
    maxDate: today,
  });
  const swipeProps = useMonthSwipe(
    calendar.goPreviousMonth,
    calendar.goNextMonth,
  );
  const monthQuery = useQuery({
    ...habitQueries.month(habitId, calendar.visibleMonth, authAction),
  });
  const from = new Date(`${calendar.days[0].dateKey}T00:00:00`);
  const memoDates = useQuery({ queryKey: ['habit', 'memo-dates', habitId, calendar.visibleMonth], queryFn: () => authAction(() => getActivityDates('habit', Number(habitId), from.toISOString(), addDays(from, 42).toISOString())) });
  const habitMonthData = monthQuery.data;
  const displayToday = habitMonthData?.today ?? today;

  return (
    <AppSection className="px-1">
      <AppSectionTitle className="!text-lg">월간 기록</AppSectionTitle>
      <CalendarHeader
        monthLabel={calendar.monthLabel}
        onPreviousMonth={calendar.goPreviousMonth}
        onNextMonth={calendar.goNextMonth}
        onToday={() => calendar.showDate(displayToday)}
        canGoPrevious={calendar.canGoPrevious}
        canGoNext={calendar.canGoNext}
        detail
      />

      <div {...swipeProps}>
        <HabitMonthCalendar
          memoDates={(memoDates.data ?? []).map((time) => format(new Date(time), 'yyyy-MM-dd'))}
          onSelectDate={onSelectDate}
          iconKey={iconKey}
          iconColor={iconColor}
          habitMonthData={habitMonthData}
          monthLabel={calendar.monthLabel}
          days={calendar.days}
          today={displayToday}
          isFetching={monthQuery.isFetching}
          onShowDate={calendar.showDate}
        />
      </div>
    </AppSection>
  );
};

export default MonthInfo;
