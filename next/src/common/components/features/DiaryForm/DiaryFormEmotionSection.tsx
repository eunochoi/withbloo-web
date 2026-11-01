import { ChevronRightIcon, EmotionIcon } from '@/common/constants/appIcons';
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
    <div className="border-b border-theme-border-muted pb-4">
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={isPickerOpen}
        onClick={() => setIsPickerOpen(true)}
        className="flex w-full items-center gap-3 rounded-xl py-1 text-left disabled:cursor-wait"
      >
        <span className="flex h-14 w-14 shrink-0 items-center justify-center">
          {selectedEmotion ? (
            <EmotionImage emotion={selectedEmotion} alt="" width={48} height={48} className="h-12 w-12 object-contain" />
          ) : (
            <EmotionIcon aria-hidden="true" className="h-11 w-11 text-theme-text-tertiary" />
          )}
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="text-lg font-semibold text-theme-text-primary">오늘의 감정</span>
          <span className=" text-sm text-theme-text-secondary">
            {selectedEmotion ? (selectedEmotion.id === 9 ? '무덤덤' : selectedEmotion.nameKr) : '감정을 골라주세요'}
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-0.5 text-base text-theme-text-secondary">
          {selectedEmotion ? '변경' : '선택'}
          <ChevronRightIcon aria-hidden="true" className="h-5 w-5" />
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
