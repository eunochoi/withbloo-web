import {
  DIARY_IMAGE_ALLOWED_MIME_TYPES,
  DIARY_IMAGE_MAX_COUNT,
  DIARY_IMAGE_MAX_SIZE_BYTES,
  DIARY_IMAGE_MAX_SIZE_MB,
} from '@/common/constants/image';
import { showNotice } from '@/common/components/ui/Notice/notice';
import type { ChangeEvent, Dispatch, SetStateAction } from 'react';
import { useEffect, useRef } from 'react';
import type { ImageAttachmentDraft } from './types';

type UseImageAttachmentsParams = {
  images: ImageAttachmentDraft[];
  setImages: Dispatch<SetStateAction<ImageAttachmentDraft[]>>;
};

type UseImageAttachmentsResult = {
  handleImageChange: (event: ChangeEvent<HTMLInputElement>) => void;
  getImageUrl: (image: ImageAttachmentDraft) => string;
  handleRemoveImage: (index: number) => void;
};

export const useImageAttachments = ({
  images,
  setImages,
}: UseImageAttachmentsParams): UseImageAttachmentsResult => {
  const blobUrlCacheRef = useRef<Map<File, string>>(new Map());

  useEffect(() => {
    const cache = blobUrlCacheRef.current;

    return () => {
      cache.forEach((url) => URL.revokeObjectURL(url));
      cache.clear();
    };
  }, []);

  const handleImageChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    if (!event.target.files) return;

    const newImageFiles = Array.from(event.target.files);

    if (
      images.length + newImageFiles.length >
      DIARY_IMAGE_MAX_COUNT
    ) {
      showNotice(
        `이미지 파일은 최대 ${DIARY_IMAGE_MAX_COUNT}개까지 삽입 가능합니다.`,
      );
      event.target.value = '';
      return;
    }

    const hasInvalidType = newImageFiles.some(
      (file) =>
        !DIARY_IMAGE_ALLOWED_MIME_TYPES.includes(
          file.type as typeof DIARY_IMAGE_ALLOWED_MIME_TYPES[number],
        ),
    );

    if (hasInvalidType) {
      showNotice('이미지 파일만 업로드 가능합니다.');
      event.target.value = '';
      return;
    }

    const hasOversizedFile = newImageFiles.some(
      (file) => file.size > DIARY_IMAGE_MAX_SIZE_BYTES,
    );

    if (hasOversizedFile) {
      showNotice(
        `선택된 이미지 중 ${DIARY_IMAGE_MAX_SIZE_MB}MB를 초과하는 이미지가 존재합니다.`,
      );
      event.target.value = '';
      return;
    }

    setImages((currentImages) => [
      ...currentImages,
      ...newImageFiles,
    ]);
    event.target.value = '';
  };

  const getImageUrl = (image: ImageAttachmentDraft) => {
    if (!(image instanceof File)) return image.src;

    let blobUrl = blobUrlCacheRef.current.get(image);

    if (!blobUrl) {
      blobUrl = URL.createObjectURL(image);
      blobUrlCacheRef.current.set(image, blobUrl);
    }

    return blobUrl;
  };

  const handleRemoveImage = (index: number) => {
    const image = images[index];

    if (image instanceof File) {
      const blobUrl = blobUrlCacheRef.current.get(image);

      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
        blobUrlCacheRef.current.delete(image);
      }
    }

    setImages((currentImages) =>
      currentImages.filter((_, imageIndex) => imageIndex !== index),
    );
  };

  return {
    handleImageChange,
    getImageUrl,
    handleRemoveImage,
  };
};
