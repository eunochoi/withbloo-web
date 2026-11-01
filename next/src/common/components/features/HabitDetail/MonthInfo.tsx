'use client';

import {
  CheckIcon,
  CloseIcon,
  DateIcon,
  PercentIcon,
} from '@/common/constants/appIcons';

import { useQuery } from '@tanstack/react-query';

import { authAction } from '@/common/auth/authAction';
import { habitQueries } from '@/common/queries/habitQueries';
import { AppSection, AppSectionTitle } from '@/common/components/ui/AppSection';
import CalendarHeader from '@/common/components/ui/Calendar/CalendarHeader';
import { useMonthCalendar } from '@/common/components/ui/Calendar/useMonthCalendar';

import { useMonthSwipe } from '@/common/components/ui/Calendar/useMonthSwipe';
import InfoNotice from '@/common/components/ui/InfoNotice';
import HabitMonthCalendar from './HabitMonthCalendar';

interface Props {
  accent?: ReturnType<
    typeof import('@/common/functions/itemAccentColors').itemAccentColors
  >;
  habitId: string;
  today: string;
  iconKey?: string;
  iconColor?: string;
  isFree: boolean;
  startedDate?: string;
}

const MonthInfo = ({
  habitId,
  today,
  iconKey,
  iconColor,
  isFree,
  startedDate,
  accent,
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
  const habitMonthData = monthQuery.data;
  const summary = habitMonthData?.summary;
  const displayToday = habitMonthData?.today ?? today;
  const stats = isFree
    ? [
        {
          label: '기록 횟수',
          icon: CheckIcon,
          value: summary?.completedCount ?? '—',
          unit: '회',
        },
        {
          label: '평균 기록 주기',
          icon: DateIcon,
          value:
            summary?.averageInterval == null
              ? '—'
              : Number(summary.averageInterval.toFixed(1)),
          unit: summary?.averageInterval == null ? '' : '일',
        },
      ]
    : [
        {
          label: '실천 횟수',
          icon: CheckIcon,
          value: summary?.completedCount ?? '—',
          unit: '회',
        },
        {
          label: '놓친 횟수',
          icon: CloseIcon,
          value: summary?.missedCount ?? '—',
          unit: '회',
        },
        {
          label: '실천율',
          icon: PercentIcon,
          value:
            summary?.completionRate == null
              ? '—'
              : summary.completionRate.toFixed(1),
          unit: '%',
        },
      ];

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

      <div
        style={accent ? { backgroundColor: accent.background } : undefined}
        className={`grid ${isFree ? 'grid-cols-2' : 'grid-cols-3'} divide-x divide-theme-border/50 rounded-theme border border-theme-border/50 bg-theme-accent-light/50 py-2 text-center`}
      >
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex min-w-0 flex-col gap-2.5 px-1 py-2"
          >
            <stat.icon
              style={accent ? { color: accent.color } : undefined}
              className="mx-auto text-2xl text-theme-accent"
              aria-hidden="true"
            />
            <span className="text-sm text-theme-text-secondary">
              {stat.label}
            </span>
            <strong className=" text-2xl text-theme-text-primary">
              {stat.value}
              <span className="ml-0.5 text-sm font-semibold text-theme-text-secondary">
                {stat.unit}
              </span>
            </strong>
          </div>
        ))}
      </div>

      {isFree && (
        <InfoNotice accent={accent}>
          습관 시작일을 반영한 월간 경과 일수 ÷ 기록 횟수예요.
        </InfoNotice>
      )}
      <div {...swipeProps}>
        <HabitMonthCalendar
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
