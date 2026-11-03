'use client';

import { PanelDialog } from '@/common/components/ui/Dialog/PanelDialog';
import { PanelHeader } from '@/common/components/ui/Dialog/PanelDialog/PanelHeader';
import { ScrollContainer } from '@/common/components/ui/ScrollContainer';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useRef, useState } from 'react';
import { BackupPage } from './BackupPage';
import { CalendarGuidePage } from './CalendarGuidePage';
import { StartPage } from './StartPage';
import { ThemePage } from './ThemePage';
import { UsagePage } from './UsagePage';
import { WelcomePage } from './WelcomePage';

const pages = [
  WelcomePage,
  ThemePage,
  UsagePage,
  CalendarGuidePage,
  BackupPage,
  StartPage,
];
const buttonClass =
  'min-h-12 flex-1 rounded-full border px-4 py-3 text-[13px] font-semibold';

export function OnboardingDialog({
  firstRun,
  onClose,
  onContinueWithoutSaving,
}: {
  firstRun: boolean;
  onClose: () => void;
  onContinueWithoutSaving: () => void;
}) {
  const [page, setPage] = useState(0);
  const reducedMotion = useReducedMotion();
  const [error, setError] = useState('');
  const [sessionOnly, setSessionOnly] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const Page = pages[page];
  const isFirst = page === 0;
  const isLast = page === pages.length - 1;

  const changePage = (next: number) => {
    if (next < 0 || next >= pages.length) return;
    setPage(next);
    setError('');
  };

  const finish = () => {
    try {
      onClose();
    } catch {
      setError(
        '완료 상태를 저장하지 못했어요. 브라우저의 저장소 설정을 확인하고 다시 시도해주세요.',
      );
      setSessionOnly(true);
    }
  };

  return (
    <PanelDialog
      ariaLabel="위블 사용 안내"
      dismissible={!firstRun}
      onClose={onClose}
    >
      <PanelHeader />
      <ScrollContainer
        ref={scrollRef}
        className="min-h-0 flex-1"
        contentClassName="flex flex-col"
        showScrollFade
        scrollFadeClassName="h-8"
      >
        <AnimatePresence
          mode="wait"
          onExitComplete={() => scrollRef.current?.scrollTo({ top: 0 })}
        >
          <motion.div
            className="flex flex-1 flex-col"
            key={page}
            initial={{ opacity: reducedMotion ? 1 : 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: reducedMotion ? 1 : 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.2 }}
          >
            <Page />
          </motion.div>
        </AnimatePresence>
      </ScrollContainer>
      <footer style={{ lineHeight: 'normal' }} className="shrink-0 px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-4">
        <div className="mx-auto w-full max-w-lg">
          {error && (
            <p role="alert" className="mb-3 text-[11px] text-theme-text-secondary">
              {error}
            </p>
          )}

          {sessionOnly && (
            <div className="mb-3 text-[11px] text-theme-text-secondary">
              <p>저장하지 않고 시작하면 다음 접속 때 안내가 다시 표시돼요.</p>
              <button
                type="button"
                onClick={onContinueWithoutSaving}
                className="min-h-11 underline"
              >
                저장하지 않고 시작하기
              </button>
            </div>
          )}

          <div className="flex items-stretch gap-3">
            {!isFirst && (
              <button
                type="button"
                className={`${buttonClass} border-theme-border text-theme-text-secondary`}
                onClick={() => changePage(page - 1)}
              >
                이전
              </button>
            )}
            <button
              type="button"
              className={`${buttonClass} border-theme-accent bg-theme-accent text-theme-text-on-accent`}
              onClick={() => (isLast ? finish() : changePage(page + 1))}
            >
              {isLast ? (firstRun ? '시작하기' : '닫기') : '다음'}
            </button>
          </div>
        </div>
      </footer>
    </PanelDialog>
  );
}
