import type { DiaryImage } from '@/common/types/diary';

export type ImageAttachmentDraft =
  | Pick<DiaryImage, 'imageContentId' | 'src'>
  | File;
