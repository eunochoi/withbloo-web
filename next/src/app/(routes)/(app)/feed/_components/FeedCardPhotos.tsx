import Carousel from '@/common/components/ui/Carousel';
import type { DiaryImage } from '@/common/types/diary';
import Image from 'next/image';
import Link from 'next/link';

export default function FeedCardPhotos({ images, href, label, priority = false }: {
  images: DiaryImage[];
  href: string;
  label: string;
  priority?: boolean;
}) {
  return (
    <Carousel className="aspect-[4/3] rounded-lg">
      {images.map((image, index) => (
        <Link
          key={image.id}
          href={href}
          scroll={false}
          prefetch={false}
          draggable={false}
          aria-label={`${label} 사진 ${index + 1} 상세 보기`}
          className="block h-full w-full"
        >
          <Image
            priority={priority && index === 0}
            className="h-full w-full object-cover"
            src={image.src}
            width={800}
            height={480}
            sizes="(min-width: 1024px) 460px, (min-width: 480px) min(484px, calc(100vw - 88px)), calc(90vw - 16px)"
            alt={`${label} 사진 ${index + 1}`}
            draggable={false}
          />
        </Link>
      ))}
    </Carousel>
  );
}
