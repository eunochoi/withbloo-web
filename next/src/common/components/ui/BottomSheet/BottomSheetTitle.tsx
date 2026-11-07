"use client";

import type { ReactNode } from "react";
import { PANEL_HORIZONTAL_PADDING_CLASS } from "./panelConstants";
import ScrollableName from '../ScrollableName';
import { BottomSheetHeader } from './BottomSheetHeader';

interface BottomSheetTitleProps {
  title?: string;
  onBack?: () => void;
  backLabel?: string;
  headerLeft?: ReactNode;
  headerRight?: ReactNode;
  onTitleClick?: () => void;
  scrollableTitle?: boolean;
}

export const BottomSheetTitle = ({
  title,
  headerLeft,
  headerRight,
  onTitleClick,
  scrollableTitle = false,
}: BottomSheetTitleProps) => title || headerLeft || headerRight ? (
  <BottomSheetHeader
    className={`relative flex min-h-12 w-full shrink-0 items-center justify-center ${PANEL_HORIZONTAL_PADDING_CLASS}`}
    headerLeft={headerLeft}
    headerRight={headerRight}
    leftClassName="absolute left-5 flex items-center tablet:left-12 desktop:left-[81px]"
    rightClassName="absolute right-5 flex items-center tablet:right-12 desktop:right-[81px]"
  >
    {title &&
      (onTitleClick ? (
        <button
          type="button"
          onClick={onTitleClick}
          className="min-h-11 px-10 text-center text-xl font-semibold tracking-tight"
          aria-label={`${title}, 날짜 선택`}
        >
          {title}
        </button>
      ) : (
        <h2 className={`${scrollableTitle ? 'w-full min-w-0 ' : ''}px-10 text-center text-xl font-semibold tracking-tight`}>
          {scrollableTitle ? <ScrollableName name={title} /> : title}
        </h2>
      ))}
  </BottomSheetHeader>
) : null;
