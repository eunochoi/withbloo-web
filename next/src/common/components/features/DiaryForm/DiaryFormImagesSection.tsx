import type { ChangeEvent } from 'react';

import ImageAttachments from '@/common/components/ui/ImageAttachments';
import { ImageAttachmentsHeader } from '@/common/components/ui/ImageAttachments/ImageAttachmentsHeader';
import type { ImageAttachmentDraft } from '@/common/components/ui/ImageAttachments/types';

interface DiaryFormImagesSectionProps {
  diaryImages: ImageAttachmentDraft[];
  handleImageChange: (event: ChangeEvent<HTMLInputElement>) => void;
  getImageUrl: (image: ImageAttachmentDraft) => string;
  handleRemoveImage: (index: number) => void;
  isLoading: boolean;
  onReorder: (from: number, to: number) => void;
}

const DiaryFormImagesSection = ({ diaryImages, handleImageChange, getImageUrl, handleRemoveImage, isLoading, onReorder }: DiaryFormImagesSectionProps) => {
  return (
    <section aria-labelledby="diary-images-title" className="flex w-full flex-col gap-3">
      <ImageAttachmentsHeader id="diary-images-title" title="오늘의 장면" count={diaryImages.length} />
      <div className="flex flex-col gap-3 px-1">
        <p className="text-base text-theme-text-secondary">기억하고 싶은 장면을 남겨보세요.</p>
        <ImageAttachments images={diaryImages} handleImageChange={handleImageChange} getImageUrl={getImageUrl} handleRemoveImage={handleRemoveImage} isLoading={isLoading} onReorder={onReorder} />
      </div>
    </section>
  );
};

export default DiaryFormImagesSection;
