"use client";

import { authAction } from '@/common/auth/authAction';
import { diaryQueries } from '@/common/queries/diaryQueries';
import { showNotice } from '@/common/components/ui/Notice/notice';
import { DIARY_TEXT_MAX_LENGTH } from '@/common/constants/diary';
import { isValidLocalDateString } from '@/common/utils/date/isValidLocalDateString';
import { parseLocalDate } from '@/common/utils/date/parseLocalDate';
import { arrayMove } from '@dnd-kit/sortable';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { PanelDialog } from '../../ui/Dialog/PanelDialog';
import { PanelBody } from '../../ui/Dialog/PanelDialog/PanelBody';
import { PanelHeader } from '../../ui/Dialog/PanelDialog/PanelHeader';
import { PanelSubmitButton } from '../../ui/Dialog/PanelDialog/PanelSubmitButton';
import DiaryDatePicker from './DiaryDatePicker';
import DiaryFormEmotionSection from './DiaryFormEmotionSection';
import DiaryFormImagesSection from './DiaryFormImagesSection';
import DiaryFormTextSection from './DiaryFormTextSection';
import { createDiaryRequest } from './functions/createDiaryRequest';
import { updateDiaryRequest } from './functions/updateDiaryRequest';
import { useDiaryForm } from './hooks/useDiaryForm';
import { useDiaryImages } from './hooks/useDiaryImages';
import { useDiarySubmission } from './hooks/useDiarySubmission';
import { useHandleDiaryFormLoadFailure } from './hooks/useHandleDiaryFormLoadFailure';
import { useSyncDiaryDataToForm } from './hooks/useSyncDiaryDataToForm';

interface DiaryFormClientPageProps {
  isEdit: boolean;
  diaryId?: string | null;
}

const DiaryFormClientPage = ({ isEdit, diaryId }: DiaryFormClientPageProps) => {
  const router = useRouter();
  const [isDialogMounted, setIsDialogMounted] = useState(true);
  const searchParams = useSearchParams();
  const {
    data: diaryData,
    isError,
    isPending,
  } = useQuery({
    ...diaryQueries.byId(diaryId, authAction),
    enabled: isEdit && Boolean(diaryId),
  });
  const {
    text,
    setText,
    emotion,
    setEmotion,
    diaryImages,
    setDiaryImages,
  } = useDiaryForm();
  const isFormInitialized = useSyncDiaryDataToForm({
    enabled: isEdit,
    diaryData,
    setText,
    setEmotion,
    setDiaryImages,
  });
  const isDiaryLoadFailure = useHandleDiaryFormLoadFailure({
    isEdit,
    diaryId,
    diaryData,
    isError,
    isPending,
  });
  const imageHandlers = useDiaryImages({ diaryImages, setDiaryImages });
  const dateParam = searchParams.get('date');
  const allowDateChange = isEdit || searchParams.get('allowDateChange') === 'true';
  const [selectedDate, setSelectedDate] = useState<string | null>(() => isEdit ? null : isValidLocalDateString(dateParam) ? dateParam : allowDateChange ? null : format(new Date(), 'yyyy-MM-dd'));
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const date = isEdit ? selectedDate ?? diaryData?.date ?? null : selectedDate;
  const effectiveDate = isEdit && diaryData && selectedDate === null ? diaryData.date : date;
  const headerTitle = effectiveDate ? format(parseLocalDate(effectiveDate), 'yyyy. M. d. EEEE', { locale: ko }) : '날짜를 선택해주세요';
  const saveDiary = isEdit
    ? (imageContentIds: string[]) => {
      if (!diaryId) {
        throw new Error('DIARY_ID_REQUIRED');
      }

      return updateDiaryRequest({
        diaryId,
        date: effectiveDate!,
        text,
        emotion,
        imageContentIds,
      });
    }
    : (imageContentIds: string[]) =>
      createDiaryRequest({
        date: effectiveDate!,
        text,
        emotion,
        imageContentIds,
      });
  const { isSubmitting, handleSubmit } = useDiarySubmission({
    text,
    emotion,
    diaryImages,
    saveDiary,
    successMessage: isEdit ? '일기를 수정했어요' : '일기를 저장했어요',
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
    isDiaryLoadFailure || isPending || !isFormInitialized
  );

  if (shouldHideEditForm) {
    return null;
  }

  return (
    <AnimatePresence onExitComplete={() => router.back()}>
      {isDialogMounted && (
        <PanelDialog
          ariaLabel={headerTitle}
          dismissible={!isSubmitting}
          onClose={handleBack}
        >
          <PanelHeader
            title={headerTitle}
            onBack={handleBack}
            onTitleClick={allowDateChange && !isSubmitting ? () => setIsDatePickerOpen(true) : undefined}
          headerRight={<PanelSubmitButton
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || !effectiveDate || text.length > DIARY_TEXT_MAX_LENGTH}
                aria-busy={isSubmitting}
              >
                {isSubmitting ? '저장 중' : '저장'}
              </PanelSubmitButton>}
          />
          <PanelBody showScrollFade>
            <fieldset disabled={isSubmitting} className="m-0 flex w-full flex-col gap-6 border-0 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <DiaryFormEmotionSection
                emotion={emotion}
                setEmotion={setEmotion}
              />
              <DiaryFormTextSection text={text} setText={setText} />
              <DiaryFormImagesSection
                diaryImages={diaryImages}
                handleImageChange={imageHandlers.handleImageChange}
                getImageUrl={imageHandlers.getImageUrl}
                handleRemoveImage={imageHandlers.handleRemoveImage}
                onReorder={(from, to) => setDiaryImages((images) => arrayMove(images, from, to))}
                isLoading={isSubmitting}
              />

            </fieldset>
          </PanelBody>
          <AnimatePresence>
            {isDatePickerOpen && <DiaryDatePicker value={effectiveDate} diaryId={diaryId} onClose={() => setIsDatePickerOpen(false)} onApply={(next) => { setSelectedDate(next); setIsDatePickerOpen(false); }} />}
          </AnimatePresence>
        </PanelDialog>
      )
      }
    </AnimatePresence >
  );
};

export default DiaryFormClientPage;
