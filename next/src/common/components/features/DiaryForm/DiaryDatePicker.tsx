"use client";

import { PickerHeader } from "@/common/components/ui/Dialog/PickerDialog/PickerHeader";

import { DiaryIcon } from "@/common/constants/appIcons";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authAction } from "@/common/auth/authAction";
import { PickerDialog } from "@/common/components/ui/Dialog/PickerDialog";
import InfoNotice from "@/common/components/ui/InfoNotice";
import { CalendarDay } from "@/common/components/ui/Calendar/CalendarDay";
import CalendarHeader from "@/common/components/ui/Calendar/CalendarHeader";
import { CalendarGrid } from "@/common/components/ui/Calendar/CalendarGrid";
import { useMonthSwipe } from "@/common/components/ui/Calendar/useMonthSwipe";
import { useMonthCalendar } from "@/common/components/ui/Calendar/useMonthCalendar";

import { getTodayString } from "@/common/functions/getTodayString";
import { diaryQueries } from "@/common/queries/diaryQueries";
import { isValidLocalDateString } from "@/common/utils/date/isValidLocalDateString";

const DiaryDatePicker = ({
  value,
  diaryId,
  onClose,
  onApply,
}: {
  value: string | null;
  diaryId?: string | null;
  onClose: () => void;
  onApply: (value: string) => void;
}) => {
  const today = getTodayString();
  const [draft, setDraft] = useState(value ?? "");
  const calendar = useMonthCalendar(value ?? today, { maxDate: today });
  const swipeProps = useMonthSwipe(
    calendar.goPreviousMonth,
    calendar.goNextMonth,
  );
  const monthQuery = useQuery({
    ...diaryQueries.habitMonth(calendar.visibleMonth, authAction),
  });
  const valid =
    isValidLocalDateString(draft) && draft >= "1900-01-01" && draft <= today;
  const query = useQuery({
    ...diaryQueries.byDate(draft, authAction),
    enabled: valid,
  });
  const occupied = !!query.data && String(query.data.id) !== diaryId;
  const disabled =
    !valid ||
    query.isPending ||
    query.isError ||
    monthQuery.isError ||
    monthQuery.isPending ||
    occupied ||
    query.isFetching;

  return (
    <PickerDialog labelledBy="diary-date-title" onClose={onClose}>
      <div className="flex flex-col gap-6 pb-6">
        <PickerHeader
          headerLeft={
            <button
              type="button"
              onClick={() => {
                setDraft(today);
                calendar.showDate(today);
              }}
              className="min-h-11 px-2 text-lg font-semibold text-theme-accent"
            >
              오늘
            </button>
          }
        >
          <h2
            id="diary-date-title"
            className="text-center text-lg font-semibold"
          >
            일기 날짜 선택
          </h2>
          <button
            type="button"
            disabled={disabled}
            onClick={() => onApply(draft)}
            className="absolute right-0 min-h-11 px-2 text-lg font-semibold text-theme-accent disabled:opacity-40"
          >
            완료
          </button>
        </PickerHeader>

        <CalendarHeader
          monthLabel={calendar.monthLabel}
          onPreviousMonth={calendar.goPreviousMonth}
          onNextMonth={calendar.goNextMonth}
          onToday={() => calendar.showDate(today)}
          canGoPrevious={calendar.canGoPrevious}
          canGoNext={calendar.canGoNext}
          centerTitle
        />
        <CalendarGrid
          {...swipeProps}
          aria-label="일기 날짜 선택"
          aria-busy={monthQuery.isFetching}
        >
          {calendar.days.map((day) => {
            const available = calendar.isDateAvailable(day.dateKey);
            const recorded =
              !day.isOutsideMonth &&
              monthQuery.data?.daysByDate[day.dateKey]?.hasDiary;
            return (
              <CalendarDay
                key={day.dateKey}
                day={day}
                isToday={day.dateKey === today}
                isSelected={day.dateKey === draft}
                showTodayIndicator={false}
                className={!available ? "opacity-30" : undefined}
                onClick={
                  available
                    ? () => {
                        setDraft(day.dateKey);
                        calendar.showDate(day.dateKey);
                      }
                    : undefined
                }
                label={`${day.dateKey}${recorded ? ", 일기 있음" : ""}`}
              >
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-full ${day.dateKey === draft ? "bg-theme-accent text-theme-text-on-accent" : ""}`}
                >
                  {recorded ? (
                    <DiaryIcon
                      className={
                        day.dateKey === draft
                          ? "text-xl text-theme-text-on-accent"
                          : "text-xl text-theme-accent"
                      }
                      aria-hidden="true"
                    />
                  ) : (
                    day.dayNumber
                  )}
                </span>
              </CalendarDay>
            );
          })}
        </CalendarGrid>
        <InfoNotice>
          {!valid
            ? "오늘 이전의 날짜를 선택해주세요."
            : query.isError
              ? "선택한 날짜를 확인하지 못했어요."
              : query.isFetching
                ? "선택한 날짜를 확인하고 있어요."
                : occupied
                  ? "이미 일기가 있는 날짜예요. 다른 날짜를 선택해주세요."
                  : "날짜를 바꿔도 작성 중인 내용과 이미지은 유지돼요."}
        </InfoNotice>
        {(query.isError || monthQuery.isError) && (
          <button
            type="button"
            className="text-theme-accent"
            onClick={() => {
              if (query.isError) void query.refetch();
              if (monthQuery.isError) void monthQuery.refetch();
            }}
          >
            다시 확인
          </button>
        )}
      </div>
    </PickerDialog>
  );
};

export default DiaryDatePicker;
