import type { ImageAttachmentDraft } from './types';
import { uploadImages } from '@/common/actions/image';
import { authAction } from '@/common/auth/authAction';
import { collectFinalImageContentIds, type CollectedImageContentIds } from './collectFinalImageContentIds';

export const uploadImagesAndCollectIds = async (
  imageDrafts: ImageAttachmentDraft[],
): Promise<CollectedImageContentIds> => {
  const newImageFiles = imageDrafts.filter(
    (image): image is File => image instanceof File,
  );

  if (newImageFiles.length === 0) {
    return collectFinalImageContentIds(imageDrafts, []);
  }

  const imageFormData = new FormData();

  newImageFiles.forEach((file) => {
    imageFormData.append('image', file);
  });

  const uploadedDiaryImages = await authAction(() => uploadImages(imageFormData));

  if (uploadedDiaryImages.length !== newImageFiles.length) {
    throw new Error('IMAGE_UPLOAD_RESULT_MISMATCH');
  }

  return collectFinalImageContentIds(
    imageDrafts,
    uploadedDiaryImages,
  );
};
