import { ChevronLeftIcon, ChevronRightIcon } from '@/common/constants/appIcons';
import { getDefaultYear, MONTH_UNSELECTED } from "@/common/constants/filterDefaults";
import { cn } from "@/common/utils/cn";
import { useState } from "react";


interface Props {
  selectedYear: number | null;
  selectedMonth: number;
  setSelectedYear: (year: number | null) => void;
  setSelectedMonth: (month: number) => void;
}

const MONTHS = Array.from({ length: 12 }, (_, index) => index + 1);

const PeriodSelector = ({ selectedYear, setSelectedYear, selectedMonth, setSelectedMonth }: Props) => {
  const [displayYear, setDisplayYear] = useState(selectedYear ?? getDefaultYear());
  const optionClass = "min-h-12 rounded-xl px-2 text-sm text-theme-text-primary transition-colors";

  const selectYear = (year: number) => {
    setDisplayYear(year);
    setSelectedYear(year);
    setSelectedMonth(MONTH_UNSELECTED);
  };

  const selectMonth = (month: number) => {
    setSelectedYear(displayYear);
    setSelectedMonth(selectedYear === displayYear && selectedMonth === month ? MONTH_UNSELECTED : month);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => selectYear(displayYear - 1)} aria-label="이전 연도 선택" className={cn(optionClass, "flex w-12 shrink-0 items-center justify-center")}>
            <ChevronLeftIcon aria-hidden="true" className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-pressed={selectedYear === displayYear}
            onClick={() => {
              if (selectedYear === displayYear) {
                setSelectedYear(null);
                setSelectedMonth(MONTH_UNSELECTED);
              } else selectYear(displayYear);
            }}
            className={cn("min-w-0 flex-1 !text-base font-semibold", optionClass, selectedYear === displayYear && "bg-theme-accent/10 ring-1 ring-inset ring-theme-accent")}
          >
            {displayYear}년
          </button>
          <button type="button" onClick={() => selectYear(displayYear + 1)} aria-label="다음 연도 선택" className={cn(optionClass, "flex w-12 shrink-0 items-center justify-center")}>
            <ChevronRightIcon aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="grid w-full grid-cols-6 gap-1.5">
          {MONTHS.map((month) => {
            const selected = selectedYear === displayYear && selectedMonth === month;

            return (
              <button
                key={month}
                className={cn(
                  optionClass,
                  "aspect-square",
                  selected && "bg-theme-accent/10 ring-1 ring-inset ring-theme-accent",
                )}
                aria-pressed={selected}
                onClick={() => selectMonth(month)}
                type="button"
              >
                {month}월
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PeriodSelector;
