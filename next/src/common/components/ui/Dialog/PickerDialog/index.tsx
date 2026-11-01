'use client';

import { motion, useIsPresent, useReducedMotion } from 'framer-motion';
import { ReactNode, useLayoutEffect, useRef } from 'react';
import { cn } from '@/common/utils/cn';
import { DIALOG_ROOT_CLASS } from '../constants';
import { DialogBackdrop } from '../DialogBackdrop';
import { SheetHandle } from '../SheetHandle';
import { useSheetDismiss } from '../useSheetDismiss';

interface PickerDialogProps {
  children: ReactNode;
  labelledBy: string;
  describedBy?: string;
  fixedHeight?: boolean;
  onClose: () => void;
}

// 히스토리에 남기지 않는 임시 선택 UI다. 열림 상태와 적용된 값은 상위 컴포넌트가 관리한다.
export const PickerDialog = ({ children, labelledBy, describedBy, onClose, fixedHeight = false }: PickerDialogProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const isPresent = useIsPresent();
  const reduceMotion = useReducedMotion();
  const y = useSheetDismiss({ contentRef, enabled: isPresent, reducedMotion: reduceMotion, onClose });
  const offset = reduceMotion ? 0 : 'var(--picker-offset)';
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
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      className={DIALOG_ROOT_CLASS}
      onCancel={(event) => {
        event.preventDefault();
        event.stopPropagation();
        if (isPresent) onClose();
      }}
    >
      <DialogBackdrop
        transition={transition}
        onClick={() => {
          if (isPresent) onClose();
        }}
      />
      <motion.div
        ref={contentRef}
        style={{ y }}
        className={cn(
          "absolute inset-x-0 bottom-0 mx-auto flex max-h-[95dvh] w-full max-w-[550px] desktop:max-w-[650px] flex-col overflow-hidden rounded-t-[2rem] border border-theme-border bg-theme-surface pt-2 shadow-theme-modal [--picker-offset:50px]",
          fixedHeight && "h-[95dvh]",
        )}
        initial={{ opacity: 0, y: offset }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: y.get() > 0 && !reduceMotion ? '100%' : offset }}
        transition={transition}
      >
        <SheetHandle onClose={onClose} />
        <div className={cn("min-h-0 px-5 tablet:px-12 desktop:px-[81px]", fixedHeight ? "flex flex-1 flex-col overflow-hidden" : "overflow-y-auto overscroll-contain")}>{children}</div>
      </motion.div>
    </dialog>
  );
};
