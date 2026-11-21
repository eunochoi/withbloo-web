"use client";


import { DateSelectionCalendar } from '@/common/components/ui/DateSelectionCalendar';
import { DateSelectionForm } from '@/common/components/ui/DateSelectionForm';
import { BottomSheetHeading } from '@/common/components/ui/BottomSheet/BottomSheetHeading';
import { BottomSheetPickerHeader } from "@/common/components/ui/BottomSheet/BottomSheetPickerHeader";

import { DiaryIcon } from "@/common/constants/appIcons";

import { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authAction } from "@/common/auth/authAction";
import { BottomSheetPicker } from "@/common/components/ui/BottomSheet/BottomSheetPicker";
import InfoNotice from "@/common/components/ui/InfoNotice";
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
  const notice = useRef("일기를 작성할 날짜를 선택해주세요.");
  if (!draft) notice.current = "일기를 작성할 날짜를 선택해주세요.";
  else if (!valid) notice.current = "오늘 또는 이전 날짜를 선택해주세요.";
  else if (!query.isFetching && !query.isPending) {
    notice.current = query.isError
      ? "선택한 날짜의 일기를 확인하지 못했어요."
      : occupied
        ? "이미 일기가 있는 날짜예요. 다른 날짜를 선택해주세요."
        : "날짜를 바꿔도 작성 중인 내용과 이미지는 유지돼요.";
  }
  const disabled =
    !valid ||
    query.isPending ||
    query.isError ||
    monthQuery.isError ||
    monthQuery.isPending ||
    occupied ||
    query.isFetching;

  return (
    <BottomSheetPicker fixedHeight labelledBy="diary-date-title" onClose={onClose} header={<BottomSheetPickerHeader>
          <BottomSheetHeading id="diary-date-title">
            날짜 선택
          </BottomSheetHeading>
          <button
            type="button"
            disabled={disabled}
            onClick={() => onApply(draft)}
            className="absolute right-0 min-h-11 text-lg font-normal text-theme-accent disabled:opacity-40"
          >
            완료
          </button>
        </BottomSheetPickerHeader>}>
      <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto overscroll-contain pb-6">


        <DateSelectionForm date={draft}>
        <DateSelectionCalendar calendar={calendar} selected={draft} today={today} onSelect={(date) => { setDraft(date); }} marker={(date, selected) => monthQuery.data?.daysByDate[date]?.hasDiary ? { icon: <DiaryIcon className={selected ? "text-xl text-theme-text-on-accent" : "text-xl text-theme-accent"} aria-hidden="true" />, label: "일기 있음" } : undefined} busy={monthQuery.isFetching} />
        </DateSelectionForm>
        <InfoNotice>{monthQuery.isError ? "일기가 있는 날짜를 확인하지 못했어요." : notice.current}</InfoNotice>
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
    </BottomSheetPicker>
  );
};

export default DiaryDatePicker;
