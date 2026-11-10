import {
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@/common/constants/appIcons';
import { authAction } from '@/common/auth/authAction';
import { habitQueries } from '@/common/queries/habitQueries';
import { AppSection } from '@/common/components/ui/AppSection';

import { useQuery } from '@tanstack/react-query';
import { addYears, format, subYears } from 'date-fns';
import { Dispatch, SetStateAction } from 'react';

import { useMonthSwipe } from '@/common/components/ui/Calendar/useMonthSwipe';
import MonthlyBarChart from './MonthlyBarChart';

interface Props {
  accent?: ReturnType<
    typeof import('@/common/functions/itemAccentColors').itemAccentColors
  >;
  displayDate: Date;
  habitId: string;
  startedDate?: string;
  today: string;
  setDisplayDate: Dispatch<SetStateAction<Date>>;
}

const YearInfo = ({
  setDisplayDate,
  displayDate,
  habitId,
  startedDate,
  today,
  accent,
}: Props) => {
  const { data } = useQuery({
    ...habitQueries.year(habitId, format(displayDate, 'yyyy'), authAction),
  });
  const year = format(displayDate, 'yyyy');
  const currentYear = () => {
    setDisplayDate(new Date());
  };
  const nextYear = () => {
    if (Number(year) >= Number(today.slice(0, 4))) return;
    const temp = addYears(displayDate, 1);
    setDisplayDate(temp);
  };
  const preYear = () => {
    if (!startedDate || Number(year) <= Number(startedDate.slice(0, 4))) return;
    const temp = subYears(displayDate, 1);
    setDisplayDate(temp);
  };

  const swipeProps = useMonthSwipe(preYear, nextYear);

  return (
    <AppSection
      {...swipeProps}
      className="border-t border-theme-border/30 px-1 pt-8"
    >
      <h2 className="text-lg font-semibold">연간 기록</h2>
      <div className="flex h-10 items-center justify-between">
        <button
          type="button"
          onClick={currentYear}
          className="text-base font-medium"
          aria-label={`${year}년, 올해로 이동`}
        >
          {year}년
        </button>
        <div className="flex text-theme-text-tertiary">
          <button
            type="button"
            onClick={preYear}
            disabled={
              !startedDate || Number(year) <= Number(startedDate.slice(0, 4))
            }
            aria-label="이전 연도"
            className="flex h-10 w-10 items-center justify-center disabled:opacity-30"
          >
            <ChevronLeftIcon size={22} />
          </button>
          <button
            type="button"
            onClick={nextYear}
            disabled={Number(year) >= Number(today.slice(0, 4))}
            aria-label="다음 연도"
            className="flex h-10 w-10 items-center justify-center disabled:opacity-30"
          >
            <ChevronRightIcon size={22} />
          </button>
        </div>
      </div>

      <MonthlyBarChart data={data?.monthly} color={accent?.color} />
    </AppSection>
  );
};

export default YearInfo;
