import type { DiaryImage } from "@/common/types/diary";
import { cn } from "@/common/utils/cn";
import Image from "next/image";

interface DiaryDetailImageSlideProps {
  image: DiaryImage;
  index: number;
  priority?: boolean;
  isFullView: boolean;
  onToggleView: () => void;
  recordPhoto?: boolean;
}

export const DiaryDetailImageSlide = ({ image, index, priority = false, isFullView, onToggleView, recordPhoto = false }: DiaryDetailImageSlideProps) => (
  <button
    type="button"
    className={cn(
      "relative h-full w-full overflow-hidden rounded-theme",
      isFullView ? "cursor-zoom-in" : "cursor-zoom-out",
    )}
    aria-label={`사진 ${index + 1} ${isFullView ? '크롭해서 보기' : '전체 보기'}`}
    aria-pressed={isFullView}
    onClick={onToggleView}
  >
    <Image
      className={cn("rounded-theme bg-black/75", isFullView ? "object-contain" : "object-cover")}
      src={image.src}
      alt={`${recordPhoto ? '기록' : '일기'}에 첨부한 사진 ${index + 1}`}
      fill
      priority={priority}
      sizes="(min-width: 500px) 452px, 90vw"
      draggable={false}
    />
  </button>
);
