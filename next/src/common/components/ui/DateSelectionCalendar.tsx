import type { ReactNode } from 'react';
import { CalendarDay } from './Calendar/CalendarDay';
import { CalendarGrid } from './Calendar/CalendarGrid';
import CalendarHeader from './Calendar/CalendarHeader';
import { useMonthSwipe } from './Calendar/useMonthSwipe';
import type { useMonthCalendar } from './Calendar/useMonthCalendar';

type Props = {
  calendar: ReturnType<typeof useMonthCalendar>;
  selected: string;
  today: string;
  onSelect: (date: string) => void;
  marker?: (date: string, selected: boolean) => { icon: ReactNode; label: string } | undefined;
  busy?: boolean;
};
export function DateSelectionCalendar({ calendar, selected, today, onSelect, marker, busy }: Props) {
  const swipe = useMonthSwipe(calendar.goPreviousMonth, calendar.goNextMonth);
  const select = (date: string) => {
    if (!calendar.isDateAvailable(date)) return;
    calendar.showDate(date);
    onSelect(date);
  };
  return <>
    <CalendarHeader monthLabel={calendar.monthLabel} onPreviousMonth={calendar.goPreviousMonth}
      onNextMonth={calendar.goNextMonth} onToday={() => select(today)}
      canGoPrevious={calendar.canGoPrevious} canGoNext={calendar.canGoNext} />
    <CalendarGrid {...swipe} aria-label="날짜 선택" aria-busy={busy}>
      {calendar.days.map((day) => {
        const available = calendar.isDateAvailable(day.dateKey);
        const chosen = day.dateKey === selected;
        const mark = !day.isOutsideMonth && available ? marker?.(day.dateKey, chosen) : undefined;
        return <CalendarDay key={day.dateKey} day={day} isToday={day.dateKey === today}
          isSelected={chosen} showTodayIndicator={false} label={[day.dateKey, mark?.label].filter(Boolean).join(', ')}
          className={!available ? 'opacity-30' : undefined} onClick={available ? () => select(day.dateKey) : undefined}>
          <span className={`flex h-9 w-9 items-center justify-center rounded-full text-base ${chosen ? 'bg-theme-accent text-theme-text-on-accent' : ''}`}>
            {mark?.icon ?? day.dayNumber}
          </span>
        </CalendarDay>;
      })}
    </CalendarGrid>
  </>;
}
