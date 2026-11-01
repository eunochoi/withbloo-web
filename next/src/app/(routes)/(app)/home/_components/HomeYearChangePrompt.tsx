'use client';

import { ArrowRightIcon } from '@/common/constants/appIcons';



interface Props {
  onOpenYearPicker: () => void;
}

const HomeYearChangePrompt = ({ onOpenYearPicker }: Props) => {
  return (
    <div
      className="flex w-full flex-col gap-2"
    >
      <span className=" text-xl font-semibold text-theme-text-primary">다른 연도도 확인해 볼까요?</span>
      <span className="text-base text-theme-text-secondary">연도를 바꿔 다른 해의 기록도 살펴보세요.</span>
      <button
        onClick={onOpenYearPicker}
        className="mr-2 desktop:mr-6 mt-4 self-end flex shrink-0 items-center gap-2 text-lg desktop:text-base font-medium text-theme-accent">
        <span>연도 선택</span>
        <ArrowRightIcon aria-hidden="true" />
      </button>
    </div>
  );
};

export default HomeYearChangePrompt;
