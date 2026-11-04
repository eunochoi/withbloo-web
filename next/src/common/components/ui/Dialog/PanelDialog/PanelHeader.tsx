"use client";

import type { ReactNode } from "react";
import { PANEL_HORIZONTAL_PADDING_CLASS } from "./constants";
import ScrollableName from '../../ScrollableName';

interface PanelHeaderProps {
  title?: string;
  onBack?: () => void;
  backLabel?: string;
  headerLeft?: ReactNode;
  headerRight?: ReactNode;
  onTitleClick?: () => void;
  scrollableTitle?: boolean;
}

export const PanelHeader = ({
  title,
  headerLeft,
  headerRight,
  onTitleClick,
  scrollableTitle = false,
}: PanelHeaderProps) => title || headerLeft || headerRight ? (
  <div
    className={`relative flex min-h-12 w-full shrink-0 items-center justify-center ${PANEL_HORIZONTAL_PADDING_CLASS}`}
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
    {headerLeft && (
      <div className="absolute left-5 flex items-center tablet:left-12 desktop:left-[81px]">
        {headerLeft}
      </div>
    )}
    {headerRight && (
      <div className="absolute right-5 flex items-center tablet:right-12 desktop:right-[81px]">
        {headerRight}
      </div>
    )}
  </div>
) : null;
