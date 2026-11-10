"use client";

import type { ReactNode } from "react";
import { PANEL_HORIZONTAL_PADDING_CLASS } from "./panelConstants";
import ScrollableName from '../ScrollableName';
import { BottomSheetHeader } from './BottomSheetHeader';
import { BOTTOM_SHEET_HEADING_CLASS } from './BottomSheetHeading';

interface BottomSheetTitleProps {
  title?: string;
  onBack?: () => void;
  backLabel?: string;
  headerButton?: ReactNode;
  scrollableTitle?: boolean;
}

export const BottomSheetTitle = ({
  title,
  headerButton,
  scrollableTitle = false,
}: BottomSheetTitleProps) => title || headerButton ? (
  <BottomSheetHeader
    className={`relative flex min-h-12 w-full shrink-0 items-center justify-center ${PANEL_HORIZONTAL_PADDING_CLASS}`}
    headerButton={headerButton}
    rightClassName="absolute right-5 flex items-center tablet:right-12 desktop:right-[81px]"
  >
    {title && (
      <h2 className={`${scrollableTitle ? 'w-full min-w-0 ' : ''}px-10 ${BOTTOM_SHEET_HEADING_CLASS}`}>
        {scrollableTitle ? <ScrollableName name={title} /> : title}
      </h2>
    )}
  </BottomSheetHeader>
) : null;
