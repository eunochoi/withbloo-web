'use client';

import { ResetIcon, UndoIcon } from '@/common/constants/appIcons';
import { sortHabits } from '@/common/functions/sortHabits';

import { authAction } from '@/common/auth/authAction';
import { habitQueries } from '@/common/queries/habitQueries';
import { useQuery } from '@tanstack/react-query';
import { AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

import { useHabitSortPreferences } from '@/app/(routes)/(app)/habit/_hooks/useHabitSortPreferences';
import { PanelDialog } from '@/common/components/ui/Dialog/PanelDialog';
import { PanelBody } from '@/common/components/ui/Dialog/PanelDialog/PanelBody';
import { PanelFooter } from '@/common/components/ui/Dialog/PanelDialog/PanelFooter';
import { PanelHeader } from '@/common/components/ui/Dialog/PanelDialog/PanelHeader';
import { PanelSubmitButton } from '@/common/components/ui/Dialog/PanelDialog/PanelSubmitButton';
import { useRouter } from 'next/navigation';
import { showNotice } from '@/common/components/ui/Notice/notice';
import { Habit } from './_types';
import { HabitList } from './HabitList';



export const HabitOrderClientPage = () => {
  const router = useRouter();
  const [isDialogMounted, setIsDialogMounted] = useState(true);
  const { customHabitOrder, setCustomHabitOrder, isStorageReady } = useHabitSortPreferences();

  const { data: customHabits, isPending, isError, refetch } = useQuery({
    ...habitQueries.list(authAction),
    enabled: isStorageReady,
    select: (data) => sortHabits(data, { sortType: 'CUSTOM', customHabitOrder }),
  });

  const [tempHabits, setTempHabits] = useState<Habit[] | null>(null);
  const [resetToDefault, setResetToDefault] = useState(false);

  useEffect(() => {
    if (customHabits) {
      setTempHabits((current) => current ?? customHabits);
    }
  }, [customHabits]);

  const defaultHabits = [...(customHabits ?? [])].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const currentIds = tempHabits?.map((habit) => habit.id) ?? [];
  const savedIds = customHabits?.map((habit) => habit.id) ?? [];
  const isDefaultOrder = currentIds.length === defaultHabits.length
    && currentIds.every((id, index) => id === defaultHabits[index].id);
  const hasChanges = tempHabits !== null && customHabits !== undefined && (
    currentIds.length !== savedIds.length
    || currentIds.some((id, index) => id !== savedIds[index])
    || (resetToDefault && isDefaultOrder && customHabitOrder.length > 0)
  );

  const onCancelChanges = () => {
    if (!customHabits) return;
    setTempHabits(customHabits);
    setResetToDefault(false);
  };

  const onResetToDefault = () => {
    setTempHabits(defaultHabits);
    setResetToDefault(true);
  };

  const onSubmit = () => {
    if (!tempHabits || !hasChanges) return;
    setCustomHabitOrder(isDefaultOrder ? [] : currentIds);
    setIsDialogMounted(false);
    setTimeout(() => showNotice('습관 순서를 저장했어요.'), 300);
  };

  return (
    <AnimatePresence onExitComplete={() => router.back()}>
      {isDialogMounted && (
        <PanelDialog
          ariaLabel="습관 순서 설정"
          onClose={() => setIsDialogMounted(false)}
        >
          <PanelHeader title='습관 순서 설정' onBack={() => setIsDialogMounted(false)} />
          <PanelBody showScrollFade>
            <div className="flex w-full flex-col gap-4 py-6">
              <div className="flex gap-3">
                <button className="flex min-h-12 min-w-0 flex-1 items-center justify-center gap-2 rounded-xl border border-theme-accent/30 px-2 py-2 text-sm text-theme-accent-text transition-opacity hover:opacity-65 disabled:opacity-40" disabled={!hasChanges} onClick={onCancelChanges} type="button"><UndoIcon className="shrink-0 text-lg" aria-hidden="true" />변경사항 취소</button>
                <button className="flex min-h-12 min-w-0 flex-1 items-center justify-center gap-2 rounded-xl border border-theme-accent/20 bg-theme-accent-light px-2 py-2 text-center text-sm text-theme-accent-text transition-opacity hover:opacity-65 disabled:opacity-40" disabled={!tempHabits || (isDefaultOrder && customHabitOrder.length === 0)} onClick={onResetToDefault} type="button"><ResetIcon className="shrink-0 text-lg" aria-hidden="true" />기본 순서로 초기화</button>
              </div>
              {isPending && <p role="status" className="py-4 text-center text-sm text-theme-text-secondary">습관을 불러오는 중이에요.</p>}
              {isError && <div className="py-4 text-center text-sm text-theme-text-secondary">습관을 불러오지 못했어요. <button type="button" onClick={() => void refetch()} className="text-theme-accent">다시 시도</button></div>}
              {tempHabits && <HabitList tempHabits={tempHabits} onOrderChange={setTempHabits} />}
            </div>
          </PanelBody>
          <PanelFooter>
            <PanelSubmitButton
              disabled={!hasChanges || isPending || isError}
              onClick={onSubmit}
              type="button"
            >
              순서 저장하기
            </PanelSubmitButton>
          </PanelFooter>
        </PanelDialog>
      )}
    </AnimatePresence>
  );
};
