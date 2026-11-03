'use client';

import { format } from 'date-fns';
import { isValidHabitStartedAt } from '@/common/functions/habitStats';
import HabitFormIconPicker from './HabitFormIconPicker';
import HabitFormColorPicker from './HabitFormColorPicker';
import HabitFormPriorityPicker from './HabitFormPriorityPicker';
import HabitFormDatePicker from './HabitFormDatePicker';
import HabitFormRecordOptions from './HabitFormRecordOptions';
import { authAction } from '@/common/auth/authAction';
import { habitQueries } from '@/common/queries/habitQueries';
import { showNotice } from '@/common/components/ui/Notice/notice';
import {
  HABIT_NAME_MAX_LENGTH
} from '@/common/constants/habit';
import { useQuery } from '@tanstack/react-query';
import { AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { PanelDialog } from '../../ui/Dialog/PanelDialog';
import { PanelBody } from '../../ui/Dialog/PanelDialog/PanelBody';
import { PanelHeader } from '../../ui/Dialog/PanelDialog/PanelHeader';
import { PanelSubmitButton } from '../../ui/Dialog/PanelDialog/PanelSubmitButton';
import { createHabitRequest } from './functions/createHabitRequest';
import { updateHabitRequest } from './functions/updateHabitRequest';
import HabitFormIconSection from './HabitFormIconSection';
import HabitFormNameSection from './HabitFormNameSection';
import HabitFormPrioritySection from './HabitFormPrioritySection';
import { useHabitForm } from './hooks/useHabitForm';
import { useHabitSubmission } from './hooks/useHabitSubmission';
import { useHandleHabitFormLoadFailure } from './hooks/useHandleHabitFormLoadFailure';
import { useSyncHabitDataToForm } from './hooks/useSyncHabitDataToForm';

interface HabitFormClientPageProps {
  isEdit: boolean;
  habitId?: string | null;
}

const HabitFormClientPage = ({ isEdit, habitId }: HabitFormClientPageProps) => {
  const router = useRouter();
  const [picker, setPicker] = useState<'priority' | 'icon' | 'color' | 'date' | null>(null);
  const [isDialogMounted, setIsDialogMounted] = useState(true);
  const {
    data: habitData,
    isError,
    isPending,
  } = useQuery({
    ...habitQueries.byId(habitId, authAction),
    enabled: isEdit && Boolean(habitId),
  });
  const {
    name,
    setName,
    priority,
    setPriority,
    iconKey,
    setIconKey,
    iconColor,
    setIconColor,
    startedAtInput,
    setStartedAtInput,
  } = useHabitForm();
  const isFormInitialized = useSyncHabitDataToForm({
    enabled: isEdit,
    habitData,
    setName,
    setPriority,
    setIconKey,
    setIconColor,
    setStartedAtInput,
  });
  const isHabitLoadFailure = useHandleHabitFormLoadFailure({
    isEdit,
    habitId,
    habitData,
    isError,
    isPending,
  });
  const saveHabit = async (habitName: string) => {
    if (isEdit) {
      if (!habitId) throw new Error('습관 정보를 다시 불러와주세요.');
      return updateHabitRequest({ habitId, name: habitName, priority, iconKey, iconColor });
    }
    const date = new Date(startedAtInput);
    if (!Number.isFinite(date.getTime()) || format(date, "yyyy-MM-dd'T'HH:mm") !== startedAtInput
      || !isValidHabitStartedAt(date.toISOString())) {
      throw new Error('시작 일시는 1900년 이후의 현재 또는 과거 시각으로 입력해주세요.');
    }
    return createHabitRequest({ name: habitName, priority, iconKey, iconColor, initialStartedAt: date.toISOString() });
  };
  const confirmText = isEdit ? '수정' : '추가';
  const { isSubmitting, handleSubmit } = useHabitSubmission({
    name,
    priority,
    saveHabit,
    successMessage: isEdit ? '습관을 수정했어요' : '습관을 추가했어요',
    failureMessage: isEdit ? '저장하지 못했어요' : '저장하지 못했어요',
    onSuccess: () => setIsDialogMounted(false),
  });

  const handleBack = () => {
    if (isSubmitting) {
      showNotice('저장이 진행 중입니다. 완료될 때까지 기다려주세요.');
      return;
    }

    setIsDialogMounted(false);
  };

  const shouldHideEditForm = isEdit && (
    isHabitLoadFailure || isPending || !isFormInitialized
  );

  if (shouldHideEditForm) {
    return null;
  }

  return (
    <>
    <AnimatePresence onExitComplete={() => router.back()}>
      {isDialogMounted && (
        <PanelDialog
          ariaLabel={`습관 항목 ${confirmText}`}
          dismissible={!isSubmitting}
          onClose={handleBack}
        >
          <PanelHeader
            title={`습관 항목 ${confirmText}`}
            onBack={handleBack}
          headerRight={<PanelSubmitButton
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || !name.trim() || name.length > HABIT_NAME_MAX_LENGTH}
              aria-busy={isSubmitting}
            >
              {isSubmitting ? '저장 중' : '저장'}
            </PanelSubmitButton>}
          />
          <PanelBody showScrollFade>
            <fieldset disabled={isSubmitting} className="m-0 flex min-w-0 w-full flex-col gap-7 border-0 pb-6 pt-2">
              <div className="flex w-full flex-col gap-7">
                <HabitFormNameSection name={name} setName={setName} />
                <HabitFormPrioritySection priority={priority} onOpen={() => setPicker('priority')} />
                <HabitFormIconSection iconKey={iconKey} iconColor={iconColor} onOpen={() => setPicker('icon')} />
                <HabitFormRecordOptions iconColor={iconColor} startedAtInput={startedAtInput} isEdit={isEdit} onOpenColor={() => setPicker('color')} onOpenDate={() => setPicker('date')} />
              </div>
            </fieldset>
          </PanelBody>

        </PanelDialog>
      )}
    </AnimatePresence>
    <AnimatePresence>
      {picker === 'priority' && <HabitFormPriorityPicker value={priority} onClose={() => setPicker(null)} onApply={(value) => { setPriority(value); setPicker(null); }} />}
      {picker === 'icon' && <HabitFormIconPicker value={iconKey} iconColor={iconColor} onClose={() => setPicker(null)} onApply={(value) => { setIconKey(value); setPicker(null); }} />}
      {picker === 'color' && <HabitFormColorPicker value={iconColor} onClose={() => setPicker(null)} onApply={(value) => { setIconColor(value); setPicker(null); }} />}
      {picker === 'date' && !isEdit && <HabitFormDatePicker value={startedAtInput} onClose={() => setPicker(null)} onApply={(value) => { setStartedAtInput(value); setPicker(null); }} />}
    </AnimatePresence>
    </>
  );
};

export default HabitFormClientPage;
