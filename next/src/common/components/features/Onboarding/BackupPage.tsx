'use client';

import { twMerge } from 'tailwind-merge';
import Wordmark from '../../ui/Wordmark';
import {
  sectionClassName,
  sectionContentClassName,
  exampleClassName,
  sectionTextClassName,
  sectionTitleClassName,
} from './styles';
import { OnboardingFrame } from './OnboardingFrame';

export function BackupPage() {
  return (
    <OnboardingFrame
      title="소중한 기록을 보관해요"
      description="웹과 앱의 저장 방식과 활용 방법을 알아보세요."
      info="백업 비밀번호를 잊으면 복원할 수 없어요."
    >
      <section className={sectionClassName}>
        <h3 className={sectionTitleClassName}>{"'위블' - 웹"}</h3>
        <div className={sectionContentClassName}>
          <div
            className={twMerge(
              exampleClassName,
              'justify-center items-center gap-4',
            )}
          >
            <Wordmark
              accentColor="var(--loading-indicator)"
              className="text-[36px]"
            />
            <span className="font-semibold text-[20px] text-theme-text-primary">
              -
            </span>
            <span className="font-semibold text-[20px] text-theme-text-primary">
              Web
            </span>
          </div>
          <p className={sectionTextClassName}>
            로그인 후 입력한 자료는 모두 서버에 저장되며 PC와 모바일에서
            확인하고 기록할 수 있어요.
          </p>
          <p className={sectionTextClassName}>
            수동 백업 기능만 지원해요. 백업 파일을 이용해 모바일 앱에서 복원
            가능해요.
          </p>
        </div>
      </section>
      <section className={sectionClassName}>
        <h3 className={sectionTitleClassName}>{"'위블' - 모바일 앱"}</h3>
        <div className={sectionContentClassName}>
          <div
            className={twMerge(
              exampleClassName,
              'justify-center items-center gap-4',
            )}
          >
            <Wordmark
              accentColor="var(--loading-indicator)"
              className="text-[36px]"
            />
            <span className="font-semibold text-[20px] text-theme-text-primary">
              -
            </span>
            <span className="font-semibold text-[20px] text-theme-text-primary">
              App
            </span>
          </div>
          <p className={sectionTextClassName}>
            계정 없이 사용하며 기록은 기기에 저장돼요.
          </p>
          <p className={sectionTextClassName}>
            자동 및 수동 백업과 복원 기능을 모두 지원하며 웹과 앱 백업 파일은
            서로 호환돼요.
          </p>
        </div>
      </section>
      <section className={sectionClassName}>
        <h3 className={sectionTitleClassName}>백업 및 복원</h3>
        <div className={sectionContentClassName}>
          <p className={sectionTextClassName}>
            백업 파일을 생성할 때 비밀번호 설정이 요구되며 복원할 때 사용돼요.
          </p>
          <p className={sectionTextClassName}>
            최대 1GB의 .bloo 확장자 파일로 백업 파일이 생성돼요.
          </p>
        </div>
      </section>
    </OnboardingFrame>
  );
}
