'use client';

import { addDays, addMonths, format, startOfWeek } from 'date-fns';
import { getTodayString } from '@/common/functions/getTodayString';
import { isValidLocalDateString } from '@/common/utils/date/isValidLocalDateString';
import { useMemo, useState } from 'react';

import type { DateKey, MonthKey } from '@/common/types/calendar';
import { parseLocalDate } from '@/common/utils/date/parseLocalDate';

export interface CalendarDayModel {
  dateKey: DateKey;
  dayNumber: number;
  weekday: number;
  isOutsideMonth: boolean;
}

export const makeMonthCalendarDays = (month: MonthKey): CalendarDayModel[] => {
  const monthStart = parseLocalDate(`${month}-01`);

  const start = startOfWeek(monthStart, { weekStartsOn: 1 });
  return Array.from({ length: 42 }, (_, index) => {
    const date = addDays(start, index);
    const dateKey = format(date, 'yyyy-MM-dd');

    return {
      dateKey,
      dayNumber: date.getDate(),
      weekday: date.getDay(),
      isOutsideMonth: dateKey.slice(0, 7) !== month,
    };
  });
};

export const useMonthCalendar = (initialDate: DateKey, { minDate = '1900-01-01', maxDate = getTodayString() }: { minDate?: DateKey; maxDate?: DateKey } = {}) => {
  const minMonth = minDate.slice(0, 7);
  const maxMonth = maxDate.slice(0, 7);
  const [requestedMonth, setVisibleMonth] = useState<MonthKey>(() => initialDate.slice(0, 7));
  const visibleMonth = requestedMonth < minMonth ? minMonth : requestedMonth > maxMonth ? maxMonth : requestedMonth;
  const days = useMemo(() => makeMonthCalendarDays(visibleMonth), [visibleMonth]);
  const isDateAvailable = (date: DateKey) => isValidLocalDateString(date) && date >= minDate && date <= maxDate;
  const showDate = (date: DateKey) => {
    const month = date.slice(0, 7);
    if (isValidLocalDateString(date) && month >= minMonth && month <= maxMonth) setVisibleMonth(month);
  };
  const goPreviousMonth = () => showDate(format(addMonths(parseLocalDate(`${visibleMonth}-01`), -1), 'yyyy-MM-dd'));
  const goNextMonth = () => showDate(format(addMonths(parseLocalDate(`${visibleMonth}-01`), 1), 'yyyy-MM-dd'));

  return {
    visibleMonth,
    monthLabel: format(parseLocalDate(`${visibleMonth}-01`), 'yyyy년 M월'),
    days,
    goPreviousMonth,
    goNextMonth,
    showDate,
    isDateAvailable,
    canGoPrevious: visibleMonth > minMonth,
    canGoNext: visibleMonth < maxMonth,
  };
};
