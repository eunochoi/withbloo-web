import Image, { StaticImageData } from 'next/image';

import { cn } from '@/common/utils/cn';
import { introVisualClass } from '../_styles/classes';
import sad from '/public/img/emotion/basic/sad.png';


interface IntroVisualProps {
  alt: string;
  className?: string;
  priority?: boolean;
  src?: StaticImageData;
}

// 통합 이미지 준비 전에는 앱 아이콘을 사용합니다. 교체할 이미지의 구성은 alt에 기록합니다.
const IntroVisual = ({ alt, className, priority = false, src = sad }: IntroVisualProps) => (
  <div className={cn(introVisualClass, 'aspect-[4/3]', className)}>
    <Image
      src={src}
      alt={alt}
      width={src.width}
      height={src.height}
      priority={priority}
      sizes="(min-width: 1196px) 622px, (min-width: 1024px) calc(60vw - 96px), (min-width: 480px) calc(100vw - 64px), calc(100vw - 40px)"
      className="h-full w-full rounded-[20px] object-contain"
    />
  </div>
);

export default IntroVisual;
