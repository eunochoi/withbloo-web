'use client';

import type { ReactNode } from 'react';
import { cn } from '@/common/utils/cn';
import { BottomSheet } from './BottomSheet';

type BottomSheetPickerProps = {
  children: ReactNode;
  header: ReactNode;
  labelledBy: string;
  describedBy?: string;
  fixedHeight?: boolean;
  onClose: () => void;
};

export function BottomSheetPicker({ children, header, labelledBy, describedBy, onClose, fixedHeight = false }: BottomSheetPickerProps) {
  return (
    <BottomSheet picker labelledBy={labelledBy} describedBy={describedBy} onClose={onClose} height={fixedHeight ? 'full' : 'auto'}>
      <div className="shrink-0 px-5 tablet:px-12 desktop:px-18">{header}</div>
      <div className={cn('min-h-0 px-6 py-8 tablet:px-12 desktop:px-18', fixedHeight ? 'flex flex-1 flex-col overflow-hidden' : 'overflow-y-auto overscroll-contain')}>
        {children}
      </div>
    </BottomSheet>
  );
}
