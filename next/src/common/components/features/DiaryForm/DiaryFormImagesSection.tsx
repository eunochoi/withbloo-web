import { ChevronRightIcon, ImageIcon } from '@/common/constants/appIcons';
import { PickerDialog } from '@/common/components/ui/Dialog/PickerDialog';
import { PICKER_CONFIRM_BUTTON_CLASS } from '@/common/components/ui/Dialog/PickerDialog/constants';
import { DIARY_IMAGE_MAX_COUNT } from '@/common/constants/image';
import { AnimatePresence } from 'framer-motion';
import { useState, type ChangeEvent } from 'react';

import DiaryFormImages from './DiaryFormImages';
import type { DiaryImageDraft } from './types';

interface DiaryFormImagesSectionProps {
  diaryImages: DiaryImageDraft[];
  handleImageChange: (event: ChangeEvent<HTMLInputElement>) => void;
  getImageUrl: (image: DiaryImageDraft) => string;
  handleRemoveImage: (index: number) => void;
  isLoading: boolean;
  onReorder: (from: number, to: number) => void;
}

const DiaryFormImagesSection = ({ diaryImages, handleImageChange, getImageUrl, handleRemoveImage, isLoading, onReorder }: DiaryFormImagesSectionProps) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <button type="button" disabled={isLoading} aria-haspopup="dialog" aria-expanded={isOpen} onClick={() => setIsOpen(true)} className="flex min-h-12 w-full items-center gap-2 rounded-2xl px-2 text-left disabled:opacity-40">
        <ImageIcon className="h-5 w-5 text-theme-accent" aria-hidden="true" />
        <span className="flex-1 text-base text-theme-text-secondary">사진 {diaryImages.length}장</span>
        <ChevronRightIcon className="h-5 w-5 text-theme-text-secondary" aria-hidden="true" />
      </button>
      <AnimatePresence>
        {isOpen && <PickerDialog labelledBy="diary-images-title" onClose={() => setIsOpen(false)}>
          <div className="flex flex-col gap-3 pb-[max(24px,env(safe-area-inset-bottom))]">
            <div className="relative flex min-h-11 items-center justify-center">
              <h2 id="diary-images-title" className="text-center text-lg font-semibold text-theme-text-primary">오늘의 장면</h2>
            </div>
            <p className="text-base text-theme-text-secondary">기억하고 싶은 장면을 남겨보세요.</p>
            <p className="text-xs text-theme-text-secondary">{diaryImages.length} / {DIARY_IMAGE_MAX_COUNT}장</p>
            <DiaryFormImages diaryImages={diaryImages} handleImageChange={handleImageChange} getImageUrl={getImageUrl} handleRemoveImage={handleRemoveImage} isLoading={isLoading} onReorder={onReorder} />
            <button type="button" disabled={isLoading} onClick={() => setIsOpen(false)} className={PICKER_CONFIRM_BUTTON_CLASS}>완료</button>
          </div>
        </PickerDialog>}
      </AnimatePresence>
    </>
  );
};

export default DiaryFormImagesSection;
