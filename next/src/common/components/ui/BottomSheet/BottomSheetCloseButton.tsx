'use client';

import { createContext, useContext } from 'react';
import { ChevronLeftIcon } from '@/common/constants/appIcons';
import { cn } from '@/common/utils/cn';

export const BottomSheetCloseContext = createContext<{
  onClose: () => void;
  disabled: boolean;
} | null>(null);

export function BottomSheetCloseButton({ className }: { className?: string }) {
  const close = useContext(BottomSheetCloseContext);
  if (!close) return null;

  return (
    <button
      type="button"
      aria-label="닫기"
      disabled={close.disabled}
      onClick={close.onClose}
      className={cn(
        '-ml-5 flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-theme-accent hover:opacity-70 focus-visible:outline-2 focus-visible:outline-theme-accent disabled:opacity-40',
        className,
      )}
    >
      <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
    </button>
  );
}
