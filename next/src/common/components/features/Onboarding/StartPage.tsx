'use client';

import { ArrowRightIcon } from '@/common/constants/appIcons';
import Image from 'next/image';
import Wordmark from '../../ui/Wordmark';
import standingCat from '/public/img/bloolog/cats/cat-blue-standing.png';

export function StartPage() {
  return (
    <div className="w-full flex-1 px-6 py-6 flex flex-col justify-evenly items-center gap-4">
      <span className="text-3xl font-semibold">이제, 시작해볼까요?</span>
      <div className="w-full h-auto flex flex-col justify-center items-center gap-2">
        <span className="text-lg text-theme-text-secondary">
          오늘의 감정도, 쌓아갈 습관도,
        </span>
        <span className="text-lg text-theme-text-secondary">
          멀리하고 싶은 것들도 블루와 함께해요.
        </span>
      </div>

      <div className="w-full h-auto flex flex-col justify-center items-center gap-4">
        <Image
          src={standingCat}
          alt=""
          className="h-auto w-2/3 max-w-[300px]"
          sizes="300px"
        />
        <Wordmark
          accentColor="var(--loading-indicator)"
          className="text-[36px]"
        />
      </div>
      <div className="w-full h-auto flex flex-col justify-center items-center gap-2">
        <span className="text-lg text-theme-text-secondary">
          {"오늘부터 '블루'가 함께할게요."}
        </span>
        <span className="mt-2 text-base whitespace-pre-line text-theme-accent-deep">
          {'withBloo - Bloom with Bloo & Blue.'}
        </span>
      </div>

      <a
        href="https://to-ok.me"
        target="_blank"
        rel="noreferrer"
        className="flex min-h-12 items-center justify-start gap-2 rounded-xl text-base text-theme-text-secondary/75"
      >
        &apos;위블&apos; 서비스 페이지 둘러보기
        <ArrowRightIcon aria-hidden="true" />
      </a>
    </div>
  );
}
