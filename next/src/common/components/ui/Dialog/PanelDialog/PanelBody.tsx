'use client';

import { ScrollContainer } from "@/common/components/ui/ScrollContainer";
import { cn } from "@/common/utils/cn";
import { ReactNode } from "react";
import { PANEL_HORIZONTAL_PADDING_CLASS } from './constants';

interface PanelBodyProps {
  children: ReactNode;
  showScrollFade?: boolean;
  contentClassName?: string;
}

export const PanelBody = ({
  children,
  showScrollFade = false,
  contentClassName,
}: PanelBodyProps) => {
  return (
    <ScrollContainer
      className="flex min-h-0 flex-1"
      contentClassName={cn(PANEL_HORIZONTAL_PADDING_CLASS, 'py-8', contentClassName)}
      showScrollFade={showScrollFade}

    >
      {children}
    </ScrollContainer>
  );
};
