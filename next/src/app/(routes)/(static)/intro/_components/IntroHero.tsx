import Wordmark from '@/common/components/ui/Wordmark';
import { cn } from '@/common/utils/cn';
import Image from 'next/image';
import { introContainerClass, introContentClass, introDescriptionClass, introSectionClass } from '../_styles/classes';
import IntroActionButtons from './IntroActionButtons';
import cat from '/public/img/bloolog/cats/cat-blue.png';

const IntroHero = () => (
  <section className={cn(introSectionClass, '!bg-theme-accent-light')}>
    <div className={cn(introContainerClass, 'grid items-center gap-10 desktop:min-h-[560px] desktop:grid-cols-2 desktop:gap-16')}>
      <div className={cn(introContentClass, '!gap-10')}>
        <Wordmark className="text-6xl desktop:text-7xl" />
        <h1 className="m-0 break-keep text-4xl font-bold leading-tight tracking-tight desktop:text-6xl">
          어떤 하루든,<br />모두 나의 기록으로
        </h1>
        <p className={introDescriptionClass}>{'어떤 색의 하루라도, 블루와 함께.\n마음을 기록하며 나를 조금씩 알아가요.'}</p>
        <IntroActionButtons className="mt-2 desktop:items-start" />
      </div>
      <Image priority src={cat} alt="고양이 블루" sizes="(min-width: 1024px) 45vw, 80vw" className="mx-auto w-full max-w-[420px]" />
    </div>
  </section>
);

export default IntroHero;
