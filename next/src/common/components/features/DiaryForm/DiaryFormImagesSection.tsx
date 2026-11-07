import { DIARY_IMAGE_MAX_COUNT } from '@/common/constants/image';
import type { ChangeEvent } from 'react';

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
  return (
    <section aria-labelledby="diary-images-title" className="flex w-full flex-col gap-3">
      <div className="flex items-baseline gap-2">
        <h2 id="diary-images-title" className="text-lg font-semibold text-theme-text-primary">오늘의 장면</h2>
        <span className="text-sm text-theme-text-secondary">{diaryImages.length} / {DIARY_IMAGE_MAX_COUNT}장</span>
      </div>
      <div className="flex flex-col gap-3 px-1">
        <p className="text-base text-theme-text-secondary">기억하고 싶은 장면을 남겨보세요.</p>
        <DiaryFormImages diaryImages={diaryImages} handleImageChange={handleImageChange} getImageUrl={getImageUrl} handleRemoveImage={handleRemoveImage} isLoading={isLoading} onReorder={onReorder} />
      </div>
    </section>
  );
};

export default DiaryFormImagesSection;
