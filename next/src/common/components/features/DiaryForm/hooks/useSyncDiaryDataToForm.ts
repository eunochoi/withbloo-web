import { EMOTION_UNSELECTED } from '@/common/constants/filterDefaults';
import type { DiaryData } from '@/common/types/diary';
import { useEffect, useRef, useState } from 'react';
import type { ImageAttachmentDraft } from '@/common/components/ui/ImageAttachments/types';

type UseSyncDiaryDataToFormParams = {
  enabled: boolean;
  diaryData: DiaryData | null | undefined;
  setText: (value: string) => void;
  setEmotion: (value: number) => void;
  setDiaryImages: (value: ImageAttachmentDraft[]) => void;
};

export const useSyncDiaryDataToForm = ({
  enabled,
  diaryData,
  setText,
  setEmotion,
  setDiaryImages,
}: UseSyncDiaryDataToFormParams) => {
  const initializedDiaryIdRef = useRef<number | null>(null);
  const [initializedDiaryId, setInitializedDiaryId] = useState<number | null>(
    null,
  );
  useEffect(() => {
    if (!enabled || !diaryData) return;
    if (initializedDiaryIdRef.current === diaryData.id) return;

    setText(diaryData.text ?? '');
    setEmotion(diaryData.emotion ?? EMOTION_UNSELECTED);
    setDiaryImages(
      diaryData.Images?.map(({ imageContentId, src }) => ({
        imageContentId,
        src,
      })) ?? [],
    );
    initializedDiaryIdRef.current = diaryData.id;
    setInitializedDiaryId(diaryData.id);
  }, [diaryData, enabled, setEmotion, setDiaryImages, setText]);

  return !enabled || initializedDiaryId === diaryData?.id;
};
