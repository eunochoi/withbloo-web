'use client';

import Wordmark from '@/common/components/ui/Wordmark';
import { cn } from '@/common/utils/cn';
import Image from 'next/image';
import Link from 'next/link';
import { useRef, useState } from 'react';
import { PiBrowserFill, PiDeviceMobileFill, PiFloppyDiskBackFill } from 'react-icons/pi';
import { twMerge } from 'tailwind-merge';
import IntroHero from './_components/IntroHero';
import IntroSection from './_components/IntroSection';
import {
  introContainerClass,
  introDescriptionClass,
  introSectionClass,
  introTitleClass,
} from './_styles/classes';
import negative from '/public/img/bloolog/cats/cat-blue-n.png';
import positive from '/public/img/bloolog/cats/cat-blue-p.png';
import standingCat from '/public/img/bloolog/cats/cat-blue-standing.png';
import neutral from '/public/img/bloolog/cats/cat-blue.png';

const moods = [
  {
    src: positive,
    label: '긍정',
    story: '기쁘고 설레는 날엔 분홍빛이 번져.',
    color: '#EDA5B1',
  },
  {
    src: neutral,
    label: '중립',
    story: '특별할 것 없는 날에도 나는 나야.',
    color: '#979FC7',
  },
  {
    src: negative,
    label: '부정',
    story: '마음이 무거운 날엔 푸른빛이 짙어져.',
    color: '#8CADE2',
  },
];

const IntroClientPage = () => {
  const [mood, setMood] = useState(1);
  const touchStart = useRef<number | null>(null);
  return (
    <div className="static-theme-blue h-[100dvh] w-full overflow-y-auto bg-theme-bg text-theme-text-primary">
      <IntroHero />
      <IntroSection
        hashtag="#파란마음 #분홍빛하루"
        title="안녕, 나는 블루야!"
        description={['파란 날에도, 분홍빛 날에도', '나는 여전히 나야!']}
      >
        <div
          className="mx-auto flex w-full max-w-[520px] flex-col items-center gap-5 text-center"
          onTouchStart={(event) => {
            touchStart.current = event.touches[0].clientX;
          }}
          onTouchEnd={(event) => {
            if (touchStart.current === null) return;
            const delta = event.changedTouches[0].clientX - touchStart.current;
            if (Math.abs(delta) > 40)
              setMood((current) =>
                Math.max(
                  0,
                  Math.min(moods.length - 1, current + (delta < 0 ? 1 : -1)),
                ),
              );
            touchStart.current = null;
          }}
        >
          <div className="relative isolate flex min-h-20 w-full max-w-[336px] items-center justify-center px-6 pb-4">
            <svg
              aria-hidden="true"
              className="absolute inset-0 -z-10 h-full w-full"
              viewBox="0 0 320 88"
              preserveAspectRatio="none"
            >
              <path
                d="M42 4 C21 3 7 14 7 35 C6 56 20 69 43 70 C77 72 67 71 98 71 C102 78 111 83 124 82 C116 77 113 73 114 71 C157 73 242 72 277 69 C301 67 315 55 314 35 C314 14 299 5 276 4 C203 1 115 2 42 4 Z"
                fill={moods[mood].color}
                fillOpacity="0.2"
              />
            </svg>
            <p
              aria-live="polite"
              className="break-keep leading-relaxed text-theme-text-primary"
            >
              {moods[mood].story}
            </p>
          </div>
          <Image
            src={moods[mood].src}
            alt={`${moods[mood].label}인 블루`}
            sizes="(min-width: 1024px) 520px, 90vw"
            className="w-full max-w-[480px]"
          />
          <div
            className="grid w-full grid-cols-3 gap-2"
            role="group"
            aria-label="블루의 기분 미리보기"
          >
            {moods.map((item, index) => (
              <button
                key={item.label}
                type="button"
                aria-pressed={mood === index}
                onClick={() => setMood(index)}
                className={cn(
                  'flex min-h-11 items-center justify-center gap-2 rounded-xl border px-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-theme-accent',
                  mood === index
                    ? 'border-theme-accent bg-theme-accent-light/50 font-semibold text-theme-accent-text'
                    : 'border-transparent text-theme-text-secondary',
                )}
              >
                <span
                  aria-hidden="true"
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </IntroSection>
      <IntroSection
        bordered
        reverse
        hashtag="#오늘의색 #마음한조각"
        title="오늘의 마음을 남겨요"
        description={[
          '오늘은 어떤 색이었나요?',
          '그 마음을 있는 그대로 기록해요.',
        ]}
      >
        <div className="rounded-[20px] bg-theme-accent-light p-8 text-center text-theme-text-secondary">
          감정 일기 · 사진 · 기록 필터
        </div>
      </IntroSection>
      <IntroSection
        bordered
        hashtag="#작은걸음 #나를돌보는시간"
        title="나를 위한 작은 실천"
        description={[
          '이어가고 싶은 습관은 쌓고',
          '멀어지고 싶은 것과는 거리를 둬요.',
        ]}
      >
        <div className="rounded-[20px] bg-theme-accent-light p-8 text-center text-theme-text-secondary">
          습관 관리 · 자유 기록 · 거리두기
        </div>
      </IntroSection>
      <IntroSection
        bordered
        reverse
        hashtag="#차곡차곡 #우리의발자국"
        title="하루하루 쌓이는 발자국"
        description={[
          '지나온 날들을 가만히 펼치면',
          '나와 블루가 걸어온 길이 보여요.',
        ]}
      >
        <div className="rounded-[20px] bg-theme-accent-light p-8 text-center text-theme-text-secondary">
          월간 기록 · 감정 통계 · 연속 기록
        </div>
      </IntroSection>
      <section className={cn(introSectionClass, 'border-t border-theme-border/50')}>
        <div
          className={cn(
            introContainerClass,
            'flex max-w-[760px] flex-col gap-8',
          )}
        >
          <div className="flex flex-col gap-5 text-center">
            <span className="text-base font-semibold text-theme-accent-deep desktop:text-lg">
              #언제어디서나 #블루와함께
            </span>
            <h2 className={cn(introTitleClass, 'text-center')}>
              위블, 나에게 맞는 방식으로
            </h2>
          </div>
          <div className="grid auto-rows-fr gap-6 tablet:grid-cols-2 text-theme-text-secondary leading-relaxed">
            <div className="flex items-center gap-5 rounded-[20px] bg-theme-accent-light p-6 leading-8">
              <PiBrowserFill
                aria-hidden="true"
                className="shrink-0 text-4xl text-theme-accent"
              />
              <div className="min-w-0">
                <strong className="text-lg text-theme-text-primary">웹</strong>
                <p className="mt-3 break-keep">
                  계정으로 기록하고, 여러 기기에서 이어가요.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-5 rounded-[20px] bg-theme-accent-light p-6 leading-8">
              <PiDeviceMobileFill
                aria-hidden="true"
                className="shrink-0 text-4xl text-theme-accent"
              />
              <div className="min-w-0">
                <strong className="text-lg text-theme-text-primary">앱</strong>
                <p className="mt-3 break-keep">
                  계정 없이 내 기기에 기록을 남겨요.
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-5 rounded-[20px] bg-theme-accent-light p-6 leading-8 text-theme-text-secondary">
            <PiFloppyDiskBackFill
              aria-hidden="true"
              className="shrink-0 text-4xl text-theme-accent"
            />
            <div className="min-w-0">
              <strong className="text-lg text-theme-text-primary">백업 및 복원</strong>
              <p className="mt-3 break-keep">
                웹에서 백업한 기록은 앱에서 복원할 수 있어요. 앱에서는 백업과 복원을 모두 지원해요.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className={twMerge(introSectionClass, 'bg-theme-accent-light')}>
        <div
          className={cn(
            introContainerClass,
            'flex flex-col items-center gap-10 text-center',
          )}
        >
          <Image
            priority
            src={standingCat}
            alt="고양이 블루"
            sizes="(min-width: 1024px) 45vw, 80vw"
            className="mx-auto w-full max-w-[175px] desktop:max-w-[200px]"
          />
          <Wordmark className="text-5xl desktop:text-6xl" />
          <h2 className={introTitleClass}>
            모든 색의 하루가, 나의 이야기가 되도록.
          </h2>
          <p className={twMerge(introDescriptionClass, 'text-theme-accent')}>
            Bloom with Bloo and Blue.
          </p>
          <nav
            aria-label="서비스 정책"
            className="flex flex-wrap justify-center gap-6 text-sm text-theme-text-secondary"
          >
            <Link href="/privacy" className="hover:underline">
              개인정보처리방침
            </Link>
            <Link href="/account-deletion" className="hover:underline">
              계정 삭제
            </Link>
          </nav>
          <p className="text-sm text-theme-text-secondary">eooooostudio</p>
        </div>
      </section>
    </div>
  );
};

export default IntroClientPage;
