"use client";

import { PickerHeader } from "@/common/components/ui/Dialog/PickerDialog/PickerHeader";

import { PickerDialog } from "@/common/components/ui/Dialog/PickerDialog";
import { HabitPriority } from "@/common/components/ui/Habit/HabitPriority";
import InfoNotice from "@/common/components/ui/InfoNotice";
import { useState } from "react";

const HabitFilterPicker = ({
  completedOnly,
  priorities,
  onClose,
  onApply,
}: {
  completedOnly: boolean;
  priorities: number[];
  onClose: () => void;
  onApply: (completedOnly: boolean, priorities: number[]) => void;
}) => {
  const [completed, setCompleted] = useState(completedOnly);
  const [selected, setSelected] = useState(priorities);
  return (
    <PickerDialog labelledBy="habit-filter-title" onClose={onClose}>
      <div className="flex flex-col gap-7 pb-6">
        <PickerHeader
          headerLeft={
            <button
              type="button"
              onClick={() => {
                setCompleted(false);
                setSelected([]);
              }}
              className="min-h-11 px-2 text-lg font-semibold text-theme-accent"
            >
              초기화
            </button>
          }
        >
          <h2
            id="habit-filter-title"
            className="text-center text-lg font-semibold"
          >
            습관 필터
          </h2>
          <button
            type="button"
            onClick={() => onApply(completed, selected)}
            className="absolute right-0 min-h-11 px-2 text-lg font-semibold text-theme-accent"
          >
            적용
          </button>
        </PickerHeader>

        <label className="flex items-center justify-between gap-3 font-semibold">
          완료한 항목만 보기
          <input
            type="checkbox"
            role="switch"
            checked={completed}
            onChange={(event) => setCompleted(event.target.checked)}
            className="peer sr-only"
          />
          <span
            aria-hidden="true"
            className="relative h-7 w-12 shrink-0 rounded-full bg-theme-border transition-colors after:absolute after:left-1 after:top-1 after:h-5 after:w-5 after:rounded-full after:bg-theme-surface after:transition-transform peer-checked:bg-theme-accent peer-checked:after:translate-x-5 peer-focus-visible:ring-2 peer-focus-visible:ring-theme-accent"
          />
        </label>
        <section className="flex flex-col gap-4">
          <div className="flex justify-between gap-3">
            <h3 className="font-semibold">중요도</h3>
            <span className="text-sm text-theme-text-secondary">
              {selected.length
                ? selected
                    .slice()
                    .sort()
                    .map((priority) =>
                      priority === 0 ? "자유 기록" : "★".repeat(priority),
                    )
                    .join(", ")
                : "전체"}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[0, 1, 2, 3].map((priority) => (
              <button
                key={priority}
                type="button"
                role="checkbox"
                aria-checked={selected.includes(priority)}
                onClick={() =>
                  setSelected((previous) =>
                    previous.includes(priority)
                      ? previous.filter((item) => item !== priority)
                      : [...previous, priority],
                  )
                }
                className={`flex min-h-12 flex-col items-center justify-center gap-2 rounded-xl border px-1 py-3 ${selected.includes(priority) ? "border-theme-accent bg-theme-accent/10 text-theme-accent" : "border-theme-border text-theme-text-secondary"}`}
              >
                <HabitPriority
                  priority={priority}
                  className="gap-0 text-base"
                />
                <span className="text-sm">
                  {["자유 기록", "낮음", "보통", "높음"][priority]}
                </span>
              </button>
            ))}
          </div>
        </section>
        <InfoNotice>중요도는 여러 개 선택할 수 있어요.</InfoNotice>
      </div>
    </PickerDialog>
  );
};

export default HabitFilterPicker;
