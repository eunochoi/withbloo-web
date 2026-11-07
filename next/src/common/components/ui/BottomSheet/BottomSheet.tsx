'use client';

import { motion, useIsPresent, useReducedMotion } from 'framer-motion';
import { type ReactNode, useLayoutEffect, useRef } from 'react';
import { DIALOG_ROOT_CLASS } from './constants';
import { DialogBackdrop } from './DialogBackdrop';
import { SheetHandle } from './SheetHandle';
import { useSheetDismiss } from './useSheetDismiss';

type BottomSheetProps = {
  children: ReactNode;
  onClose: () => void;
  ariaLabel?: string;
  labelledBy?: string;
  describedBy?: string;
  dismissible?: boolean;
  preserveHandle?: boolean;
  handleColor?: string;
  height?: 'full' | 'auto';
  animateHeight?: boolean;
  picker?: boolean;
};

export function BottomSheet({
  children, onClose, ariaLabel, labelledBy, describedBy,
  dismissible = true, preserveHandle = false, handleColor,
  height = 'full', animateHeight = false, picker = false,
}: BottomSheetProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const isPresent = useIsPresent();
  const reduceMotion = useReducedMotion();
  const y = useSheetDismiss({ contentRef, enabled: dismissible && isPresent, reducedMotion: reduceMotion, onClose });
  const offset = reduceMotion ? 0 : picker ? 'var(--picker-offset)' : 50;
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
    <dialog ref={dialogRef} aria-label={ariaLabel} aria-labelledby={labelledBy} aria-describedby={describedBy}
      className={DIALOG_ROOT_CLASS} onCancel={(event) => {
        event.preventDefault();
        if (picker) event.stopPropagation();
        if (dismissible && isPresent) onClose();
      }}>
      <DialogBackdrop transition={transition} onClick={() => { if (dismissible && isPresent) onClose(); }} />
      <motion.div ref={contentRef} layout={!picker && !animateHeight && height === 'auto' && !reduceMotion}
        style={{ y }}
        className={`absolute inset-x-0 bottom-0 mx-auto flex ${height === 'auto' ? 'h-auto' : 'h-[calc(100dvh-40px)]'} max-h-[calc(100dvh-40px)] w-full max-w-[550px] desktop:max-w-[650px] flex-col overflow-hidden rounded-t-[2rem] border border-theme-border bg-theme-surface pt-2 shadow-theme-modal [--picker-offset:50px]`}
        initial={{ opacity: 0, y: offset }}
        animate={{ opacity: 1, y: 0, ...(animateHeight ? { height: height === 'auto' ? 'auto' : 'calc(100dvh - 40px)' } : {}) }}
        exit={{ opacity: 0, y: y.get() > 0 && !reduceMotion ? '100%' : offset }} transition={transition}>
        {(dismissible || preserveHandle) && <SheetHandle onClose={onClose} color={handleColor} disabled={!dismissible} />}
        {children}
      </motion.div>
    </dialog>
  );
}
