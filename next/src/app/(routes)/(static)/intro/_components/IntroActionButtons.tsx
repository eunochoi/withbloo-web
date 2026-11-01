'use client';

import { ArrowRightIcon } from '@/common/constants/appIcons';

import Link from 'next/link';
import { FaGooglePlay } from 'react-icons/fa';
import { MdInstallMobile } from 'react-icons/md';

import { cn } from '@/common/utils/cn';
import { usePwaInstall } from '../_hooks/usePwaInstall';
import { introActionClass, introIconClass } from '../_styles/classes';

const PLAY_STORE_URL =
  'https://play.google.com/store/apps/details?id=com.everstamp&pcampaignid=web_share';
const secondaryActionClass = cn(
  introActionClass,
  'px-2 text-sm text-theme-text-secondary hover:bg-theme-accent-light hover:text-theme-accent-text',
);

interface IntroActionButtonsProps {
  className?: string;
}

const IntroActionButtons = ({ className }: IntroActionButtonsProps) => {
  const { installPwa } = usePwaInstall();

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <Link
        href="/login"
        className={cn(
          introActionClass,
          'bg-theme-surface w-full max-w-[280px]  px-7 font-bold text-theme-accent-text ring-1 ring-inset ring-theme-accent/40 hover:bg-theme-accent/30',
        )}
      >
        웹에서 시작하기
        <ArrowRightIcon className={introIconClass} aria-hidden="true" />
      </Link>
      <div className="flex flex-wrap items-center justify-center gap-x-3">
        <a href={PLAY_STORE_URL} className={secondaryActionClass}>
          <FaGooglePlay className={introIconClass} aria-hidden="true" />
          Play Store
        </a>
        <button
          type="button"
          onClick={installPwa}
          className={secondaryActionClass}
        >
          <MdInstallMobile className={introIconClass} aria-hidden="true" />홈
          화면에 설치
        </button>
      </div>
    </div>
  );
};

export default IntroActionButtons;
