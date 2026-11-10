import { DIARY_IMAGE_MAX_COUNT } from '@/common/constants/image';

export function ImageAttachmentsHeader({ title, count, id }: { title: string; count: number; id?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <h2 id={id} className="min-w-0 text-lg font-semibold text-theme-text-primary">
        {title} <span className="text-base font-normal text-theme-text-tertiary">(선택)</span>
      </h2>
      <span className="shrink-0 text-base text-theme-text-secondary">{count} / {DIARY_IMAGE_MAX_COUNT}장</span>
    </div>
  );
}
