'use client';

import EmotionImage from '@/common/components/ui/EmotionImage';
import { DiaryIcon, HabitIcon } from '@/common/constants/appIcons';
import { EMOTIONS } from '@/common/constants/emotions';
import { twMerge } from 'tailwind-merge';
import { OnboardingFrame } from './OnboardingFrame';
import {
  exampleClassName,
  sectionClassName,
  sectionContentClassName,
  sectionTextClassName,
  sectionTitleClassName,
} from './styles';

export function CalendarGuidePage() {
  return (
    <OnboardingFrame
      title="달력에서 한눈에 봐요"
      description="지난 감정과 습관을 함께 살펴볼 수 있어요."
      info={'자유 기록 습관은 완료율 계산에 포함되지 않아요.'}
    >
      <section className={sectionClassName}>
        <h3 className={sectionTitleClassName}>그날의 감정</h3>
        <div className={sectionContentClassName}>
          <div className={twMerge(exampleClassName, 'justify-evenly')}>
            {[EMOTIONS[0], EMOTIONS[3], EMOTIONS[1], EMOTIONS[6]].map(
              (emotion) => (
                <EmotionImage
                  key={emotion.id}
                  emotion={emotion}
                  alt=""
                  width={64}
                  height={64}
                  className="h-16 w-auto object-contain"
                />
              ),
            )}
          </div>
          <p className={sectionTextClassName}>
            감정 아이콘으로 그날의 감정을 남겨요.
          </p>
        </div>
      </section>

      <section className={sectionClassName}>
        <h3 className={sectionTitleClassName}>습관 진행률</h3>
        <div className={sectionContentClassName}>
          <div className={twMerge(exampleClassName, 'justify-evenly')}>
            <div className="w-full h-auto grid grid-cols-3 gap-4">
              {[
                { label: '~ 25%', percent: 20, color: '#E599A5' },
                { label: '25% ~ 75%', percent: 50, color: '#EFBE48' },
                { label: '75% ~', percent: 100, color: '#7BBDAD' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex flex-col gap-4 text-center"
                >
                  <p className="text-base text-theme-text-secondary">
                    {item.label}
                  </p>
                  <div
                    aria-hidden="true"
                    className="h-4 overflow-hidden rounded-full bg-theme-border/30"
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${item.percent}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p className={sectionTextClassName}>
            진행바의 색상과 길이로 그날의 성취를 확인해요.
          </p>
        </div>
      </section>

      <section className={sectionClassName}>
        <h3 className={sectionTitleClassName}>달력 페이지 상단 아이콘</h3>
        <div className={sectionContentClassName}>
          <div className={twMerge(exampleClassName, 'justify-evenly')}>
            <span className="flex items-center gap-1.5">
              <DiaryIcon
                aria-hidden="true"
                className="text-xl text-theme-accent"
              />
              12개
            </span>
            {[
              { count: 8, color: '#7BBDAD' },
              { count: 5, color: '#EFBE48' },
              { count: 2, color: '#E599A5' },
            ].map((item) => (
              <span key={item.color} className="flex items-center gap-1.5">
                <HabitIcon
                  aria-hidden="true"
                  className="text-xl"
                  style={{ color: item.color }}
                />
                {item.count}일
              </span>
            ))}
          </div>
          <p className={sectionTextClassName}>
            이번 달 일기와 습관 성취도를 한눈에 파악해요.
          </p>
        </div>
      </section>
    </OnboardingFrame>
  );
}
