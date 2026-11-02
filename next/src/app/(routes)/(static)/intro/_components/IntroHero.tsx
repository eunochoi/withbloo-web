import Wordmark from '@/common/components/ui/Wordmark';
import { cn } from '@/common/utils/cn';
import Image from 'next/image';
import { twMerge } from 'tailwind-merge';
import {
  introContainerClass,
  introContentClass,
  introDescriptionClass,
  introSectionClass,
} from '../_styles/classes';
import IntroActionButtons from './IntroActionButtons';
import cat from '/public/img/bloolog/cats/cat-blue-standing.png';

const IntroHero = () => (
  <section className={cn(introSectionClass, '!bg-theme-accent-light')}>
    <div
      className={cn(
        introContainerClass,
        'relative grid items-center gap-10 desktop:gap-12 desktop:grid-cols-2',
      )}
    >
      <div className={cn(introContentClass)}>
        <div className="flex gap-4 mb-8 items-center">
          <Wordmark className="text-5xl desktop:text-6xl" />
        </div>
        <h1 className="flex flex-col gap-3 desktop:gap-6 m-0 break-keep text-4xl font-bold leading-[1.3] tracking-tight desktop:text-5xl">
          <span className="block">어떤 색의 하루도</span>
          <span className="block text-theme-accent">나의 기록으로</span>
        </h1>
        <Image
          priority
          src={cat}
          alt="고양이 블루"
          sizes="(min-width: 1024px) 45vw, 80vw"
          className="mx-auto w-full max-w-[200px] desktop:absolute desktop:right-0 desktop:top-1/2 desktop:w-[calc(50%-2rem)] desktop:max-w-[400px] desktop:-translate-y-1/2"
        />
        <div
          className={twMerge(
            introDescriptionClass,
            'flex flex-col desktop:text-xl gap-1 desktop:gap-2',
          )}
        >
          <p>블루와 함께 마음을 남기고</p>
          <p>나만의 속도로 하루를 채워가요.</p>
        </div>
        <IntroActionButtons className="mt-2 desktop:items-start" />
      </div>
    </div>
  </section>
);

export default IntroHero;
