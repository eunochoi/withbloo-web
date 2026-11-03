'use client';


import { PickerDialog } from "@/common/components/ui/Dialog/PickerDialog";
import {
  PICKER_BODY_CLASS,
  PICKER_CONTENT_CLASS,
  PICKER_TITLE_CLASS
} from '@/common/components/ui/Dialog/PickerDialog/constants';
import { cn } from "@/common/utils/cn";
import { useState } from "react";


interface Props {
  onClose: () => void;
  years: number[];
  isPending: boolean;
  isError: boolean;
  onRetry: () => void;
  selectedYear: number;
  onApplyYear: (year: number) => void;
}

const HomePageYearPicker = ({ onClose, years, isPending, isError, onRetry, selectedYear, onApplyYear }: Props) => {
  const [tempYear, setTempYear] = useState(selectedYear);
  const yearGridClass = "grid w-full gap-2";

  const onSubmit = () => {
    onApplyYear(tempYear);
  };

  return (
    <PickerDialog labelledBy="home-year-picker-title" describedBy="home-year-picker-description" onClose={onClose}>
      <div className={PICKER_CONTENT_CLASS}>
        <div className="relative flex min-h-11 items-center justify-center px-12">
          <h2 id="home-year-picker-title" className={PICKER_TITLE_CLASS}>어느 해의 기록을 볼까요?</h2>
          {!isPending && !isError && <button onClick={onSubmit} type="button" className="absolute right-0 min-h-11 px-2 text-xl font-semibold text-theme-accent">적용</button>}
        </div>
        {isError ? (
          <div role="status" className="py-8 text-center text-theme-text-secondary">
            <p>선택할 수 있는 연도를 불러오지 못했어요.</p>
            <button type="button" className="mt-3 text-theme-accent" onClick={onRetry}>다시 시도</button>
          </div>
        ) : isPending ? (
          <p role="status" className="py-8 text-center text-theme-text-secondary">연도를 불러오는 중이에요.</p>
        ) : (
          <>
            <div className={cn(PICKER_BODY_CLASS, yearGridClass, years.length === 1 ? "grid-cols-1" : years.length === 2 ? "grid-cols-2" : "grid-cols-3")}>
              {years.map((year) => {
                const selected = year === tempYear;
                return (
                  <button
                    key={year}
                    className={cn(
                      "min-h-14 rounded-2xl border px-2 py-3 text-base text-theme-text-primary transition-colors",
                      selected ? "border-theme-accent bg-theme-accent/10" : "border-transparent",
                    )}
                    aria-pressed={selected}
                    onClick={() => setTempYear(year)}
                    type="button"
                  >
                    {year}년
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </PickerDialog>
  );
};

export default HomePageYearPicker;
