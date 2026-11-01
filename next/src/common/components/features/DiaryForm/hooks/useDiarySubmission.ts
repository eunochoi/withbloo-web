import type { DiaryData } from '@/common/types/diary';
import { EMOTIONS } from '@/common/constants/emotions';
import { DIARY_TEXT_MAX_LENGTH } from '@/common/constants/diary';
import { useQueryClient } from '@tanstack/react-query';
import { showNotice } from '@/common/components/ui/Notice/notice';
import { useState } from 'react';
import { uploadDiaryImagesAndCollectIds } from '../functions/uploadDiaryImagesAndCollectIds';
import type { DiaryImageDraft } from '../types';

type UseDiarySubmissionParams = {
  text: string;
  emotion: number;
  diaryImages: DiaryImageDraft[];
  saveDiary: (imageContentIds: string[]) => Promise<DiaryData>;
  successMessage: string;
  failureMessage: string;
  onSuccess: () => void;
};

export const useDiarySubmission = ({
  text,
  emotion,
  diaryImages,
  saveDiary,
  successMessage,
  failureMessage,
  onSuccess,
}: UseDiarySubmissionParams) => {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (isSubmitting) return;

    if (!Number.isInteger(emotion) || emotion < 0 || emotion >= EMOTIONS.length) {
      showNotice('감정을 선택해주세요');
      return;
    }
    if (text.trim().length === 0) {
      showNotice('내용을 입력해주세요');
      return;
    }
    if (text.length > DIARY_TEXT_MAX_LENGTH) {
      showNotice(`일기 내용은 ${DIARY_TEXT_MAX_LENGTH.toLocaleString()}자까지 입력할 수 있습니다.`);
      return;
    }

    try {
      setIsSubmitting(true);
      const {
        imageContentIds,
        duplicateImageCount,
      } = await uploadDiaryImagesAndCollectIds(diaryImages);
      const savedDiary = await saveDiary(imageContentIds);

      queryClient.setQueryData(['diary', 'date', savedDiary.date], savedDiary);
      queryClient.setQueryData(['diary', 'id', String(savedDiary.id)], savedDiary);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['diary', 'date'] }),
        queryClient.invalidateQueries({ queryKey: ['habit'] }),
        queryClient.invalidateQueries({ queryKey: ['habits'] }),
        queryClient.invalidateQueries({ queryKey: ['diary-habit', 'month'] }),
        queryClient.invalidateQueries({ queryKey: ['diary', 'diaryList'] }),
        queryClient.invalidateQueries({ queryKey: ['stats'] }),
      ]);
      onSuccess();
      const completedMessage = duplicateImageCount > 0
        ? `${successMessage}. 이미 추가된 사진은 한 장만 저장되었습니다.`
        : successMessage;
      setTimeout(() => showNotice(completedMessage), 300);
    } catch (error) {
      console.error(failureMessage, error);
      showNotice(error instanceof Error ? error.message : failureMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    handleSubmit,
  };
};
