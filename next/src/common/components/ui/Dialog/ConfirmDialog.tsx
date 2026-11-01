'use client';

import { AnimatePresence } from 'framer-motion';
import { useId, useRef } from 'react';
import { ChevronRightIcon, DeleteIcon, LogoutIcon, UndoIcon } from '@/common/constants/appIcons';
import { PickerDialog } from './PickerDialog';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  confirmLabel: string;
  confirmDescription: string;
  danger?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ConfirmDialog = ({ isOpen, title, confirmLabel, confirmDescription, danger = false, onClose, onConfirm }: ConfirmDialogProps) => {
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
        <PickerDialog labelledBy={`${id}-title`} onClose={onClose}>
          <div className="flex w-full flex-col gap-6 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <div className="flex flex-col items-center gap-2">
              <h2 id={`${id}-title`} className="text-center text-lg font-semibold tracking-tight text-theme-text-primary">{title}</h2>
            </div>
            <div className="flex flex-col gap-3">
              <button type="button" className="flex min-h-16 w-full items-center gap-4 rounded-2xl border border-theme-border p-4 text-left transition-opacity hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-theme-accent" onClick={() => {
                if (confirmed.current) return;
                confirmed.current = true;
                onClose();
              }}>
                {danger ? <DeleteIcon className="shrink-0 text-2xl text-theme-danger" aria-hidden="true" /> : <LogoutIcon className="shrink-0 text-2xl text-theme-accent" aria-hidden="true" />}
                <span className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className={`text-base font-semibold ${danger ? 'text-theme-danger' : 'text-theme-text-primary'}`}>{confirmLabel}</span>
                  <span className="text-sm leading-5 tracking-tight text-theme-text-secondary">{confirmDescription}</span>
                </span>
                <ChevronRightIcon className="shrink-0 text-xl text-theme-text-tertiary" aria-hidden="true" />
              </button>
              <button type="button" className="flex min-h-16 w-full items-center gap-4 rounded-2xl border border-theme-border p-4 text-left transition-opacity hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-theme-accent" onClick={onClose}>
                <UndoIcon className="shrink-0 text-2xl text-theme-accent" aria-hidden="true" />
                <span className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="text-base font-semibold text-theme-text-primary">취소</span>
                  <span className="text-sm leading-5 tracking-tight text-theme-text-secondary">이전 화면으로 돌아가요.</span>
                </span>
                <ChevronRightIcon className="shrink-0 text-xl text-theme-text-tertiary" aria-hidden="true" />
              </button>
            </div>
          </div>
        </PickerDialog>
      )}
    </AnimatePresence>
  );
};
