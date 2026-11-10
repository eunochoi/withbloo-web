'use client';

import { AnimatePresence, motion, usePresence, useReducedMotion } from 'framer-motion';
import { forwardRef, type ReactNode, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react';
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

export type BottomSheetHandle = { close: () => void };

export const BottomSheet = forwardRef<BottomSheetHandle, BottomSheetProps>(function BottomSheet({
  children, onClose, ariaLabel, labelledBy, describedBy,
  dismissible = true, preserveHandle = false, handleColor,
  height = 'full', animateHeight = false, picker = false,
}: BottomSheetProps, ref) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isPresent, safeToRemove] = usePresence();
  const [open, setOpen] = useState(true);
  const closingRef = useRef(false);
  const exitCompleteRef = useRef(false);
  const requestClose = () => {
    if (closingRef.current) return;
    closingRef.current = true;
    setOpen(false);
  };
  useImperativeHandle(ref, () => ({ close: requestClose }));
  const reduceMotion = useReducedMotion();
  const y = useSheetDismiss({ contentRef, enabled: dismissible && isPresent && open, reducedMotion: reduceMotion, onClose: requestClose });
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

  useEffect(() => {
    if (!isPresent) {
      if (exitCompleteRef.current) safeToRemove?.();
      else setOpen(false);
    }
  }, [isPresent, safeToRemove]);

  useLayoutEffect(() => {
    if (contentRef.current) contentRef.current.inert = !isPresent || !open;
  }, [isPresent, open]);

  return (
    <dialog ref={dialogRef} aria-label={ariaLabel} aria-labelledby={labelledBy} aria-describedby={describedBy}
      className={DIALOG_ROOT_CLASS} onCancel={(event) => {
        event.preventDefault();
        if (picker) event.stopPropagation();
        if (dismissible && isPresent && open) requestClose();
      }}>
      <AnimatePresence onExitComplete={() => {
        exitCompleteRef.current = true;
        if (dialogRef.current?.open) dialogRef.current.close();
        if (!isPresent) safeToRemove?.();
        else if (closingRef.current) onClose();
      }}>
        {open && <DialogBackdrop key="backdrop" transition={transition} onClick={() => { if (dismissible && isPresent) requestClose(); }} />}
      {open && <motion.div key="sheet" ref={contentRef} layout={!picker && !animateHeight && height === 'auto' && !reduceMotion}
        style={{ y }}
        className={`absolute inset-x-0 bottom-0 mx-auto flex ${height === 'auto' ? 'h-auto' : 'h-[calc(100dvh-40px)]'} max-h-[calc(100dvh-40px)] w-full max-w-[550px] desktop:max-w-[650px] flex-col overflow-hidden rounded-t-[2rem] border border-theme-border bg-theme-surface pt-2 shadow-theme-modal [--picker-offset:50px]`}
        initial={{ opacity: 0, y: offset }}
        animate={{ opacity: 1, y: 0, ...(animateHeight ? { height: height === 'auto' ? 'auto' : 'calc(100dvh - 40px)' } : {}) }}
        exit={{ opacity: 0, y: y.get() > 0 && !reduceMotion ? '100%' : offset }} transition={transition}>
        {(dismissible || preserveHandle) && <SheetHandle onClose={requestClose} color={handleColor} disabled={!dismissible} />}
        {children}
      </motion.div>}
      </AnimatePresence>
    </dialog>
  );
});
