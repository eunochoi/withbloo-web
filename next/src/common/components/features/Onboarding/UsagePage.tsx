'use client';

import { LeftRightIcon } from '@/common/constants/appIcons';
import Image from 'next/image';
import { twMerge } from 'tailwind-merge';
import {
  sectionClassName,
  sectionContentClassName,
  exampleClassName,
  sectionTextClassName,
  sectionTitleClassName,
} from './styles';
import { OnboardingFrame } from './OnboardingFrame';
import navigationPreview from '/public/img/onboarding/navigation.png';

const ViewToggleExample = ({
  leftText,
  rightText,
}: {
  leftText: string;
  rightText: string;
}) => {
  return (
    <div
      aria-label={`보기 방식 예시: ${leftText} / ${rightText}`}
      className={twMerge(exampleClassName, 'flex items-center justify-between')}
    >
      <div className="flex-1 flex justify-center items-center gap-2">
        <span className="text-base font-semibold">{leftText}</span>
      </div>
      <LeftRightIcon
        aria-hidden="true"
        className="shrink-0 text-lg text-theme-text-tertiary"
      />
      <div className="flex-1 flex justify-center items-center gap-2">
        <span className="text-base font-semibold">{rightText}</span>
      </div>
    </div>
  );
};

export function UsagePage() {
  return (
    <OnboardingFrame
      title="편리하게 사용해요"
      description="알아두면 더 편리한 기능들이에요."
      info="긴 이름 예시는 직접 눌러볼 수 있어요."
    >
      <section className={sectionClassName}>
        <h3 className={sectionTitleClassName}>화면 맨 위로 빠르게</h3>
        <div className={sectionContentClassName}>
          <Image
            src={navigationPreview}
            alt="현재 메뉴를 원형 점선으로 표시한 하단 메뉴"
            sizes="240px"
            className="h-auto w-full object-contain"
          />
          <p className={sectionTextClassName}>
            현재 보고 있는 메뉴를 한 번 더 누르면 맨 위로 이동해요.
          </p>
        </div>
      </section>
      <section className={sectionClassName}>
        <h3 className={sectionTitleClassName}>시간 표시 바꾸기</h3>
        <div className={sectionContentClassName}>
          <ViewToggleExample leftText="2일 3시간 4분" rightText="51시간 4분" />
          <p className={sectionTextClassName}>
            거리두기 상세 화면에서 보기 방식 변환 토글 지원
          </p>
        </div>
      </section>
      <section className={sectionClassName}>
        <h3 className={sectionTitleClassName}>긴 이름 확인하기</h3>
        <div className={sectionContentClassName}>
          <ViewToggleExample leftText="말 줄임표" rightText="스크롤 형태" />
          <p className={sectionTextClassName}>
            긴 항목 이름 보기 방식 변환 토글 지원
          </p>
        </div>
      </section>
    </OnboardingFrame>
  );
}
