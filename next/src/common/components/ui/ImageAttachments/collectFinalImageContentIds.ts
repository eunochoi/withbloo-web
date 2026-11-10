import type { UploadedImage } from '@/common/actions/image/types';
import type { ImageAttachmentDraft } from './types';

export type CollectedImageContentIds = {
  imageContentIds: string[];
  duplicateImageCount: number;
};

export const collectFinalImageContentIds = (
  imageDrafts: ImageAttachmentDraft[],
  uploadedDiaryImages: UploadedImage[],
): CollectedImageContentIds => {
  let uploadedImageIndex = 0;

  const finalDiaryImages = imageDrafts.map((image) => {
    if (image instanceof File) {
      const uploadedImage = uploadedDiaryImages[uploadedImageIndex++];

      if (!uploadedImage) {
        throw new Error('IMAGE_UPLOAD_RESULT_MISMATCH');
      }

      return uploadedImage;
    }

    return image;
  });

  const allImageContentIds = finalDiaryImages.map(
    (image) => image.imageContentId,
  );
  const imageContentIds = Array.from(new Set(allImageContentIds));

  return {
    imageContentIds,
    duplicateImageCount: allImageContentIds.length - imageContentIds.length,
  };
};
