'use client';

import { AnimatePresence } from 'framer-motion';
import { useId, useRef } from 'react';
import { PickerDialog } from './PickerDialog';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  danger?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ConfirmDialog = ({ isOpen, title, message, confirmLabel, danger = false, onClose, onConfirm }: ConfirmDialogProps) => {
  const id = useId();
  const confirmed = useRef(false);

  return (
    <AnimatePresence onExitComplete={() => {
      if (confirmed.current) {
        confirmed.current = false;
        onConfirm();
      }
    }}>
      {isOpen && (
        <PickerDialog labelledBy={`${id}-title`} describedBy={`${id}-message`} onClose={onClose}>
          <div className="flex w-full flex-col gap-6 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <div className="flex flex-col items-center gap-2">
              <h2 id={`${id}-title`} className="text-center text-lg font-semibold tracking-tight text-theme-text-primary">{title}</h2>
            </div>
            <p id={`${id}-message`} className="text-center text-sm leading-relaxed text-theme-text-primary">{message}</p>
            <div className="flex gap-3">
              <button type="button" className="flex min-h-12 flex-1 items-center justify-center rounded-full border border-theme-border px-5 text-base text-theme-text-primary" onClick={onClose}>취소</button>
              <button type="button" className={`flex min-h-12 flex-1 items-center justify-center rounded-full border border-theme-overlay/15 px-5 text-base text-theme-text-on-accent ${danger ? 'bg-theme-danger' : 'bg-theme-accent'}`} onClick={() => {
                if (confirmed.current) return;
                confirmed.current = true;
                onClose();
              }}>{confirmLabel}</button>
            </div>
          </div>
        </PickerDialog>
      )}
    </AnimatePresence>
  );
};
