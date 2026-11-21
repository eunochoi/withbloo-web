"use client";

import type { ReactNode } from "react";
import { useContext } from 'react';
import { PANEL_HORIZONTAL_PADDING_CLASS } from "./panelConstants";
import ScrollableName from '../ScrollableName';
import { BottomSheetHeader } from './BottomSheetHeader';
import { BOTTOM_SHEET_HEADING_CLASS } from './BottomSheetHeading';
import { BottomSheetCloseButton, BottomSheetCloseContext } from './BottomSheetCloseButton';

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
}: BottomSheetTitleProps) => {
  const close = useContext(BottomSheetCloseContext);
  if (!title && !headerButton && !close) return null;

  return (
    <BottomSheetHeader
      className={`relative flex min-h-12 w-full shrink-0 items-center justify-center ${PANEL_HORIZONTAL_PADDING_CLASS}`}
      headerButton={headerButton}
      rightClassName="absolute right-[5%] flex items-center tablet:right-12 desktop:right-18"
    >
      <BottomSheetCloseButton className="absolute left-[5%] tablet:left-12 desktop:left-18" />
      {title && (
        <h2 className={`min-w-0 ${scrollableTitle ? 'w-full' : ''} px-11 ${BOTTOM_SHEET_HEADING_CLASS}`}>
          {scrollableTitle ? <ScrollableName name={title} /> : title}
        </h2>
      )}
    </BottomSheetHeader>
  );
};
