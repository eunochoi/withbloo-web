import { createImageSignedUrl } from '@/common/actions/image/utils';
import type { DiaryImage } from '@/common/types/diary';

interface RecordImage {
  id: number;
  imageContentId: string;
  position: number;
  imageContent: { storagePath: string };
}

export async function formatRecordImages(images: RecordImage[]): Promise<DiaryImage[]> {
  return Promise.all(images.map(async (image) => ({
    id: String(image.id),
    imageContentId: image.imageContentId,
    order: image.position,
    src: await createImageSignedUrl(image.imageContent.storagePath),
  })));
}
