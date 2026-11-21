'use client';

import { ContentBottomButton } from '@/common/components/ui/ContentBottomButton';

import { sortHabits } from '@/common/functions/sortHabits';

import { authAction } from '@/common/auth/authAction';
import { habitQueries } from '@/common/queries/habitQueries';
import { useQuery } from '@tanstack/react-query';
import { AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

import { BottomSheet } from '@/common/components/ui/BottomSheet/BottomSheet';
import { BottomSheetBody } from '@/common/components/ui/BottomSheet/BottomSheetBody';
import { BottomSheetTitle } from '@/common/components/ui/BottomSheet/BottomSheetTitle';
import { BottomSheetSubmitButton } from '@/common/components/ui/BottomSheet/BottomSheetSubmitButton';
import { SheetSectionHeading } from '@/common/components/ui/BottomSheet/SheetSectionHeading';
import { CheckIcon, SortIcon, DragIcon } from '@/common/constants/appIcons';
import InfoNotice from '@/common/components/ui/InfoNotice';
import { showNotice } from '@/common/components/ui/Notice/notice';
import type { HabitSort } from '@/common/types/sort';
import { HabitSortEntry } from './_types';
import type { HabitData } from '@/common/actions/habit/types';
import { HabitManualSortList } from './HabitManualSortList';

export const HabitSortModal = ({ onClose, sortValue, priorityFirst, customHabitOrder, setCustomHabitOrder, setSort, isStorageReady, initialHabits }: {
  onClose: () => void;
  sortValue: HabitSort;
  priorityFirst: boolean;
  customHabitOrder: number[];
  setCustomHabitOrder: (order: number[]) => void;
  setSort: (sort: HabitSort, priority: boolean) => void;
  isStorageReady: boolean;
  initialHabits?: HabitData[];
}) => {
  const [isDialogMounted, setIsDialogMounted] = useState(true);

  const {
    data: customHabits,
    isPending,
    isError,
    refetch,
  } = useQuery({
    ...habitQueries.list(authAction),
    enabled: isStorageReady,
    initialData: initialHabits,
    select: (data) =>
      sortHabits(data, { sortType: 'CUSTOM', customHabitOrder }),
  });

  const [tempHabits, setTempHabits] = useState<HabitSortEntry[] | null>(() => customHabits ?? null);
  const [, setResetToDefault] = useState(false);
  const [draftSort, setDraftSort] = useState(sortValue);
  const [priority, setPriority] = useState(priorityFirst);
  const [standardSort, setStandardSort] = useState<'ASC' | 'DESC'>(sortValue === 'CUSTOM' ? 'DESC' : sortValue);

  useEffect(() => setDraftSort(sortValue), [sortValue]);

  useEffect(() => {
    if (customHabits) {
      setTempHabits((current) => current ?? customHabits);
    }
  }, [customHabits]);

  const defaultHabits = sortHabits(customHabits ?? [], { sortType: 'DESC' });
  const currentIds = tempHabits?.map((habit) => habit.id) ?? [];
  const isDefaultOrder =
    currentIds.length === defaultHabits.length &&
    currentIds.every((id, index) => id === defaultHabits[index].id);

  const onSubmit = () => {
    if (!isStorageReady || (draftSort === 'CUSTOM' && (!tempHabits || !customHabits))) return;
    setSort(draftSort, draftSort === 'CUSTOM' ? false : priority);
    if (draftSort === 'CUSTOM') setCustomHabitOrder(isDefaultOrder ? [] : currentIds);
    setIsDialogMounted(false);
    setTimeout(() => showNotice('습관 정렬을 저장했어요.'), 300);
  };

  return (
    <AnimatePresence onExitComplete={onClose}>
      {isDialogMounted && (
        <BottomSheet
          ariaLabel="습관 정렬 설정"
          onClose={() => setIsDialogMounted(false)}
        >
          <BottomSheetTitle
            title="습관 정렬"
            onBack={() => setIsDialogMounted(false)}

            headerButton={
              <BottomSheetSubmitButton
                disabled={!isStorageReady || (draftSort === 'CUSTOM' && (!tempHabits || !customHabits))}
                onClick={onSubmit}
                type="button"
              >
                적용
              </BottomSheetSubmitButton>
            }
          />
          <BottomSheetBody showScrollFade>
            <div className="flex w-full min-w-0 flex-col gap-12 pb-6">

              <section className="flex min-w-0 flex-col gap-10">
                <SheetSectionHeading icon={SortIcon} title="기준별 정렬" toggle={{ checked: draftSort !== 'CUSTOM', onChange: (checked) => setDraftSort(checked ? standardSort : 'CUSTOM') }} />
                <fieldset disabled={draftSort === 'CUSTOM'} className={`flex min-w-0 flex-col gap-6 pl-7 transition-opacity ${draftSort === 'CUSTOM' ? 'opacity-40' : ''}`}>
                  <label className="flex min-h-7 cursor-pointer items-center justify-between gap-3 text-base font-semibold text-theme-text-secondary">
                    중요한 항목 먼저
                    <input type="checkbox" checked={priority} onChange={(event) => setPriority(event.currentTarget.checked)} className="peer sr-only" />
                    <span
                      aria-hidden="true"
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-theme-text-on-accent transition-colors motion-reduce:transition-none peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-theme-accent ${priority ? 'border-theme-accent/75 bg-theme-accent/75' : 'border-theme-accent/60 bg-theme-surface'}`}
                    >
                      {priority && <CheckIcon className="h-3.5 w-3.5" />}
                    </span>
                  </label>
                  <section className="flex flex-col gap-3">
                    <h3 className="text-base font-semibold text-theme-text-secondary">생성일 정렬</h3>
                    <div className="flex gap-3">
                      {(['DESC', 'ASC'] as const).map((value) => (
                        <button key={value} type="button" aria-pressed={standardSort === value} onClick={() => { setStandardSort(value); setDraftSort(value); }} className={`min-h-12 flex-1 rounded-xl border px-1 py-3 ${standardSort === value ? 'border-theme-accent bg-theme-accent/10 text-theme-accent-deep' : 'border-theme-border/70'}`}>
                          {value === 'DESC' ? '최신순' : '과거순'}
                        </button>
                      ))}
                    </div>
                  </section>
                  <InfoNotice>{priority ? '중요한 항목부터, ' : ''}생성일 순으로 정렬해요.</InfoNotice>
                </fieldset>
              </section>
              <section className="flex min-w-0 flex-col gap-10">
                <SheetSectionHeading icon={DragIcon} title="자유 정렬" toggle={{ checked: draftSort === 'CUSTOM', onChange: (checked) => setDraftSort(checked ? 'CUSTOM' : standardSort) }} />
                <fieldset disabled={draftSort !== 'CUSTOM'} className={`flex min-w-0 flex-col gap-6 pl-7 transition-opacity ${draftSort !== 'CUSTOM' ? 'opacity-40' : ''}`}>
                  {draftSort === 'CUSTOM' && !customHabits && isPending && <p role="status" className="py-4 text-center text-sm text-theme-text-secondary">습관을 불러오는 중이에요.</p>}
                  {draftSort === 'CUSTOM' && !customHabits && isError && <div className="py-4 text-center text-sm text-theme-text-secondary">습관을 불러오지 못했어요. <button type="button" onClick={() => void refetch()} className="text-theme-accent">다시 시도</button></div>}
                  {tempHabits && <HabitManualSortList tempHabits={tempHabits} onOrderChange={setTempHabits} disabled={draftSort !== 'CUSTOM'} />}
                  {(tempHabits?.length ?? 0) > 1 && <InfoNotice>위아래로 끌어 습관 순서를 변경하세요.</InfoNotice>}
                </fieldset>
              </section>
        <ContentBottomButton
                type="button"
                aria-label="선택 초기화"
                disabled={draftSort === 'CUSTOM' && !tempHabits}
                onClick={() => {
                  if (draftSort === 'CUSTOM') {
                    setTempHabits(defaultHabits);
                    setResetToDefault(true);
                  } else {
                    setDraftSort('DESC');
                    setStandardSort('DESC');
                    setPriority(false);
                  }
                }}

              >
                초기화
              </ContentBottomButton>
            </div>
          </BottomSheetBody>
        </BottomSheet>
      )}
    </AnimatePresence>
  );
};
