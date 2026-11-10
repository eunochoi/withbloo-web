'use client';

import { ImageIcon } from '@/common/constants/appIcons';

import Carousel from "@/common/components/ui/Carousel";
import type { DiaryImage } from "@/common/types/diary";
import { useState } from "react";

import { DiaryDetailImageSlide } from "./DiaryDetailImageSlide";

interface DiaryDetailGalleryProps {
  images: DiaryImage[];
  cardAspect?: boolean;
}

export const DiaryDetailGallery = ({ images, cardAspect = false }: DiaryDetailGalleryProps) => {
  const [fullViewImageId, setFullViewImageId] = useState<string | null>(null);

  return (
    <section className="min-w-0" aria-label="첨부 사진">
      {!cardAspect && <h2 className="mb-4 flex items-center gap-2  text-sm text-theme-text-secondary landscape-short:mb-2">
        <ImageIcon aria-hidden="true" className="shrink-0 text-lg text-theme-accent-text" />
        함께 남긴 장면
      </h2>}
      <Carousel
        className={cardAspect ? 'aspect-[4/3] rounded-lg' : 'aspect-auto h-[min(90dvw,440px)] tablet:h-[min(70dvh,440px)]'}
        indicatorPosition="below"
        gap
        showImageBorder={!cardAspect}
        onPageChange={() => setFullViewImageId(null)}
      >
        {images.map((image, index) => (
          <DiaryDetailImageSlide
            key={image.id}
            image={image}
            index={index}
            recordPhoto={cardAspect}
            priority={index === 0}
            isFullView={fullViewImageId === image.id}
            onToggleView={() => setFullViewImageId((currentId) => currentId === image.id ? null : image.id)}
          />
        ))}
      </Carousel>
    </section>
  );
};
