'use client';

import { motion, useIsPresent, useReducedMotion } from 'framer-motion';
import { ReactNode, useLayoutEffect, useRef } from 'react';
import { DIALOG_ROOT_CLASS } from '../constants';
import { DialogBackdrop } from '../DialogBackdrop';
import { SheetHandle } from '../SheetHandle';

interface PanelDialogProps {
  ariaLabel: string;
  children: ReactNode;
  onClose: () => void;
  dismissible?: boolean;
  handleColor?: string;
  height?: 'full' | 'auto';
}

// 라우트 기반 화면을 패널로 표시한다. 닫힌 뒤의 라우트 이동은 상위 컴포넌트가 처리한다.
export const PanelDialog = ({
  ariaLabel,
  children,
  onClose,
  dismissible = true,
  handleColor,
  height = 'full',
}: PanelDialogProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const isPresent = useIsPresent();
  const reduceMotion = useReducedMotion();
  const offset = reduceMotion ? 0 : 50;
  const transition = { duration: reduceMotion ? 0 : 0.3, ease: 'easeInOut' as const };

  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (dialog && !dialog.open) dialog.showModal();

    return () => {
      if (dialog?.open) dialog.close();
      if (trigger?.isConnected) trigger.focus();
    };
  }, []);

  useLayoutEffect(() => {
    if (contentRef.current) contentRef.current.inert = !isPresent;
  }, [isPresent]);

  return (
    <dialog
      ref={dialogRef}
      aria-label={ariaLabel}
      className={DIALOG_ROOT_CLASS}
      onCancel={(event) => {
        event.preventDefault();
        if (dismissible && isPresent) onClose();
      }}
    >
      <DialogBackdrop
        transition={transition}
        onClick={() => {
          if (dismissible && isPresent) onClose();
        }}
      />
      <motion.div
        ref={contentRef}
        className={`absolute inset-x-0 bottom-0 mx-auto flex ${height === 'auto' ? 'h-auto' : 'h-[95dvh]'} max-h-[95dvh] w-full max-w-[550px] desktop:max-w-[650px] flex-col overflow-hidden rounded-t-[2rem] border border-theme-border bg-theme-surface pt-2 shadow-theme-modal`}
        initial={{ opacity: 0, y: offset }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: offset }}
        transition={transition}
      >
        {dismissible && <SheetHandle onClose={onClose} color={handleColor} />}
        {children}
      </motion.div>
    </dialog>
  );
};
