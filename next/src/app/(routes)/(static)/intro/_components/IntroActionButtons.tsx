'use client';

import { PickerDialog } from '@/common/components/ui/Dialog/PickerDialog';
import { ChevronRightIcon } from '@/common/constants/appIcons';
import { cn } from '@/common/utils/cn';
import { AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useId, useState } from 'react';
import { FaApple, FaGooglePlay } from 'react-icons/fa';
import { MdInstallMobile, MdLanguage, MdOutlineAndroid } from 'react-icons/md';
import { twMerge } from 'tailwind-merge';

import { usePwaInstall } from '../_hooks/usePwaInstall';
import { introIconClass } from '../_styles/classes';

const PLAY_STORE_URL =
  'https://play.google.com/store/apps/details?id=com.everstamp&pcampaignid=web_share';
const actionClass =
  'inline-flex w-full items-center gap-3 rounded-theme border px-3 py-3 text-left text-base font-normal transition-colors';
const optionClass =
  'flex min-h-16 w-full items-center gap-4 rounded-2xl border border-theme-border p-4 text-left transition-opacity hover:opacity-70';

interface IntroActionButtonsProps {
  className?: string;
}

const IntroActionButtons = ({ className }: IntroActionButtonsProps) => {
  const { installPwa } = usePwaInstall();
  const [isOpen, setIsOpen] = useState(false);
  const [isAppOpen, setIsAppOpen] = useState(false);
  const appTitleId = useId();
  const titleId = useId();

  return (
    <>
      <div className={cn('grid w-full max-w-[500px] grid-cols-1 gap-3 tablet:grid-cols-2', className)}>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={twMerge(actionClass, 'border-theme-border bg-theme-surface text-theme-text-primary hover:bg-theme-accent/20')}
        >
          <MdLanguage className={introIconClass} aria-hidden="true" />
          <span className="flex min-w-0 flex-col gap-1">
            <span className='font-semibold'>웹 서비스 시작</span>
            <span className="text-xs leading-4 opacity-80">로그인 후 기록을 서버에 저장해요.</span>
          </span>
        </button>
        <button type="button" onClick={() => setIsAppOpen(true)} className={twMerge(actionClass, 'border-theme-border bg-theme-surface text-theme-text-primary hover:bg-theme-accent/20')}>
          <FaGooglePlay className={introIconClass} aria-hidden="true" />
          <span className="flex min-w-0 flex-col gap-1">
            <span className='font-semibold'>앱 서비스 시작</span>
            <span className="text-xs leading-4 opacity-80">로그인 없이 기록을 기기에 저장해요.</span>
          </span>
        </button>
      </div >
      <AnimatePresence>
        {isOpen && (
          <PickerDialog labelledBy={titleId} onClose={() => setIsOpen(false)} header={<h2 id={titleId} className="text-center text-lg font-semibold tracking-tight text-theme-text-primary">
                웹 서비스 이용하기
              </h2>}>
            <div className="flex w-full flex-col gap-6 pb-[max(1rem,env(safe-area-inset-bottom))]">

              <div className="flex flex-col gap-3">
                <Link href="/login" className={optionClass}>
                  <MdLanguage className="shrink-0 text-2xl text-theme-accent" aria-hidden="true" />
                  <span className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="text-base font-semibold text-theme-text-primary">웹 사이트에서 접속</span>
                    <span className="text-sm leading-5 tracking-tight text-theme-text-secondary">설치 없이 브라우저에서 이용해요.</span>
                  </span>
                  <ChevronRightIcon className="shrink-0 text-xl text-theme-text-tertiary" aria-hidden="true" />
                </Link>
                <button type="button" disabled className={cn(optionClass, 'cursor-not-allowed opacity-60')}>
                  <MdOutlineAndroid className="shrink-0 text-2xl text-theme-accent" aria-hidden="true" />
                  <span className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="text-base font-semibold text-theme-text-primary">APK 설치</span>
                    <span className="text-sm leading-5 tracking-tight text-theme-text-secondary">안드로이드 설치 파일을 준비하고 있어요.</span>
                  </span>
                </button>
                <button type="button" onClick={() => { setIsOpen(false); void installPwa(); }} className={optionClass}>
                  <MdInstallMobile className="shrink-0 text-2xl text-theme-accent" aria-hidden="true" />
                  <span className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="text-base font-semibold text-theme-text-primary">PWA 설치</span>
                    <span className="text-sm leading-5 tracking-tight text-theme-text-secondary">홈 화면에 추가해 앱처럼 이용해요.</span>
                  </span>
                  <ChevronRightIcon className="shrink-0 text-xl text-theme-text-tertiary" aria-hidden="true" />
                </button>
              </div>
            </div>
          </PickerDialog>
        )}
        {isAppOpen && (
          <PickerDialog labelledBy={appTitleId} onClose={() => setIsAppOpen(false)} header={<h2 id={appTitleId} className="text-center text-lg font-semibold tracking-tight text-theme-text-primary">앱 서비스 이용하기</h2>}>
            <div className="flex w-full flex-col gap-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <a href={PLAY_STORE_URL} className={optionClass}>
                <MdOutlineAndroid className="shrink-0 text-2xl text-theme-accent" aria-hidden="true" />
                <span className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="text-base font-semibold text-theme-text-primary">안드로이드 앱</span>
                  <span className="text-sm leading-5 tracking-tight text-theme-text-secondary">Google Play에서 설치해 이용해요.</span>
                </span>
                <ChevronRightIcon className="shrink-0 text-xl text-theme-text-tertiary" aria-hidden="true" />
              </a>
              <button type="button" disabled className={cn(optionClass, 'cursor-not-allowed opacity-60')}>
                <FaApple className="shrink-0 text-2xl text-theme-accent" aria-hidden="true" />
                <span className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="text-base font-semibold text-theme-text-primary">iOS 앱</span>
                  <span className="text-sm leading-5 tracking-tight text-theme-text-secondary">iOS 앱을 준비하고 있어요.</span>
                </span>
              </button>
            </div>
          </PickerDialog>
        )}
      </AnimatePresence>
    </>
  );
};

export default IntroActionButtons;
