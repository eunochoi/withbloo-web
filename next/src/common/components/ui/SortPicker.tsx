"use client";

import { PickerHeader } from "@/common/components/ui/Dialog/PickerDialog/PickerHeader";

import { useState } from "react";

import InfoNotice from "./InfoNotice";
import { PickerDialog } from "./Dialog/PickerDialog";

interface Props<T extends string> {
  title: string;
  value: T;
  options: { value: T; label: string }[];
  priorityFirst?: boolean;
  recordSort?: "ASC" | "DESC";
  sortLabel?: string;
  showCriteriaSort?: boolean;
  onClose: () => void;
  onApply: (
    value: T,
    priorityFirst: boolean,
    recordSort?: "ASC" | "DESC",
  ) => void;
}

const SortPicker = <T extends string>({
  title,
  value,
  options,
  priorityFirst,
  recordSort,
  sortLabel,
  showCriteriaSort = false,
  onClose,
  onApply,
}: Props<T>) => {
  const [selected, setSelected] = useState(value);
  const [records, setRecords] = useState(recordSort);
  const [priority, setPriority] = useState(priorityFirst ?? false);
  return (
    <PickerDialog labelledBy="sort-picker-title" onClose={onClose} header={<PickerHeader
          headerLeft={
            <button
              type="button"
              onClick={() => {
                setSelected(options[0].value);
                setPriority(false);
                setRecords(recordSort ? "DESC" : undefined);
              }}
              className="min-h-11 text-lg font-normal text-theme-text-secondary/70"
            >
              초기화
            </button>
          }
        >
          <h2
            id="sort-picker-title"
            className="text-center text-xl font-semibold"
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={() =>
              onApply(
                selected,
                selected === "CUSTOM" ? false : priority,
                records,
              )
            }
            className="absolute right-0 min-h-11 text-lg font-normal text-theme-accent"
          >
            적용
          </button>
        </PickerHeader>}>
      <div className={`flex flex-col pb-6 ${showCriteriaSort ? 'gap-5' : 'gap-7'}`}>

        {priorityFirst !== undefined && (
          <label className="flex items-center justify-between gap-3 text-lg font-semibold">
            중요한 항목 먼저
            <input
              type="checkbox"
              role="switch"
              checked={priority}
              onChange={(event) => {
                setPriority(event.target.checked);
                if (event.target.checked && selected === "CUSTOM")
                  setSelected(options[0].value);
              }}
              className="peer sr-only"
            />
            <span
              aria-hidden="true"
              className="relative h-7 w-12 shrink-0 rounded-full bg-theme-border transition-colors after:absolute after:left-1 after:top-1 after:h-5 after:w-5 after:rounded-full after:bg-theme-surface after:transition-transform peer-checked:bg-theme-accent peer-checked:after:translate-x-5"
            />
          </label>
        )}
        {recordSort && (
          <section className="flex flex-col gap-3">
            <h3 className="text-lg font-semibold">기록</h3>
            <div className="flex gap-3">
              {(["DESC", "ASC"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={records === value}
                  onClick={() => setRecords(value)}
                  className={`min-h-12 flex-1 rounded-xl border px-1 py-3 ${records === value ? "border-theme-accent bg-theme-accent/10 text-theme-accent-deep" : "border-theme-border/70"}`}
                >
                  {value === "DESC" ? "긴 기록순" : "짧은 기록순"}
                </button>
              ))}
            </div>
          </section>
        )}
        <section className={`flex flex-col gap-3 ${showCriteriaSort ? 'px-2' : ''}`}>
          <h3 className={showCriteriaSort ? 'text-base font-semibold' : 'text-lg font-semibold'}>
            {sortLabel ?? (title === "일기 정렬" ? "날짜순 정렬" : "생성일 정렬")}
          </h3>
          <div className="flex gap-3">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={selected === option.value}
                onClick={() => {
                  setSelected(option.value);
                  if (option.value === "CUSTOM") setPriority(false);
                  setRecords(recordSort ? "DESC" : undefined);
                }}
                className={`min-h-12 min-w-0 flex-1 rounded-xl border px-1 py-3 ${selected === option.value ? "border-theme-accent bg-theme-accent/10 text-theme-accent-deep" : "border-theme-border/70"}`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </section>
        <div className={`flex flex-col gap-1 ${showCriteriaSort ? 'px-2' : ''}`}>
          <InfoNotice>
            {selected === "CUSTOM"
              ? "직접 정한 순서로 보여드려요."
              : recordSort
                ? `${priority ? "중요도, " : ""}현재 기록, 생성일 순으로 정렬해요.`
                : `${priority ? "중요한 항목부터, " : ""}${sortLabel?.replace(/ 정렬$/, "") ?? (title === "일기 정렬" ? "날짜" : "생성일")} 순으로 정렬해요.`}
          </InfoNotice>
          {options.some((option) => option.value === "CUSTOM") && (
            <InfoNotice>
              커스텀과 중요도 우선은 함께 선택할 수 없어요.
            </InfoNotice>
          )}
        </div>
      </div>
    </PickerDialog>
  );
};

export default SortPicker;
