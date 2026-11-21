'use client';

import type { ReactNode } from 'react';
import { cn } from '@/common/utils/cn';
import { BottomSheet } from './BottomSheet';
import { BottomSheetCloseButton } from './BottomSheetCloseButton';
import { PANEL_HORIZONTAL_PADDING_CLASS } from './panelConstants';

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
      <div className={cn('relative flex min-h-11 shrink-0 flex-col justify-center [&>h2]:px-11', PANEL_HORIZONTAL_PADDING_CLASS)}>
        <BottomSheetCloseButton className="absolute left-[5%] top-1/2 z-10 -translate-y-1/2 tablet:left-12 desktop:left-18" />
        {header}
      </div>
      <div className={cn('min-h-0 py-8', PANEL_HORIZONTAL_PADDING_CLASS, fixedHeight ? 'flex flex-1 flex-col overflow-hidden' : 'overflow-y-auto overscroll-contain')}>
        {children}
      </div>
    </BottomSheet>
  );
}
