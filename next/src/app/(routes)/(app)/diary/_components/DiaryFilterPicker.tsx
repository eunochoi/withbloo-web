"use client";

import { SheetSectionHeading } from '@/common/components/ui/BottomSheet/SheetSectionHeading';
import { FilterIcon } from '@/common/constants/appIcons';
import { ContentBottomButton } from '@/common/components/ui/ContentBottomButton';


import { BottomSheetHeading } from '@/common/components/ui/BottomSheet/BottomSheetHeading';
import { BottomSheetPickerHeader } from "@/common/components/ui/BottomSheet/BottomSheetPickerHeader";

import { FilterPickerRow } from "@/common/components/ui/FilterPickerRow";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";

import { authAction } from "@/common/auth/authAction";
import { BottomSheetPicker } from "@/common/components/ui/BottomSheet/BottomSheetPicker";
import InfoNotice from "@/common/components/ui/InfoNotice";
import {
  DIARY_EMOTION_GROUPS,
  DIARY_SEASONS,
  type DiaryEmotionGroup,
  type DiarySeason,
} from "@/common/constants/diaryFilters";
import { statsQueries } from "@/common/queries/statsQueries";

const DiaryFilterPicker = ({
  year,
  seasons,
  emotionGroups,
  onClose,
  onApply,
}: {
  year: number | null;
  seasons: DiarySeason[];
  emotionGroups: DiaryEmotionGroup[];
  onClose: () => void;
  onApply: (
    year: number | null,
    seasons: DiarySeason[],
    groups: DiaryEmotionGroup[],
  ) => void;
}) => {
  const [selectedYear, setSelectedYear] = useState(year);
  const [selectedSeasons, setSelectedSeasons] = useState(seasons);
  const [selectedGroups, setSelectedGroups] = useState(emotionGroups);
  const [yearOpen, setYearOpen] = useState(false);
  const yearsQuery = useQuery({
    ...statsQueries.years(authAction),
    enabled: yearOpen,
  });
  return (
    <BottomSheetPicker labelledBy="diary-filter-title" onClose={onClose} header={<BottomSheetPickerHeader>
          <BottomSheetHeading id="diary-filter-title">
            일기 필터
          </BottomSheetHeading>
          <button
            type="button"
            onClick={() =>
              onApply(selectedYear, selectedSeasons, selectedGroups)
            }
            className="absolute right-0 min-h-11 text-lg font-normal text-theme-accent"
          >
            적용
          </button>
        </BottomSheetPickerHeader>}>
      <div className="flex flex-col gap-8 pb-6">
        <div className="flex flex-col gap-10">
          <SheetSectionHeading icon={FilterIcon} title="필터 조건" />
          <div className="flex flex-col gap-6 pl-7">
            <section className="flex flex-col gap-3">
              <h3 className="text-base font-semibold text-theme-text-secondary">연도</h3>
              <FilterPickerRow
                label={selectedYear === null ? "전체 연도" : `${selectedYear}년`}
                accessibilityLabel="연도 선택"
                onClick={() => setYearOpen(true)}
              />
            </section>
            <section className="flex flex-col gap-3">
              <div className="flex justify-between gap-3">
                <h3 className="text-base font-semibold text-theme-text-secondary">계절</h3>
                <span className="text-sm text-theme-text-secondary">
                  {selectedSeasons.length
                    ? selectedSeasons
                        .map((season) => DIARY_SEASONS[season].label)
                        .join(", ")
                    : "전체 계절"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {(Object.keys(DIARY_SEASONS) as DiarySeason[]).map((season) => {
                  const selected = selectedSeasons.includes(season);
                  return (
                    <button
                      key={season}
                      type="button"
                      role="checkbox"
                      aria-checked={selected}
                      onClick={() =>
                        setSelectedSeasons((previous) =>
                          selected
                            ? previous.filter((item) => item !== season)
                            : [...previous, season],
                        )
                      }
                      className={`min-h-12 rounded-xl border px-2 ${selected ? "border-theme-accent bg-theme-accent/10 text-theme-accent-deep" : "border-theme-border/70"}`}
                    >
                      {DIARY_SEASONS[season].label}
                    </button>
                  );
                })}
              </div>
              <InfoNotice>
                봄 3~5월, 여름 6~8월
                <br />
                가을 9~11월, 겨울 12~다음 2월
              </InfoNotice>
            </section>
            <section className="flex flex-col gap-3">
              <div className="flex justify-between gap-3">
                <h3 className="text-base font-semibold text-theme-text-secondary">감정</h3>
                <span className="text-sm text-theme-text-secondary">
                  {selectedGroups.length
                    ? selectedGroups
                        .map((group) => DIARY_EMOTION_GROUPS[group].label)
                        .join(", ")
                    : "전체 감정"}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {(Object.keys(DIARY_EMOTION_GROUPS) as DiaryEmotionGroup[]).map(
                  (group) => {
                    const selected = selectedGroups.includes(group);
                    const item = DIARY_EMOTION_GROUPS[group];
                    return (
                      <button
                        key={group}
                        type="button"
                        role="checkbox"
                        aria-checked={selected}
                        onClick={() =>
                          setSelectedGroups((previous) =>
                            selected
                              ? previous.filter((value) => value !== group)
                              : [...previous, group],
                          )
                        }
                        className={`flex min-h-20 min-w-0 flex-col items-center justify-center gap-1 rounded-xl border px-1 py-2 ${selected ? "border-theme-accent bg-theme-accent/10 text-theme-accent-deep" : "border-theme-border/70"}`}
                      >
                        <span>{item.label}</span>
                        <span className="whitespace-pre-line text-center text-xs leading-4 text-theme-text-secondary">
                          {item.description}
                        </span>
                      </button>
                    );
                  },
                )}
              </div>
              <InfoNotice>여러 개 선택할 수 있어요. 다시 누르면 해제돼요.</InfoNotice>
            </section>
          </div>
        </div>
        <ContentBottomButton
              type="button"
              onClick={() => {
                setSelectedYear(null);
                setSelectedSeasons([]);
                setSelectedGroups([]);
              }}

            >
              초기화
            </ContentBottomButton>
      </div>
      <AnimatePresence>
        {yearOpen && (
          <BottomSheetPicker
            labelledBy="diary-year-title"
            onClose={() => setYearOpen(false)}
           header={<BottomSheetHeading id="diary-year-title">
                연도 선택
              </BottomSheetHeading>}>
            <div className="flex flex-col gap-3 pb-6">

              {[null, ...(yearsQuery.data ?? [])].map((value) => (
                <button
                  key={value ?? "all"}
                  type="button"
                  onClick={() => {
                    setSelectedYear(value);
                    setYearOpen(false);
                  }}
                  className={`min-h-12 rounded-xl border ${selectedYear === value ? "border-theme-accent bg-theme-accent/10 text-theme-accent-deep" : "border-theme-border/70"}`}
                >
                  {value === null ? "전체 연도" : `${value}년`}
                </button>
              ))}
              {yearsQuery.isPending && (
                <p className="text-center text-sm text-theme-text-secondary">
                  연도를 불러오고 있어요.
                </p>
              )}
              {yearsQuery.isError && (
                <button
                  type="button"
                  onClick={() => void yearsQuery.refetch()}
                  className="text-theme-accent"
                >
                  연도 다시 불러오기
                </button>
              )}
            </div>
          </BottomSheetPicker>
        )}
      </AnimatePresence>
    </BottomSheetPicker>
  );
};

export default DiaryFilterPicker;
