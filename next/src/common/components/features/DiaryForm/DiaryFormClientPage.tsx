"use client";

import { authAction } from '@/common/auth/authAction';
import { diaryQueries } from '@/common/queries/diaryQueries';
import { showNotice } from '@/common/components/ui/Notice/notice';
import { DIARY_TEXT_MAX_LENGTH } from '@/common/constants/diary';
import { DIARY_EMOTION_GROUPS } from '@/common/constants/diaryFilters';
import { isValidLocalDateString } from '@/common/utils/date/isValidLocalDateString';
import { parseLocalDate } from '@/common/utils/date/parseLocalDate';
import { arrayMove } from '@dnd-kit/sortable';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import Image from 'next/image';
import neutralCat from '/public/img/bloolog/cats/cat-blue.png';
import positiveCat from '/public/img/bloolog/cats/cat-blue-p.png';
import negativeCat from '/public/img/bloolog/cats/cat-blue-n.png';
import { PanelDialog } from '../../ui/Dialog/PanelDialog';
import { PanelBody } from '../../ui/Dialog/PanelDialog/PanelBody';
import { PanelFooter } from '../../ui/Dialog/PanelDialog/PanelFooter';
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
  const cat = (DIARY_EMOTION_GROUPS.positive.emotions as readonly number[]).includes(emotion)
    ? positiveCat
    : (DIARY_EMOTION_GROUPS.negative.emotions as readonly number[]).includes(emotion)
      ? negativeCat
      : neutralCat;
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
          />
          <PanelBody showScrollFade contentClassName="flex h-full min-h-full flex-col">
            <fieldset disabled={isSubmitting} className="m-0 flex h-full min-h-0 w-full flex-1 flex-col justify-between border-0 pt-2">
              <DiaryFormEmotionSection
                emotion={emotion}
                setEmotion={setEmotion}
              />
              <div className="flex min-h-0 w-full flex-1 flex-col">
                <DiaryFormTextSection
                  text={text}
                  setText={setText}
                />
              </div>
              <DiaryFormImagesSection
                diaryImages={diaryImages}
                handleImageChange={imageHandlers.handleImageChange}
                getImageUrl={imageHandlers.getImageUrl}
                handleRemoveImage={imageHandlers.handleRemoveImage}
                onReorder={(from, to) => setDiaryImages((images) => arrayMove(images, from, to))}
                isLoading={isSubmitting}
              />
              <div className="flex shrink-0 items-center justify-center pt-2" aria-hidden="true">
                <Image src={cat} alt="" className="h-auto w-44 max-w-full" sizes="176px" />
              </div>
            </fieldset>
          </PanelBody>
          <PanelFooter>
            <PanelSubmitButton
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || !effectiveDate || text.length > DIARY_TEXT_MAX_LENGTH}
              aria-busy={isSubmitting}
            >
              {isSubmitting && <span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none" />}
              {isSubmitting ? '저장 중...' : isEdit ? '수정한 기록 저장하기' : '기록 저장하기'}
            </PanelSubmitButton>
          </PanelFooter>
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
