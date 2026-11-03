'use client';

import Image from 'next/image';
import { useState } from 'react';
import negative from '/public/img/cats/cat-blue-n.png';
import positive from '/public/img/cats/cat-blue-p.png';
import neutral from '/public/img/cats/cat-blue.png';
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
const choiceClass =
  'min-h-11 min-w-0 rounded-xl border px-2 py-2 text-[13px]';
export function WelcomePage() {
  const [mood, setMood] = useState(1);
  return (
    <section
      style={{ lineHeight: 'normal' }}
      aria-labelledby="onboarding-welcome-title"
      className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-evenly gap-6 break-keep px-6 py-6 text-[13px] text-theme-text-primary"
    >
      <header className="flex shrink-0 flex-col gap-1 text-center">
        <h2
          id="onboarding-welcome-title"
          className="mb-4 text-[24px] font-semibold tracking-tight"
        >
          안녕, 나는 &apos;블루&apos;야!
        </h2>
        <p className="text-[13px] whitespace-pre-line text-theme-text-secondary">
          {'나는 마음에 따라 털색이 달라지는'}
        </p>
        <p className="text-[13px] whitespace-pre-line text-theme-text-secondary">
          {'조금 특별한 고양이야.'}
        </p>
      </header>

      <div className="flex flex-col gap-4 text-center">
        <div className="relative isolate mx-auto flex h-20 w-full max-w-[21rem] items-center justify-center px-6 pb-4">
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
          <p aria-live="polite">{moods[mood].story}</p>
        </div>
        <div
          className="relative -mt-8 h-48"
          role="img"
          aria-label={`${moods[mood].label}인 블루`}
        >
          <Image
            key={mood}
            src={moods[mood].src}
            alt=""
            aria-hidden="true"
            sizes="336px"
            className="absolute inset-0 mx-auto h-full w-full max-w-[21rem] object-contain"
          />
        </div>
        <div
          className="grid grid-cols-3 gap-2"
          role="group"
          aria-label="블루의 기분 미리보기"
        >
          {moods.map((item, index) => (
            <button
              key={item.label}
              type="button"
              aria-label={`${item.label}인 블루 미리보기`}
              aria-pressed={mood === index}
              onClick={() => setMood(index)}
              className={`${choiceClass} flex flex-wrap items-center justify-center gap-2 ${mood === index ? 'border-theme-accent bg-theme-accent-light/50 font-semibold text-theme-accent-text' : 'border-transparent'}`}
            >
              <span
                aria-hidden="true"
                className="h-3 w-3 shrink-0 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              {item.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-col text-center gap-1">
        <p className="mb-2 text-[16px] font-semibold">
          어떤 색의 하루라도 괜찮아요.
        </p>
        <p className="text-[13px] whitespace-pre-line text-theme-text-secondary">
          {"'위블'에서 오늘의 마음을 기록하고"}
        </p>
        <p className="text-[13px] whitespace-pre-line text-theme-text-secondary">
          {'좋은 습관을 더하고, 줄이고 싶은 습관은 덜어내요.'}
        </p>
        <p className="mt-2 text-[13px] whitespace-pre-line text-theme-accent-deep">
          {'withBloo - Bloom with Bloo & Blue.'}
        </p>
      </div>
    </section>
  );
}
