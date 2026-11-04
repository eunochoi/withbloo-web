'use client';

import { sortHabits } from '@/common/functions/sortHabits';
import { useSortSectionScroll } from '@/common/hooks/useSortSectionScroll';

import { authAction } from '@/common/auth/authAction';
import { habitQueries } from '@/common/queries/habitQueries';
import { useQuery } from '@tanstack/react-query';
import { AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

import { PanelDialog } from '@/common/components/ui/Dialog/PanelDialog';
import { PanelBody } from '@/common/components/ui/Dialog/PanelDialog/PanelBody';
import { PanelHeader } from '@/common/components/ui/Dialog/PanelDialog/PanelHeader';
import { PanelSubmitButton } from '@/common/components/ui/Dialog/PanelDialog/PanelSubmitButton';
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
  const [, setUserSortSelected] = useState(false);
  const sections = useSortSectionScroll(sortValue === 'CUSTOM', isStorageReady && (tempHabits !== null || isError));

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
        <PanelDialog
          ariaLabel="습관 정렬 설정"
          onClose={() => setIsDialogMounted(false)}
        >
          <PanelHeader
            title="습관 정렬"
            onBack={() => setIsDialogMounted(false)}
            headerLeft={
              <button
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
                className="min-h-11 text-lg font-normal text-theme-text-secondary/70 disabled:opacity-40"
              >
                초기화
              </button>
            }
            headerRight={
              <PanelSubmitButton
                disabled={!isStorageReady || (draftSort === 'CUSTOM' && (!tempHabits || !customHabits))}
                onClick={onSubmit}
                type="button"
              >
                적용
              </PanelSubmitButton>
            }
          />
          <PanelBody ref={sections.scrollRef} showScrollFade>
            <div className="flex min-w-0 w-full flex-col pb-6">
              <section ref={sections.standardRef} className="flex min-w-0 flex-col gap-5 pb-8">
                <label className="flex cursor-pointer items-center gap-2 text-lg font-semibold">
                  <input type="radio" name="habit-sort-mode" value="standard" checked={draftSort !== 'CUSTOM'} onChange={() => { setDraftSort(standardSort); setUserSortSelected(false); sections.cancelInitialScroll(); }} onClick={sections.cancelInitialScroll} className="h-5 w-5 shrink-0 appearance-none rounded-full border border-theme-accent bg-theme-surface checked:bg-theme-accent checked:shadow-[inset_0_0_0_3px_rgb(var(--theme-surface))] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-theme-accent" />
                  기준별 정렬
                </label>
                <fieldset disabled={draftSort === 'CUSTOM'} className={`p-2 flex min-w-0 flex-col gap-5 transition-opacity ${draftSort === 'CUSTOM' ? 'opacity-40' : ''}`}>
                  <label className="flex items-center justify-between gap-3 text-base font-semibold">
                    중요한 항목 먼저
                    <input type="checkbox" role="switch" checked={priority} onChange={(event) => setPriority(event.target.checked)} className="peer sr-only" />
                    <span aria-hidden="true" className="relative h-7 w-12 shrink-0 rounded-full bg-theme-border transition-colors after:absolute after:left-1 after:top-1 after:h-5 after:w-5 after:rounded-full after:bg-theme-surface after:transition-transform peer-checked:bg-theme-accent peer-checked:after:translate-x-5" />
                  </label>
                  <section className="flex flex-col gap-3">
                    <h3 className="text-base font-semibold">생성일 정렬</h3>
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
              <section ref={sections.customRef} className="flex min-w-0 flex-col gap-5 border-t border-theme-border/30 pt-8">
                <label className="flex cursor-pointer items-center gap-2 text-lg font-semibold">
                  <input type="radio" name="habit-sort-mode" value="user" checked={draftSort === 'CUSTOM'} onChange={() => { setDraftSort('CUSTOM'); setUserSortSelected(true); sections.cancelInitialScroll(); }} onClick={() => { setUserSortSelected(true); sections.cancelInitialScroll(); }} className="h-5 w-5 shrink-0 appearance-none rounded-full border border-theme-accent bg-theme-surface checked:bg-theme-accent checked:shadow-[inset_0_0_0_3px_rgb(var(--theme-surface))] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-theme-accent" />
                  자유 정렬
                </label>
                <fieldset disabled={draftSort !== 'CUSTOM'} className={`p-2 flex min-w-0 flex-col gap-5 transition-opacity ${draftSort !== 'CUSTOM' ? 'opacity-40' : ''}`}>
                  {draftSort === 'CUSTOM' && !customHabits && isPending && <p role="status" className="py-4 text-center text-sm text-theme-text-secondary">습관을 불러오는 중이에요.</p>}
                  {draftSort === 'CUSTOM' && !customHabits && isError && <div className="py-4 text-center text-sm text-theme-text-secondary">습관을 불러오지 못했어요. <button type="button" onClick={() => void refetch()} className="text-theme-accent">다시 시도</button></div>}
                  {tempHabits && <HabitManualSortList tempHabits={tempHabits} onOrderChange={setTempHabits} disabled={draftSort !== 'CUSTOM'} />}
                  <InfoNotice>직접 정한 순서로 보여드려요.</InfoNotice>
                </fieldset>
              </section>
            </div>
          </PanelBody>
        </PanelDialog>
      )}
    </AnimatePresence>
  );
};
