'use client';

import { authAction } from '@/common/auth/authAction';
import { BottomSheet } from '@/common/components/ui/BottomSheet/BottomSheet';
import { BottomSheetBody } from '@/common/components/ui/BottomSheet/BottomSheetBody';
import { BottomSheetHeading } from '@/common/components/ui/BottomSheet/BottomSheetHeading';
import { BottomSheetPicker } from '@/common/components/ui/BottomSheet/BottomSheetPicker';
import { BottomSheetSubmitButton } from '@/common/components/ui/BottomSheet/BottomSheetSubmitButton';
import { BottomSheetTitle } from '@/common/components/ui/BottomSheet/BottomSheetTitle';
import { SheetSectionHeading } from '@/common/components/ui/BottomSheet/SheetSectionHeading';
import { ContentBottomButton } from '@/common/components/ui/ContentBottomButton';
import { FilterPickerRow } from '@/common/components/ui/FilterPickerRow';
import InfoNotice from '@/common/components/ui/InfoNotice';
import { DiaryIcon, HabitIcon, SoberIcon } from '@/common/constants/appIcons';
import { DIARY_EMOTION_GROUPS, DIARY_SEASONS, type DiaryEmotionGroup, type DiarySeason } from '@/common/constants/diaryFilters';
import { statsQueries } from '@/common/queries/statsQueries';
import { DEFAULT_FEED_FILTERS, FEED_KINDS, FEED_KIND_LABELS, type FeedFilters } from '@/common/types/feed';
import { useQuery } from '@tanstack/react-query';
import { AnimatePresence } from 'framer-motion';
import { useState } from 'react';

const filterIcons = { diary: DiaryIcon, habit: HabitIcon, sober: SoberIcon };
const seasons = Object.keys(DIARY_SEASONS) as DiarySeason[];
const emotionGroups = Object.keys(DIARY_EMOTION_GROUPS) as DiaryEmotionGroup[];

const optionStyle = (selected: boolean) =>
  selected ? 'border-theme-accent bg-theme-accent/10 text-theme-accent-deep' : 'border-theme-border/70';

export default function FeedFilterPicker({ filters, onClose, onApply }: {
  filters: FeedFilters;
  onClose: () => void;
  onApply: (filters: FeedFilters) => void;
}) {
  const [draft, setDraft] = useState(filters);
  const [yearOpen, setYearOpen] = useState(false);
  const diaryEnabled = draft.kinds.includes('diary');
  const selectedGroups = draft.groups;
  const years = useQuery({ ...statsQueries.years(authAction), enabled: yearOpen });

  return (
    <>
      <BottomSheet ariaLabel="기록 필터" onClose={onClose} height="auto">
        <BottomSheetTitle
          title="기록 필터"
          headerButton={
            <BottomSheetSubmitButton type="button" onClick={() => onApply(draft)}>적용</BottomSheetSubmitButton>
          }
        />
        <BottomSheetBody showScrollFade>
          <div className="flex w-full min-w-0 flex-col gap-12 pb-6">
            {FEED_KINDS.map((kind) => (
              <section key={kind} className="flex min-w-0 flex-col gap-10">
                <SheetSectionHeading
                  icon={filterIcons[kind]}
                  title={`${FEED_KIND_LABELS[kind]} 필터`}
                  toggle={{
                    checked: draft.kinds.includes(kind),
                    onChange: (checked) => setDraft((current) => ({
                      ...current,
                      kinds: FEED_KINDS.filter((value) => value === kind ? checked : current.kinds.includes(value)),
                    })),
                  }}
                />
                {kind === 'diary' && (
                  <fieldset
                    disabled={!diaryEnabled}
                    className={`flex min-w-0 flex-col gap-6 pl-7 transition-opacity ${diaryEnabled ? '' : 'opacity-40'}`}
                  >
                    <section className="flex flex-col gap-3">
                      <h3 className="text-base font-semibold text-theme-text-secondary">연도</h3>
                      <FilterPickerRow
                        label={draft.year === null ? '전체 연도' : `${draft.year}년`}
                        accessibilityLabel="연도 선택"
                        onClick={() => setYearOpen(true)}
                      />
                    </section>
                    <section className="flex flex-col gap-3">
                      <div className="flex justify-between gap-3">
                        <h3 className="text-base font-semibold text-theme-text-secondary">계절</h3>
                        <span className="text-sm text-theme-text-secondary">
                          {draft.seasons.length ? draft.seasons.map((season) => DIARY_SEASONS[season].label).join(', ') : '전체 계절'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {seasons.map((season) => {
                          const selected = draft.seasons.includes(season);
                          return (
                            <button
                              key={season}
                              type="button"
                              role="checkbox"
                              aria-checked={selected}
                              onClick={() => setDraft({
                                ...draft,
                                seasons: selected ? draft.seasons.filter((value) => value !== season) : [...draft.seasons, season],
                              })}
                              className={`min-h-12 rounded-xl border px-2 ${optionStyle(selected)}`}
                            >
                              {DIARY_SEASONS[season].label}
                            </button>
                          );
                        })}
                      </div>
                      <InfoNotice>봄 3~5월, 여름 6~8월<br />가을 9~11월, 겨울 12~다음 2월</InfoNotice>
                    </section>
                    <section className="flex flex-col gap-3">
                      <div className="flex justify-between gap-3">
                        <h3 className="text-base font-semibold text-theme-text-secondary">감정</h3>
                        <span className="text-sm text-theme-text-secondary">
                          {selectedGroups.length ? selectedGroups.map((group) => DIARY_EMOTION_GROUPS[group].label).join(', ') : '전체 감정'}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        {emotionGroups.map((group) => {
                          const selected = selectedGroups.includes(group);
                          const option = DIARY_EMOTION_GROUPS[group];
                          return (
                            <button
                              key={group}
                              type="button"
                              role="checkbox"
                              aria-checked={selected}
                              onClick={() => setDraft({
                                ...draft,
                                groups: selected ? selectedGroups.filter((value) => value !== group) : [...selectedGroups, group],
                              })}
                              className={`flex min-h-20 min-w-0 flex-col items-center justify-center gap-1 rounded-xl border px-1 py-2 ${optionStyle(selected)}`}
                            >
                              <span>{option.label}</span>
                              <span className="whitespace-pre-line text-center text-xs leading-4 text-theme-text-secondary">{option.description}</span>
                            </button>
                          );
                        })}
                      </div>
                    </section>
                  </fieldset>
                )}
              </section>
            ))}
            <ContentBottomButton type="button" onClick={() => setDraft(DEFAULT_FEED_FILTERS)}>
              초기화
            </ContentBottomButton>
          </div>
        </BottomSheetBody>
      </BottomSheet>
      <AnimatePresence>
        {yearOpen && (
          <BottomSheetPicker
            labelledBy="feed-year-title"
            header={<BottomSheetHeading id="feed-year-title">연도 선택</BottomSheetHeading>}
            onClose={() => setYearOpen(false)}
          >
            <div className="flex flex-col gap-3 pb-6">
              {[null, ...(years.data ?? [])].map((year) => (
                <button
                  key={year ?? 'all'}
                  type="button"
                  onClick={() => {
                    setDraft({ ...draft, year });
                    setYearOpen(false);
                  }}
                  className={`min-h-12 rounded-xl border ${optionStyle(draft.year === year)}`}
                >
                  {year === null ? '전체 연도' : `${year}년`}
                </button>
              ))}
              {years.isPending && <p role="status" className="text-center text-sm text-theme-text-secondary">연도를 불러오는 중이에요.</p>}
              {years.isError && (
                <button type="button" onClick={() => void years.refetch()} className="min-h-11 text-theme-accent">연도 다시 불러오기</button>
              )}
            </div>
          </BottomSheetPicker>
        )}
      </AnimatePresence>
    </>
  );
}
