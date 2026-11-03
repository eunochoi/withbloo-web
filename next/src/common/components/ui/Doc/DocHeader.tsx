'use client';

import { ChevronLeftIcon } from '@/common/constants/appIcons';

import Wordmark from '@/common/components/ui/Wordmark';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import hidingCat from '/public/img/cats/cat-blue.png';

interface Props {
  description?: string;
  subtitle: string;
  title: string;
}

const headerClass = 'w-full border-b border-theme-accent/30 bg-theme-accent-light px-5 pt-6 tablet:px-8';
const backButtonClass = 'flex items-center justify-center text-xl text-theme-accent';

const DocHeader = ({ description, subtitle, title }: Props) => {
  const router = useRouter();

  return (
    <header className={headerClass}>
      <div className="mx-auto flex w-full max-w-[720px] flex-col gap-6">
        <button
          aria-label="이전 페이지로 돌아가기"
          className={`${backButtonClass} self-start`}
          onClick={() => router.back()}
          type="button"
        >
          <ChevronLeftIcon />
        </button>
        <Wordmark className="text-5xl tablet:text-6xl" />
        <div className="flex flex-col gap-3">
          <h1 className="m-0 break-keep  text-3xl leading-tight text-theme-text-primary tablet:text-4xl">{title}</h1>
          <p className="m-0 text-base font-bold text-theme-accent">{subtitle}</p>
        </div>
        {description ? (
          <p className="m-0 max-w-[520px] break-keep text-sm leading-relaxed text-theme-text-secondary tablet:text-base">{description}</p>
        ) : null}
        <Image src={hidingCat} alt="" sizes="(min-width: 784px) 360px, (min-width: 480px) calc(50vw - 32px), calc(100vw - 40px)" className="ml-auto block w-full tablet:w-1/2" />
      </div>
    </header>
  );
};

export default DocHeader;
