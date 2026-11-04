import { cn } from '@/common/utils/cn';
import type { ReactNode } from 'react';

import { PickerDialog } from '@/common/components/ui/Dialog/PickerDialog';
import { ScrollContainer } from '@/common/components/ui/ScrollContainer';

const HabitFormPicker = ({ title, id, children, onClose, onApply, fixedContent, fixedHeight = false, scrollFade = false }: {
  title: string; id: string; children: ReactNode; onClose: () => void; onApply: () => void;
  fixedContent?: ReactNode;
  fixedHeight?: boolean;
  scrollFade?: boolean;
}) => (
  <PickerDialog labelledBy={id} onClose={onClose} fixedHeight={fixedHeight} header={<header className="relative flex min-h-14 shrink-0 items-center justify-center px-12">
        <h2 id={id} className="text-center text-lg font-semibold">{title}</h2>
        <button type="button" onClick={onApply} className="absolute right-0 min-h-11 px-2 text-lg font-normal text-theme-accent">완료</button>
      </header>}>
    <div className={cn("flex flex-col", fixedHeight && "min-h-0 flex-1")}>

      {fixedContent}
      {scrollFade && fixedHeight ? (
        <ScrollContainer showScrollFade fadeOutset className="min-h-0 flex-1" contentClassName="pb-7" scrollAreaClassName="overscroll-contain" data-picker-scroll="true">{children}</ScrollContainer>
      ) : (
        <div className={cn("pb-7", fixedHeight && "min-h-0 flex-1 overflow-y-auto overscroll-contain")}>{children}</div>
      )}
    </div>
  </PickerDialog>
);

export default HabitFormPicker;
