import { EmotionOutlineIcon } from '@/common/constants/appIcons';
import EmotionImage from '@/common/components/ui/EmotionImage';
import { EMOTIONS } from '@/common/constants/emotions';
import { AnimatePresence } from 'framer-motion';
import { useState } from 'react';

import DiaryFormEmotionPicker from './DiaryFormEmotionPicker';

interface DiaryFormEmotionSectionProps {
  emotion: number;
  setEmotion: (value: number) => void;
}

const DiaryFormEmotionSection = ({
  emotion,
  setEmotion,
}: DiaryFormEmotionSectionProps) => {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const selectedEmotion = EMOTIONS.find((item) => item.id === emotion);

  return (
    <div>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={isPickerOpen}
        onClick={() => setIsPickerOpen(true)}
        className="flex w-full items-center gap-3 text-left disabled:cursor-wait"
      >
        <span className="flex min-w-0 flex-1 flex-col gap-3">
          <span className="text-lg font-semibold text-theme-text-primary">오늘의 감정</span>
          <span className="px-1 text-base text-theme-text-secondary">
            {selectedEmotion ? (selectedEmotion.id === 9 ? '무덤덤' : selectedEmotion.nameKr) : '감정을 골라주세요'}
          </span>
        </span>
        <span className="flex h-16 w-16 shrink-0 items-center justify-center">
          {selectedEmotion ? (
            <EmotionImage emotion={selectedEmotion} alt="" width={64} height={64} className="h-16 w-16 object-contain" />
          ) : (
            <EmotionOutlineIcon aria-hidden="true" className="h-10 w-10 text-theme-accent" />
          )}
        </span>
      </button>
      <AnimatePresence>
        {isPickerOpen && (
          <DiaryFormEmotionPicker
            emotion={emotion}
            onClose={() => setIsPickerOpen(false)}
            onConfirm={(value) => {
              setEmotion(value);
              setIsPickerOpen(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default DiaryFormEmotionSection;
