import { EMOTION_UNSELECTED } from '@/common/constants/filterDefaults';
import { useState } from 'react';
import type { ImageAttachmentDraft } from '@/common/components/ui/ImageAttachments/types';

export const useDiaryForm = () => {
  const [text, setText] = useState('');
  const [emotion, setEmotion] = useState(EMOTION_UNSELECTED);
  const [diaryImages, setDiaryImages] = useState<ImageAttachmentDraft[]>([]);

  return {
    text,
    setText,
    emotion,
    setEmotion,
    diaryImages,
    setDiaryImages,
  };
};
