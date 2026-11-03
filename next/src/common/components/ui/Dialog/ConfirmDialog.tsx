'use client';

import { AnimatePresence } from 'framer-motion';
import { useId, useRef, useState } from 'react';
import { showNotice } from '@/common/components/ui/Notice/notice';
import { PickerDialog } from './PickerDialog';
import { ChevronRightIcon, DeleteIcon, LogoutIcon, UndoIcon } from '@/common/constants/appIcons';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  confirmLabel: string;
  confirmDescription: string;
  danger?: boolean;
  onClose: () => void;
  onConfirm: () => Promise<unknown> | void;
  onConfirmed?: () => void;
}

export const ConfirmDialog = ({ isOpen, title, confirmLabel, confirmDescription, danger = false, onClose, onConfirm, onConfirmed }: ConfirmDialogProps) => {
  const id = useId();
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  const confirmed = useRef(false);
  const close = () => { if (!pending.current) onClose(); };
  return (
    <AnimatePresence onExitComplete={() => {
      if (confirmed.current) { confirmed.current = false; onConfirmed?.(); }
    }}>
      {isOpen && (
        <PickerDialog labelledBy={`${id}-title`} onClose={close}>
          <div className="flex w-full flex-col gap-6 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <h2 id={`${id}-title`} className="text-center text-lg font-semibold tracking-tight text-theme-text-primary">{title}</h2>
            <div className="flex flex-col gap-3">
              <button type="button" disabled={busy} className="flex min-h-16 w-full items-center gap-4 rounded-2xl border border-theme-border p-4 text-left transition-opacity hover:opacity-70 disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-theme-accent" onClick={async () => {
                if (pending.current) return;
                pending.current = true;
                setBusy(true);
                try {
                  await onConfirm();
                  confirmed.current = true;
                  pending.current = false;
                  onClose();
                } catch (error) {
                  showNotice(error instanceof Error ? error.message : '처리하지 못했어요.');
                } finally {
                  pending.current = false;
                  setBusy(false);
                }
              }}>
                {danger ? <DeleteIcon className="shrink-0 text-2xl text-theme-danger" aria-hidden="true" /> : <LogoutIcon className="shrink-0 text-2xl text-theme-accent" aria-hidden="true" />}
                <span className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className={`text-base font-semibold ${danger ? 'text-theme-danger' : 'text-theme-text-primary'}`}>{confirmLabel}</span>
                  <span className="text-sm leading-5 tracking-tight text-theme-text-secondary">{confirmDescription}</span>
                </span>
                <ChevronRightIcon className="shrink-0 text-xl text-theme-text-tertiary" aria-hidden="true" />
              </button>
              <button type="button" disabled={busy} onClick={close} className="flex min-h-16 w-full items-center gap-4 rounded-2xl border border-theme-border p-4 text-left transition-opacity hover:opacity-70 disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-theme-accent">
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
