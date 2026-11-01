'use client';

import type { DiaryData } from '@/common/types/diary';
import DiaryHabitMonthCalendar from './DiaryHabitMonthCalendar';
import DayInfo from './DayInfo';
import { PickerDialog } from '@/common/components/ui/Dialog/PickerDialog';
import { AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { parseLocalDate } from '@/common/utils/date/parseLocalDate';

import type { UseQueryResult } from '@tanstack/react-query';

interface Props {
  today: string;
  onMonthChange: (month: string) => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  selectedDiaryQuery: Pick<
    UseQueryResult<DiaryData | null>,
    'data' | 'isPending' | 'isPlaceholderData' | 'isError' | 'refetch'
  >;
}

const CalendarPageContent = ({
  today,
  selectedDate,
  setSelectedDate,
  selectedDiaryQuery,
  onMonthChange,
}: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    const media = window.matchMedia('(min-width: 1024px)');
    const closeOnDesktop = () => {
      if (media.matches) setIsOpen(false);
    };
    media.addEventListener('change', closeOnDesktop);
    return () => media.removeEventListener('change', closeOnDesktop);
  }, []);
  const dayInfo = (
    <DayInfo
      date={selectedDate}
      diaryData={selectedDiaryQuery.data}
      isDiaryPending={selectedDiaryQuery.isPending}
      isDiaryPlaceholder={selectedDiaryQuery.isPlaceholderData}
      isDiaryError={selectedDiaryQuery.isError}
      onRetryDiary={() => void selectedDiaryQuery.refetch()}
    />
  );
  return (
    <>
      <section className="pt-3 grid flex-1 w-full min-w-0 grid-cols-1 items-stretch gap-6 tablet:gap-6 desktop:min-h-0 desktop:flex-1 desktop:items-stretch desktop:grid-cols-[minmax(0,11fr)_minmax(0,9fr)] desktop:gap-x-8">
        <DiaryHabitMonthCalendar
          today={today}
          onMonthChange={onMonthChange}
          selectedDate={selectedDate}
          onSelectDate={(date) => {
            setSelectedDate(date);
            if (!window.matchMedia('(min-width: 1024px)').matches)
              setIsOpen(true);
          }}
        />
        <div className="hidden min-w-0 desktop:col-start-2 desktop:row-start-1 desktop:flex desktop:min-h-0 desktop:flex-col desktop:border-l desktop:border-theme-border/60 desktop:pl-8">
          {dayInfo}
        </div>
      </section>
      <AnimatePresence>
        {isOpen && (
          <PickerDialog
            labelledBy="calendar-day-title"
            onClose={() => setIsOpen(false)}
          >
            <div className="mx-auto pb-[calc(2rem+env(safe-area-inset-bottom))]">
              <header className="flex min-h-12 items-center justify-center gap-4">
                <h2 id="calendar-day-title" className="text-lg font-semibold">
                  {selectedDate === today
                    ? '오늘'
                    : format(parseLocalDate(selectedDate), 'M월 d일 EEEE', {
                        locale: ko,
                      })}
                </h2>
              </header>
              {dayInfo}
            </div>
          </PickerDialog>
        )}
      </AnimatePresence>
    </>
  );
};

export default CalendarPageContent;
