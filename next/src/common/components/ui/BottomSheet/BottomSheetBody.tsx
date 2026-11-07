'use client';

import { ScrollContainer } from "@/common/components/ui/ScrollContainer";
import { cn } from "@/common/utils/cn";
import { forwardRef, ReactNode } from "react";
import { PANEL_CONTENT_HORIZONTAL_PADDING_CLASS } from './panelConstants';

interface BottomSheetBodyProps {
  children: ReactNode;
  showScrollFade?: boolean;
  contentClassName?: string;
}

export const BottomSheetBody = forwardRef<HTMLDivElement, BottomSheetBodyProps>(function BottomSheetBody({
  children,
  showScrollFade = false,
  contentClassName,
}, ref) {
  return (
    <ScrollContainer
      ref={ref}
      className="flex min-h-0 flex-1"
      contentClassName={cn(PANEL_CONTENT_HORIZONTAL_PADDING_CLASS, 'py-8', contentClassName)}
      showScrollFade={showScrollFade}

    >
      {children}
    </ScrollContainer>
  );
});
