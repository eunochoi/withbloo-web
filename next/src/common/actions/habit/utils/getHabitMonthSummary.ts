import { differenceInCalendarDays } from 'date-fns';

import type { HabitMonthData } from '../../../types/calendar';
import { parseLocalDate } from '../../../utils/date/parseLocalDate';

interface Params {
  monthStart: string;
  monthEnd: string;
  startedDate: string;
  today: string;
  completedDates: string[];
  isFree?: boolean;
}

export const getHabitMonthSummary = ({
  monthStart, monthEnd, startedDate, today, completedDates, isFree = false,
}: Params): HabitMonthData['summary'] => {
  const targetStart = startedDate > monthStart ? startedDate : monthStart;
  const targetEnd = today < monthEnd ? today : monthEnd;
  const targetDays = targetStart <= targetEnd
    ? differenceInCalendarDays(parseLocalDate(targetEnd), parseLocalDate(targetStart)) + 1
    : 0;
  const completedCount = new Set(completedDates.filter((date) => date >= targetStart && date <= targetEnd)).size;
  return {
    periodStart: targetDays ? targetStart : null,
    periodEnd: targetDays ? targetEnd : null,
    targetDays,
    completedCount,
    completionRate: !isFree && targetDays ? Number(((completedCount / targetDays) * 100).toFixed(1)) : null,
    missedCount: isFree ? null : Math.max(0, targetDays - completedCount),
    averageInterval: completedCount ? targetDays / completedCount : null,
  };
};
