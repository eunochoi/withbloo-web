export const DIARY_IMAGE_MAX_COUNT = 5;
export const DIARY_IMAGE_MAX_SIZE_MB = 5;
export const DIARY_IMAGE_MAX_SIZE_BYTES = DIARY_IMAGE_MAX_SIZE_MB * 1024 * 1024;

export const DIARY_IMAGE_ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/jpg',
  'image/webp',
] as const;
