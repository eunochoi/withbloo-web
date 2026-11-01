'use client';

import { ChevronLeftIcon, ChevronRightIcon, TodayIcon } from '@/common/constants/appIcons';




interface Props {
  monthLabel: string;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  canGoPrevious?: boolean;
  canGoNext?: boolean;
  centerTitle?: boolean;
  detail?: boolean;
}

const CalendarHeader = ({ monthLabel, onPreviousMonth, onNextMonth, onToday, canGoPrevious = true, canGoNext = true, centerTitle = false, detail = false }: Props) => {
  const previous = <button type="button" onClick={onPreviousMonth} disabled={!canGoPrevious} aria-label="이전 달" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-theme-text-tertiary disabled:opacity-30"><ChevronLeftIcon size="1.1rem" aria-hidden="true" /></button>;
  const next = <button type="button" onClick={onNextMonth} disabled={!canGoNext} aria-label="다음 달" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-theme-text-tertiary disabled:opacity-30"><ChevronRightIcon size="1.1rem" aria-hidden="true" /></button>;

  return (
    <header className="flex h-10 items-center justify-between">
      {centerTitle && previous}
      <button type="button" onClick={onToday} aria-label={`${monthLabel}, 이번 달로 이동`} className={`flex flex-1 ${centerTitle ? 'justify-center' : 'justify-start'} ${detail ? 'text-base font-medium' : 'text-lg font-semibold'} text-theme-text-primary`}>{monthLabel}</button>
      {centerTitle ? next : <div className="-mr-2 flex items-center">{previous}<button type="button" onClick={onToday} aria-label="오늘로 이동" className="flex h-10 w-10 items-center justify-center rounded-xl text-theme-text-tertiary"><TodayIcon size="1.1rem" aria-hidden="true" /></button>{next}</div>}
    </header>
  );
};

export default CalendarHeader;
